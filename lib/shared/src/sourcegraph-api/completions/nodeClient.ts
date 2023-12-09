import http from 'http'
import https from 'https'

import { isError } from '../../utils'
import { RateLimitError } from '../errors'
import { customUserAgent } from '../graphql/client'
import { toPartialUtf8String } from '../utils'

import { SourcegraphCompletionsClient } from './client'
import { parseEvents } from './parse'
import { CompletionCallbacks, CompletionParameters } from './types'

export class SourcegraphNodeCompletionsClient extends SourcegraphCompletionsClient {
    public stream(params: CompletionParameters, cb: CompletionCallbacks): () => void {
        const log = this.logger?.startCompletion(params, this.completionsEndpoint)

        const abortController = new AbortController()
        const abortSignal = abortController.signal

        const requestFn = this.completionsEndpoint.startsWith('https://') ? https.request : http.request

        const request = requestFn(
            this.completionsEndpoint,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.accessToken ? { Authorization: `token ${this.config.accessToken}` } : null),
                    ...(customUserAgent ? { 'User-Agent': customUserAgent } : null),
                    ...this.config.customHeaders,
                },
                // So we can send requests to the Sourcegraph local development instance, which has an incompatible cert.
                rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0' && !this.config.debugEnable,
            },
            (res: http.IncomingMessage) => {
                if (res.statusCode === undefined) {
                    throw new Error('no status code present')
                }

                // Calls the error callback handler for an error.
                //
                // If the request failed with a rate limit error, wraps the
                // error in RateLimitError.
                function handleError(e: Error): void {
                    log?.onError(e.message)

                    if (res.statusCode === 429) {
                        // Check for explicit false, because if the header is not set, there
                        // is no upgrade available.
                        const upgradeIsAvailable =
                            typeof res.headers['x-is-cody-pro-user'] !== undefined &&
                            res.headers['x-is-cody-pro-user'] === 'false'
                        const retryAfter = res.headers['retry-after']
                        const limit = res.headers['x-ratelimit-limit'] ? res.headers['x-ratelimit-limit'][0] : undefined
                        const error = new RateLimitError(
                            'chat messages and commands',
                            e.message,
                            upgradeIsAvailable,
                            limit ? parseInt(limit, 10) : undefined,
                            retryAfter
                        )
                        cb.onError(error, res.statusCode)
                    } else {
                        cb.onError(e, res.statusCode)
                    }
                }

                // For failed requests, we just want to read the entire body and
                // ultimately return it to the error callback.
                if (res.statusCode >= 400) {
                    // Bytes which have not been decoded as UTF-8 text
                    let bufferBin = Buffer.of()
                    // Text which has not been decoded as a server-sent event (SSE)
                    let errorMessage = ''
                    res.on('data', chunk => {
                        if (!(chunk instanceof Buffer)) {
                            throw new TypeError('expected chunk to be a Buffer')
                        }
                        // Messages are expected to be UTF-8, but a chunk can terminate
                        // in the middle of a character
                        const { str, buf } = toPartialUtf8String(Buffer.concat([bufferBin, chunk]))
                        errorMessage += str
                        bufferBin = buf
                    })

                    res.on('error', e => handleError(e))
                    res.on('end', () => handleError(new Error(errorMessage)))
                    return
                }

                // By tes which have not been decoded as UTF-8 text
                let bufferBin = Buffer.of()
                // Text which has not been decoded as a server-sent event (SSE)
                let bufferText = ''

                res.on('data', chunk => {
                    if (!(chunk instanceof Buffer)) {
                        throw new TypeError('expected chunk to be a Buffer')
                    }
                    // text/event-stream messages are always UTF-8, but a chunk
                    // may terminate in the middle of a character
                    const { str, buf } = toPartialUtf8String(Buffer.concat([bufferBin, chunk]))
                    bufferText += str
                    bufferBin = buf

                    const parseResult = parseEvents(bufferText)
                    if (isError(parseResult)) {
                        console.error(parseResult)
                        return
                    }

                    log?.onEvents(parseResult.events)
                    this.sendEvents(parseResult.events, cb)
                    bufferText = parseResult.remainingBuffer
                })

                res.on('error', e => handleError(e))
            }
        )

        request.on('error', e => {
            let error = e
            if (error.message.includes('ECONNREFUSED')) {
                error = new Error(
                    'Could not connect to Cody. Please ensure that Cody app is running or that you are connected to the Sourcegraph server.'
                )
            }
            log?.onError(error.message)
            cb.onError(error)
        })

        request.write(JSON.stringify(params))
        request.end()

        abortSignal.addEventListener('abort', () => {
            request.destroy()
        })

        return () => request.destroy()
    }
}

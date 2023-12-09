import * as vscode from 'vscode'

import { Configuration, ConfigurationWithAccessToken } from '@sourcegraph/cody-shared/src/configuration'
import { TelemetryEventProperties, TelemetryService } from '@sourcegraph/cody-shared/src/telemetry'
import { EventLogger, ExtensionDetails } from '@sourcegraph/cody-shared/src/telemetry/EventLogger'

import { version as packageVersion } from '../../package.json'
import { getConfiguration } from '../configuration'
import { logDebug } from '../log'
import { getOSArch } from '../os'

import { localStorage } from './LocalStorageProvider'

export let eventLogger: EventLogger | null = null
let telemetryLevel: 'all' | 'off' | 'agent' = 'off'
let globalAnonymousUserID: string

const { platform, arch } = getOSArch()

export const extensionVersion =
    vscode.extensions.getExtension('sourcegraph.cody-ai')?.packageJSON?.version ?? packageVersion
export const getExtensionDetails = (config: Pick<Configuration, 'agentIDE'>): ExtensionDetails => ({
    ide: config.agentIDE ?? 'VSCode',
    ideExtensionType: 'Cody',
    platform: platform ?? 'browser',
    arch,
    // Prefer the runtime package json over the version that is inlined during build times. This
    // way we will be able to include pre-release builds that are published with a different version
    // identifier.
    version: extensionVersion,
})

/**
 * Initializes or configures legacy event-logging globals.
 */
export async function createOrUpdateEventLogger(
    config: ConfigurationWithAccessToken,
    isExtensionModeDevOrTest: boolean
): Promise<void> {
    if (config.telemetryLevel === 'off' || isExtensionModeDevOrTest) {
        // check that CODY_TESTING is not true, because we want to log events when we are testing
        if (process.env.CODY_TESTING !== 'true') {
            eventLogger = null
            telemetryLevel = 'off'
            return
        }
    }

    const extensionDetails = getExtensionDetails(config)

    telemetryLevel = config.telemetryLevel

    const { anonymousUserID, created } = await localStorage.anonymousUserID()
    globalAnonymousUserID = anonymousUserID

    const serverEndpoint = localStorage?.getEndpoint() || config.serverEndpoint

    if (!eventLogger) {
        eventLogger = new EventLogger(serverEndpoint, extensionDetails, config)
        if (created) {
            logEvent('CodyInstalled', undefined, {
                hasV2Event: true, // Created in src/services/telemetry-v2.ts
            })
        } else if (!config.isRunningInsideAgent) {
            logEvent('CodyVSCodeExtension:CodySavedLogin:executed', undefined, {
                hasV2Event: true, // Created in src/services/telemetry-v2.ts
            })
        }
        return
    }
    eventLogger?.onConfigurationChange(serverEndpoint, extensionDetails, config)
}

/**
 * Log a telemetry event using the legacy event-logging mutations.
 * @deprecated New callsites should use telemetryRecorder instead. Existing
 * callsites should ALSO record an event using services/telemetry-v2
 * as well and indicate this has happened, for example:
 *
 * logEvent(name, properties, { hasV2Event: true })
 * telemetryRecorder.recordEvent(...)
 *
 * In the future, all usages of TelemetryService will be removed in
 * favour of the new libraries. For more information, see:
 * https://docs.sourcegraph.com/dev/background-information/telemetry
 * @param eventName The name of the event.
 * @param properties Event properties. Do NOT include any private information, such as full URLs
 * that may contain private repository names or search queries.
 *
 * PRIVACY: Do NOT include any potentially private information in `properties`. These properties may
 * get sent to analytics tools, so must not include private information, such as search queries or
 * repository names.
 */
function logEvent(
    eventName: string,
    properties?: TelemetryEventProperties,
    opts?: { hasV2Event?: boolean; agent?: boolean }
): void {
    if (telemetryLevel === 'agent' && !opts?.agent) {
        return
    }

    logDebug(
        `logEvent${eventLogger === null || process.env.CODY_TESTING === 'true' ? ' (telemetry disabled)' : ''}`,
        eventName,
        getExtensionDetails(getConfiguration(vscode.workspace.getConfiguration())).ide,
        JSON.stringify({ properties, opts })
    )
    if (!eventLogger || !globalAnonymousUserID) {
        return
    }
    try {
        eventLogger.log(eventName, globalAnonymousUserID, properties, opts)
    } catch (error) {
        console.error(error)
    }
}

/**
 * telemetryService logs events using the legacy event-logging mutations.
 * @deprecated New callsites should use telemetryRecorder instead. Existing
 * callsites should ALSO record an event using services/telemetry-v2
 * as well and indicate this has happened, for example:
 *
 * logEvent(name, properties, { hasV2Event: true })
 * telemetryRecorder.recordEvent(...)
 *
 * In the future, all usages of TelemetryService will be removed in
 * favour of the new libraries. For more information, see:
 * https://docs.sourcegraph.com/dev/background-information/telemetry
 */
export const telemetryService: TelemetryService = {
    log(eventName, properties, opts) {
        logEvent(eventName, properties, opts)
    },
}

// TODO: Clean up this name mismatch when we move to TelemetryV2
export function logPrefix(ide: 'VSCode' | 'JetBrains' | 'Neovim' | 'Emacs' | undefined): string {
    return ide
        ? {
              VSCode: 'CodyVSCodeExtension',
              JetBrains: 'CodyJetBrainsPlugin',
              Emacs: 'CodyEmacsPlugin',
              Neovim: 'CodyNeovimPlugin',
          }[ide]
        : 'CodyVSCodeExtension'
}

import { Dispatch, SetStateAction, useState } from 'react'

import type { ClientInit } from '@sourcegraph/cody-shared/src/chat/client'

const DEFAULT_WEB_CONFIGURATION: WebConfiguration = {
    serverEndpoint: 'https://sourcegraph.com',
    accessToken: null,
    useContext: 'embeddings',
    customHeaders: {},
    experimentalLocalSymbols: false,
}

export type WebConfiguration = ClientInit['config']

export function useConfig(): [WebConfiguration, Dispatch<SetStateAction<WebConfiguration>>] {
    return useLocalStorage<WebConfiguration>('cody-web.config', DEFAULT_WEB_CONFIGURATION)
}

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.log(error)
            return initialValue
        }
    })

    const setValue = (value: T | ((prevValue: T) => T)): void => {
        setStoredValue(value)
        localStorage.setItem(key, JSON.stringify(value))
    }

    return [storedValue, setValue]
}

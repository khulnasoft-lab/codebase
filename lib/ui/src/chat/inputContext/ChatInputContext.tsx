import React from 'react'

import { mdiDatabaseCheckOutline, mdiDatabaseOffOutline, mdiDatabaseRemoveOutline } from '@mdi/js'
import classNames from 'classnames'

import { basename, ChatContextStatus } from '@sourcegraph/cody-shared'

import { Icon } from '../../utils/Icon'

import styles from './ChatInputContext.module.css'

export const formatFilePath = (filePath: string, selection: ChatContextStatus['selectionRange']): string => {
    const fileName = basename(filePath)

    if (!selection) {
        return fileName
    }

    const startLine = selection.start.line + 1
    const endLine = selection.end.line + 1

    if (
        startLine === endLine ||
        (startLine + 1 === endLine && selection.end.character === 0) // A single line selected with the cursor at the start of the next line
    ) {
        return `${fileName}:${startLine}`
    }

    return `${fileName}:${startLine}-${endLine}`
}

export const ChatInputContext: React.FunctionComponent<{
    contextStatus: ChatContextStatus
    className?: string
}> = React.memo(function ChatInputContextContent({ contextStatus, className }) {
    return (
        <div className={classNames(styles.container, className)}>
            {contextStatus.codebase ? (
                contextStatus.mode && contextStatus.connection ? (
                    <CodebaseState
                        codebase={contextStatus.codebase}
                        tooltip={`Repository ${contextStatus.codebase} is indexed and has embeddings`}
                        icon={mdiDatabaseCheckOutline}
                    />
                ) : (
                    <CodebaseState
                        codebase={contextStatus.codebase}
                        tooltip={`Repository ${contextStatus.codebase} is not indexed and has no embeddings`}
                        icon={mdiDatabaseRemoveOutline}
                        iconClassName={styles.warningColor}
                    />
                )
            ) : (
                <CodebaseState
                    tooltip="No Git repository opened"
                    icon={mdiDatabaseOffOutline}
                    iconClassName={styles.errorColor}
                />
            )}
            {(contextStatus.filePath && (
                <p className={styles.file} title={contextStatus.filePath}>
                    {formatFilePath(contextStatus.filePath, contextStatus.selectionRange)}
                </p>
            )) || (
                <p className={styles.file} title={contextStatus.filePath}>
                    No file selected
                </p>
            )}
        </div>
    )
})

const CodebaseState: React.FunctionComponent<{
    tooltip: string
    iconClassName?: string
    icon: string
    codebase?: string
}> = ({ tooltip, iconClassName, icon, codebase }) => (
    <h3 title={tooltip} className={styles.codebase}>
        <Icon svgPath={icon} className={classNames(styles.codebaseIcon, iconClassName)} />
    </h3>
)

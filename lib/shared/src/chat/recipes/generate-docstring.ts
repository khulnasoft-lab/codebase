import { MAX_RECIPE_INPUT_TOKENS, MAX_RECIPE_SURROUNDING_TOKENS } from '../../prompt/constants'
import { truncateText, truncateTextStart } from '../../prompt/truncation'
import { newInteraction } from '../prompts/utils'
import { Interaction } from '../transcript/interaction'

import {
    getContextMessagesFromSelection,
    getFileExtension,
    getNormalizedLanguageName,
    MARKDOWN_FORMAT_PROMPT,
} from './helpers'
import { Recipe, RecipeContext, RecipeID } from './recipe'

export class GenerateDocstring implements Recipe {
    public id: RecipeID = 'generate-docstring'
    public title = 'Generate Docstring'

    public async getInteraction(_humanChatInput: string, context: RecipeContext): Promise<Interaction | null> {
        const source = this.id
        const selection = context.editor.getActiveTextEditorSelectionOrEntireFile()
        if (!selection) {
            await context.editor.showWarningMessage('No code selected. Please select some code and try again.')
            return Promise.resolve(null)
        }

        const truncatedSelectedText = truncateText(selection.selectedText, MAX_RECIPE_INPUT_TOKENS)
        const truncatedPrecedingText = truncateTextStart(selection.precedingText, MAX_RECIPE_SURROUNDING_TOKENS)
        const truncatedFollowingText = truncateText(selection.followingText, MAX_RECIPE_SURROUNDING_TOKENS)

        const extension = getFileExtension(selection.fileName)
        const languageName = getNormalizedLanguageName(selection.fileName)
        const promptPrefix = `Generate a comment documenting the parameters and functionality of the following ${languageName} code:`
        let additionalInstructions = `Use the ${languageName} documentation style to generate a ${languageName} comment.`
        if (extension === 'java') {
            additionalInstructions = 'Use the JavaDoc documentation style to generate a Java comment.'
        } else if (extension === 'py') {
            additionalInstructions = 'Use a Python docstring to generate a Python multi-line string.'
        }
        const promptMessage = `${promptPrefix}\n\`\`\`\n${truncatedSelectedText}\n\`\`\`\nOnly generate the documentation, do not generate the code. ${additionalInstructions} ${MARKDOWN_FORMAT_PROMPT}`

        let docStart = ''
        if (extension === 'java' || extension.startsWith('js') || extension.startsWith('ts')) {
            docStart = '/*'
        } else if (extension === 'py') {
            docStart = '"""\n'
        } else if (extension === 'go') {
            docStart = '// '
        }

        const displayText = `Generate documentation for the following code:\n\`\`\`\n${selection.selectedText}\n\`\`\``

        const assistantResponsePrefix = `Here is the generated documentation:\n\`\`\`${extension}\n${docStart}`
        return newInteraction({
            text: promptMessage,
            displayText,
            source,
            assistantPrefix: assistantResponsePrefix,
            assistantText: assistantResponsePrefix,
            contextMessages: getContextMessagesFromSelection(
                truncatedSelectedText,
                truncatedPrecedingText,
                truncatedFollowingText,
                selection,
                context.codebaseContext
            ),
        })
    }
}

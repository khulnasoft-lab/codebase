import { MAX_RECIPE_INPUT_TOKENS, MAX_RECIPE_SURROUNDING_TOKENS } from '../../prompt/constants'
import { truncateText, truncateTextStart } from '../../prompt/truncation'
import { newInteraction } from '../prompts/utils'
import { Interaction } from '../transcript/interaction'

import { getContextMessagesFromSelection, getNormalizedLanguageName, MARKDOWN_FORMAT_PROMPT } from './helpers'
import { Recipe, RecipeContext, RecipeID } from './recipe'

export class ExplainCodeDetailed implements Recipe {
    public id: RecipeID = 'explain-code-detailed'
    public title = 'Explain Selected Code (Detailed)'

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

        const languageName = getNormalizedLanguageName(selection.fileName)
        const promptMessage = `Please explain the following ${languageName} code. Be very detailed and specific, and indicate when it is not clear to you what is going on. Format your response as an ordered list.\n\`\`\`\n${truncatedSelectedText}\n\`\`\`\n${MARKDOWN_FORMAT_PROMPT}`
        const displayText = `Explain the following code:\n\`\`\`\n${selection.selectedText}\n\`\`\``

        return newInteraction({
            text: promptMessage,
            displayText,
            source,
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

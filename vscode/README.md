# AI that knows your entire codebase

[Cody](https://about.sourcegraph.com/cody?utm_source=marketplace.visualstudio.com&utm_medium=referral) is a free and [open-source](https://github.com/sourcegraph/cody) AI coding assistant that can write, understand and fix your code. Cody is powered by Sourcegraph’s code graph, and has knowledge of your entire codebase. Install Cody to get started with free AI-powered autocomplete, chat, commands, and more.

## Autocomplete

Cody autocompletes single lines, or whole functions, in any programming language, configuration file, or documentation. It’s powered by latest instant LLM models, for accuracy and performance.

<!-- prettier-ignore: Uses <img> so we can fix width to 480px so all images are consistent width and look sharp @2x -->
<img src="https://storage.googleapis.com/sourcegraph-assets/website/Product%20Animations/GIFS/cody-completions-may2023-optim.gif" width="480" alt="Cody autocomplete">

## Chat

Ask Cody questions in the chat view, or inline with code, and it will use Sourcegraph’s code graph to answer using knowledge of your entire codebase.

For example, you can ask Cody:

- "How is our app's secret storage implemented on Linux?"
- "Where is the CI config for the web integration tests?"
- "Write a new GraphQL resolver for the AuditLog"
- "Why is the UserConnectionResolver giving an "unknown user" error, and how do I fix it?"
- "Add helpful debug log statements"
- "Make this work" _(seriously, it often works—try it!)_

<!-- prettier-ignore: Uses <img> so we can fix width to 480px so all images are consistent width and look sharp @2x -->
<img src="https://storage.googleapis.com/sourcegraph-assets/website/Product%20Animations/GIFS/cody-chat-may2023-optim.gif" width="480" alt="Cody Chat">

## Built-In Commands

Cody has quick commands for common actions, such as adding code documentation, explaining code, generating unit tests, and detecting code smells.

<!-- prettier-ignore: Uses <img> so we can fix width to 480px so all images are consistent width and look sharp @2x -->
<img src="https://storage.googleapis.com/sourcegraph-assets/website/Product%20Animations/GIFS/Explain_Code-Sept23-Sm.gif" width="480" alt="Explain Code command">

## Custom Commands

There's also experimental support for adding your own custom commands, defined as JSON within your repository:

<!-- prettier-ignore: Uses <img> so we can fix width to 480px so all images are consistent width and look sharp @2x -->
<img src="https://storage.googleapis.com/sourcegraph-assets/website/Product%20Animations/GIFS/Custom_Command-Sept2023-Sm.gif" width="480" alt="Custom command">

## Swappable LLMs

Support for Anthropic Claude, Claude 2, and OpenAI GPT-4/3.5, with more coming soon.

## Free Usage

Cody is currently in beta, and includes free LLM usage for individual users on both personal and work code. Fair use limits apply.

## Programming Languages

Cody works for any programming language because it uses LLMs trained on broad data. Cody works great with Python, Go, JavaScript, and TypeScript code.

## Code Graph

Cody is powered by Sourcegraph’s code graph, and uses context of your codebase to extend its capabilities. By using context from the entire repository, Cody is able to give more accurate answers and generate idiomatic code.

For example:

- Ask Cody to generate an API call. Cody can gather context on your API schema to inform the code it writes.
- Ask Cody to find where in your codebase a specific component is defined. Cody can retrieve and describe the exact files where that component is written.
- Ask Cody questions that require an understanding of multiple files. For example, ask Cody how frontend data is populated in a React app; Cody can find the React component definitions to understand what data is being passed and where it originates.

## Embeddings

Cody indexes your entire repository and generates embeddings, which are a vector representation of your entire codebase. Cody queries this embeddings database on-demand, and passes that data to the LLM as context. Embeddings make up one part of Sourcegraph’s code graph.

Embeddings for free Cody users are generated via the [Cody desktop app](https://docs.sourcegraph.com/app?utm_source=marketplace.visualstudio.com&utm_medium=referral). For Cody Enterprise customers the embeddings are generated by your Sourcegraph Enterprise instance.

## Cody Enterprise

Cody Enterprise requires the use of a Sourcegraph Enterprise instance, and gives you access to AI coding tools across your entire organization. [Contact us](https://about.sourcegraph.com/contact/request-info?utm_source=marketplace.visualstudio.com&utm_medium=referral) to set up a trial of Cody Enterprise. If you’re an existing Sourcegraph Enterprise customer, contact your technical advisor.

## Feedback

- [Issue tracker](https://github.com/sourcegraph/cody/issues)
- [Discussions](https://github.com/sourcegraph/cody/discussions)
- [Discord](https://discord.gg/s2qDtYGnAE)
- [Twitter (@sourcegraph)](https://twitter.com/sourcegraph)

## Development

Cody for VS Code is open source (Apache 2), and available in the [sourcegraph/cody repository](https://github.com/sourcegraph/cody) on GitHub.

## More Information

See [https://cody.dev/](https://about.sourcegraph.com/cody?utm_source=marketplace.visualstudio.com&utm_medium=referral) for demos, information and more.

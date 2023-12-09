import { Command } from 'commander'

import { run } from './run'

export interface CLIOptions {
    label: string
    runs: number
    output: string
    provider: 'anthropic' | 'azure'
}

export const program = new Command()
    .name('cody-e2e')
    .version('0.0.1')
    .description('Cody E2E quality evaluation suite')
    .option('--output <value>', 'Output tests results to the given file.', '')
    .option('--label <value>', 'Run tests with the matching label.', '')
    .option(
        '--provider <value>',
        'Provider against which to validate the answer. anthropic (default - requres setting ANTHROPIC_API_KEY) or azure (requires setting AZURE_API_KEY)',
        /(anthropic|azure)/,
        'anthropic'
    )
    .option<number>('--runs <value>', 'Number of runs.', value => parseInt(value, 10), 1)
    .action(run)

const args = process.argv.slice(2)
program.parseAsync(args, { from: 'user' }).catch(error => {
    console.error('Error:', error)
    process.exit(1)
})

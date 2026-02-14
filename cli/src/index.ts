import { Command } from 'commander';
import chalk from 'chalk';
import { agentCommands } from './commands/agents';
import { payrollCommands } from './commands/payroll';
import { complianceCommands } from './commands/compliance';

const program = new Command();

program
  .name('trellis')
  .description('Trellis CLI - Agent Payroll & Compliance OS')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize Trellis CLI')
  .action(() => {
    console.log(chalk.green('Initializing Trellis...'));
    // Create config file
  });

program
  .command('login')
  .description('Authenticate with passkey')
  .action(async () => {
    console.log(chalk.blue('Opening passkey authentication...'));
    // Implement passkey login
  });

// Add command groups
program.addCommand(agentCommands);
program.addCommand(payrollCommands);
program.addCommand(complianceCommands);

program.parse();

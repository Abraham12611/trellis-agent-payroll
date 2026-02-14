import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export const agentCommands = new Command('agents')
  .description('Manage agents');

agentCommands
  .command('list')
  .description('List all agents')
  .option('-t, --type <type>', 'Filter by type (human, ai)')
  .option('-j, --jurisdiction <code>', 'Filter by jurisdiction')
  .action(async (options) => {
    const spinner = ora('Fetching agents...').start();
    
    try {
      // Mock data - would fetch from API
      const agents = [
        { id: 'AGENT-001', name: 'CodePilot-AI', type: 'AI_AGENT', status: 'Active' },
        { id: 'AGENT-002', name: 'Sarah Chen', type: 'HUMAN', status: 'Active' },
      ];
      
      spinner.stop();
      
      console.log(chalk.cyan('\nAgents:\n'));
      agents.forEach(agent => {
        console.log(`  ${chalk.white(agent.id)} - ${agent.name} (${agent.type})`);
        console.log(`  Status: ${chalk.green(agent.status)}\n`);
      });
    } catch (error) {
      spinner.fail('Failed to fetch agents');
    }
  });

agentCommands
  .command('create')
  .description('Create new agent')
  .requiredOption('-n, --name <name>', 'Agent name')
  .requiredOption('-t, --type <type>', 'Agent type (human, ai)')
  .requiredOption('-j, --jurisdiction <code>', 'Jurisdiction code')
  .action(async (options) => {
    const spinner = ora('Creating agent...').start();
    
    try {
      // Would call API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      spinner.succeed(chalk.green(`Agent created: ${options.name}`));
      console.log(chalk.gray(`  Type: ${options.type}`));
      console.log(chalk.gray(`  Jurisdiction: ${options.jurisdiction}`));
    } catch (error) {
      spinner.fail('Failed to create agent');
    }
  });

agentCommands
  .command('show <id>')
  .description('Show agent details')
  .action(async (id) => {
    console.log(chalk.cyan(`Agent: ${id}\n`));
    console.log(chalk.gray('  Name: CodePilot-AI'));
    console.log(chalk.gray('  Type: AI_AGENT'));
    console.log(chalk.gray('  Wallet: 0x1234...5678'));
    console.log(chalk.gray('  Status: Active'));
  });

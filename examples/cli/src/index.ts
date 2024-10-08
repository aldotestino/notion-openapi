import { NotionOpenapi, getOpenapiFromURL } from '@notion-openapi/notion-openapi';
import figlet from 'figlet';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { program } from 'commander';
import { optionsSchema } from '@/lib/schema';
import { formatEndpointSelection, formatZodError } from './lib/utils';

program
  .version('0.0.1')
  .description('Leaf API insert values')
  .option('-o, --openapi <string>', 'URL of OpenAPI v3 spec in JSON format')
  .option('-t, --token <string>', 'Token of the Notion integration')
  .option('-p, --page <string>', 'URL of the Notion page')
  .option('-i, --inline', 'Create inline Database')
  .action(async (o) => {

    const { success, data: options, error } = optionsSchema.safeParse(o);

    if (!success) {
      console.error(formatZodError(error));
      return;
    }

    console.log(chalk.hex('#9065B0')(figlet.textSync('notion-openapi')));

    const spinner = ora();

    try {
      const notionOpenapi = new NotionOpenapi({
        auth: options.token,
      });

      // Downlaod openapi file
      spinner.start('Downloading OpenAPI file...');
      const openapi = await getOpenapiFromURL(options.openapi);
      spinner.succeed('OpenAPI file downloaded');

      const { selectedEndpoints } = await inquirer.prompt([{
        name: 'selectedEndpoints',
        message: 'Select endpoints',
        type: 'checkbox',
        loop: false,
        choices: openapi.endpoints.map((endpoint) => ({
          name: formatEndpointSelection({ method: endpoint.method, path: endpoint.path }),
          value: endpoint,
        })),
      }]);

      const customOpenapi = {
        ...openapi,
        endpoints: selectedEndpoints,
      };

      // Create database
      spinner.start('Creating database...');
      await notionOpenapi.createDBFromOpeanpi({
        pageURL: options.page,
        openapi: customOpenapi,
        inline: options.inline,
      });

      spinner.succeed(`Database created at: ${options.page}`);

    } catch (e: any) {
      spinner.fail(e.message);
      return;
    }
  });

program.parse(process.argv);

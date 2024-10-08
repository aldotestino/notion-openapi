import { Client } from '@notionhq/client';
import { methodOptions, notionColors } from './lib/data';
import { NotionOpenapiError } from './lib/errors';
import { Endpoint, Openapi } from './lib/types';
import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';
import { formatParametersTable, formatRequestBodyCode, formatResponsesCode } from './lib/utils';
import { pageSchema } from './lib/schema';

export class NotionOpenapi {
  private notion: Client;

  constructor(...options: ConstructorParameters<typeof Client>) {
    this.notion = new Client(...options);
  }

  async createDBFromOpeanpi({
    openapi,
    pageURL,
    inline = false
  }: {
    openapi: Openapi
    pageURL: string;
    inline?: boolean;
  }) {

    const { success, data: pageID } = pageSchema.safeParse(pageURL);

    if (!success) {
      throw new NotionOpenapiError('DBCreationError', 'Invalid Notion Page URL');
    }

    const databaseID = await this.createDatabase({
      pageID,
      title: openapi.title,
      description: openapi.description,
      tags: openapi.tags,
      inline
    });

    return this.insertEndpoints({
      databaseID,
      endpoints: openapi.endpoints
    });
  }

  private async createDatabase({
    pageID,
    title = 'Endpoints',
    description = 'Collections of endpoints of the API',
    tags,
    inline = false
  }: {
    pageID: string;
    title?: string;
    description?: string;
    tags?: string[];
    inline?: boolean;
  }) {
    try {
      const data = await this.notion.databases.create({
        parent: {
          type: 'page_id',
          page_id: pageID,
        },
        is_inline: inline,
        title: [{ type: 'text', text: { content: title } }],
        description: [{ type: 'text', text: { content: description } }],
        properties: {
          Name: { title: {} },
          Description: { rich_text: {} },
          Path: { rich_text: {} },
          Method: { select: { options: methodOptions.map(({ name, color }) => ({ name: name.toUpperCase(), color })) } },
          Tags: { multi_select: { options: tags?.map((tag, i) => ({ name: tag, color: notionColors[notionColors.length % i] })) } }
        }
      });

      return data.id;
    } catch (err: any) {
      throw new NotionOpenapiError('DBCreationError', err.message);
    }
  }

  private async insertEndpoints({
    databaseID,
    endpoints
  }: {
    databaseID: string;
    endpoints: Endpoint[];
  }) {
    try {
      const data = await Promise.all(endpoints.map(e => {

        const children: BlockObjectRequest[] = [];

        if (e.parameters) {
          children.push(...formatParametersTable(e.parameters));
        }

        if (e.requestBody) {
          children.push(...formatRequestBodyCode(e.requestBody));
        }

        if (e.responses.length > 0) {
          children.push(...formatResponsesCode(e.responses));
        }

        return this.notion.pages.create({
          parent: {
            type: 'database_id',
            database_id: databaseID
          },
          properties: {
            Name: { title: [{ text: { content: e.name || '' } }] },
            Description: { rich_text: [{ text: { content: e.description || '' } }] },
            Path: { rich_text: [{ text: { content: e.path } }] },
            Method: { select: { name: e.method.toUpperCase() } },
            Tags: { multi_select: e.tags?.map(tag => ({ name: tag })) || [] }
          },
          children
        });
      }));

      return data.length;
    } catch (err: any) {
      throw new NotionOpenapiError('DBInsertionError', err.message);
    }
  }
}
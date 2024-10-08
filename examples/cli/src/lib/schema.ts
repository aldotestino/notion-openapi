import { z } from 'zod';

export const optionsSchema = z.object({
  openapi: z.string({ required_error: 'OpenAPI URL is required', })
    .url({ message: 'OpenAPI URL must be a valid URL', })
    .describe('URL of OpenAPI v3 spec in JSON format'),
  page: z.string({ required_error: 'Notion page URL is required', })
    .url({ message: 'Notion page URL must be a valid URL', }),
  token: z.string({ required_error: 'Notion token is required', }),
  inline: z.boolean().optional().default(false).describe('Create inline Database'),
});
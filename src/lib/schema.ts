import { z } from 'zod';

const notionPageURLRegex = /https:\/\/www\.notion\.so\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+-([a-f0-9]{32})/;

export const pageSchema = z.string({ required_error: 'Notion page URL is required', })
  .url({ message: 'Notion page URL must be a valid URL', })
  .regex(notionPageURLRegex, { message: 'Notion page URL must be a valid Notion page URL', })
  .transform(url => url.match(notionPageURLRegex)![1])
  .describe('ID of the Notion page');
import { Hono } from 'hono';
import { handle } from '@hono/node-server/vercel';
import { NotionOpenapi, getOpenapiFromURL } from '@notion-openapi/notion-openapi';

export const config = {
  api: {
    bodyParser: false,
  },
};
const app = new Hono();

app.get('/webhook', async (c) => {

  const { NOTION_TOKEN, NOTION_PAGE_URL, OPENAPI_JSON_URL } = process.env;

  if (!NOTION_TOKEN || !NOTION_PAGE_URL || !OPENAPI_JSON_URL) {
    return c.json({ message: 'Please set NOTION_TOKEN, NOTION_PAGE_URL, OPENAPI_JSON_URL in env' }, 400);
  }

  try {
    const openapi = await getOpenapiFromURL(OPENAPI_JSON_URL);

    const notionOpenapi = new NotionOpenapi({
      auth: NOTION_TOKEN,
    });

    const nEndpoints = await notionOpenapi.createDBFromOpeanpi({
      openapi,
      pageURL: NOTION_PAGE_URL
    });

    return c.json({ message: `${nEndpoints} inserted` });
  } catch (e) {
    console.error(e);
    c.json({ message: 'Error' }, 400);
  }
});

export default handle(app);

# notion-openapi

A utility to create Notion databases from an OpenAPI document. This package automatically generates a structured Notion database, mapping your API endpoints, methods, parameters, and descriptions directly from the OpenAPI spec. Perfect for documenting your API or sharing it with teams in a collaborative, visual format.

Features include:
- Supports OpenAPI 3.x
- Easy authentication with Notion API
- Auto-mapping of endpoints, methods, and parameters to Notion database properties

## How to use

1. Create a page on Notion
2. Create a [Notion Integration](https://www.notion.so/profile/integrations) (leaving the default permissions is fine)
3. Get the Token associated with the integration
4. Connect the page to the integration
5. Install `notion-openapi`
    ```bash
    npm install notion-openapi
    # or
    yarn install notion-openapi
    # or
    pnpm install notion-openapi
    # or
    bun add notion-openapi
    ```
6. Write some code
    ```ts
    import NotionOpenapi, { getOpenapiFromURL } from 'notion-openapi';

    async function main() {
      try {
        const openapiUrl = ''; // URL of the openapi v3 JSON
        const notionToken = ''; // notion token of the integration
        const notionPageURL = ''; // URL of the notion page

        // Uses the same options of axios (headers for auth...)
        const openapi = await getOpenapiFromURL(url);

        // Uses the same options of @notionhq/client
        const notionOpenapi = new NotionOpenapi({ 
          auth: notionToken
        });

        const insertedEndpoints = await notionOpenapi.createDBFromOpeanpi({
          openapi,
          pageURL: notionPageURL
        });

        console.log('Inserted endpoints:', insertedEndpoints);

      } catch (error) {
        console.error(error);
      }
    }

    main();
    ```
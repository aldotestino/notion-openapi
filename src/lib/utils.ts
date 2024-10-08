import SwaggerParser from '@apidevtools/swagger-parser';
import { Endpoint, OAParameter, Response, OAPaths, OAResponses, Openapi, Parameter, MethodName, JSONSchema } from './types';
import { NotionOpenapiError } from './errors';
import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';

function parseParameters(parameters: OAParameter[]): Parameter[] {
  return parameters?.map(p => ({
    name: p.name,
    description: p.description,
    in: p.in,
    type: p.schema?.enum ? p.schema.enum.join(' | ') : p.schema?.type,
    required: p.required,
    default: p.schema?.default,
  }));
}

function parseResponses(responses: OAResponses): Response[] {
  return Object.entries(responses)
    .filter(([, response]) => response.content?.['application/json']?.schema)
    .map(([code, response]) => ({ code, schema: response.content!['application/json']!.schema }));
}

function parseEndpoints(paths: OAPaths): Endpoint[] {
  return Object.entries(paths)
    .flatMap(([path, methods]) => Object.entries(methods)
      .map(([method, { summary, tags, description, parameters, requestBody, responses }]) => ({
        name: summary,
        method: method as MethodName,
        path,
        description,
        tags,
        parameters: parameters ? parseParameters(parameters) : undefined,
        requestBody: requestBody?.content?.['application/json']?.schema,
        responses: parseResponses(responses),
      })));
}

export async function parseJsonOpenapi(rawOpenapi: any): Promise<Openapi> {
  try {
    const data = await SwaggerParser.validate(rawOpenapi);
    return {
      title: data.info.title,
      description: data.info.description,
      tags: data.tags?.map(tag => tag.name),
      endpoints: data.paths ? parseEndpoints(data.paths as OAPaths) : [],
    };
  } catch {
    throw new NotionOpenapiError('ParseError', 'The provided OpenAPI document is invalid');
  }
}

export function generateJson(schema: JSONSchema): any {
  switch (schema.type) {
    case 'object':
      // eslint-disable-next-line no-case-declarations
      const obj: { [key: string]: any } = {};
      if (schema.properties) {
        for (const [key, value] of Object.entries(schema.properties)) {
          if (!schema.required || schema.required.includes(key)) {
            obj[key] = generateJson(value);
          } else {
            obj[`${key}?`] = generateJson(value);
          }
        }
      }
      return obj;

    case 'array':
      if (schema.items) {
        return [generateJson(schema.items)];
      }
      return [];

    case 'string':
      return schema.enum ? schema.enum.join(' | ') : 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return null;
  }
}

export function formatResponsesCode(responses: { code: string, schema: JSONSchema }[]) {
  return [
    {
      object: 'block',
      heading_2: {
        rich_text: [{ text: { content: 'Responses' } }]
      }
    },
    ...responses.map(({ code, schema }) => ({
      object: 'block',
      toggle: {
        rich_text: [{ text: { content: code }, annotations: { color: parseInt(code) >= 400 ? 'red' : 'green' } }],
        children: [{
          object: 'block',
          code: {
            language: 'json',
            rich_text: [{ text: { content: JSON.stringify(generateJson(schema), null, 2) } }]
          }
        }]
      }
    } as BlockObjectRequest))
  ] as BlockObjectRequest[];
}

export function formatRequestBodyCode(requestBody: JSONSchema) {
  return [
    {
      object: 'block',
      heading_2: {
        rich_text: [{ text: { content: 'Request Body' } }]
      }
    }, {
      object: 'block',
      code: {
        language: 'json',
        rich_text: [{ text: { content: JSON.stringify(generateJson(requestBody), null, 2) } }]
      }
    }
  ] as BlockObjectRequest[];
}

export function formatParametersTable(parameters: Parameter[]) {
  return [
    {
      object: 'block',
      heading_2: {
        rich_text: [{ text: { content: 'Parameters' } }]
      }
    }, {
      object: 'block',
      table: {
        has_column_header: true,
        table_width: 5,
        children: [
          { table_row: { cells: [[{ text: { content: 'Name' } }], [{ text: { content: 'Description' } }], [{ text: { content: 'In' } }], [{ text: { content: 'Type' } }], [{ text: { content: 'Default' } }]] } },
          ...parameters.map(p => ({
            table_row: {
              cells: [
                [{ text: { content: p.name } }],
                [{ text: { content: p.description || '' } }],
                [{ text: { content: p.in } }],
                [{ text: { content: p.type } }],
                [{ text: { content: p.default?.toString() || '' } }]
              ]
            }
          }))
        ]
      }
    }
  ] as BlockObjectRequest[];
}
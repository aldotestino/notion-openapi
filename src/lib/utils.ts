import SwaggerParser from '@apidevtools/swagger-parser';
import { Endpoint, OAParameter, Response, OAPaths, OAResponses, Openapi, Parameter, MethodName } from './types';
import { NotionOpenapiError } from './errors';

function parseParameters(parameters: OAParameter[]): Parameter[] {
  return parameters?.map(p => ({
    name: p.name,
    description: p.description,
    in: p.in,
    type: p.schema.enum ? p.schema.enum.join(' | ') : p.schema.type,
    required: p.required,
    default: p.schema.default,
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
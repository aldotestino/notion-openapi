import { AxiosRequestConfig } from 'axios';

export type JSONSchema = {
  type: string;
  enum?: string[];
  properties?: { [key: string]: JSONSchema };
  items?: JSONSchema;
  required?: string[];
  additionalProperties?: boolean;
};

/* OPENAPI TYPES */
export type OAParameter = {
  name: string;
  in: ParameterIn;
  description?: string;
  required?: boolean;
  schema: {
    type: 'string' | 'integer' | 'boolean';
    format: 'date';
    enum?: string[];
    default?: string;
  };
}

export type OARequestBody = {
  content?: {
    'application/json'?: {
      schema: JSONSchema;
    }
  }
}

export type OAResponse = {
  description: string;
  content?: {
    'application/json'?: {
      schema: JSONSchema;
    }
  }
}

export type OAResponses = Record<string, OAResponse>;

export type OAMethod = {
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OAParameter[];
  requestBody?: OARequestBody;
  responses: OAResponses;
}

export type OAPath = Record<MethodName, OAMethod>

export type OAPaths = Record<string, OAPath>;

/* Exported TYPES */
export type NotionColor = 'default' | 'gray' | 'brown' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red';

export type MethodName = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export type ParameterIn = 'query' | 'path' | 'header' | 'cookie';

export type Parameter = {
  name: string;
  description?: string;
  in: ParameterIn;
  type: string; // string, integer, boolean or string1|string2|string3
  required?: boolean;
  default?: string;
}

export type Response = {
  code: string;
  schema: JSONSchema;
}

export type Endpoint = {
  name?: string;
  method: MethodName;
  path: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: JSONSchema;
  responses: Response[];
}

export type Openapi = {
  title?: string;
  description?: string;
  tags?: string[];
  endpoints: Endpoint[];
}

export type GetOpenapiFromURLOptions<T> = AxiosRequestConfig<T>

export type NotionOpenapiErrorType = 'FileError' | 'FetchError' | 'ParseError' | 'DBCreationError' | 'DBInsertionError';
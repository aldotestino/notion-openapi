import axios, { isAxiosError } from 'axios';
import { GetOpenapiFromURLOptions, Openapi } from './lib/types';
import { parseJsonOpenapi } from './lib/utils';
import { NotionOpenapiError } from './lib/errors';

export async function getOpenapiFromURL<T>(url: string, options?: GetOpenapiFromURLOptions<T>): Promise<Openapi> {
  try {
    const res = await axios.get(url, options);
    if (!res.headers['content-type']?.includes('application/json'))
      throw new NotionOpenapiError('FetchError', 'The provided URL does not return a JSON response');
    return parseJsonOpenapi(res.data);
  } catch (err: any) {
    if (isAxiosError(err)) {
      throw new NotionOpenapiError('FetchError', err.message);
    }
    throw err;
  }
}

export async function getOpenapiFromFile(filePath: string) {
  console.log(filePath);
}
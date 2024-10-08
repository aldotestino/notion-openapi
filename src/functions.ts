import axios, { AxiosRequestConfig, isAxiosError } from 'axios';
import { Openapi } from './lib/types';
import { parseJsonOpenapi } from './lib/utils';
import { NotionOpenapiError } from './lib/errors';

export async function getJsonOpenapiFromURL(url: string, options?: AxiosRequestConfig<any> | undefined): Promise<Openapi> {
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

export async function getJsonOpenapiFromFile(filePath: string) {
  console.log(filePath);
}
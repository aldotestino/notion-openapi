import { NotionOpenapiErrorType } from './types';

export class NotionOpenapiError extends Error {
  type: NotionOpenapiErrorType;

  constructor(type: NotionOpenapiErrorType, message: string) {
    super(message);
    this.type = type;
  }
}
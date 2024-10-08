import chalk from 'chalk';
import { ZodError } from 'zod';
import { notionHexColorByMethod } from '@/lib/data';
import { MethodName } from '@notion-openapi/notion-openapi';

export function formatZodError(error: ZodError): string {
  return error.errors
    .map((err) => {
      const path = err.path.join('.');
      const message = err.message;
      return `Missing option "${path}": ${message}`;
    })
    .join('\n');
}

export function formatEndpointSelection({ method, path }: { method: MethodName, path: string }) {
  return `${chalk.hex(notionHexColorByMethod[method]).bold(method.toUpperCase())} ${path}`;
}
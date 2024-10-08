import { MethodName, NotionColor } from './types';

export const notionColors: NotionColor[] = ['brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red', 'gray'];

// insomnia color codes for methods
export const methodOptions: { name: MethodName, color: NotionColor }[] = [
  {
    name: 'get',
    color: 'purple'
  },
  {
    name: 'post',
    color: 'green'
  },
  {
    name: 'put',
    color: 'orange'
  },
  {
    name: 'delete',
    color: 'red'
  },
  {
    name: 'patch',
    color: 'yellow'
  },
  {
    name: 'options',
    color: 'blue'
  },
  {
    name: 'head',
    color: 'blue'
  }
];
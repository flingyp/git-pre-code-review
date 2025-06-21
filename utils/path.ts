import path from 'path';

/**
 * TODO: 集成 @flypeng/tool
 * 获取配置文件路径
 */
export function getFilePath(filename: string): string {
  return path.resolve(process.cwd(), filename);
}

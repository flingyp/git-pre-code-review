import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface GitStagedFile {
  path: string;
  status: string;
}

export interface GitDiffContent {
  added: string[]; // 新增的行
  removed: string[]; // 删除的行
  content: string; // 完整的新内容
}

/**
 * 过滤掉被忽略的文件
 * @param files 暂存区文件列表
 * @param ignorePatterns 忽略的文件模式（支持 glob 模式）
 * @returns GitStagedFile[] 过滤后的文件列表
 */
export function filterIgnoredFiles(files: GitStagedFile[], ignorePatterns: string | string[]): GitStagedFile[] {
  const patterns = Array.isArray(ignorePatterns) ? ignorePatterns : [ignorePatterns];

  return files.filter((file) => {
    const basename = path.basename(file.path);
    const dirname = path.dirname(file.path);

    return !patterns.some((pattern) => {
      // 处理目录匹配
      if (pattern.endsWith('/')) {
        return dirname === pattern.slice(0, -1) || dirname.startsWith(pattern);
      }

      // 处理文件名通配符匹配
      if (pattern.startsWith('*.')) {
        const extension = pattern.slice(1); // 包含点号的扩展名
        return basename.endsWith(extension);
      }

      // 处理完整路径匹配
      if (pattern.includes('/')) {
        return file.path === pattern || file.path.startsWith(pattern + '/');
      }

      // 处理简单的文件名或目录名匹配
      return basename === pattern || dirname === pattern;
    });
  });
}

/**
 * 获取 Git 暂存区的文件信息
 * @returns Promise<GitStagedFile[]> 暂存区文件列表
 *
 * status 说明：
 * A: 新增文件
 * M: 修改文件
 * D: 删除文件
 * R: 重命名文件
 * C: 复制文件
 */
export async function getGitStagedFiles(): Promise<GitStagedFile[]> {
  try {
    // 使用 git diff --cached 命令获取暂存区的变更
    // --name-status: 显示文件名和状态
    // --no-renames: 不显示重命名信息，而是显示为删除和新增
    const { stdout } = await execAsync('git diff --cached --name-status --no-renames');

    if (!stdout) return [];

    // 解析命令输出
    return stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [status, path] = line.split('\t');
        return {
          status: status.trim(),
          path: path.trim(),
        };
      });
  } catch (error) {
    console.error('获取暂存区信息失败:', error);
    return [];
  }
}

/**
 * 检查当前目录是否是 Git 仓库
 * @returns Promise<boolean>
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    await execAsync('git rev-parse --is-inside-work-tree');
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取暂存区文件的具体改动内容
 * @param filePath 文件路径
 * @returns Promise<GitDiffContent> 文件的改动内容
 */
export async function getGitStagedFileDiff(filePath: string): Promise<GitDiffContent> {
  try {
    // 使用 git show 来获取暂存区的完整内容
    const { stdout: newContent } = await execAsync(`git show :${filePath}`);

    // 获取 diff 信息以解析变更
    const { stdout: diffContent } = await execAsync(`git diff --cached ${filePath}`);

    const added: string[] = [];
    const removed: string[] = [];

    // 解析 diff 内容
    const lines = diffContent.split('\n');
    for (const line of lines) {
      // 跳过 diff 头部信息
      if (
        line.startsWith('diff ') ||
        line.startsWith('index ') ||
        line.startsWith('--- ') ||
        line.startsWith('+++ ') ||
        line.startsWith('@@ ')
      ) {
        continue;
      }

      // 解析变更行
      if (line.startsWith('+') && !line.startsWith('+++')) {
        added.push(line.slice(1));
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        removed.push(line.slice(1));
      }
    }

    return {
      added,
      removed,
      content: newContent,
    };
  } catch (error) {
    console.error(`获取文件 ${filePath} 的改动内容失败:`, error);
    return {
      added: [],
      removed: [],
      content: '',
    };
  }
}

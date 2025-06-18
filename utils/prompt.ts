import { getGitStagedFileDiff, GitStagedFile } from './git';
import { Config } from '../core/config';
import { getFileExtension } from './path';

/**
 * 获取文件类型分类
 * 根据文件扩展名返回文件类型，用于应用特定的审查指南
 */
export function getFileTypeCategory(extension: string): string {
  const typeMap: Record<string, string[]> = {
    'js,ts,jsx,tsx': ['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs'],
    'css,scss,less': ['css', 'scss', 'less', 'styl'],
    py: ['py', 'pyw'],
    java: ['java'],
    php: ['php'],
    ruby: ['rb'],
    go: ['go'],
    rust: ['rs'],
    csharp: ['cs'],
    swift: ['swift'],
    html: ['html', 'htm'],
    markdown: ['md', 'markdown'],
    json: ['json'],
    yaml: ['yml', 'yaml'],
    xml: ['xml'],
    shell: ['sh', 'bash', 'zsh'],
  };

  for (const [category, extensions] of Object.entries(typeMap)) {
    if (extensions.includes(extension)) {
      return category;
    }
  }

  return 'other';
}

/**
 * 获取文件特定的审查指南
 */
function getFileReviewGuidelines(extension: string, config: Config): string[] {
  const category = getFileTypeCategory(extension);
  const guidelines = config.reviewGuidelines?.[category] || [];

  return guidelines;
}

/**
 * 生成代码审查提示词
 */
export async function generatePrompt(files: GitStagedFile[], config: Config): Promise<string> {
  // 使用配置中的主提示词模板或默认模板
  const mainTemplate =
    config.promptTemplate?.main ||
    `
      ## 充当角色

      你是一个专业的代码审查助手，你的任务是对暂存区文件的代码进行审查，并给出是否建议提交的结果以及原因，最终只需要告知我最终结果，不要包含任何其他内容
      如果建议提交，则返回此次代码修改很棒，不需要调整，可直接提交。如果不建议提交，则直接给出原因。

      以下是待审查的代码变更：\n\n
   `;

  // 添加代码规范指导（如果有）
  let prompt = mainTemplate;

  const codeStandards = config.promptTemplate?.codeStandards || [];
  if (codeStandards.length > 0) {
    prompt += `## 代码规范指导\n\n请参考以下代码规范进行审查：\n`;
    codeStandards.forEach((standard, index) => {
      prompt += `${index + 1}. ${standard}\n`;
    });
    prompt += '\n';
  }

  // 获取每个文件的变更内容
  for (const file of files) {
    const diffContent = await getGitStagedFileDiff(file.path);
    const extension = getFileExtension(file.path);
    const fileType = getFileTypeCategory(extension);

    // 添加文件信息
    prompt += `## 文件：${file.path}\n`;
    prompt += `变更类型：${file.status}\n`;
    prompt += `文件类型：${extension} (${fileType})\n`;

    // 添加特定于该文件类型的审查指南
    const guidelines = getFileReviewGuidelines(extension, config);
    if (guidelines.length > 0) {
      prompt += `\n### 该文件类型的审查重点：\n`;
      guidelines.forEach((guideline, index) => {
        prompt += `${index + 1}. ${guideline}\n`;
      });
      prompt += '\n';
    }

    // 使用文件类型特定的模板（如果有）
    const fileTypeTemplate = config.promptTemplate?.fileTypes?.[fileType];
    if (fileTypeTemplate) {
      prompt += `${fileTypeTemplate}\n`;
    }

    // 优化差异显示格式
    prompt += `\n### 代码变更：\n`;

    // 如果有新增内容，显示新增行
    if (diffContent.added.length > 0) {
      prompt += `\n#### 新增的行：\n\`\`\`${extension}\n${diffContent.added.join('\n')}\n\`\`\`\n`;
    }

    // 如果有删除内容，显示删除行
    if (diffContent.removed.length > 0) {
      prompt += `\n#### 删除的行：\n\`\`\`${extension}\n${diffContent.removed.join('\n')}\n\`\`\`\n`;
    }

    // 显示完整的新内容（使用代码块包装以提高可读性）
    prompt += `\n#### 完整的新内容：\n\`\`\`${extension}\n${diffContent.content}\n\`\`\`\n\n`;
  }

  return prompt;
}

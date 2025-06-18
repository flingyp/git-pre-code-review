import fs from 'fs';
import yaml from 'js-yaml';
import { deepMerge, getFilePath } from '../utils';
import { parseFile } from 'parse-gitignore-ts';
import { z } from 'zod';

// 配置文件的类型定义
export const configSchema = z.object({
  ignore: z.array(z.string()).optional(),
  LLM: z
    .object({
      BASE_URL: z.string().optional(),
      API_KEY: z.string().optional(),
    })
    .optional(),
  customCommands: z.array(z.string()).optional().default([]), // 添加自定义命令配置
  isContainGitignore: z.boolean().optional().default(true), // 添加 isContainGitignore 字段

  // 新增: 自定义提示词模板配置
  promptTemplate: z
    .object({
      // 自定义主提示词模板
      main: z.string().optional(),
      // 自定义文件类型特定的提示词模板
      fileTypes: z.record(z.string()).optional(),
      // 代码规范指导
      codeStandards: z.array(z.string()).optional(),
    })
    .optional(),

  // 新增: 语言/框架特定的审查重点
  reviewGuidelines: z.record(z.array(z.string())).optional(),
});

export type Config = z.infer<typeof configSchema>;

const defaultOptions: Config = {
  ignore: ['code-review.yaml', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock'],
  isContainGitignore: true,
  customCommands: [], // 默认无自定义命令
  promptTemplate: {
    main: `
      ## 充当角色

      你是一个专业的代码审查助手，你的任务是对暂存区文件的代码进行审查，并给出是否建议提交的结果以及原因，最终只需要告知我最终结果，不要包含任何其他内容
      如果建议提交，则返回此次代码修改很棒，不需要调整，可直接提交。如果不建议提交，则直接给出原因。

      以下是待审查的代码变更：\n\n
    `,
    codeStandards: [],
  },
  // 默认的语言特定审查指南
  reviewGuidelines: {
    'js,ts,jsx,tsx': ['检查是否存在潜在的内存泄漏', '确保异步函数正确处理错误', '检查是否有不必要的渲染或计算'],
    'css,scss,less': ['检查是否有不必要的重复样式', '确保样式命名符合项目规范', '检查媒体查询是否合理'],
    py: ['检查是否遵循PEP8规范', '确保适当的类型注释', '检查异常处理是否完善'],
  },
};

export function readConfig(): Config {
  const configPath = getFilePath('code-review.yaml');

  if (!fs.existsSync(configPath)) return defaultOptions;

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = yaml.load(content) as Partial<Config>;

    let gitignoreConfig: string[] = [];
    const gitignorePath = getFilePath('.gitignore');

    if (!config.isContainGitignore) {
      if (config.isContainGitignore === undefined) {
        config.isContainGitignore = defaultOptions.isContainGitignore;
      } else {
        config.isContainGitignore = false;
      }
    }

    if (config.isContainGitignore && fs.existsSync(gitignorePath)) {
      gitignoreConfig = parseFile(gitignorePath).patterns;
    }

    let targetConfig;
    if (gitignoreConfig.length === 0) {
      targetConfig = deepMerge(defaultOptions, config) as Config;
    } else {
      targetConfig = deepMerge(
        defaultOptions,
        {
          ignore: gitignoreConfig,
        },
        config,
      ) as Config;
    }

    return targetConfig;
  } catch (error) {
    console.error('readConfig_error:', error);
    return defaultOptions;
  }
}

/**
 * 检查是否配置了 LLM
 */
export async function getIsConfigLLMParams(config: Config): Promise<boolean> {
  return !!(config.LLM?.BASE_URL && config.LLM?.API_KEY);
}

# Git Pre Code Review (GPCR)

[![npm](https://img.shields.io/npm/v/git-pre-code-review)](https://www.npmjs.com/package/git-pre-code-review)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一个基于 AI 的 Git 预提交代码审查工具，用于提高代码质量。

[English](README.md)｜[简体中文](README_CN.md)

## 概述

GPCR 通过在代码提交前分析代码变更，帮助开发团队自动化部分代码审查流程。该工具与 Git 工作流集成，提供早期反馈，减少审查时间，提高整体代码质量。

## 特性

- 🔍 自动化代码风格和质量检查
- 🤖 AI 驱动的代码审查建议
- 🔄 Git pre-commit 钩子集成
- ⚡ 快速轻量级分析
- 🛠️ 可自定义的审查规则
- 🧩 针对不同语言的特定审查指南
- 📝 自定义提示词模板支持

## 安装

```bash
# 全局安装
npm install -g git-pre-code-review

# 或使用 yarn
yarn global add git-pre-code-review

# 或使用 pnpm
pnpm add -g git-pre-code-review
```

## 快速开始

安装后，您需要先配置 LLM（AI 模型）设置才能使用该工具：

1. 在项目根目录创建 `code-review.yaml` 文件：

```yaml
# LLM 配置（必需）
LLM:
  BASE_URL: '您的-llm-base-url'
  API_KEY: '您的-llm-api-key'
```

2. 在暂存的文件上运行代码审查工具：

```bash
# 审查已暂存的更改
gpcr review

# 查看更多选项
gpcr --help
```

## 配置

在项目根目录创建 `code-review.yaml` 文件来自定义设置：

```yaml
# 要忽略的文件或目录
ignore:
  - 'node_modules'
  - 'dist'
  - '*.log'

# LLM 配置（必需）
LLM:
  BASE_URL: '您的-llm-base-url'
  API_KEY: '您的-llm-api-key'

# 提交前运行的自定义命令（可选）
customCommands:
  - 'pnpm lint'
  - 'pnpm format'

# 是否包含 gitignore 模式（默认：true）
isContainGitignore: true

# 自定义提示词模板配置（可选）
promptTemplate:
  # 主提示词模板
  main: |
    ## 充当角色
    你是一个专业的代码审查助手...

  # 文件类型特定的提示词模板
  fileTypes:
    'js,ts,jsx,tsx': |
      请特别关注JavaScript/TypeScript的代码质量...
    'css,scss,less': |
      请特别关注CSS的命名规范...

  # 代码规范指导
  codeStandards:
    - '变量和函数命名应当清晰表达其用途和含义'
    - '避免过深的嵌套和复杂的条件判断'

# 语言/框架特定的审查重点
reviewGuidelines:
  'js,ts,jsx,tsx':
    - '检查是否存在潜在的内存泄漏'
    - '确保异步函数正确处理错误'
  'css,scss,less':
    - '检查是否有不必要的重复样式'
    - '确保样式命名符合项目规范'
```

完整示例请参见 [code-review.example.yml](code-review.example.yml)。

## 开发

要为此项目做出贡献：

```bash
# 克隆仓库
git clone https://github.com/flingyp/git-pre-code-review.git
cd git-pre-code-review

# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test
```

## 许可证

本项目采用 MIT 许可证 - 详细信息请参见 [LICENSE](LICENSE) 文件。

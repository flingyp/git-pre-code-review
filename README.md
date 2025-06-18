# Git Pre Code Review (GPCR)

[![npm](https://img.shields.io/npm/v/git-pre-code-review)](https://www.npmjs.com/package/git-pre-code-review)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An AI-based Git pre-commit code review tool to enhance code quality before human review.

[English](README.md)｜[简体中文](README_CN.md)

## Overview

GPCR helps development teams automate part of the code review process by analyzing code changes before they are committed. This tool integrates with your Git workflow to provide early feedback, reduce review time, and improve overall code quality.

## Features

- 🔍 Automated code style and quality checks
- 🤖 AI-powered code review suggestions
- 🔄 Git pre-commit hook integration
- ⚡ Fast and lightweight analysis
- 🛠️ Customizable review rules
- 🧩 Language-specific review guidelines
- 📝 Custom prompt templates support

## Installation

```bash
# Install globally
npm install -g git-pre-code-review

# Or with yarn
yarn global add git-pre-code-review

# Or with pnpm
pnpm add -g git-pre-code-review
```

## Quick Start

After installation, you need to configure your LLM (AI model) settings before using the tool:

1. Create a `code-review.yaml` file in your project root:

```yaml
# LLM configuration (required)
LLM:
  BASE_URL: 'your-llm-base-url'
  API_KEY: 'your-llm-api-key'
```

2. Run the code review tool on your staged files:

```bash
# Review staged changes
gpcr review

# For more options
gpcr --help
```

## Configuration

Create a `code-review.yaml` file in your project root to customize settings:

```yaml
# Files or directories to ignore
ignore:
  - 'node_modules'
  - 'dist'
  - '*.log'

# LLM configuration (required)
LLM:
  BASE_URL: 'your-llm-base-url'
  API_KEY: 'your-llm-api-key'

# Custom commands to run before commit (optional)
customCommands:
  - 'pnpm lint'
  - 'pnpm format'

# Whether to include gitignore patterns (default: true)
isContainGitignore: true

# Custom prompt template configuration (optional)
promptTemplate:
  # Main prompt template
  main: |
    ## Acting as a role
    You are a professional code review assistant...

  # File type specific prompt templates
  fileTypes:
    'js,ts,jsx,tsx': |
      Pay special attention to JavaScript/TypeScript code quality...
    'css,scss,less': |
      Pay special attention to CSS naming conventions...

  # Code standards guidance
  codeStandards:
    - 'Variables and function names should clearly express their purpose'
    - 'Avoid deep nesting and complex conditional judgments'

# Language/framework specific review guidelines
reviewGuidelines:
  'js,ts,jsx,tsx':
    - 'Check for potential memory leaks'
    - 'Ensure async functions handle errors correctly'
  'css,scss,less':
    - 'Check for unnecessary duplicate styles'
    - 'Ensure style naming follows project conventions'
```

For a complete example, see [code-review.example.yml](code-review.example.yml).

## Development

To contribute to this project:

```bash
# Clone the repository
git clone https://github.com/flingyp/git-pre-code-review.git
cd git-pre-code-review

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build

# Run tests
pnpm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

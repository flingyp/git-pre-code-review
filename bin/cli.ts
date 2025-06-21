#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { toReview } from '../core/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json - going up two levels from dist/bin to reach root
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('gpcr')
  .description('An AI-based Git pre-commit code review tool to enhance code quality before human review.')
  .version(packageJson.version, '-v, --version', 'show version number');

program
  .command('review')
  .description('Run code review on staged files')
  .action(async () => {
    await toReview();
  });

program.parse();

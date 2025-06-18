#!/usr/bin/env node

import { Command } from 'commander';
import { toReview } from '../core/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json - going up two levels from dist/bin to reach root
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program.name('gpcr').description('Git Pre-commit Code Review CLI').version(packageJson.version);

program
  .command('review')
  .description('Run code review on staged files')
  .action(async () => {
    await toReview();
  });

program.parse();

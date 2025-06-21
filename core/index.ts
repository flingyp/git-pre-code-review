import { exit } from 'process';
import { getGitStagedFiles, filterIgnoredFiles, askLLM } from '../utils';
import { getIsConfigLLMParams, readConfig } from './config';
import inquirer from 'inquirer';
import { isTTY } from '../utils';
import { useExecCommand } from '@flypeng/tool/node';
import chalk from 'chalk';

export function toReview() {
  init();
}

async function init() {
  // 标题栏
  console.log('\n' + chalk.bgBlue.white(' GPCR - Git Pre Code Review ') + '\n');

  // 读取配置信息
  const config = readConfig();

  // 获取当前git暂存区相关信息
  console.log(chalk.blue('📂 获取暂存区文件...'));
  const gitStagedFiles = await getGitStagedFiles();
  if (gitStagedFiles.length === 0) {
    console.log(chalk.red('❌ 暂存区没有文件，无法进行代码审查'));
    exit(1);
  }
  console.log(chalk.green(`✅ 找到 ${gitStagedFiles.length} 个暂存文件`));

  // 过滤忽略掉的文件
  console.log(chalk.blue('\n🔍 过滤忽略的文件...'));
  const filteredFiles = filterIgnoredFiles(gitStagedFiles, config.ignore || []);
  if (filteredFiles.length === 0) {
    console.log(chalk.red('❌ 过滤后没有需要审查的文件'));
    exit(1);
  }
  console.log(chalk.green(`✅ 过滤后剩余 ${filteredFiles.length} 个文件需要审查\n`));

  // 调用AI接口，获取代码审查结果
  const isConfigLLMConfig = await getIsConfigLLMParams(config);
  if (!isConfigLLMConfig) {
    console.log(chalk.red('❌ 请提供 LLM 配置，否则无法进行代码审查'));
    console.log(chalk.yellow('ℹ️ 提示：在项目根目录创建 code-review.yaml 文件并配置 LLM 参数'));
    exit(1);
  }

  // 调用 AI 进行代码审查
  let isPass = true;
  try {
    isPass = await askLLM(config.LLM?.BASE_URL!, config.LLM?.API_KEY!, filteredFiles, config);
  } catch (error) {
    console.log(chalk.red('\n❌ AI 代码审查调用失败'));
    console.log(chalk.red('错误详情:'), error);
    exit(1);
  }

  // AI 的审查结果已经通过流式输出到控制台了

  // 非终端并且不建议提交-直接退出
  if (!isTTY && !isPass) {
    exit(1);
  }

  if (!isTTY && isPass) {
    exit(0);
  }

  // 终端环境下的交互处理
  if (isTTY) {
    // 如果审查不通过，询问是否继续
    if (!isPass) {
      const answer = (await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: chalk.yellow('⚠️ 本次代码审查不建议提交，确定是否继续提交？'),
          default: false,
        },
      ])) as { continue: boolean };

      if (!answer.continue) {
        console.log(chalk.blue('\n👋 已取消提交，请根据审查结果修改代码\n'));
        exit(1);
      }
    }

    // 获取提交信息
    const commitAnswer = (await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: chalk.blue('📝 请输入提交信息:'),
        default: '',
        validate: (input) => {
          if (input.trim() === '') {
            return '提交信息不能为空';
          }
          return true;
        },
      },
    ])) as { message: string };

    // 执行自定义命令
    if (config.customCommands && config.customCommands.length > 0) {
      console.log(chalk.blue('\n🔄 执行自定义命令...'));
      for (const cmd of config.customCommands) {
        try {
          await useExecCommand(cmd);
          console.log(chalk.green(`✅ 命令执行成功: ${cmd}`));
          await useExecCommand(`git add .`);
          console.log(chalk.green('✅ 执行 git add . 成功'));
        } catch (error) {
          console.log(chalk.red(`❌ 命令执行失败: ${cmd}`));
          console.log(chalk.red('错误详情:'), error);
          exit(1);
        }
      }
    }

    // 提交代码
    console.log(chalk.yellow('\n⚠️ 注意: 使用脚本命令执行 AI Code Review 会忽略项目配置的 pre-commit hooks'));
    console.log(chalk.blue('🚀 正在提交代码...'));
    try {
      await useExecCommand(`git commit -m "${commitAnswer.message}" --no-verify`);
      console.log(chalk.green('✅ 代码提交成功!\n'));
    } catch (error) {
      console.log(chalk.red('❌ 代码提交失败'));
      console.log(chalk.red('错误详情:'), error);
      exit(1);
    }
    exit(0);
  }
}

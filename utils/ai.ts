import OpenAI from 'openai';
import { GitStagedFile } from './git';
import { generatePrompt } from './prompt';
import chalk from 'chalk';
import { Config } from '../core/config';

let openInstance: OpenAI;
const getOpenAIInstance = (baseURL: string, apiKey: string) => {
  openInstance = new OpenAI({
    baseURL,
    apiKey,
  });
  return openInstance;
};

/**
 * 调用 LLM 进行代码审查
 */
export async function askLLM(baseURL: string, apiKey: string, files: GitStagedFile[], config: Config) {
  const prompt = await generatePrompt(files, config);

  console.log(chalk.blue('🔍 正在进行代码审查中...'));
  const openInstance = getOpenAIInstance(baseURL, apiKey);

  try {
    const stream = await openInstance.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: '你是一个专业的代码审查助手，擅长发现代码中的问题并给出改进建议。请使用中文回复。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'deepseek-chat',
      stream: true,
    });

    // 显示漂亮的标题
    console.log('\n' + chalk.bgBlue.white(' 🔍 代码审查结果 '));
    console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(''); // 空一行但不多空

    let reviewResponse = '';
    let isFirstChunk = true;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      reviewResponse += content;

      // 实时输出内容
      if (content) {
        // 第一个内容块前不需要换行
        if (!isFirstChunk) {
          process.stdout.write(content);
        } else {
          process.stdout.write(chalk.yellow(content));
          isFirstChunk = false;
        }
      }
    }

    // 结束分隔线，保持一致的间距
    console.log('\n');
    console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    // 判断审查结果
    const isPass = reviewResponse.includes('此次代码修改很棒，不需要调整，可直接提交');

    if (isPass) {
      console.log(chalk.green('✅ 审查通过：') + chalk.greenBright('代码质量良好，可以提交！'));
    } else {
      console.log(chalk.yellow('⚠️ 审查结果：') + chalk.yellowBright('代码可能需要调整，请查看上述建议。'));
    }

    return isPass;
  } catch (error) {
    console.log('\n' + chalk.red('❌ 审查过程中出现错误'));
    throw error;
  }
}

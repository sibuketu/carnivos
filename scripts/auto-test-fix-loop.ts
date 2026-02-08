#!/usr/bin/env tsx
/**
 * CarnivOS - Auto Test & Fix Loop
 *
 * RULES 2.1準拠: 自動テスト・修正ループ
 * エラーが出たら、ユーザーに報告せず、直るまで何度でも修正ループを回す
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

const MAX_FIX_ATTEMPTS = 5;

async function runCommand(command: string): Promise<{ stdout: string; stderr: string }> {
  try {
    const result = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10, // 10MB
    });
    return { stdout: result.stdout, stderr: result.stderr };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || err.message || String(error),
    };
  }
}

async function runLint(): Promise<TestResult> {
  console.log('🔍 Linting...');
  const { stdout, stderr } = await runCommand('npm run lint');
  const hasErrors = stderr.includes('error') || stdout.includes('error');

  return {
    success: !hasErrors,
    errors: hasErrors ? [stderr || stdout] : [],
    warnings: [],
  };
}

async function runTypeCheck(): Promise<TestResult> {
  console.log('📝 Type checking...');
  const { stdout, stderr } = await runCommand('npx tsc --noEmit');
  const hasErrors = stderr.includes('error') || stdout.includes('error');

  return {
    success: !hasErrors,
    errors: hasErrors ? [stderr || stdout] : [],
    warnings: [],
  };
}

async function runBuild(): Promise<TestResult> {
  console.log('🏗️  Building...');
  const { stderr } = await runCommand('npm run build');
  const hasErrors = stderr.includes('ERROR') || stderr.includes('Failed');

  return {
    success: !hasErrors,
    errors: hasErrors ? [stderr] : [],
    warnings: [],
  };
}

async function runE2ETests(): Promise<TestResult> {
  console.log('🧪 Running E2E tests...');
  const { stdout, stderr } = await runCommand('npm test');
  const hasErrors = stdout.includes('failed') || stderr.includes('error');

  return {
    success: !hasErrors,
    errors: hasErrors ? [stdout + stderr] : [],
    warnings: [],
  };
}

async function attemptAutoFix(error: string): Promise<boolean> {
  console.log('🔧 Attempting auto-fix...');

  // Auto-fix lint errors
  if (error.includes('lint')) {
    await runCommand('npm run lint:fix');
    return true;
  }

  // Auto-fix format errors
  if (error.includes('Prettier') || error.includes('format')) {
    await runCommand('npm run format');
    return true;
  }

  return false;
}

async function deploy(): Promise<boolean> {
  console.log('🚀 Deploying to Netlify...');
  const { stderr } = await runCommand('git push');
  return !stderr.includes('error') && !stderr.includes('fatal');
}

async function main() {
  console.log('🤖 CarnivOS Auto Test & Fix Loop');
  console.log('━'.repeat(50));

  let attempts = 0;
  let allTestsPassed = false;

  while (attempts < MAX_FIX_ATTEMPTS && !allTestsPassed) {
    attempts++;
    console.log(`\n📊 Attempt ${attempts}/${MAX_FIX_ATTEMPTS}`);
    console.log('─'.repeat(50));

    // Run all checks
    const lintResult = await runLint();
    const typeCheckResult = await runTypeCheck();
    const buildResult = await runBuild();

    const allErrors = [
      ...lintResult.errors,
      ...typeCheckResult.errors,
      ...buildResult.errors,
    ];

    if (allErrors.length === 0) {
      console.log('\n✅ All checks passed!');

      // Run E2E tests
      const e2eResult = await runE2ETests();
      if (e2eResult.success) {
        console.log('✅ E2E tests passed!');
        allTestsPassed = true;
      } else {
        console.log('❌ E2E tests failed');
        console.log(e2eResult.errors.join('\n'));

        // E2Eエラーは自動修正しない（手動確認が必要）
        console.log('\n⚠️  E2E tests require manual review');
        break;
      }
    } else {
      console.log(`\n❌ Found ${allErrors.length} errors`);

      // Attempt auto-fix
      let fixed = false;
      for (const error of allErrors) {
        const wasFixed = await attemptAutoFix(error);
        if (wasFixed) {
          fixed = true;
          console.log('✅ Auto-fix applied');
        }
      }

      if (!fixed) {
        console.log('❌ Unable to auto-fix errors');
        console.log('\nErrors:');
        allErrors.forEach((err, i) => {
          console.log(`\n${i + 1}. ${err.substring(0, 500)}`);
        });
        break;
      }
    }
  }

  if (allTestsPassed) {
    console.log('\n🎉 All tests passed! Deploying...');
    const deployed = await deploy();
    if (deployed) {
      console.log('✅ Deployed successfully!');
      console.log('\n🌐 https://carnivoslol.netlify.app');
    } else {
      console.log('❌ Deployment failed');
    }
  } else {
    console.log('\n❌ Tests failed after', attempts, 'attempts');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

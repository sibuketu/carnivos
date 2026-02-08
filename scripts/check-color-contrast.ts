#!/usr/bin/env tsx
/**
 * CarnivOS - Color Contrast Checker
 *
 * WCAG AA準拠（コントラスト比 4.5:1以上）を自動チェック
 * ビルド時に実行し、見えにくい色の組み合わせを検出
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface ColorPair {
  fg: string;
  bg: string;
  location: string;
  line?: number;
}

interface ContrastResult {
  pair: ColorPair;
  ratio: number;
  passes: boolean;
  level: 'AAA' | 'AA' | 'FAIL';
}

/**
 * HEXをRGBに変換
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * 相対輝度を計算
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * コントラスト比を計算
 */
function getContrastRatio(color1: string, color2: string): number | null {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return null;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * コントラスト比からレベル判定
 */
function getContrastLevel(ratio: number): 'AAA' | 'AA' | 'FAIL' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'FAIL';
}

/**
 * CSSファイルから色ペアを抽出（将来の拡張用）
 */
async function _extractColorPairs(filePath: string): Promise<ColorPair[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const pairs: ColorPair[] = [];

  let currentBg: string | null = null;
  let currentFg: string | null = null;

  lines.forEach((line, index) => {
    const bgMatch = line.match(/background(?:-color)?:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/);
    const fgMatch = line.match(/color:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/);

    if (bgMatch) currentBg = bgMatch[1];
    if (fgMatch) currentFg = fgMatch[1];

    // 同じブロック内でbgとcolorが見つかったら記録
    if (currentBg && currentFg) {
      pairs.push({
        fg: currentFg,
        bg: currentBg,
        location: path.basename(filePath),
        line: index + 1,
      });
      currentBg = null;
      currentFg = null;
    }
  });

  return pairs;
}

/**
 * 重要な色ペアをハードコードでチェック
 */
function getCriticalColorPairs(): ColorPair[] {
  return [
    // Primary text on primary bg
    { fg: '#e0e0e0', bg: '#050505', location: 'index.css (primary)' },
    // Neon green on dark
    { fg: '#00ff9d', bg: '#050505', location: 'index.css (neon-green)' },
    // Neon red on dark
    { fg: '#ff0055', bg: '#050505', location: 'index.css (neon-red)' },
    // Neon blue on dark
    { fg: '#00d9ff', bg: '#050505', location: 'index.css (neon-blue)' },
    // Gray text on dark (WCAG AA準拠に修正)
    { fg: '#a8a29e', bg: '#050505', location: 'common (secondary text)' },
    // White text on red (WCAG AA準拠に修正)
    { fg: '#ffffff', bg: '#dc2626', location: 'ErrorReportButton' },
    // Dark text on yellow
    { fg: '#92400e', bg: '#fef3c7', location: 'InputScreen (fasting)' },
  ];
}

async function main() {
  console.log('🎨 CarnivOS Color Contrast Checker');
  console.log('━'.repeat(50));
  console.log('WCAG AA基準: コントラスト比 4.5:1 以上');
  console.log('WCAG AAA基準: コントラスト比 7:1 以上\n');

  const results: ContrastResult[] = [];

  // 重要な色ペアをチェック
  const criticalPairs = getCriticalColorPairs();

  for (const pair of criticalPairs) {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    if (ratio) {
      const level = getContrastLevel(ratio);
      results.push({
        pair,
        ratio,
        passes: level !== 'FAIL',
        level,
      });
    }
  }

  // 結果表示
  let failCount = 0;
  let warnCount = 0;

  console.log('📊 チェック結果:\n');

  results.forEach((result) => {
    const icon = result.level === 'AAA' ? '✅' : result.level === 'AA' ? '⚠️ ' : '❌';
    const status = result.level === 'FAIL' ? 'FAIL' : result.level;

    console.log(`${icon} ${status} (${result.ratio.toFixed(2)}:1)`);
    console.log(`   ${result.pair.fg} on ${result.pair.bg}`);
    console.log(`   Location: ${result.pair.location}`);
    if (result.pair.line) {
      console.log(`   Line: ${result.pair.line}`);
    }
    console.log('');

    if (result.level === 'FAIL') failCount++;
    if (result.level === 'AA') warnCount++;
  });

  console.log('━'.repeat(50));
  console.log(`✅ AAA: ${results.filter((r) => r.level === 'AAA').length}`);
  console.log(`⚠️  AA:  ${warnCount}`);
  console.log(`❌ FAIL: ${failCount}`);

  if (failCount > 0) {
    console.log('\n⚠️  警告: WCAG AA基準を満たしていない色の組み合わせがあります');
    console.log('   視認性を改善してください');
  } else if (warnCount > 0) {
    console.log('\n✅ WCAG AA基準をクリアしています');
    console.log('   (AAA推奨: さらに視認性を向上できます)');
  } else {
    console.log('\n🎉 全てWCAG AAA基準をクリアしています！');
  }

  // FAILがある場合はエラーコードを返す（CI/CDでビルド失敗させる場合）
  // process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('エラー:', error);
  process.exit(1);
});

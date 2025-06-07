import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // ブラウザのグローバル変数を許可
        'window': 'readonly',
        'document': 'readonly',
        'console': 'readonly',
        'fetch': 'readonly',
        'Response': 'readonly',
        // Phaserのグローバル変数を許可
        'Phaser': 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'unused-imports': unusedImports
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // インデントはスペース2つ
      'indent': ['error', 2],
      // 文字列はシングルクォートを使用
      'quotes': ['error', 'single'],
      // 末尾セミコロン必須
      'semi': ['error', 'always'],
      // 未使用の変数とインポートを自動修正
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', {
        'varsIgnorePattern': '^_',
        'argsIgnorePattern': '^_'
      }],
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      // anyの使用を警告に
      '@typescript-eslint/no-explicit-any': 'warn',
      // console関数の使用を制限（修正版）
      'no-console': ['warn'],
      // loggerユーティリティの使用を推奨するカスタムルール
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CallExpression[callee.object.name="console"]',
          message: 'console.* の代わりに logger.* を使用してください。例: logger.info(), logger.error(), logger.debug()'
        }
      ],
      // 相対パスでのimportを禁止し、絶対パスを強制
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['../*', './*'],
          message: '相対パスでのimportは禁止されています。代わりに絶対パス（src/からのパス）を使用してください。'
        }]
      }]
    }
  },
  // utils/logger.ts ファイルではconsole関数の使用を許可
  {
    files: ['**/utils/logger.ts'],
    rules: {
      'no-console': 'off',
      'no-restricted-syntax': 'off'
    }
  }
]; 
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

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
        // Phaserのグローバル変数を許可
        'Phaser': 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // インデントはスペース2つ
      'indent': ['error', 2],
      // 文字列はシングルクォートを使用
      'quotes': ['error', 'single'],
      // 末尾セミコロン必須
      'semi': ['error', 'always'],
      // 未使用の変数を警告に
      '@typescript-eslint/no-unused-vars': ['warn', {
        'varsIgnorePattern': '^_',
        'argsIgnorePattern': '^_'
      }],
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
      ]
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
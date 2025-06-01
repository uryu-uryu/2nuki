import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        assetsInlineLimit: 0,
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            'src': resolve(__dirname, 'src')
        }
    },
    define: {
        'global': 'globalThis',
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis'
            }
        }
    },
    plugins: [],
    server: {
        host: true
    }
});

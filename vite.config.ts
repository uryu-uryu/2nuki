import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        assetsInlineLimit: 0,
    },
    resolve: {
        alias: {
            'src': path.resolve(__dirname, './src')
        }
    }
});

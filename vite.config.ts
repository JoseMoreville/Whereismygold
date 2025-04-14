import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { ViteDevServer } from 'vite';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';

const viteServerConfig = () => ({
    name: 'add-headers',
    configureServer: (server: ViteDevServer) => {
        server.middlewares.use((req, res, next) => {
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            next();
        });
    },
});
// https://vite.dev/config/
export default defineConfig({
    optimizeDeps: {
        esbuildOptions: {
            target: 'es2022',
        },
        exclude: ['@leaningtech/cheerpx'],
    },
    plugins: [
        react(),
        viteServerConfig(),
        checker({
            typescript: true,
        }),
        tailwindcss(),
        VitePWA({
            // you can generate the icons using: https://favicon.io/favicon-converter/
            // and the maskable icon using: https://progressier.com/maskable-icons-editor
            manifest: {
                name: 'Where is my gold?',
                short_name: 'Where is my gold?',
                description: 'Where is my gold?',
                theme_color: '#ffffff',
                start_url: '/',
                display: 'fullscreen',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        __APP_NAME__: JSON.stringify(process.env.npm_package_name),
    },
    build: {
        target: 'es2022',
        rollupOptions: {
            output: {
                manualChunks: {
                    'lib/@mui/joy': ['@mui/joy'],
                    'lib/react-markdown': ['react-markdown', 'rehype-raw', 'remark-gfm'],
                },
            },
        },
    },
});

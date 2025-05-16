import { build } from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

// Get external dependencies to exclude from bundle
const external = [
    // List any dependencies you want to exclude from the bundle
    // For now, we'll keep all dependencies bundled
];

async function runBuild() {
    try {
        // Bundle the main application
        await build({
            entryPoints: ['src/mcp.ts'],
            bundle: true,
            platform: 'node',
            target: 'node16',
            outfile: 'dist/index.js',
            format: 'cjs',
            minify: true,
            external,
            banner: {
                js: '#!/usr/bin/env node',
            },
        });

        console.log('⚡ Build completed successfully!');
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

runBuild(); 
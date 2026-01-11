import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/js/main.js',
  output: {
    file: 'site/bundle.js',
    format: 'iife',
    sourcemap: !production,
    name: 'Theora'
  },
  plugins: [
    json(),
     
    replace({
      preventAssignment: true,
      // --- AI Provider Configuration ---
      // Set the primary AI provider: 'bedrock' or 'edenai'
      'import.meta.env.AI_PROVIDER': JSON.stringify('bedrock'), 

      // --- AWS Bedrock Configuration (from environment variables) ---
      'import.meta.env.AWS_ACCESS_KEY_ID': JSON.stringify(process.env.AWS_ACCESS_KEY_ID || ""),

      'import.meta.env.AWS_SECRET_ACCESS_KEY': JSON.stringify(process.env.AWS_SECRET_ACCESS_KEY || ""),
      'import.meta.env.AWS_REGION': JSON.stringify(process.env.AWS_REGION || 'us-east-1'),

      // --- Eden AI Configuration (as constants) ---
      'import.meta.env.EDEN_AI_API_KEY': JSON.stringify(process.env.EDEN_AI_API_KEY || ""), // Replace with your actual key
      'import.meta.env.EDEN_AI_MODEL': JSON.stringify('deepseek'), // Specify desired Eden AI model

      // --- Firebase Configuration ---
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY || ""),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID || ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID || ''),
    }),
    
    postcss({
      extensions: ['.css'],
      extract: 'bundle.css',
      minimize: production,
      config: {
        path: './postcss.config.cjs'
      }
    }),

    resolve({
      browser: true,
      preferBuiltins: false
    }),

    commonjs(),

    copy({
      targets: [
        { src: 'src/index.html', dest: 'site' },
        { src: 'src/sw.js', dest: 'site' },
        { src: 'src/logo.png', dest: 'site/assets' },
        { src: 'public/assets/*', dest: 'site/assets' }
      ],
      hook: 'writeBundle'
    }),

    !production && serve({
      open: false,
      contentBase: '',
      host: '0.0.0.0',
      port: 5005,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }),

    !production && livereload('site'),

    production && terser()
  ]
};

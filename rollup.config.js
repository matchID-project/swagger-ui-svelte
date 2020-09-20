import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import sass from 'rollup-plugin-sass';
import postcss from 'postcss'
import pkg from "./package.json";

const mode = process.env.NODE_ENV;
const production = !process.env.ROLLUP_WATCH;

const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./src/**/*.svelte", "./src/**/*.html"],
  whitelistPatterns: [/^swagger/],
  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
});

function serve() {
	let server;
	
	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default [
  {
    input: 'src/main.ts',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: 'public/build/bundle.js'
    },
    plugins: [
      sass({
        includePaths: ['src/scss', 'node_modules'],
        output: 'public/global.css',
        processor: css => postcss(...(mode === "production" ? [purgecss] : []))
        .process(css)
        .then(result => result.css),
        options: {
          outputStyle: 'compressed',
          sourceMap: false,
        }
      }),
      svelte({
        // enable run-time checks when not in production
        dev: !production,
        // we'll extract any component CSS out into
        // a separate file - better for performance
        css: css => {
          css.write('bundle.css');
        },
        preprocess: sveltePreprocess(),
      }),

      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production
      }),

      // In dev mode, call `npm run start` once
      // the bundle has been generated
      !production && serve(),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      !production && livereload('public'),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser()
    ],
    watch: {
      clearScreen: false
    }
  },
  {
    input: "src/SwaggerUISvelte.svelte",
    output: { file: pkg.main, format: "umd", name: "SwaggerUISvelte" },
    plugins: [svelte(), resolve(), commonjs()]
  },
  {
    input: "src/SwaggerUISvelte.svelte",
    output: { file: pkg.module, format: "es" },
    external: ["svelte/internal"],
    plugins: [svelte(), commonjs()]
  }
];

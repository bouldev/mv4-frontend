import { appTools, defineConfig } from '@modern-js/app-tools';
import { tailwindcssPlugin } from '@modern-js/plugin-tailwindcss';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
    state: true,
  },
  output: {
    copy: [
      {
        from: './src/assets/static',
        to: 'static',
      },
    ],
    charset: 'utf8',
    disableSourceMap: process.env.NODE_ENV === 'production',
  },
  html: {
    title: 'FastBuilder 用户中心',
    meta: {
      description: 'FastBuilder user center next generation',
    },
    favicon: './src/assets/logo.svg',
    template: './src/html/template.html',
  },
  tools: {
    postcss: (config, { addPlugins }) => {
      addPlugins(require('postcss-preset-mantine'));
      addPlugins(
        require('postcss-simple-vars')({
          variables: {
            'mantine-breakpoint-xs': '36em',
            'mantine-breakpoint-sm': '48em',
            'mantine-breakpoint-md': '62em',
            'mantine-breakpoint-lg': '75em',
            'mantine-breakpoint-xl': '88em',
          },
        }),
      );
    },
    devServer: {
      proxy: {
        '/api': 'http://localhost:23159',
        '/captcha-api': 'http://localhost:23169',
      },
    },
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
  plugins: [
    appTools({
      bundler: 'experimental-rspack',
    }),
    tailwindcssPlugin(),
  ],
});

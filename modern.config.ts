import { appTools, defineConfig } from '@modern-js/app-tools';
import { tailwindcssPlugin } from '@modern-js/plugin-tailwindcss';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
    state: true,
  },
  output: {
    charset: 'utf8',
    disableSourceMap: process.env.NODE_ENV === 'production',
  },
  html: {
    title: 'FBUC Next',
    meta: {
      description: 'FastBuilder user center next generation',
    },
    favicon: './src/assets/logo.svg',
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

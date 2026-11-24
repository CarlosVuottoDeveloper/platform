import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';
import type { PluginBuild } from 'esbuild';

const CODEGEN_STUB_SOURCE = `export default function codegenNativeComponent(name) {
  function NativeComponent(props) { return props.children ?? null; }
  NativeComponent.displayName = name;
  return NativeComponent;
}`;

const codegenStubPlugin: Plugin = {
  name: 'react-native-codegen-stub',
  resolveId(id) {
    if (id.endsWith('/codegenNativeComponent')) {
      return '\0react-native-codegen-stub';
    }
  },
  load(id) {
    if (id === '\0react-native-codegen-stub') {
      return CODEGEN_STUB_SOURCE;
    }
  },
};

const codegenStubEsbuildPlugin = {
  name: 'react-native-codegen-stub-esbuild',
  setup(build: PluginBuild) {
    build.onResolve({ filter: /\/codegenNativeComponent$/ }, () => ({
      path: 'react-native-codegen-stub',
      namespace: 'react-native-codegen-stub',
    }));
    build.onLoad({ filter: /.*/, namespace: 'react-native-codegen-stub' }, () => ({
      contents: CODEGEN_STUB_SOURCE,
      loader: 'js' as const,
    }));
  },
};

const FABRIC_SVG_MODULE_STUB_SOURCE = `const noop = () => null;
export default {
  toDataURL: noop, getBBox: noop, getCTM: noop, getScreenCTM: noop,
  isPointInFill: noop, isPointInStroke: noop, getTotalLength: noop, getPointAtLength: noop,
};`;
const FABRIC_SVG_MODULE_FILTER = /\/fabric\/NativeSvg(Renderable|View)Module(\.js)?$/;

const fabricSvgModuleStubPlugin: Plugin = {
  name: 'react-native-svg-fabric-module-stub',
  resolveId(id) {
    if (FABRIC_SVG_MODULE_FILTER.test(id)) {
      return '\0react-native-svg-fabric-module-stub';
    }
  },
  load(id) {
    if (id === '\0react-native-svg-fabric-module-stub') {
      return FABRIC_SVG_MODULE_STUB_SOURCE;
    }
  },
};

const fabricSvgModuleStubEsbuildPlugin = {
  name: 'react-native-svg-fabric-module-stub-esbuild',
  setup(build: PluginBuild) {
    build.onResolve({ filter: FABRIC_SVG_MODULE_FILTER }, () => ({
      path: 'react-native-svg-fabric-module-stub',
      namespace: 'react-native-svg-fabric-module-stub',
    }));
    build.onLoad({ filter: /.*/, namespace: 'react-native-svg-fabric-module-stub' }, () => ({
      contents: FABRIC_SVG_MODULE_STUB_SOURCE,
      loader: 'js' as const,
    }));
  },
};

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/react-vite', options: {} },
  typescript: { reactDocgen: 'react-docgen-typescript' },

  async viteFinal(baseConfig) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(baseConfig, {
      plugins: [codegenStubPlugin, fabricSvgModuleStubPlugin],
      resolve: {
        alias: {
          'react-native': 'react-native-web',
        },
        // Metro picks a `.web.*` sibling over the native file on its own; Vite
        // doesn't, so without these extensions react-native-svg and
        // react-native-safe-area-context silently load their native entry
        // points and every icon and SVG shape renders as nothing.
        extensions: [
          '.web.js',
          '.web.ts',
          '.web.tsx',
          '.web.jsx',
          '.mjs',
          '.js',
          '.mts',
          '.ts',
          '.jsx',
          '.tsx',
          '.json',
        ],
      },
      optimizeDeps: {
        include: ['react-native-web'],
        exclude: ['react-native-safe-area-context'],
        esbuildOptions: {
          plugins: [codegenStubEsbuildPlugin, fabricSvgModuleStubEsbuildPlugin],
        },
      },
    });
  },
};

export default config;

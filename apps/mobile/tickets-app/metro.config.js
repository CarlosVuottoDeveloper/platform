const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force a single instance of react and react-native across the entire monorepo
// bundle. Both are pinned to the app-local node_modules.
//
// WHY resolveRequest and not extraNodeModules:
//   extraNodeModules is only a last-resort fallback — Metro checks it AFTER
//   nodeModulesPaths succeeds. If the specifier already exists anywhere in
//   node_modules it is found there first and extraNodeModules is never reached.
//   resolveRequest is called BEFORE nodeModulesPaths and intercepts
//   unconditionally.
//
// WHY pin react to app-local (not root):
//   react-native 0.86.3 ships a renderer built against React 19.2.3 and does
//   an exact version check: throws if React.version !== "19.2.3". The monorepo
//   root has react ^19.2.5 (for the web app), which can resolve to a
//   different patch version. Pinning to app-local ensures the renderer sees
//   exactly 19.2.3 from every import site.
//
// WHY 'react/*' and 'react-native/*' matter:
//   The automatic JSX transform imports 'react/jsx-runtime' and
//   'react/jsx-dev-runtime' as separate specifiers.
//   Codegen-transformed native components import
//   'react-native/Libraries/NativeComponent/NativeComponentRegistry' to
//   register their view configs. react-native-safe-area-context is hoisted to
//   the monorepo root, so without interception its transformed output resolves
//   react-native from the root copy and registers in the root's
//   ReactNativeViewConfigRegistry Map. The renderer (app-local react-native)
//   reads a different Map and never finds the entry, producing "View config
//   getter callback must be a function (received undefined)". Pinning both to
//   app-local makes registration and lookup use the same Map.
//
// WHY react-native-safe-area-context is also pinned:
//   @industry/mobile's Sheet imports react-native-safe-area-context directly,
//   and its own package.json (needed to run its Storybook) pulls in a private
//   copy under packages/design-system/industry/mobile/node_modules — yarn does
//   not reliably dedupe it against the app-local install even when the
//   version ranges overlap. Without this branch, Metro resolves two separate
//   copies (root/app-local vs. the one nested in industry/mobile), each
//   registering the RNCSafeAreaProvider native view, producing "Invariant
//   Violation: Tried to register two views with the same name
//   RNCSafeAreaProvider" at runtime.
//
// WHY react-native-svg is also pinned:
//   lucide-react-native (root-only, not nohoisted) and @industry/mobile's own
//   chart components require('react-native-svg') from directories whose
//   upward node_modules walk lands on the ROOT copy, while
//   react-native-svg is nohoisted app-local (apps/mobile/tickets-app's own
//   package.json + nohoist) for native autolinking to see it — so the JS
//   bundle and the natively-linked copy are two different module instances
//   at the same version. Same-version does not mean same file: without this
//   branch, icons/charts mount with no thrown error but render nothing,
//   because the JS-side Fabric registration doesn't match what's compiled
//   into the native binary.
const PINNED_MODULES = [
  'react',
  'react-native',
  'react-native-safe-area-context',
  'react-native-svg',
];
const appLocalNodeModules = path.resolve(projectRoot, 'node_modules');
const _originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isPinned = PINNED_MODULES.some(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`),
  );
  if (isPinned) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName, { paths: [appLocalNodeModules] }),
    };
  }
  if (_originalResolveRequest) {
    return _originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

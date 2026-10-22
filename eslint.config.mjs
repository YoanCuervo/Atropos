import eslint from "@electron-toolkit/eslint-config";
import eslintConfigPrettier from "@electron-toolkit/eslint-config-prettier";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginReactRefresh from "eslint-plugin-react-refresh";

const SIDE_EFFECT_NODE_MODULES = [
  "fs",
  "fs/promises",
  "child_process",
  "http",
  "https",
  "net",
];

const SIDE_EFFECT_IMPORT_NAMES = [
  "electron",
  ...SIDE_EFFECT_NODE_MODULES.flatMap((moduleName) => [
    moduleName,
    `node:${moduleName}`,
  ]),
];

const SIDE_EFFECT_IMPORT_RESTRICTIONS = SIDE_EFFECT_IMPORT_NAMES.map(
  (importName) => ({
    name: importName,
    message: "src/core must stay pure: perform side effects in its callers.",
  }),
);

export default [
  { ignores: ["**/node_modules", "**/dist", "**/out", "**/coverage"] },
  eslint,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat["jsx-runtime"],
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      "react-hooks": eslintPluginReactHooks,
      "react-refresh": eslintPluginReactRefresh,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules,
      // React 19 no longer checks propTypes; component props are typed with JSDoc instead.
      "react/prop-types": "off",
    },
  },
  {
    files: ["src/core/**/*.js"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: SIDE_EFFECT_IMPORT_RESTRICTIONS },
      ],
    },
  },
  eslintConfigPrettier,
];

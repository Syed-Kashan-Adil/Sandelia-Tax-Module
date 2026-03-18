// eslint.config.js (Complete Version)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

// --- NEW IMPORTS ---
import react from "eslint-plugin-react"; // Needed for basic rules/settings
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwind from "eslint-plugin-tailwindcss"; // CRUCIAL for v4/Shadcn
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default defineConfig([
  // 1. Global Ignores (Kept your 'dist' ignore)
  globalIgnores(["dist", "node_modules", ".vite"]),

  // 2. Base TypeScript, React, and Quality Rules
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react, // Needed to make settings below work
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort, // Import sorting
      "unused-imports": unusedImports, // Unused variable cleanup
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    settings: {
      react: { version: "detect" }, // Auto-detect React version
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      // React hooks (ported from plugin recommended config)
      ...(reactHooks.configs.recommended?.rules ?? {}),
      // General React Clean-up
      "react/prop-types": "off", // Disable for TS projects
      "react/react-in-jsx-scope": "off",
      // TypeScript Clean-up
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "off", // Off, prefer unused-imports
      // Import Sorting and Cleanup
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", args: "after-used", ignoreRestSiblings: true },
      ],
    },
  },

  // 3. Tailwind CSS Plugin (CRUCIAL for v4 & Shadcn)
  ...tailwind.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx}"],
    settings: {
      tailwindcss: {
        // Tells the plugin to check classes inside the cn/cva helpers
        callees: ["cn", "cva"],
        // Tailwind v4 uses CSS config, so no JS config file reference needed
        config: null,
      },
    },
    rules: {
      // Tailwind v4 + CSS theme tokens often look "custom" to the plugin.
      // Keep the plugin enabled for obvious mistakes, but don't hard-fail on token classes.
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-custom-classname": "off",
    },
  },

  // 4. Prettier Integration (Must be LAST to turn off conflicting rules)
  prettierConfig, // Turns off all ESLint formatting rules
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { prettier },
    rules: {
      "prettier/prettier": [
        "error",
        {
          semi: false,
          singleQuote: true,
          printWidth: 100,
          trailingComma: "es5",
        },
      ], // Report Prettier violations as ESLint errors
    },
  },
]);

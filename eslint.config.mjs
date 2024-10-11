import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.node },rules: {
    "no-unused-vars": [
      "error",
      { argsIgnorePattern: /^next$|^req$|^res$|^_$/ }
    ]
  }},
  pluginJs.configs.recommended,
];
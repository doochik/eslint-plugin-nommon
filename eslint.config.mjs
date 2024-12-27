import eslintConfigESLint from "eslint-config-eslint";
import globals from "globals";

export default [
    ...eslintConfigESLint,
    {
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    }
];

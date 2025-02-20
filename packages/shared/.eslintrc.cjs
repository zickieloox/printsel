module.exports = {
  root: true,
  extends: ['custom'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  ],
  ignorePatterns: ['**/*.d.ts'],
};

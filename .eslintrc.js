module.exports = {
  root: true,
  extends: [
    "@vercel/style-guide/eslint/node",
    "@vercel/style-guide/eslint/typescript",
  ].map(require.resolve),
  parser: "@typescript-eslint/parser",
  parserOptions: { project: ["tsconfig.json"] },
  plugins: ["@typescript-eslint"],
  rules: {},
  ignorePatterns: ["out"],
};

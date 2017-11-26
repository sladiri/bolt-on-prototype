module.exports = {
  parser: "babel-eslint",
  plugins: ["react"],
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/react"
  ],
  rules: {
    "no-debugger": 0,
    "no-console": 0,
    "react/prop-types": 0
  }
};

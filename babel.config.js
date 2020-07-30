module.exports = {
  presets: [
    [
      "next/babel",
      {
        "preset-env": {
          targets: {
            chrome: "58",
            ie: "11"
          },
          useBuiltIns: "usage",
          corejs: 2
        }
      }
    ]
  ],
  plugins: [
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining"
  ],
  env: {
    test: {
      plugins: ["require-context-hook"]
    }
  }
};

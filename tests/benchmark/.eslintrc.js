module.exports = {
  extends: [require.resolve("@seact/eslint-config-custom/server")],
  rules: {
    "no-await-in-loop": "off",
  },
};

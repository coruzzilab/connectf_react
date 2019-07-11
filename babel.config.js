module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": [
            "> 1%",
            "last 2 versions",
            "Firefox ESR",
            "not dead"
          ]
        }
      }
    ],
    "@babel/preset-react"
  ];

  const plugins = [
    "babel-plugin-styled-components"
  ];

  return {
    presets,
    plugins
  };
};

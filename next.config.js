const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");
const withPlugins = require("next-compose-plugins");
const withSass = require("@zeit/next-sass");
const withCss = require("@zeit/next-css");
const withBundleAnalyzer = require("@zeit/next-bundle-analyzer");
const withImages = require("next-images");
const withTranspileModules = require("next-transpile-modules");

const {
  // AGENT_ID: agentId,
  ANALYZE_BUNDLE: analyzeBundle,
  IS_LOCAL: isLocal,
  STAGE: stage
} = process.env;

const hostedEnvironment = ["test", "qa", "prod", "dev"].find(
  env => stage && stage.includes(env)
);

// Set config file to prod by default
const configFile = hostedEnvironment || "prod";
const configPath = `./config/${isLocal ? "local" : configFile}.env`;

// eslint-disable-next-line
console.log(`Loading config from ${configPath}`);

require("dotenv").config({ path: configPath });

module.exports = withPlugins(
  [
    [withTranspileModules(["apollo-server-env", "react-spring"]), {}],
    [
      withImages,
      {
        inlineImageLimit: 0
      }
    ],
    [withCss],
    [
      withSass,
      {
        cssModules: true,
        cssLoaderOptions: {
          importLoaders: 1,
          localIdentName: isLocal
            ? "🏎[name]__[local]--[hash:base64:6]"
            : "🏎[hash:base64:6]"
        }
      }
    ],
    [
      withBundleAnalyzer,
      {
        analyzeServer: ["server", "both"].includes(analyzeBundle),
        analyzeBrowser: ["browser", "both"].includes(analyzeBundle),
        bundleAnalyzerConfig: {
          server: {
            analyzerMode: "server",
            analyzerPort: 8888
          },
          browser: {
            analyzerMode: "server",
            analyzerPort: 8889
          }
        }
      }
    ]
  ],
  {
    compress: false,
    env: {
      API_HOST: process.env.API_HOST,
      DEV_API: process.env.DEV_API,
      DEV_API_KEY: process.env.DEV_API_KEY,
      DISABLE_THIRD_PARTY_SCRIPTS: process.env.DISABLE_THIRD_PARTY_SCRIPTS,
      GRAPHQL_HOST: process.env.GRAPHQL_HOST,
      HOSTNAME: process.env.HOSTNAME,
      IS_LOCAL: process.env.IS_LOCAL,
      ORIGIN: process.env.ORIGIN,
      STAGE: process.env.STAGE,
      SAILTHRU_CUSTOMER_ID: process.env.SAILTHRU_CUSTOMER_ID
    },
    target: "serverless",
    webpack: config => {
      config.plugins.push(
        new FilterWarningsPlugin({
          exclude: /mini-css-extract-plugin[^]*Conflicting order between:/
        })
      );

      return config;
    }
  }
);

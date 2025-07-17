const fs = require("fs");
const { chalk, warn } = require("@vue/cli-shared-utils");

module.exports = (api, options) => {
  const userOptions = options.pwa || {};
  // const pwaMode = userOptions.workboxPluginMode ?? 'GenerateSW'
  // const workboxOptions = userOptions.workboxOptions

  // if(pwaMode === 'GenerateSW') {
  //   // 改成InjectManifest的模式
  //   userOptions.workboxPluginMode = 'InjectManifest'
  //   // 本地生成一个名为syz-service-worker.js的文件
  //   // exclude 这个参数不需要做处理
  //   // maximumFileSizeToCacheInBytes 这个参数也不需要处理
  //   // navigateFallback 这个参数需要处理
  //   // runtimeCaching 这个参数需要处理
  //   // skipWaiting 这个参数需要处理
  // } else if(pwaMode === 'InjectManifest') {

  // } else {
  //   // 不支持的模式
  //   return 1
  // }

  const manifestPath = api.resolve("public/manifest.json");
  if (fs.existsSync(manifestPath)) {
    if (!userOptions.manifestOptions) {
      userOptions.manifestOptions = require(manifestPath);
    } else {
      warn(
        `The ${chalk.red(
          "public/manifest.json"
        )} file will be ignored in favor of ${chalk.cyan(
          "pwa.manifestOptions"
        )}`
      );
    }
  }

  api.chainWebpack((webpackConfig) => {
    const target = process.env.VUE_CLI_BUILD_TARGET;
    if (target && target !== "app") {
      return;
    }

    const name = api.service.pkg.name;

    // the pwa plugin hooks on to html-webpack-plugin
    // and injects icons, manifest links & other PWA related tags into <head>
    webpackConfig
      .plugin("pwa")
      .use(require("./lib/HtmlPwaPlugin"), [
        Object.assign(
          {
            name,
          },
          userOptions
        ),
      ])
      .after("html");

    // generate /service-worker.js in production mode
    if (process.env.NODE_ENV === "production") {
      // Default to GenerateSW mode, though InjectManifest also might be used.
      const workboxPluginMode = userOptions.workboxPluginMode || "GenerateSW";
      const workboxWebpackModule = require("workbox-webpack-plugin");
      const syzWorkboxWebpackModule = require("syz-workbox-webpack-plugin");

      if (!(workboxPluginMode in workboxWebpackModule)) {
        throw new Error(
          `${workboxPluginMode} is not a supported Workbox webpack plugin mode. ` +
            `Valid modes are: ${Object.keys(workboxWebpackModule).join(", ")}`
        );
      }

      const defaultOptions = {
        exclude: [
          /\.map$/,
          /img\/icons\//,
          /favicon\.ico$/,
          /^manifest.*\.js?$/,
        ],
      };

      const defaultGenerateSWOptions =
        workboxPluginMode === "GenerateSW" ? { cacheId: name } : {};

      const workBoxConfig = Object.assign(
        defaultOptions,
        defaultGenerateSWOptions,
        userOptions.workboxOptions
      );

      webpackConfig
        .plugin("workbox")
        .use(workboxWebpackModule[workboxPluginMode], [workBoxConfig]);
      webpackConfig
        .plugin("syzworkboxwebpackplugin")
        .use(syzWorkboxWebpackModule, { swDest: "service-worker-syz.js" });
    }
  });

  // install dev server middleware for resetting service worker during dev
  const createNoopServiceWorkerMiddleware = require("./lib/noopServiceWorkerMiddleware");
  api.configureDevServer((app) => {
    app.use(createNoopServiceWorkerMiddleware());
  });
};

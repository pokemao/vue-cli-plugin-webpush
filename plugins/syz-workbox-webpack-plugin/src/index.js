const { sources } = require("webpack");

class SyzModifySWPlugin {
  constructor(options = {}) {
    console.log("shao options", options);

    this.options = {
      swDest: "service-worker.js", // 默认输出文件名
      customCode: "", // 要追加的自定义代码
      ...options,
    };
  }

  apply(compiler) {
    const { Compilation } = compiler.webpack;

    compiler.hooks.compilation.tap("SyzModifySWPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "SyzModifySWPlugin",
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE, // 在 Workbox 生成资产后运行
        },
        (assets) => {
          console.log("shao", assets);

          // // 获取 service-worker.js 文件
          // const swAsset = assets[this.options.swDest];
          // if (!swAsset) {
          //   compilation.warnings.push(
          //     new Error(`Service worker file ${this.options.swDest} not found in assets.`)
          //   );
          //   return;
          // }

          // // 获取文件内容
          // let source = swAsset.source().toString();

          // // 追加自定义代码
          // if (this.options.customCode) {
          //   source += `\n\n// Custom code injected by SyzModifySWPlugin\n${this.options.customCode}`;
          // }

          // // 更新资产
          // assets[this.options.swDest] = new sources.RawSource(source);
        }
      );
    });
  }
}

module.exports = SyzModifySWPlugin;

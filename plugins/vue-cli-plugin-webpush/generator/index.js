module.exports = api => {
  // 判断是否存在@vue/cli-plugin-pwa
  let hasAddPWA = false
  const g1c1 = api.pkg.dependencies['@vue/cli-plugin-pwa']
  const g1c2 = api.pkg.devDependencies['@vue/cli-plugin-pwa']
  const g1 = g1c1 || g1c2
  const g2c1 = api.pkg.dependencies['register-service-worker']
  const g2c2 = api.pkg.devDependencies['register-service-worker']
  const g2 = g2c1 || g2c2
  if (g1 || g2) {
    hasAddPWA = true
  }
  // 用户已经安装了pwa这个插件了
  if (hasAddPWA) {
    // 从用户的package.json中移除@vue/cli-plugin-pwa
    api.extendPackage({
      dependencies: {
        '@vue/cli-plugin-pwa': undefined
      },
      devDependencies: {
        '@vue/cli-plugin-pwa': undefined
      }
    })
    // 之后还需要处理么？
  } else {
    // 走一遍vue add pwa的流程
    api.extendPackage({
      dependencies: {
        'register-service-worker': '^1.7.2'
      }
    })
    api.injectImports(api.entryFile, `import './registerServiceWorker'`)
    api.render('./template')
    if (api.invoking && api.hasPlugin('typescript')) {
      /* eslint-disable-next-line node/no-extraneous-require */
      const convertFiles = require('@vue/cli-plugin-typescript/generator/convert')
      convertFiles(api)
    }
  }
}
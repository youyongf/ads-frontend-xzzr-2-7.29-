const prodPlugins = [];

if(process.env.NODE_ENV === 'production'&&process.env.VUE_APP_VCONSOLE_STATUS=='OPEN') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 发布产品时的插件数组
    ...prodPlugins
  ]
}

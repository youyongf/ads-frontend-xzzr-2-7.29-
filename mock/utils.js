const fs = require('fs')
const resolve = require('path').resolve

const readDirSync = dirPath => {
  const result = [], dirs = []
  const files = fs.readdirSync(dirPath)
  files.forEach(file => {
    const stat = fs.statSync(resolve(dirPath, file))
    stat.isDirectory() ? dirs.push(file) : result.push(resolve(dirPath, file))
  })
  dirs.forEach(dir => result.push(...readDirSync(resolve(dirPath, dir))))
  return result
}

const requireContext = (dirPath, deep = false, reg) => {
  dirPath = resolve(process.cwd(), dirPath)

  let files = deep ? readDirSync(dirPath) : fs.readdirSync(dirPath).filter(file => !fs.statSync(resolve(dirPath, file)).isDirectory())

  if (reg instanceof RegExp) {
    files = files.filter(file => reg.test(file))
  }

  const context = file => require(file)
  context.keys = () => files.map(file => resolve(dirPath, file))

  return context
}

/**
 * @param {string} url
 * @returns {Object}
 */
function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

module.exports = {
  requireContext,
  param2Obj
}

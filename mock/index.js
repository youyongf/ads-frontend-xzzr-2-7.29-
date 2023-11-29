
const { requireContext } = require("./utils");
const dirName = "./mock/mock_data";
const mocks = getFileContextList(dirName);


function getFileContextList(dir) {
  const result = [];
  const fileList = requireContext(dir, true, /\.js$/);
  let files = fileList.keys();
  if(!files.length) return ;
  files.forEach(paths => {
    const content = require(paths);
    result.push(...content)
  });
  return result;
}

module.exports = {
  mocks,
}

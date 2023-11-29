const context = require.context('./th', true, /\.js$/);
const result = {}
context.keys().forEach((key) => {
  const module = context(key).default;
  if (module) {
    Object.assign(result, module);
  }
});
export default result;
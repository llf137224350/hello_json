/**
 * 配置文件
 */
const Config = {
  MODEL_CHANGED: 1, //  模式切换格式化
  INPUT_CHANGED: 2, // 输入框变化格式化
  // 当前格式化json模式
  OPEN_MODE: 1, // 展开模式
  FOLD_MODE: 2, // 折叠模式
  // 导出模式
  NOT_EXPORT: 1, // don't export
  EXPORT: 2, // export
  EXPORT_DEFAULT: 3, // export default
  //  json折叠或展开状态
  FOLD_STATUS: 0,// 折叠状态
  OPEN_STATUS: 1,// 展开状态

  INDENT_STR: '&nbsp;&nbsp;',
  NORMAL_TYPES: ['string', 'number', 'boolean']
}
export default Config;

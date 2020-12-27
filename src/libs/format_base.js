import Config from "../util/config";

const normalTypes = Config.NORMAL_TYPES;
/**
 * 解析左大括号
 * @returns {string}
 * @private
 */
export const _getRenderLeftBrackets = () => {
  return `<span class="brackets">{</span>`
}
/**
 * 获取渲染的右大括号
 * @returns {string}
 * @private
 */
export const _getRenderRightBrackets = () => {
  return `<span class="brackets">}</span>`
}
/**
 * 获取渲染的左中括号
 * @returns {string}
 * @private
 */
export const _getRenderLeftSquareBrackets = () => {
  return `<span class="brackets">[</span>`
}
/**
 * 获取渲染的右中括号
 * @returns {string}
 * @private
 */
export const _getRenderRighSquareBrackets = () => {
  return `<span class="brackets">]</span>`
}

/**
 * 获取渲染的对象key
 * @param key
 * @returns {string}
 * @private
 */
export function _getRenderKey(key) {
  return `<span class="key copy" data-clipboard-text="${key}">${key}</span>`;
}

/**
 * 获取渲染的对象value
 * @param val
 * @returns {string}
 * @private
 */
export const _getRenderValue = (val) => {
  if (typeof val === 'string') {
    val = _html2Escape(val);
    val = `<span class="copy string" data-clipboard-text="${val}">"${val}"</span>`
  } else {
    val = `<span class="copy" data-clipboard-text="${val}">${val}</span>`;
  }
  return val;
}
/**
 * 富文本转义
 * @param val 待转义字符串
 * @returns {*}
 * @private
 */
export const _html2Escape = (val) => {
  return val.replace(/[<>&"]/g, function (c) {
    return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c];
  });
}
/**
 * 是否为基本类型数组
 * @param arr 数组
 * @returns {boolean}
 * @private
 */
export const _isBaseTypeArr = (arr) => {
  let baseType = true;
  for (const item of arr) {
    if (typeof item === 'object') {
      baseType = false;
      break;
    }
  }
  return baseType;
}
/**
 * 是否为对象数组
 * @param arr 数组
 * @returns {boolean}
 * @private
 */
export const _isObjectArr = (arr) => {
  let isObjectType = true;
  for (const item of arr) {
    if (normalTypes.includes(typeof item) || item instanceof Array || !item instanceof Object) {
      isObjectType = false;
      break;
    }
  }
  return isObjectType;
}

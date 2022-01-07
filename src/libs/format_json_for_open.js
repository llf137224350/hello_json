import Config from "../util/config";
import {
  _getRenderKey,
  _getRenderLeftBrackets,
  _getRenderLeftSquareBrackets,
  _getRenderRighSquareBrackets,
  _getRenderRightBrackets,
  _getRenderValue,
  _isArray,
  _isBaseTypeArr,
  _isObject,
  _isObjectArr,
} from "./format_base";

const indent_str = Config.INDENT_STR;
const normalTypes = Config.NORMAL_TYPES;

/**
 * 格式化数组
 * @param arr 数组
 * @param currentStr 已经拼接的字符串
 * @param indent 缩进
 * @param key 对象key
 * @returns {string|*|string}
 * @private
 */
const _formatArr = (arr, currentStr, indent, key) => {
  if (!arr.length) {
    return (currentStr +=
      _getRenderLeftSquareBrackets() + _getRenderRighSquareBrackets());
  }
  currentStr += `${_getRenderLeftSquareBrackets()}`;
  // 判断数组是否为基本类型数组
  if (_isBaseTypeArr(arr)) {
    for (let i = 0; i < arr.length; i++) {
      currentStr +=
        `<br/>${indent + indent_str}` +
        _getRenderValue(arr[i]) +
        `${i !== arr.length - 1 ? "," : ""}`;
    }
  } else if (_isObjectArr(arr)) {
    // 判断是否都为对象的数组
    for (let i = 0; i < arr.length; i++) {
      currentStr += `${i === 0 ? "" : ","}<br/>${indent_str}${indent}`;
      currentStr = _format(arr[i], currentStr, indent + indent_str);
    }
  } else {
    // 大杂烩
    for (let i = 0; i < arr.length; i++) {
      currentStr += `<br/>${indent + indent_str}`;
      if (normalTypes.includes(typeof arr[i])) {
        currentStr += _getRenderValue(arr[i]);
      } else if (_isArray(arr[i])) {
        // 还是个数组
        currentStr = _formatArr(arr[i], currentStr, indent + indent_str, "");
      } else {
        currentStr = _format(arr[i], currentStr, indent + indent_str);
      }
      currentStr += `${i !== arr.length - 1 ? "," : ""}`;
    }
  }
  currentStr += `<br/>${indent}${_getRenderRighSquareBrackets()}`;
  return currentStr;
};
/**
 * 格式化对象
 * @param jsonObj js对象
 * @param currentStr 当前已经拼接的字符串
 * @param indent 缩进
 * @returns {string|*|string}
 * @private
 */
const _format = (jsonObj, currentStr, indent) => {
  let keys = [];
  try {
    keys = Reflect.ownKeys(jsonObj);
  } catch (e) {
    // jsonObj === null
    return (currentStr += _getRenderValue(jsonObj));
  }
  if (!keys.length) {
    return (currentStr += _getRenderLeftBrackets() + _getRenderRightBrackets());
  }
  currentStr += `${_getRenderLeftBrackets()}`;
  for (let i = 0; i < keys.length; i++) {
    // 普通类型
    currentStr += `${
      i === 0 ? "" : ","
    }<br/>${indent_str}${indent}${_getRenderKey(keys[i])}: `;
    if (normalTypes.includes(typeof jsonObj[keys[i]])) {
      currentStr += `${_getRenderValue(jsonObj[keys[i]])}`;
    } else if (_isArray(jsonObj[keys[i]])) {
      // 数组
      currentStr = _formatArr(
        jsonObj[keys[i]],
        currentStr,
        indent + indent_str,
        keys[i]
      );
    } else {
      currentStr = _format(jsonObj[keys[i]], currentStr, indent + indent_str);
    }
  }
  currentStr += `<br/>${indent}${_getRenderRightBrackets()}`;
  return currentStr;
};
/**
 * 格式化json字符串
 * @param jsonStr json字符串
 * @returns {*}
 */
const formatJSON = (jsonStr) => {
  let result = "";
  try {
    const  json = eval(`(${jsonStr})`);
    if (_isObject(json)) {
      result = _format(json, result, "");
    } else {
      result = _formatArr(json, result, "");
    }
  } catch (e) {
    console.log(e);
    result = e.message;
  }
  return result;
};
export default formatJSON;

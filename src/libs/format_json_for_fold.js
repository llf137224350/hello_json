import uuid from "../util/util";
import EncryptAndDecrypt from "../util/encrypt_and_decrypt";
import Config from '../util/config';
import {
  _getRenderKey,
  _getRenderLeftBrackets,
  _getRenderLeftSquareBrackets,
  _getRenderRighSquareBrackets,
  _getRenderRightBrackets,
  _getRenderValue,
  _isBaseTypeArr,
  _isObjectArr
} from './format_base';

const indent_str = Config.INDENT_STR;
const normalTypes = Config.NORMAL_TYPES;

/**
 * 格式化数组
 * @param arr 数组
 * @param currentStr 已经拼接的字符串
 * @param indent 缩进
 * @returns {string|*}
 * @private
 */
const _formatArr = (arr, currentStr, indent) => {
  if (!arr.length) {
    return currentStr += _getRenderLeftSquareBrackets() + _getRenderRighSquareBrackets();
  }
  currentStr += `${_getRenderLeftSquareBrackets()}`;
  // 判断数组是否为基本类型数组
  if (_isBaseTypeArr(arr)) {
    for (let i = 0; i < arr.length; i++) {
      currentStr += `<br/>${indent + indent_str}` + _getRenderValue(arr[i]) + `${i !== arr.length - 1 ? ',' : ''}`;
    }
  } else if (_isObjectArr(arr)) {// 判断是否都为对象的数组
    // debugger
    for (let i = 0; i < arr.length; i++) {
      const target = _getData(arr[i], indent);
      currentStr += `${i === 0 ? '' : ','}<br/>${indent_str}${indent}<span class="object iconfont" data-fold="${Config.FOLD_STATUS}" data-id="${target.id}" data-indent="${target.encryptIndent}"></span><span id="${target.id}">${_getRenderLeftBrackets()}...${_getRenderRightBrackets()}</span>`;
    }
  } else {
    // 大杂烩
    for (let i = 0; i < arr.length; i++) {
      currentStr += `<br/>${indent + indent_str}`;
      if (normalTypes.includes(typeof arr[i])) {

        currentStr += _getRenderValue(arr[i]);

      } else if (arr[i] instanceof Array) { // 还是个数组
        if (arr[i].length === 0) { // 空数组
          currentStr += _getRenderLeftSquareBrackets() + _getRenderRighSquareBrackets();
        } else {
          const target = _getData(arr[i], indent);
          currentStr += `<span class="array iconfont" data-fold="${Config.FOLD_STATUS}" data-id="${target.id}"></span><span id="${target.id}">${_getRenderLeftSquareBrackets()}...${_getRenderRighSquareBrackets()}</span>`;
        }
      } else {
        const target = _getData(arr[i], indent);
        currentStr += `<span class="object iconfont" data-fold="${Config.FOLD_STATUS}" data-id="${target.id}"></span><span id="${target.id}">${_getRenderLeftBrackets()}...${_getRenderRightBrackets()}</span>`;
      }
      currentStr += `${i !== arr.length - 1 ? ',' : ''}`
    }
  }
  currentStr += `<br/>${indent}${_getRenderRighSquareBrackets()}`;
  return currentStr;
}
/**
 * 获取数据
 * @param oldData 原始value
 * @param currentIndent 当前缩进
 * @returns {{encryptIndent, id: string, value: any}}
 * @private
 */
const _getData = (oldData, currentIndent) => {
  const id = uuid();
  let value = JSON.stringify(oldData);
  value = EncryptAndDecrypt.encryptByDESModeEBC(value)
  sessionStorage.setItem(id, value);

  const indentKey = EncryptAndDecrypt.encryptByDESModeEBC(id + 'indent');
  const encryptIndent = EncryptAndDecrypt.encryptByDESModeEBC(indent_str + currentIndent);
  sessionStorage.setItem(indentKey, encryptIndent);
  return {
    id
  }
}
/**
 * 格式化json
 * @param jsonObj js对象
 * @param currentStr 已经拼接好的字符串
 * @param indent  当前缩进
 * @returns {string}
 * @private
 */
const _format = (jsonObj, currentStr, indent) => {
  const keys = Reflect.ownKeys(jsonObj);
  if (!keys.length) {
    return currentStr += _getRenderLeftBrackets() + _getRenderRightBrackets();
  }
  currentStr += `${_getRenderLeftBrackets()}`;
  for (let i = 0; i < keys.length; i++) {
    // 普通类型
    if (normalTypes.includes(typeof jsonObj[keys[i]])) {
      currentStr += `${i === 0 ? '' : ','}<br/>${indent_str}${indent}${_getRenderKey(keys[i])}: `;
      currentStr += `${_getRenderValue(jsonObj[keys[i]])}`
    } else if (jsonObj[keys[i]] instanceof Array) { // 数组
      if (jsonObj[keys[i]].length === 0) { // 空数组
        currentStr += `${i === 0 ? '' : ','}<br/>${indent_str}${indent}${_getRenderKey(keys[i])}: `;
        currentStr += _getRenderLeftSquareBrackets() + _getRenderRighSquareBrackets();
      } else {
        currentStr = _getObjStr(keys[i], jsonObj[keys[i]], currentStr, indent, 'array', i);
      }
    } else {
      currentStr = _getObjStr(keys[i], jsonObj[keys[i]], currentStr, indent, 'object', i);
    }
  }
  currentStr += `<br/>${indent}${_getRenderRightBrackets()}`;
  return currentStr;
}
/**
 * 对象中处理对象和数组
 * @param key 当前的key
 * @param value 对应的value
 * @param currentStr 当前拼接的字符串
 * @param indent 缩进
 * @param type object | array
 * @param i 索引
 * @returns {string} 结果字符串
 * @private
 */
const _getObjStr = (key, value, currentStr, indent, type, i) => {
  const target = _getData(value, indent);
  currentStr += `${i === 0 ? '' : ','}<br/>${indent_str}${indent}<span class="${type} iconfont" data-fold="${Config.FOLD_STATUS}" data-id="${target.id}"></span>${_getRenderKey(key)}: `;
  if (type === 'object') {
    currentStr += `<span id="${target.id}">${_getRenderLeftBrackets()}...${_getRenderRightBrackets()}</span>`;
  } else {
    currentStr += `<span id="${target.id}">${_getRenderLeftSquareBrackets()}...${_getRenderRighSquareBrackets()}</span>`;
  }
  return currentStr;
}
/**
 * 格式化json
 * @param jsonStr
 * @param fold
 * @param indent
 * @param isObj
 * @returns {string|*}
 */
const formatJSON = (jsonStr, fold = Config.FOLD_STATUS, indent = '', isObj = true) => {
  let result = '';
  try {
    if (indent) { // 有缩进 当前fold传入0 ，则需要展开
      const value = EncryptAndDecrypt.decryptByDESModeEBC(jsonStr);
      if (fold === Config.OPEN_STATUS) {
        return isObj ? `${_getRenderLeftBrackets()}...${_getRenderRightBrackets()}` : `${_getRenderLeftSquareBrackets()}...${_getRenderRighSquareBrackets()}`;
      }
      const obj = JSON.parse(value);
      return isObj ? _format(obj, '', EncryptAndDecrypt.decryptByDESModeEBC(indent)) : _formatArr(obj, '', EncryptAndDecrypt.decryptByDESModeEBC(indent));
    }
    // 第一级
    const json = JSON.parse(jsonStr);
    result = _format(json, result, '');
  } catch (e) {
    console.log(e);
    result = e.message;
  }
  return result;
}
export default formatJSON;

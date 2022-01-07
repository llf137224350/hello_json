import Config from '../util/config';
// 接口名称
const interfaceName = 'Result'
// 直接拼接基本类型
const normalTypes = ['string', 'number', 'boolean', 'undefined'];
// 处理数组
let objs = [];
let interfaceNames = [];
let globalExportMode = Config.NOT_EXPORT;
let globalInterfaceNamePrefix = '';

// 生成的代码缩进 一个tab
const indent = '&nbsp;&nbsp;';

function _isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function _isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

/**
 * 获取接口名称
 * @param name 返回字段key
 * @returns {string} 返回处理过的名称
 */
function _getOnlyInterfaceName(name) {
  if (!interfaceNames.includes(name)) {
    return name;
  }
  // 取最后一位
  let lastCharacter = name.slice(-1)
  if (lastCharacter >= '0' && lastCharacter <= '9') {
    lastCharacter = parseInt(lastCharacter) + 1;
    return _getOnlyInterfaceName(name.substring(0, name.length - 1) + lastCharacter)
  } else {
    return _getOnlyInterfaceName(name + '1');
  }
}

function _getBaseName(key) {
  const firstName = key.substring(0, 1);
  const lastName = key.substring(1);
  return firstName.toUpperCase() + lastName;
}

function _getInterfaceName(key) {
  const arr = key.split('_');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = _getBaseName(arr[i]);
  }
  let fullName = arr.join('');
  fullName = globalInterfaceNamePrefix + _getBaseName(fullName)
  fullName = _getOnlyInterfaceName(fullName)
  interfaceNames.push(fullName)
  return fullName;
}

/**
 * 如果是导出为默认，只能导出最外一级
 * @param name
 * @returns {string}
 * @private
 */
function _getRenderInterface(name) {
  if ((globalExportMode === Config.EXPORT_DEFAULT && name === 'I' + interfaceName) || name === 'I' + interfaceName) { // export default 只能导出第一级
    return `<span class="keyword">${globalExportMode === Config.EXPORT ? 'export' : globalExportMode === Config.EXPORT_DEFAULT ? 'export default ' : ''} interface</span>`;
  }
  return `<span class="keyword">${globalExportMode === Config.EXPORT ? 'export ' : ''}interface</span>`;
}

function __getRenderInterfaceName(name) {
  if (name === 'I' + interfaceName) {
    return `<span class="main-interface-name">${name}</span>`;
  } else {
    return `<span>${name}</span>`;
  }
}

function _getRenderLeft() {
  return `<span class="brackets">{</span><br/>`;
}

function _getRenderRight() {
  return `<span class="brackets">}</span><br/>`
}

function _getRenderKey(key) {
  return `<span  class="key">${key}</span>`;
}

function _getRenderValue(value) {
  return ` <span class="keyword">${value}</span>;<br/>`;
}

/**
 * 判断数组是否为普通类型数组
 * @param arr
 * @returns {string}
 */
function _isBaseType(arr) {
  // 判断数组是否
  let type = typeof arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (type !== typeof arr[i]) {
      return 'any';
    }
  }
  return type;
}

/**
 * 处理数组
 * @param json 包含当前数组的json对象
 * @param key 数组对应的key
 * @param inters 拼接字符串
 * @param indent 缩进
 * @returns {*}
 */
function _handleArray(json, key, inters, indent) {
  if (json[key].length === 0) {
    inters += `${indent}${_getRenderKey(key)}:${_getRenderValue('any[]')}`;
  } else {
    // 如果是个空数组或者数组里面为非对象
    if (_isArray(json[key][0])) {
      // 判断数组是否都为boolean number string等基本类型
      inters += `${indent}${_getRenderKey(key)}:${_getRenderValue('any[]')}`;
    } else {
      // 有可能是对象也有可能是普通类型，如果是对象，类型按照第一个元素类型定义，如果都为普通类型，则指定为具体类型数组
      // 否则为any数组
      // 判断是否为 [1,2,3]形式处理
      if (normalTypes.includes(typeof json[key][0])) {
        const type = _isBaseType(json[key])
        inters += `${indent}${_getRenderKey(key)}: ${_getRenderValue(type + '[]')}`;
      } else {
        const interfaceName = _getInterfaceName(key)
        inters += `${indent}${_getRenderKey(key)}: ${_getRenderValue(interfaceName + '[]')}`;
        objs.push({
          key: interfaceName,
          value: json[key][0]
        });
      }
    }
  }
  return inters;
}

/**
 * 处理json
 * @param json 待处理json
 * @param name 接口名字
 * @param inters 拼接的字符串
 * @param first 是否为第一级
 * @param ind 缩进方式 默认一个tab
 * @returns {*}
 */
function _parseJson(json, name, inters, first = true, ind = indent) {
  let keys = [];
  try {
    keys = Reflect.ownKeys(json);
  } catch (e) {
    console.log(e);
  }
  if (!keys.length) { // 判断是否有key
    inters += `${_getRenderInterface(name)} ${__getRenderInterfaceName(name)} ${_getRenderLeft()}`
    inters += _getRenderRight();
    return inters;
  }
  if (!inters && first) {
    inters += `${_getRenderInterface(name)} ${__getRenderInterfaceName(name)} ${_getRenderLeft()}`
  } else if (!inters && !first) {
    inters += _getRenderLeft();
  }
  let type;
  for (const key of keys) {
    // 判断值类型
    type = typeof json[key];
    if (normalTypes.includes(type) || json[key] === null) {
      inters += `${ind}${_getRenderKey(key)}:${_getRenderValue(json[key] === null ? 'null' : type)}`;
    } else if (_isArray(json[key])) {
      inters = _handleArray(json, key, inters, ind);
    } else if (_isObject(json[key])) {
      // inters += `${ind}${_getRenderKey(key)}: ${_parseJson(json[key], key, '', false, ind + ind)}`;
      const interfaceName = _getInterfaceName(key)
      inters += `${indent}${_getRenderKey(key)}: ${interfaceName};<br/>`;
      objs.push({
        key: interfaceName,
        value: json[key]
      });
    }
  }
  if (first) {
    inters += _getRenderRight();
  } else {
    inters += indent + _getRenderRight();
  }
  return inters;
}

/**
 * 导出接口定义
 * @param res json字符串
 * @param exportMode 1 不导出 2 导出 3 导出为默认
 * @returns {*}
 */
export default function interfaceDefinition(res, exportMode = Config.NOT_EXPORT, interfaceNamePrefix = '') {
  globalExportMode = exportMode;
  globalInterfaceNamePrefix = interfaceNamePrefix;
  let result;
  objs = [];
  interfaceNames = [];
  try {
    const  json = eval(`(${res})`);
    if (_isObject(json)) {
      result = _parseJson(json, _getInterfaceName(interfaceName), '', true);
      for (const obj of objs) {
        result += '<br/>'
        result += _parseJson(obj.value, obj.key, '', true);
      }
    } else {
      result = '当前仅支持对象类型';
    }
  } catch (e) {
    result = e.message;
  }
  return result;
}


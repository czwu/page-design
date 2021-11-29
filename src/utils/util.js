/*
 *获取对象某路径下属性值
*/
const getValueByPath = function(obj, path) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  const keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len - 1; ++i) {
    const key = keyArr[i]
    if (key in tempObj) {
      tempObj = tempObj[key]
    } else {
      return undefined
    }
  }
  return tempObj ? tempObj[keyArr[i]] : undefined
}

/*
 *在指定对象的某属性插入值
*/
const setValueByPath = function(obj, path, val) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  const keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len; ++i) {
    const isLast = i > len - 2
    const key = keyArr[i]
    if (isLast) {
      tempObj[key] = val
    } else {
      if (!tempObj[key] || typeof tempObj[key] !== 'object') {
        tempObj[key] = isNaN(key) ? {} : []
      }
      tempObj = tempObj[key]
    }
  }
}

/**
 * 获取随机字符
 * @return {number}
 */
function getRandomInt() {
  const num = Math.random() * 100000
  return Math.floor(num)
}

/**
 * 按指定长度生成随机字符串uuid
 * @param {长度} len
 */
function uuid(len = 8) {
  // ABCDEFGHIJKLMNOPQRSTUVWXYZ
  var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
  var uuid = []; var i
  const radix = chars.length
  for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
  return uuid.join('')
}

/**
 * 返回入参的数据类型
 *  @param {any} obj
 */
function type(obj) {
  var toString = Object.prototype.toString
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  }
  return map[toString.call(obj)]
}

/**
 * cookie
 * @param {*} name
 */
function getCookie(name) {
  var arr
  var reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = document.cookie.match(reg))) return unescape(arr[2])
  else return null
}

/**
 *
 * @param {*} name
 */
function getUrlParams(name) {
  const startIndex = window.location.href.indexOf('?')
  // eslint-disable-next-line no-unused-vars
  let param = window.location.href.substr(startIndex + 1)
  const paramsObj = {}
  param = param.split('&').map(item => {
    const arr = item.split('=')
    paramsObj[arr[0]] = arr[1]
  })
  return name ? paramsObj[name] : paramsObj
}

/**
 * 根据路径增加vue实例中data变量
 * @param obj
 * @param val
 * @param path
 */
function setDataByPath(obj, path, val) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  const keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len; ++i) {
    const isLast = i > len - 2
    const key = keyArr[i]
    if (isLast) {
      this.$set(tempObj, key, val)
    } else {
      if (!tempObj[key] || typeof tempObj[key] !== 'object') {
        this.$set(tempObj, key, isNaN(key) ? {} : [])
      }
      tempObj = tempObj[key]
    }
  }
}
/**
 * 根据路径删除对象的属性
 * @param obj
 * @param val
 * @param path
 */
function delAttrByPath(obj, path) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')
  const keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len; ++i) {
    const isLast = i > len - 2
    const key = keyArr[i]
    if (isLast) {
      delete tempObj[key]
    } else {
      if (!tempObj[key] || typeof tempObj[key] !== 'object') {
        tempObj[key] = isNaN(key) ? {} : []
      }
      tempObj = tempObj[key]
    }
  }
}
// 下划转驼峰
function camelCase(str) {
  return str.replace(/-[a-z]/g, str1 => str1.substr(-1).toUpperCase())
}

// 对象转数组
function options(obj) {
  if (type(obj) === 'object') {
    return Object.keys(obj).map((key) => {
      return {
        value: key,
        label: obj[key]
      }
    })
  }
  return []
}

function getComponentId(el, designMode) {
  let uuid = el.getAttribute('uuid')
  const mapping = el.getAttribute('mapping') ? [el.getAttribute('mapping')] : []
  if (!uuid) {
    let parent = el.parentElement
    while (parent) {
      uuid = parent.getAttribute('uuid')
      const mappingPath = parent.getAttribute('mapping')
      if (mappingPath) {
        mapping.push(mappingPath)
      }
      if (uuid) {
        break
      }
      parent = parent.parentElement
    }
  }
  return designMode ? { uuid, mapping: mapping.reverse().join('.') } : uuid
}

function getComponentId2(el) {
  let uuid = el.getAttribute('uuid')
  let mapping = el.getAttribute('mapping')
  if (!uuid || mapping) {
    let parent = el.parentElement
    while (parent) {
      uuid = parent.getAttribute('uuid')
      mapping = parent.getAttribute('mapping')
      if (uuid && !mapping) {
        break
      }
      parent = parent.parentElement
    }
  }
  return uuid
}

function clone(any) {
  if (type(any) === 'object') { // 拷贝对象
    const o = {}
    for (const key in any) {
      o[key] = clone(any[key])
    }
    return o
  } else if (type(any) === 'array') { // 拷贝数组
    var arr = []
    for (let i = 0, leng = any.length; i < leng; i++) {
      arr[i] = clone(any[i])
    }
    return arr
  } else if (type(any) === 'function') { // 拷贝函数
    return any
  } else if (type(any) === 'date') { // 拷贝日期
    return new Date(any.valueOf())
  } else if (type(any) === 'regExp') { // 拷贝正则
    return new RegExp(any)
  }
  return any
}

function dateToDiffText(dateTimeStamp) {
  var minute = 1000 * 60
  var hour = minute * 60
  var day = hour * 24
  var month = day * 30
  var now = new Date().getTime()
  var diffValue = now - dateTimeStamp
  if (diffValue < 0) { return }
  var monthC = diffValue / month
  var weekC = diffValue / (7 * day)
  var dayC = diffValue / day
  var hourC = diffValue / hour
  var minC = diffValue / minute
  let result
  if (monthC >= 1) {
    result = '' + parseInt(monthC) + '月前'
  } else if (weekC >= 1) {
    result = '' + parseInt(weekC) + '周前'
  } else if (dayC >= 1) {
    result = '' + parseInt(dayC) + '天前'
  } else if (hourC >= 1) {
    result = '' + parseInt(hourC) + '小时前'
  } else if (minC >= 1) {
    result = '' + parseInt(minC) + '分钟前'
  } else { result = '刚刚' }
  return result
}

function getOffset(target) {
  var top = 0
  var left = 0
  while (target.offsetParent) {
    top += target.offsetTop
    left += target.offsetLeft
    target = target.offsetParent
  }
  return {
    top: top,
    left: left
  }
}

function treeEach(list, fn, childKey = 'children') {
  list.forEach((child) => {
    fn(child)
    if (Array.isArray(child[childKey])) {
      treeEach(child[childKey], fn)
    }
  })
}

function getRowIndex(node) {
  let rowindex
  let el = node
  while (el) {
    rowindex = el.getAttribute('rowindex')
    if (rowindex) {
      break
    } else {
      el = el.parentElement
    }
  }
  return rowindex
}

function copyText(text) {
  var input = document.createElement('textarea')
  document.body.appendChild(input)
  // 将文本赋值给输入框
  input.value = text
  // 聚焦并选中
  input.focus()
  input.select()

  // document.queryCommandEnabled()方法返回一个布尔值，表示当前是否可用document.execCommand()的某个命令。
  // 比如copy命令只有存在文本选中时才可用，如果没有选中文本，就不可用。
  // 执行 copy 命令
  document.execCommand('copy')
  // 移除输入框节点
  input.remove()
}
export {
  getValueByPath,
  setValueByPath,
  delAttrByPath,
  getRandomInt,
  uuid,
  type,
  getCookie,
  getUrlParams,
  setDataByPath,
  camelCase,
  options,
  getComponentId,
  getComponentId2,
  clone,
  dateToDiffText,
  getOffset,
  treeEach,
  getRowIndex,
  copyText
}

// 给dom节点添加类样式
export function addClass(el, className) {
  // 有这个样式,直接返回
  if (hasClass(el, className)) {
    return;
  }
  let newClass = el.className.split(" ");
  newClass.push(className);
  el.className = newClass.join(" ");
}

// 判断dom节点有没有某个类样式
export function hasClass(el, className) {
  let reg = new RegExp("(^|\\s)" + className + "(\\s|$)"); // \s, 匹配任何空白字符
  return reg.test(el.className);
}

// 获取或设置自定义属性 data-*
export function setData(e, name, value) {
  const prefix = "data-";
  name = prefix + name;
  // 存在value参数, 就设置属性,不存在,则获取属性高
  if (value) {
    return e.setAttribute(name, value);
  } else {
    return e.getAttribute(name);
  }
}

/* js操作样式自动prefix(浏览器前缀) */
let elementStyles = document.createElement("div").style;

let vendor = (() => {
  let transformNames = {
    webkit: "webkitTransform",
    moz: "mozTransform",
    ms: "msTransform",
    o: "oTransfrom",
    standard: "transform"
  };
  for (let key in transformNames) {
    if (elementStyles[transformNames[key]] !== undefined) {
      return key;
    }
  }
  return false;
})();

export function prefixStyle(style) {
  if (vendor === false) {
    return false;
  }
  if (vendor === "standard") {
    return style;
  }
  //    对应前缀 +       首字母大写           +     剩余部分
  return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}
/*  */

//兼容方法获取元素样式的封装函数  (包括行内样式和内嵌样式)
export function getStyle(ele, attr) {
  if (window.getComputedStyle) {
    return window.getComputedStyle(ele, null)[attr];
  }
  return ele.currentStyle[attr];
}

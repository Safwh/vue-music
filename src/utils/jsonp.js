// 使用 Promise 对 jsonp 进行封装

import _jsonp from "jsonp";

export default function jsonp(url, data, option) {
  url += (url.includes("?") ? "&" : "?") + getParam(data); //includes()方法确定字符串是否包含指定字符串的字符
  return new Promise((resolve, reject) => {
    _jsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
}

// 对 data 进行处理拼接到url上
function getParam(data) {
  let url = "";
  for (let item in data) {
    let tmpVal = data[item];
    let value = tmpVal !== undefined ? tmpVal : "";
    url += `&${item}=${encodeURIComponent(value)}`; // encodeURIComponent 把字符串作为URI 组件进行编码。
  }
  return url ? url.substring(1) : ""; // substring(1) 删除第一个&符号
}

// substring（）方法从两个指定索引之间的字符串中提取字符，然后返回新的子字符串。

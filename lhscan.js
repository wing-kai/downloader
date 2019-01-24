[].map.call(document.querySelectorAll('img.chapter-img'), function(dom, index) {
  const rename = function(num) {
    return num > 99 ? num : num > 9 ? '0' + num : '00' + num
  }
  const fileName = dom.src.replace(/^.+LHScan\.net_files\/(.+)$/, '$1');
  return `mv '${fileName}' '${rename(index)}.jpg';`
}).join('\n')
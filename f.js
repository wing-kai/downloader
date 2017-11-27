// ⓕⓐⓚⓚⓤ downloader
// 解除浏览器安全协议
// open -a Google\ Chrome --args --disable-web-security --user-data-dir

(function() {
  var scan = function() {
    if (document.querySelector('canvas')) {
      return document.querySelector('canvas').toBlob(function(blob) {const a = document.createElement('a');a.download = 'p.png';a.href = window.URL.createObjectURL(blob);a.click();window.URL.revokeObjectURL(a.href);})
    }

    setTimeout(scan, 500)
  }
  document.body.addEventListener('click', function(e) {
    setTimeout(scan, 500)
  })
  scan()
  console.clear()
})()
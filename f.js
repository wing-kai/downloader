// ⓕⓐⓚⓚⓤ downloader
// 解除浏览器安全协议
// open -a Google\ Chrome --args --disable-web-security --user-data-dir

(function() {
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.2.1/dist/jszip.min.js'
  document.body.append(script)

  const download = function() {
    const JSZip = window.JSZip
    const Zip = new JSZip()
    const DOMUILayer = document.querySelector('.layer[data-name=UI]')
    const DOMPageView = document.querySelector('div.layer[data-name=PageView]')

    let index = 0
    let count = 0

    // 模拟点击
    const simulateClick = function() {
      const event = new KeyboardEvent('keydown', {
          keyCode: 37,
          bubbles: true,
      })

      document.activeElement.dispatchEvent(event)
    }

    // 重命名
    const rename = function(num) {
      return num > 99 ? num : num > 9 ? '0' + num : '00' + num
    }

    // 下载图片
    const downloadImage = function(canvasDOM) {
      return new Promise(function(resolve) {
        canvasDOM.toBlob(function(blob) {
          Zip.file(rename(index++) + '.png', blob)
          resolve()
        })
      })
    }

    const downloadZip = function() {
      Zip.generateAsync({
        type: "blob",
        mimeType: "application/zip"
      }).then(function(blob) {
        const anchor = document.createElement("a");
        const objectURL = window.URL.createObjectURL(blob);

        anchor.download = "[" + document.querySelector('.js-artist a').innerHTML + "] " + document.getElementsByClassName('js-title-text')[0].innerHTML + ".zip";
        anchor.href = objectURL;
        anchor.click();

        window.URL.revokeObjectURL(objectURL);
      })
    }

    // 执行一次下载并翻页
    const canvasLoaded = function(canvasDOM) {
      setTimeout(function() {
        downloadImage(canvasDOM).then(function() {
          if (index < count) {
            simulateClick()
          } else {
            downloadZip()
          }
        })
      }, 0)
    }

    const mutationObserver = new MutationObserver(function(mutationsList) {
      for (let mutation of mutationsList) {
        if (mutation.addedNodes.length > 0 && (mutation.addedNodes[0].tagName === 'CANVAS')) {
          canvasLoaded(mutation.addedNodes[0])
        }
      }
    })

    mutationObserver.observe(DOMPageView, {
      childList: true
    })

    count = Number(document.querySelector('span.count.js-count').innerHTML)

    if (document.querySelector('canvas')) {
      canvasLoaded(document.querySelector('canvas'))
    }
  }

  setTimeout(function() {
    let i = 0
    while(++i < 1000) {
      if (window.JSZip) {
        download()
        break
      }
    }
  }, 0)
})()

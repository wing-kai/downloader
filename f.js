// ⓕⓐⓚⓚⓤ downloader
// 解除浏览器安全协议
// open -a Google\ Chrome --args --disable-web-security --user-data-dir

(function() {
  const download = function() {
    const JSZip = window.JSZip
    const Zip = new JSZip()
    const DOMUILayer = document.querySelector('.layer[data-name=UI]')
    const DOMPageView = document.querySelector('div.layer[data-name=PageView]')
    const zipFileName = document.title.slice(5) + '.zip'
    const clickPosition = {
      pointerX: (document.body.clientWidth >> 1) + 100,
      pointerY: 300
    }

    let index = 0

    // 模拟点击
    const simulateEvent = (() => {
      function simulate(element, eventName) {
        var options = extend(defaultOptions, arguments[2] || {});
        var oEvent, eventType = null;

        for (var name in eventMatchers) {
          if (eventMatchers[name].test(eventName)) {
            eventType = name;
            break;
          }
        }

        if (!eventType)
          throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

        if (document.createEvent) {
          oEvent = document.createEvent(eventType);
          if (eventType == 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
          } else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
              options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
              options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
          }
          element.dispatchEvent(oEvent);
        } else {
          options.clientX = options.pointerX;
          options.clientY = options.pointerY;
          var evt = document.createEventObject();
          oEvent = extend(evt, options);
          element.fireEvent('on' + eventName, oEvent);
        }
        return element;
      }

      function extend(destination, source) {
        for (var property in source)
          destination[property] = source[property];
        return destination;
      }

      var eventMatchers = {
        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
      }
      var defaultOptions = {
        pointerX: 0,
        pointerY: 0,
        button: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        bubbles: true,
        cancelable: true
      }

      return simulate
    })()

    // 重命名
    const rename = function(num) {
      return num > 99 ? num : num > 9 ? '0' + num : '00' + num
    }

    // 下载图片
    const downloadImage = function(canvasDOM) {
      return new Promise(function(resolve, reject) {
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

        anchor.download
        anchor.download = zipFileName
        anchor.href = objectURL;
        anchor.click();

        window.URL.revokeObjectURL(objectURL);
      })
    }

    // 执行一次下载并翻页
    const canvasLoaded = function(canvasDOM) {
      setTimeout(function() {
        downloadImage(canvasDOM).then(function() {
          setTimeout(() => {
            if (document.querySelector('div.layer[data-name=PageView]').childElementCount === 0) {
              downloadZip()
            } else {
              console.log('执行翻页 simulateEvent')
              simulateEvent(document.querySelector('.layer[data-name=UI]'), 'mousedown', clickPosition)
              simulateEvent(document.querySelector('.layer[data-name=UI]'), 'mouseup', clickPosition)
              // simulateClick()
            }
          }, 100)
        }).catch(err => {
          console.error('下载失败')
        })
      }, 0)
    }

    const mutationObserver = new MutationObserver(function(mutationsList) {
      if (document.querySelector('div.layer[data-name=PageView]').childElementCount === 0) {
        downloadZip()
      }

      for (let mutation of mutationsList) {
        console.log('mutationObserver')
        if (mutation.addedNodes.length > 0 && (mutation.addedNodes[0].tagName === 'CANVAS')) {
          canvasLoaded(mutation.addedNodes[0])
        }
      }
    })

    mutationObserver.observe(DOMPageView, {
      childList: true
    })

    if (document.querySelector('canvas')) {
      canvasLoaded(document.querySelector('canvas'))
    }
  }

  download()
})();

// 解除浏览器安全协议
// open -a Google\ Chrome --args --disable-web-security --user-data-dir

window.downloadImage = (function(window) {
  var __drawImage;
  var imgDrawInfo = {
    // [imgSrc]: HTMLCanvasElement
  };
  var index = 0;
  var pageCount = 0;
  var promiseList = Promise.resolve();

  var rename = function(num) {
    return num > 99 ? num : num > 9 ? '0' + num : '00' + num;
  }

  var downloadBlob = function(blob, fileName) {
    try {
      var a = document.createElement('a');
      a.download = String(fileName);
      a.href = window.URL.createObjectURL(blob);
      a.click();
      window.URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
    }
  }

  __drawImage = window.CanvasRenderingContext2D.prototype.drawImage;

  window.CanvasRenderingContext2D.prototype.drawImage = function(...args) {
    if (args[0] instanceof HTMLImageElement) {
      if (imgDrawInfo[args[0].src] === undefined) {
        let canvas = document.createElement('canvas');
        canvas.height = args[0].height;
        canvas.width = args[0].width;
        imgDrawInfo[args[0].src] = canvas;
      }

      let context = imgDrawInfo[args[0].src].getContext('2d');
      __drawImage.apply(context, args);

      console.clear();
      console.log(`已获取${Object.keys(imgDrawInfo).length}张图片信息。`);
    }

    return __drawImage.apply(this, args);
  }

  return function() {
    const JSZip = window.JSZip
    const Zip = new JSZip()

    const promise = Object.keys(imgDrawInfo).reduce((promise, src) => {
      const func = function(source) {
        return new Promise(resolve => {
          var canvas = imgDrawInfo[source];
          canvas.toBlob(function(blob) {
            Zip.file(rename(index++) + '.jpg', blob)
            resolve()
          }, 'image/jpeg', 1)
        })
      }

      if (promise === null) {
        return func(src)
      }

      return promise.then(() => func(src))
    }, null)

    promise.then(function() {
      Zip.generateAsync({
        type: "blob",
        mimeType: "application/zip"
      }).then(function(blob) {
        const anchor = document.createElement("a");
        const objectURL = window.URL.createObjectURL(blob);

        anchor.download = 'xxx.zip';
        anchor.href = objectURL;
        anchor.click();

        window.URL.revokeObjectURL(objectURL);
      })
    })
  }
})(window);
console.clear();
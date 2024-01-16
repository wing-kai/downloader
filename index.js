(function () {
  let canvasContextDrawProxy = function () { };
  let drawEnded = true;
  let rename = num => num > 99 ? num : num > 9 ? '0' + num : '00' + num;
  let index = 1;
  let toBlobProxy
  const keyboardEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 37, key: 'left' });

  const initDownload = function () {
      const viewerCanvas = document.querySelector('.viewer').childNodes[0];
      const JSZip = window.JSZip;
      const zip = new JSZip();

      const getZip = function() {
          zip.generateAsync({
              type: "blob",
              mimeType: "application/zip"
          }).then(function (blob) {
              const anchor = document.createElement("a");
              const objectURL = window.URL.createObjectURL(blob);

              anchor.download = document.getElementsByClassName('header__title')[0].innerHTML + '.zip';
              anchor.href = objectURL;
              anchor.click();

              window.URL.revokeObjectURL(objectURL);
          })
          return
      };

      window.download = function (max = 999) {
          const donwloadLoopHandler = function () {
              if (index > max) {
                  return getZip();
              }

              toBlobProxy.apply(viewerCanvas, [function (blob) {
                  zip.file(rename(index++) + '.jpg', blob)
              }, 'image/jpeg']);

              window.dispatchEvent(keyboardEvent);
              setTimeout(donwloadLoopHandler, 500);
          }

          donwloadLoopHandler()
      };
  };

  (function () {
      const _window = window;
      const iframe = document.createElement('iframe');
      iframe.style.display = "none";
      iframe.onload = function () {
          toBlobProxy = iframe.contentWindow.HTMLCanvasElement.prototype.toBlob
          canvasContextDrawProxy = iframe.contentWindow.CanvasRenderingContext2D.prototype.drawImage

          _window.CanvasRenderingContext2D.prototype.drawImage = function (...args) {
              canvasContextDrawProxy.apply(this, args);
          }
      };
      document.body.appendChild(iframe);
  })();

  (function () {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.2.1/dist/jszip.min.js'
      script.onload = initDownload
      document.body.append(script)
  })();
})();
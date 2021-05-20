window.importantJavascriptFunction = {
  createElement: window.document.__proto__.createElement,
  toBlob: window.HTMLCanvasElement.prototype.toBlob,
  getImageData: window.CanvasRenderingContext2D.prototype.getImageData
}
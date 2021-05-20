window.importantJavascriptFunction = {
  createElement: window.document.createElement,
  toBlob: window.HTMLCanvasElement.prototype.toBlob,
  getImageData: window.CanvasRenderingContext2D.prototype.getImageData
}
console.log('window.document.createElement', window.document.createElement)
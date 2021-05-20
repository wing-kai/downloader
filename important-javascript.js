window.importantJavascriptFunction = {
  createElement: document.createElement,
  toBlob: window.HTMLCanvasElement.prototype.toBlob,
  getImageData: window.CanvasRenderingContext2D.prototype.getImageData
}
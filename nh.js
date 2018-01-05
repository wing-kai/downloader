// nhentai download script
// (function(a,c){return function(b){b(a,c)}})(/*这里填写要下载的开始页至结束页*/)(function(a,c){var b=document.getElementById("thumbnail-container").querySelectorAll("img"),b=Array.prototype.slice.call(b,0).map(function(a){return a.dataset.src});a=(a||1)-1;b.splice(a,(c||b.length)-a).map(function(a){a=a.replace(/^https:\/\/t\.(.+)t\.jpg$/,"https://i.$1.jpg");var b=document.createElement("a");b.href=a;b.download="picture";b.click()})});

(function(s, e) {
  return function(f) {
    f(s, e)
  }
})()(function download(start, end) {
  var imageNodes = document.getElementById('thumbnail-container').querySelectorAll('img');
  var srcList = Array.prototype.slice.call(imageNodes, 0).map(function(img) { return img.dataset.src });
  var startIndex = (start || 1) - 1;
  var length = (end || srcList.length) - startIndex;

  srcList.splice(startIndex, length).map(
    function(src) {
      var originSizeSrc = src.replace(/^https:\/\/t\.(.+)t\.jpg$/, 'https://i.$1.jpg');
      var anchor = document.createElement('a');
      anchor.href = originSizeSrc;
      anchor.download = 'picture';
      anchor.click();
    }
  )
});
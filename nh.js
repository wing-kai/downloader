(function() {
  const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.2.1/dist/jszip.min.js'
    script.onload = download
    document.body.append(script)
})();

(function(start, end) {
  const imageNodes = document.getElementById('thumbnail-container').querySelectorAll('img');
  const srcList = [].map.call(imageNodes, img => img.dataset.src);

  const startIndex = (start || 1) - 1;
  const length = (end || (srcList.length)) - startIndex;
  const blobList = [];

  const rename = function(num) {
    return num > 99 ? num : num > 9 ? '0' + num : '00' + num
  }

  const requestImageBlob = function(src) {
    const originSizeSrc = src.replace(/^https:\/\/t\.(.+)t\.jpg$/, 'https://i.$1.jpg');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.responseType = 'blob'
      xhr.open('GET', originSizeSrc)
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) {
          return
        }

        if (xhr.status === 200) {
          return resolve(xhr.response)
        }

        reject(xhr.responseText || xhr.response)
      }
      xhr.send()
    });
  }

  const promise = srcList.splice(startIndex, length).reduce((promise, src, index) => {
    if (index === 0) {
      return requestImageBlob(src)
    }

    return promise.then(blob => {
      console.log((100 - parseInt((length - index) / length * 100)) + '% 下载');
      blobList.push(blob);
      return requestImageBlob(src)
    });
  }, null);

  promise.then(lastBlob => {
    blobList.push(lastBlob)
    const Zip = new JSZip()

    blobList.forEach((blob, index) => {
      const prefix = blob.type.slice(6) === 'jpeg' ? '.jpg' : '.png'
      Zip.file(rename(index++) + prefix, blob)
    })

    Zip.generateAsync({
      type: "blob",
      mimeType: "application/zip"
    }).then(function(blob) {
      const anchor = document.createElement("a");
      const objectURL = window.URL.createObjectURL(blob);

      anchor.download = document.getElementById('info').querySelector('h2').innerHTML + '.zip';
      anchor.href = objectURL;
      anchor.click();

      window.URL.revokeObjectURL(objectURL);
    });
  });
})();
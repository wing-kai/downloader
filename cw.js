// Ⓒⓞⓜⓘⓒ - ⓦⓐⓛⓚⓔⓡ downloader

// window.CID = 'xxxx';
(function(cid) {
  var downloadImage = function(imgSrc, drmHash) {
    var generateKey = hash => {
      var e = hash.slice(0, 16).match(/[\da-f]{2}/gi);
      return new Uint8Array(e.map(function(t) {
        return parseInt(t, 16);
      }));
    }

    var blobToArrayBuffer = blob => {
      return new Promise(function(resolve) {
        var f = new FileReader();
        f.onloadend = t => {
          resolve(t.target.result);
        }
        f.readAsArrayBuffer(blob);
      });
    }

    var xor = (t, e) => {
      var n = new Uint8Array(t);
      var r = n.length;
      var i = e.length;
      var o = new Uint8Array(r);

      for (var a = 0; a < r; a += 1) {
        o[a] = n[a] ^ e[a % i];  
      }

      return o;
    }

    var downloadBlob = blob => {
      var a = document.createElement('a');
      a.download = 'x.png';
      a.href = window.URL.createObjectURL(blob);
      a.click();
      window.URL.revokeObjectURL(a.href);
    }

    var decodeFromBlob = async (originBlob, key) => {
      var buffer = await blobToArrayBuffer(originBlob);
      var decodeBuffer = xor(buffer, key);
      var decodeBlob = new Blob([decodeBuffer], {
        type: 'image/jpeg'
      });

      downloadBlob(decodeBlob);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', imgSrc);
    xhr.responseType = 'blob';

    xhr.onload = function() {
      if (this.status == 200) {
        var blob = this.response;

        decodeFromBlob(blob, generateKey(drmHash));
      }
    }

    xhr.send();
  }

  if (!cid) {
    return console.error('cid没写，请先写cid,然后重新执行这个脚本');
  }

  var frameXhr = new XMLHttpRequest();
  frameXhr.open('GET', 'https://ssl.seiga.nicovideo.jp/api/v1/comicwalker/episodes/' + cid + '/frames');

  frameXhr.onload = function() {
    if (this.status == 200) {
      var data = JSON.parse(this.response);
      data.data.result.forEach(obj => {
        downloadImage(obj.meta.source_url, obj.meta.drm_hash);
      })
    }
  }

  frameXhr.send();
})(window.CID);
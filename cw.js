// Ⓒⓞⓜⓘⓒ - ⓦⓐⓛⓚⓔⓡ downloader

(function(cid) {
  var pageCount = 0;
  var downloadCompleted = 0;
  var catchFailed = false;
  var failedInfo = [];

  var rename = function(num) {
    return num > 99 ? num : num > 9 ? '0' + num : '00' + num;
  }

  var generateKey = function(hash){
    var e = hash.slice(0, 16).match(/[\da-f]{2}/gi);
    return new Uint8Array(e.map(function(t) {
      return parseInt(t, 16);
    }));
  }

  var blobToArrayBuffer = function(blob){
    return new Promise(function(resolve) {
      var f = new FileReader();
      f.onloadend = function(t){
        resolve(t.target.result);
      }
      f.readAsArrayBuffer(blob);
    });
  }

  var xor = function(t, e) {
    var n = new Uint8Array(t);
    var r = n.length;
    var i = e.length;
    var o = new Uint8Array(r);

    for (var a = 0; a < r; a += 1) {
      o[a] = n[a] ^ e[a % i];  
    }

    return o;
  }

  var downloadBlob = function(blob, fileName) {
    var a = document.createElement('a');
    a.download = String(fileName);
    a.href = window.URL.createObjectURL(blob);
    a.click();
    window.URL.revokeObjectURL(a.href);
  }

  var getDecodeBlob = async function(encodeBlob, key) {
    var encodeBuffer = await blobToArrayBuffer(encodeBlob);
    var decodeBuffer = xor(encodeBuffer, key);

    return new Blob([decodeBuffer], {
      type: 'image/jpeg'
    });
  }

  var downloadImage = function(imgSrc, drmHash, index) {
    var fileName = rename(index);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', imgSrc);
    xhr.responseType = 'blob';

    xhr.onload = async function() {
      if (this.status == 200) {
        try {
          var encodeBlob = this.response;
          var decodeBlob = await getDecodeBlob(encodeBlob, generateKey(drmHash));
          downloadBlob(decodeBlob, fileName);
          downloadCompleted++;
          console.log(`已下载：${downloadCompleted}／${pageCount}`);

          if (downloadCompleted === pageCount) {
            console.log('所有图片下载完成！');

            if (catchFailed) {
              console.warn('以下图片的获取发生异常：\n' + failedInfo.join('\n'));
            }
          }
        } catch(e) {
          failedInfo.push(`解密出错！${fileName} - 地址：${imgSrc}，密钥：${drmHash}`);
        }
      } else {
        catchFailed = true;
        pageCount !== 0 && pageCount--;
        failedInfo.push(`下载失败！${fileName} - 地址：${imgSrc}，密钥：${drmHash}`);
      }
    }

    xhr.send();
  }

  var comicID = window.location.search.replace(/^.+\&cid\=(.+)$/, '$1');
  var frameXhr = new XMLHttpRequest();
  frameXhr.open('GET', 'https://ssl.seiga.nicovideo.jp/api/v1/comicwalker/episodes/' + comicID + '/frames');

  frameXhr.onload = function() {
    if (this.status === 200) {
      console.log('图片信息与解码密钥获取成功，开始解码');
      var pageList = JSON.parse(this.response).data.result;
      pageCount = pageList.length;
      pageList.forEach(function({ meta }, index) {
        downloadImage(
          meta.source_url,
          meta.drm_hash,
          index
        );
      });
    } else {
      console.log('获取失败，详情请咨询脚本开发者');
    }
  }

  frameXhr.send();
  console.log('获取图片信息与解码密钥中……');
})();
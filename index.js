const downloader = (function() {
  let status = 'stop';
  let imageType = 'png';
  let offset = {
    width: 0,
    height: 0
  }

  const rename = num => num > 99 ? num : num > 9 ? '0' + num : '00' + num
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

  const showTips = {
    info (msg) {
      console.log('%c' + msg, 'color:blue');
    },
    success (msg) {
      console.log('%c' + msg, 'color:green');
    },
    error (msg) {
      console.log('%c' + msg, 'color:red');
    }
  }

  const downloadPage = index => {
    return function(blob) {
      const a = document.createElement('a');
      a.download = rename(index);
      a.href = window.URL.createObjectURL(blob);
      a.click();
      window.URL.revokeObjectURL(a.href);
    }
  }

  let toBlob; // 取回canvas元素转换为二进制文件的API

  const iframe = document.createElement('iframe');
  iframe.style.display = "none";

  iframe.onload = e => {
    toBlob = iframe.contentWindow.HTMLCanvasElement.prototype.toBlob;
    showTips.success('iframe load success')
  }

  document.body.appendChild(iframe);

  const viewerCanvas = document.querySelector('.viewer > canvas'); // 获取阅读器的canvas元素

  let pageHeight = 0; // 页面高度
  let pageWidth = 0; // 页面宽度
  let pageIndex = 0;

  let completeCalculate = false; // 是否已完成计算
  let timer = 0;

  const getTempCanvas = function() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.height = pageHeight;
    tempCanvas.width = pageWidth;
    return tempCanvas;
  }

  const getLeftPageCanvas = function() {
    const tempCanvas = getTempCanvas();
    const capture = viewerCanvas.getContext('2d').getImageData(
      (viewerCanvas.width >> 1) - pageWidth + offset.width,
      0,
      pageWidth,
      pageHeight
    );
    tempCanvas.getContext('2d').putImageData(capture, 0, 0);

    return tempCanvas;
  }

  const getRightPageCanvas = function() {
    const tempCanvas = getTempCanvas();
    const capture = viewerCanvas.getContext('2d').getImageData(
      (viewerCanvas.width >> 1) + 1 + offset.width,
      0,
      pageWidth,
      pageHeight
    );
    tempCanvas.getContext('2d').putImageData(capture, 0, 0);

    return tempCanvas;
  }

  const handleClick = function() {
    setTimeout(function() {
      let loading = document.querySelector('.loading') !== null;
      if (loading) {
        timer = setTimeout(handleClick, 1000);
        return;
      }

      const mimeType = imageType === 'png' ? 'image/png' : 'image/jpeg'
      const leftPage = getLeftPageCanvas();
      const rightPage = getRightPageCanvas();

      if (pageIndex > 0) {
        toBlob.apply(rightPage, [downloadPage(pageIndex), mimeType]);
        toBlob.apply(leftPage, [downloadPage(pageIndex + 1), mimeType]);
        showTips.success('下载页面: ' + [pageIndex, pageIndex + 1].join(', '));
        pageIndex += 2;
      } else {
        toBlob.apply(leftPage, [downloadPage(pageIndex), mimeType]);
        showTips.success('下载页面: ' + pageIndex);
        pageIndex += 1;
      }

      simulateEvent(viewerCanvas, 'mousedown', { pointerX: 300, pointerY: 200 })
      simulateEvent(viewerCanvas, 'mouseup', { pointerX: 300, pointerY: 200 })
      handleClick()
    }, 200);
  }

  return {
    setImageType(type) {
      if (type === 'png') {
        imageType = 'png';
        return;
      } else if (type === 'jpg') {
        imageType = 'jpg';
        return;
      }

      showTips.error('不能设置png或jpg以外的格式');
    },

    getWidth(width = 0) {
      pageWidth = width === 0 ? viewerCanvas.width >> 1 : width;
      showTips.success('设置页面宽度为: ' + pageWidth + 'px');
    },

    getHeight(height = 0) {
      pageHeight = height === 0 ? viewerCanvas.height : height;
      showTips.success('设置页面高度为: ' + pageHeight + 'px');
    },

    start(i = 0) {
      if (status === 'stop') {
        pageIndex = i;
        handleClick();
        viewerCanvas.addEventListener('click', handleClick);
        status = 'listening';
        return;
      }

      if (status === 'pause') {
        viewerCanvas.addEventListener('click', handleClick);
        status = 'listening';
        return;
      }
    },

    pause() {
      if (status === 'listening') {
        viewerCanvas.removeEventListener('click', handleClick);
        showTips.info('暂停监听于 ' + (pageIndex - 1));
        status = 'pause';
        return;
      }
    },

    setIndex(num) {
      pageIndex = num;
      showTips.info('重置页面计数器，下次下载将从' + pageIndex + '开始');
    },

    setWidthOffset(num) {
      offset.width = parseInt(num) || 0;
      showTips.info('重置页面截取宽度偏移量为 ' + (offset.width >= 0 ? '+' : '-') + offset.width + 'px');
    },

    setHeightOffset(num) {
      offset.height = parseInt(num) || 0;
      showTips.info('重置页面截取高度偏移量为 ' + (offset.height >= 0 ? '+' : '-') + offset.height + 'px');
    }
  }
})();

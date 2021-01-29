class Dom {
  /**
   * 获取display:none 元素的宽, 高
   * @param {Element} el 需要获取的dom元素
   * @return {Object} obj.height: 高, obj.width: 宽
   */
  getDisplayNoneOffset(el) {
    let height = 0
    let width = 0
    if (!el || el.nodeType !== 1) return { height, width }

    // 拷贝子元素
    let clone = el.cloneNode(true)

    // 创建一个临时 用visibility隐藏, 只为获取高度,
    clone.style.cssText = `display: block
      position: absolute
      visibility: hidden
      height: auto
      z-index: -10
    `

    // 父级存在且为dom元素
    if (el.parentElement && el.parentElement.nodeType === 1) {
      el.parentElement.appendChild(clone)
      height = clone.offsetHeight
      width = clone.offsetWidth
      // 获取完高度, 及时删除
      el.parentElement.removeChild(clone)
      clone = null
    }

    return { height, width }
  }

  getScrollTop() {
    return document.documentElement.scrollTop || document.body.scrollTop
  }

  // 移动端顶部有header bar, 实际内容区域需要 window.screen.height - headerBar.height, 那么问题来了, headerBar如何得到呢?
  getBodyContainerHeight() {
    const div = document.createElement('div')
    div.style.cssText = `
      position: fixed;
      left: 0;
      width: 100%;
      top: 0;
      z-index: 100;
      height: 100%;
      user-select: none;
      pointer-events: none;
    `

    document.body.appendChild(div)
    let containerHeight = div.offsetHeight
    document.body.removeChild(div)

    // 所以 header bar的高度就计算出来了, window.screen.height - containerHeight
    return containerHeight
  }

  setScrollTop(num) {
    let target = parseFloat(num)
    document.documentElement.scrollTop = document.body.scrollTop = target
  }

  /**
   * 判断滚动条是否滚动到底部
   *
   * @param {Number} 距离底部的距离 可设置
   * @param {function} 触发回调
   *
   */
  getScrollToBottom(toBottomNum, callback) {
    const scrollObj = {
      getScrollTop: function () {
        var scrollTop = 0;
        var bodyScrollTop = 0;
        var documentScrollTop = 0;
        if (document.body) {
          bodyScrollTop = document.body.scrollTop;
        }
        if (document.documentElement) {
          documentScrollTop = document.documentElement.scrollTop;
        }
        scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
        return scrollTop;
      },
      getScrollHeight: function () {
        var scrollHeight = 0;
        var bodyScrollHeight = 0;
        var documentScrollHeight = 0;
        if (document.body) {
          bodyScrollHeight = document.body.scrollHeight;
        }
        if (document.documentElement) {
          documentScrollHeight = document.documentElement.scrollHeight;
        }
        scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
        return scrollHeight;
      },
      getWindowHeight: function () {
        var windowHeight = 0;
        if (document.compatMode === 'CSS1Compat') {
          windowHeight = document.documentElement.clientHeight;
        } else {
          windowHeight = document.body.clientHeight;
        }
        return windowHeight;
      }
    }

    window.onscroll = function () {
      if (scrollObj.getScrollHeight() - (scrollObj.getScrollTop() + scrollObj.getWindowHeight()) <= toBottomNum) {
        typeof callback === 'function' && callback();
      }
    };
  }
  /**
   * 获取DOM元素到文档顶部的距离
   */
  getElementToPageTop(el) {
    if (!el) return 0
    if (el.offsetParent !== document.body) {
      const marginTop = ~~el.style.marginTop.slice(0, -2)
      return this.getElementToPageTop(el.offsetParent) + el.offsetTop + marginTop
    }
    return el.offsetTop
  }

  /**
   * 兼容requestAnimationFrame
   */
  requestAnimationFrame() {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  }

  // 获取class
  getClass(el) {
    if (!el) return
    return el.getAttribute('class')
  }
  // 设置class
  setClass(el, cls) {
    if (!el) return
    return el.setAttribute('class', cls)
  }

  // 判断class是否存在
  hasClass(elements, cName) {
    if (!elements) return
    return !!elements.className.match(new RegExp('(\\s|^)' + cName + '(\\s|$)'));
  }
  // 添加clss
  addClass(elements, cName) {
    if (!elements) return
    if (!this.hasClass(elements, cName)) {
      elements.className = elements.className.trim() + ' ' + cName;
    }
  }
  // 删除class
  removeClass(elements, cName) {
    if (!elements) return
    if (this.hasClass(elements, cName)) {
      elements.className = elements.className.replace(new RegExp('(\\s|^)' + cName + '(\\s|$)'), ' ');
    }
  }
  // 切换class
  toggleClass(elements, cName) {
    if (!elements) return
    if (this.hasClass(elements, cName)) {
      elements.className = elements.className.replace(new RegExp('(\\s|^)' + cName + '(\\s|$)'), '');
    } else {
      elements.className = elements.className.trim() + ' ' + cName;
    }
  }
}

export default new Dom();

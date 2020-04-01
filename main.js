// ==UserScript==
// @name         b站vtuber直播同传评论转字幕
// @namespace    http://tampermonkey.net/
// @version      0.2
// @author       You
// @include      https://live.bilibili.com/*
// @exclude      https://live.bilibili.com/p/*
// @grant        GM_xmlhttpRequest
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
// @require      https://cdn.staticfile.org/vue/2.6.11/vue.min.js
// @connect      youdao.com
// @description  将vtuber直播时同传man的评论，以类似底部弹幕的形式展现在播放器窗口，免去在众多快速刷过的评论中找同传man的痛苦。


// ==/UserScript==


(function () {
// 字幕样式配置


  const removeBracket = true

  window.attentionModul = {}
  window.attentionModul.commentApp = {}
  window.attentionModul.consoleApp = {}
  window.attentionModul.transApp = {}
  window.attentionModul.users = []
  window.attentionModul.observe = {}
  window.attentionModul.dom = []
  // 测试用组件
  window.attentionModul.debug = {}
  window.attentionModul.debug.setComment = function (index, comment) {
    setComment(index, comment)
  }
  window.attentionModul.debug.addAttentionUser = addAttentionUser
  window.attentionModul.debug.showDOM = function () {
    return [document.getElementById('comment-container'), document.getElementById('console-container')]
  }
  window.attentionModul.config = JSON.parse(localStorage.getItem('config') || '{"color":"#ffffff","vertical":"2","fontSize":40}')
  window.attentionModul.encodingObject = encodeObject

  // 添加关注用户
  function addAttentionUser(uid) {
    $('textarea:eq(0)').click()
    if (window.attentionModul.users.indexOf(uid) < 0) {
      window.attentionModul.users.push(uid)
      window.attentionModul.commentApp.comments.push(null)
    }
  }

  // 移除关注用户
  function removeAttentionUser() {

  }

  // 移除括号
  function removeBreaket(comment) {
    let r = comment.match(/^[ 【]*(.*?)[ 】]*$/i)[1]
    return r
  }

  //将匹配评论添加到vue变量中对应的字幕DOM
  function setComment(index, comment) {
    window.attentionModul.commentApp.comments.splice(index, 1, comment)
  }

  function encodeObject(obj) {
    let param = ''
    for (let key in obj) {
      param += key + '=' + encodeURIComponent(obj[key]) + '&'
    }
    return param.substring(0, param.length - 1)
  }

  //匹配评论发出者与关注用户
  function chatFilter(nodeList) {
    for (let item of nodeList) {
      const uid = item.getAttribute('data-uid')
      const comment = item.getAttribute('data-danmaku')
      const index = window.attentionModul.users.indexOf(uid)
      if (index > -1) {
        if (removeBreaket) {
          setComment(index, removeBreaket(comment))
        } else {
          setComment(index, comment)
        }
      }
    }
  }

  // DOM突变事件回调函数
  function mutationListener(mutationList) {
    window.attentionModul.observe.message = mutationList

    if (window.attentionModul.observe.message[0].addedNodes.length > 0) {
      chatFilter(window.attentionModul.observe.message[0].addedNodes)
    }
  }

  function saveConfig() {
    const config = {
      "color": window.attentionModul.consoleApp.color,
      "vertical": window.attentionModul.consoleApp.vertical,
      "fontSize": window.attentionModul.consoleApp.fontSize
    }
    localStorage.setItem('config', JSON.stringify(config))
  }

  // 注入控制台组件
  ;(function () {


    const consoleContainer = $('<div @mouseleave="consoleOut" @mouseover.stop="consoleIn" id="console-container" class="att-top"></div>')
    const widgetIcon = $('<div v-show="!isShowConsole"  class="att-icon-container att-top" ><div class="att-icon"></div></div>')
    const consoleWidget = $('<div v-show="isShowConsole" id="att-console" class="att-col"></div>')
    const verticalWidget = $('<div class="att-console-title">字幕水平高度</div><div class="att-row"><input @input="changeVertical" class="att-input-range" type="range" v-model:value="vertical"><input class="att-input-value" v-model:value="vertical" @change="changeVertical"></div>')
    const fontSizeWidget = $('<div class="att-console-title">字幕大小</div><div class="att-row"><input @input="changeFontsize" class="att-input-range" type="range" v-model:value="fontSize" min="1" max="500"  step="5"><input class="att-input-value" v-model:value="fontSize" @change="changeFontsize"></div>')
    const colorWidget = $('<div class="att-console-title">字幕颜色</div><div class="att-row"><input class="att-input-range" placeholder="示例:#030303" v-model:value="color" @change="changeColor" style="padding: 2px;border-radius: 2px;border: 0;border-bottom: 1px solid gray"><div @click="defualtColor" style="cursor:pointer;">默认</div></div>')
    consoleWidget.append(verticalWidget)
    consoleWidget.append(fontSizeWidget)
    consoleWidget.append(colorWidget)
    consoleContainer.append(widgetIcon)
    consoleContainer.append(consoleWidget)
    $('body').append(consoleContainer)

    const config = window.attentionModul.config
    window.attentionModul.consoleApp = new Vue({
      el: '#console-container',
      data() {
        return {
          isShowConsole: false,
          vertical: config['vertical'],
          fontSize: config['fontSize'],
          color: config['color']
        }
      },
      methods: {
        consoleIn() {
          this.isShowConsole = true
        },
        consoleOut() {
          this.isShowConsole = false
        },
        changeVertical() {
          this.vertical = Math.min(100, Math.max(0, this.vertical))
          $('#comment-container').css('bottom', this.vertical.toString() + '%')
          saveConfig()
        },
        changeFontsize() {
          this.fontSize = Math.min(500, Math.max(0, this.fontSize))
          $('#comment-container').css('fontSize', this.fontSize.toString() + 'px')
          saveConfig()
        },
        changeColor() {
          $('#comment-container').css('color', this.color.toString())
          saveConfig()
        },
        defualtColor() {
          this.color = '#ffffff'
          $('#comment-container').css('color', this.color.toString())
          saveConfig()
        }
      }
    })
  })();
  // 注入字幕组件
  ;(function insertCommentWidget() {
    const container = $('.bilibili-live-player-video-danmaku')
    if (container.length > 0) {
      const commentWidget = $('<div id="comment-container" :style="widgetStyle"><div v-for="(comment,index) in comments" :style="boxStyle"><div v-show="comment" :style="commentStyle">{{comment}}</div></div></div>')
      let widgetStyle = 'z-index: 999;position:absolute;left:50%;transform:translateX(-50%);width:90%;'
      let boxStyle = ''
      let commentStyle = 'display:inline-block;backgroundColor:rgba(0,0,0,0.5);position:relative;left:50%;transform:translateX(-50%);word-break: break-all;padding:10px;'
      container.append(commentWidget)
      window.attentionModul.commentApp = new Vue({
        el: '#comment-container',
        data() {
          return {
            widgetStyle: widgetStyle,
            boxStyle: boxStyle,
            comments: new Array(window.attentionModul.users.length),
            commentStyle: commentStyle,
            dom: document.getElementById('comment-container')
          }
        }
      })
      window.attentionModul.consoleApp.changeVertical()
      window.attentionModul.consoleApp.changeColor()
      window.attentionModul.consoleApp.changeFontsize()

    } else {
      requestAnimationFrame(function () {
        insertCommentWidget()
      })
    }
  })();
// 在用户名点击菜单注入关注选项
  ;(function insertMenuWidget() {
      const menu = $('.danmaku-menu')
      const menuItem = menu.find('.report-this-guy')
      if (menuItem.length > 0) {
        let a = $('<a href="javascript:;" class="bili-link pointer" style="display: block">添加字幕特别关注</a>')
        menuItem.append(a)
        // 添加点击函数，获取用户uid，调用add函数添加到关注用户列表
        a.click(function () {
          const uid = menu[0].__vue__.uid
          addAttentionUser(uid.toString())
        })
      } else {
        requestAnimationFrame(function () {
          insertMenuWidget()
        })
      }
    }
  )();

  // 注入翻译组件
  function insertTranslateWidget() {
    let injectAnchor = $('.right-action')
    if (injectAnchor.length > 0) {
      const translateButton = $('<button id="att-translate" class="att-button" @click="translate">翻译</button>')
      injectAnchor.prepend(translateButton)
      window.attentionModul.transApp = new Vue({
        el: '#att-translate',
        data() {
          return {commentVm: document.getElementsByClassName('control-panel-ctnr')[0].__vue__}
        },
        methods: {
          translate() {
            const query = this.commentVm.chatInput
            const url = 'http://fanyi.youdao.com/translate_o?client=fanyideskweb&keyfrom=fanyi.web&version=2.1&doctype=json'
            const salt = "" + (new Date).getTime() + parseInt(10 * Math.random(), 10);
            const sign = window.attentionModul.md5("fanyideskweb" + query + salt + "n%A-rKaT5fb[Gy?;N5@Tj");
            var headers = {
              "Content-Type": "application/x-www-form-urlencoded",
              "Referer": "http://fanyi.youdao.com/"
            }
            const data = 'from=AUTO&to=ja&salt=' + salt + '&sign=' + sign + '&i=' + query
            GM_xmlhttpRequest({
              method: 'POST',
              url: url,
              data: data,
              headers: headers,
              onload(r) {
                const res = JSON.parse(r.responseText)
                if (res.translateResult) {
                  window.attentionModul.transApp.commentVm.chatInput = res.translateResult[0][0].tgt
                }
              }
            })
          }
        }
      })
    } else {
      requestAnimationFrame((function () {
        insertTranslateWidget()
      }))
    }
  }

  insertTranslateWidget();
  // 监听评论DOM突变事件
  window.attentionModul.observe.observer = new MutationObserver(mutationListener)
  window.attentionModul.observe.config = {childList: true}
  ;(function openObserver() {
    window.attentionModul.observe.anchor = document.getElementsByClassName('chat-history-list')[0]
    if (window.attentionModul.observe.anchor) {
      cancelAnimationFrame(window.attentionModul.index)
      window.attentionModul.observe.observer.observe(window.attentionModul.observe.anchor, window.attentionModul.observe.config)
    } else {
      window.attentionModul.index = requestAnimationFrame(function () {
          openObserver()
        }
      )
    }
  })();

  const consoleStyle = `



.att-col{
    display: flex;
    flex-flow: column nowrap;
    place-content: center start;
}
.att-row{
    display: flex;
    flex-flow: row nowrap;
    place-content: center start;
    margin:3px 0px 3px 0px;
}
.att-top{
    z-index: 999;
}
.att-input{
    outline: none;
}
#console-container{
    position: absolute;
    left: 50px;
    top: 300px;
    min-height: 48px;
    min-width: 48px;
}
.att-icon-container {
    position: absolute;
    left: 0px;
    top: 0px;
    height: 48px;
    width: 48px;
    background-color: #fb7299;
    border-radius: 4px;
}
.att-icon {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 32px;
    width: 32px;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADFElEQVRYhe2XX2iPURjHP7+N0oYRWWObMZSUJjQKG/JnlCh/LkSaUG6URLlf8pNSciEX1AqzaEXKhdTMnVHmRogxtOZfG/m/r956Th3v791r7++nXPCt0znv8zznOd/3Oc95zvvyzyPlAiDpd7GYAywAioEioBd4BbQCd5MGMpVK/SoICAzQdku6p3i0S6qP8ZHRMhBhNN8c++iSdFVSk/UvQvo2SbP+BIGNIceNkhZKKgjZFUqqkXTOs/0maXUuBJZ4zh5KWjzIsC6T9NSbm5Y0NymBIknvzcEDSWOT7KukkhCJAGclTRwsgVM26Yuk8oSLu1Yp6WuIRI9tVSyBUm/CviwXd+2g+en3fP6QVB1HYK8ZvpGUnyOBYZJ6jUCDpFvmu9slskOex2GB9ZeAH5kUE+Ez0GKF7iOwxmTjgHSkI0mPjOX20NuMkTQlJJsRse/hhN1t/jrseZe3HSVRBD6ass5zEpyKZ5I+SJpnsrQl2RF7DuR9kp6bvZu71vy982TdLseitsCN/QwZBpQBhcAok00DhgJT7Xk0MBwoNXsHt40pz/dF62ujItBp7LaEQhkcn03ec7GkzXbmnSzQ14bm1XvFLGWybSZ7GkXgmimP5ngCXDtu/i57spUm+xS1BTetX5ck3WPg/LR5JvnW90cROG/9JGBDjotvASbY+IInL7e+K2OGhajFQtRlxy+b0Bd52d4U0rlbs3kgApV2bAIcypLADa/0loWIfTLdjoEIBO20GTUmXLhCUqtXbLaG9CddAkoaEUfghBmmvboefB1NHmDhCZL2S3odc5kt8nQH/LtgSEQCOdksoMESMig634ErQCfQZx+mlUCNFSpMvtNLaIcq698ChyPW/CUCZ5QcHXab+n7Ge+M15vGxk8VFoNcbtwPNViOCklwNzASWhuY8AV4C600/G1gO3AbOWLTcenl+HYiKQJC5eyRVxSRcUJ6vZxGp4HMtz49Akh+TKCwCVthPS4VdRj3AHeA+MB3YZBdWgA/AyGA592OSK4Ew8iM+ZgqAVUAd0AEcI+rP6D/+CoCf0HfCu9e1CkQAAAAASUVORK5CYII=');
}
#att-console{
    color: #23ade5;
    background-color: white;
    width: 250px;
    min-height: 48px;
    padding: 14px 8px 14px 8px;
    border-radius: 8px;
}
.att-console-title{
    margin:4px;
}
.att-input-range{
    width: 200px;
    margin-right: 10px;
    outline: none;
}
.att-input-value{
    width: 20px;
    text-align: center;
    border: 0px;
    border-bottom: 1px solid gray;
    outline: none;
}
.att-button{
    min-width: 80px;
    height: 24px;
    font-size: 12px;
    background-color: #23ade5;
    color: #fff;
    border-radius: 4px;
    border: 0px;
    margin-right: 2px;
}
.att-button:hover{
    background-color: #39b5e7;
}


    `
  $('body').append($('<style></style>').text(consoleStyle))
  window.attentionModul.md5 = function (md5str) {
    var createMD5String = function (string) {
      var x = Array()
      var k, AA, BB, CC, DD, a, b, c, d
      var S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22
      var S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20
      var S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23
      var S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21
      string = uTF8Encode(string)
      x = convertToWordArray(string)
      a = 0x67452301
      b = 0xEFCDAB89
      c = 0x98BADCFE
      d = 0x10325476
      for (k = 0; k < x.length; k += 16) {
        AA = a
        BB = b
        CC = c
        DD = d
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478)
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756)
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB)
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE)
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF)
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A)
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613)
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501)
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8)
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF)
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1)
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE)
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122)
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193)
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E)
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821)
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562)
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340)
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51)
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA)
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D)
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453)
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681)
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8)
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6)
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6)
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87)
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED)
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905)
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8)
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9)
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A)
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942)
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681)
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122)
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C)
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44)
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9)
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60)
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70)
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6)
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA)
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085)
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05)
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039)
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5)
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8)
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665)
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244)
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97)
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7)
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039)
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3)
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92)
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D)
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1)
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F)
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0)
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314)
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1)
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82)
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235)
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB)
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391)
        a = addUnsigned(a, AA)
        b = addUnsigned(b, BB)
        c = addUnsigned(c, CC)
        d = addUnsigned(d, DD)
      }
      var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)
      return tempValue.toLowerCase()
    }
    var rotateLeft = function (lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
    }
    var addUnsigned = function (lX, lY) {
      var lX4, lY4, lX8, lY8, lResult
      lX8 = (lX & 0x80000000)
      lY8 = (lY & 0x80000000)
      lX4 = (lX & 0x40000000)
      lY4 = (lY & 0x40000000)
      lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF)
      if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8)
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8)
        else return (lResult ^ 0x40000000 ^ lX8 ^ lY8)
      } else {
        return (lResult ^ lX8 ^ lY8)
      }
    }
    var F = function (x, y, z) {
      return (x & y) | ((~x) & z)
    }
    var G = function (x, y, z) {
      return (x & z) | (y & (~z))
    }
    var H = function (x, y, z) {
      return (x ^ y ^ z)
    }
    var I = function (x, y, z) {
      return (y ^ (x | (~z)))
    }
    var FF = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }
    var GG = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }
    var HH = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }
    var II = function (a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }
    var convertToWordArray = function (string) {
      var lWordCount
      var lMessageLength = string.length
      var lNumberOfWordsTempOne = lMessageLength + 8
      var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64
      var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16
      var lWordArray = Array(lNumberOfWords - 1)
      var lBytePosition = 0
      var lByteCount = 0
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4
        lBytePosition = (lByteCount % 4) * 8
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition))
        lByteCount++
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4
      lBytePosition = (lByteCount % 4) * 8
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition)
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29
      return lWordArray
    }
    var wordToHex = function (lValue) {
      var WordToHexValue = '',
        WordToHexValueTemp = '',
        lByte, lCount
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255
        WordToHexValueTemp = '0' + lByte.toString(16)
        WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2)
      }
      return WordToHexValue
    }
    var uTF8Encode = function (string) {
      string = string.toString().replace(/\x0d\x0a/g, '\x0a')
      var output = ''
      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n)
        if (c < 128) {
          output += String.fromCharCode(c)
        } else if ((c > 127) && (c < 2048)) {
          output += String.fromCharCode((c >> 6) | 192)
          output += String.fromCharCode((c & 63) | 128)
        } else {
          output += String.fromCharCode((c >> 12) | 224)
          output += String.fromCharCode(((c >> 6) & 63) | 128)
          output += String.fromCharCode((c & 63) | 128)
        }
      }
      return output
    }
    return createMD5String(md5str)
  }
})();

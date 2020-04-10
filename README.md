# bilibiliVtuberLiveTool
b站(bilibili) vtuber直播，同传字幕绑定器--油猴脚本。关注同传man后，可以将同传评论显示在视频底部

## 目录
[脚本特性](#脚本特性)  
[使用方法](#使用方法)  
[更新计划](#更新计划)   
[压力测试](#压力测试)   
[说明](#说明)  

## 脚本特性
### 捕获同传man的评论，以类底部弹幕的形式显示,自动去括号。
![脚本效果web/1.png](web/1.png) 
### 支持全屏使用
![脚本效果web/2.png](web/2.gif)
### 支持小窗口使用
![bilibli小窗口](web/8.png)
### 新增可视化配置界面
![配置面板](web/6.gif)
### 新增翻译功能  
![翻译](web/7.gif)  
翻译使用有道API，不保证翻译准确性...  
**注：如果您需要使用翻译功能，请至少打开一次[有道翻译(点击此处连接直达)](http://fanyi.youdao.com/?keyfrom=dict2.index)，并随便翻译点什么，之后翻译功能就能够正常使用了。**

## 使用方法
* 前往Greasy Fork安装脚本,[点击此处](https://greasyfork.org/zh-CN/scripts/398879-b%E7%AB%99vtuber%E7%9B%B4%E6%92%AD%E5%90%8C%E4%BC%A0%E8%AF%84%E8%AE%BA%E8%BD%AC%E5%AD%97%E5%B9%95)
* 打开直播页面后，点击评论区同传man用户名，在弹出菜单中点击最下方的 **添加字幕特别关注**  
![添加关注方法web/4.png](web/4.png)  
* 设置完毕，等同传man发表新评论是，就会自动捕获并更新到播放器底部。
* **注1：如果您需要使用翻译功能，请至少打开一次[有道翻译(点击此处连接直达)](http://fanyi.youdao.com/?keyfrom=dict2.index)，并随便翻译点什么，之后翻译功能就能够正常使用了。**
* 注2：脚本可以添加多个同传man，重复上一步操作即可。


 ## 更新计划
- [ ] 添加各类功能的开关，避免切换到非vtuber直播间后需要关闭插件
- [ ] 添加同传man评论历史记录窗口
- [ ] 未来计划用Google、Azure或者有道的实时翻译接口或者语音识别接口实现实时翻译（之所以脚本都是调接口，毕竟这是人家吃饭的东西，自己写的模型充其量算是个爱好），但是最近读论文有些忙，具体什么时候实现还得待定
- [x] 计划在评论栏添加中文转日文功能，帮助不懂日语的小伙伴和vtuber互动(计划使用youdao APi)
- [ ] ~~保存关注的同传man~~
- [x] 添加可视化的字幕颜色、大小修改面板。
- [x] 添加自由拖动字幕位置的功能。
 ## 压力测试
 有人跟我提了一下高峰期直播间弹幕的问题，所以我去做了一下压力测试(因为不清楚MutationOberver的实际性能)。
 * 测试方法：模拟同传man，从0数到100，期间加入压力测试，逐渐增加弹幕频率，看脚本是否会漏掉模拟同传man的评论。
 * 测试结果：将弹幕频率提升到Chrome浏览器极限后，脚本依旧不会漏掉同传man评论，说明MutationOberver的性能没有那么不堪。(Chrome浏览器弹幕速度的极限取决于DOM刷新频率，在每秒920条弹幕频率就无法提升了)
 * 测试过程：![100秒压力测试](web/press.gif)  
 测完了才想起来，Mutation如果是回调事件应该是阻塞式的，理论上就不可能漏掉弹幕...是自己蠢了。
 ## 说明
* 如果您有任何问题、意见或建议，请直接发issue。  
* 请不要在greasyfork发反馈，gf的反馈看不到。

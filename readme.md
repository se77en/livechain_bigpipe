## 使用Facebook Bigpipe技术提速页面加载效率并实现模块化 ##

**[Bigpipe](https://www.facebook.com/note.php?note_id=389414033919)** (需翻墙)是 Facebook 开发的优化页面加载速度的技术,只有理论没有实现,周末用node.js实现了它。

### 什么是 Bigpipe ? ###

Bigpipe的核心是只用一个Http请求,页面元素不按顺序发送(谁先完成发送谁),而我们传统意义上,是先发送页面框架,然后各个模块发送各自的Http请求去获取各自区域内的数据,或者统一发送一个ajax请求去获取数据,然后在处理数据到各个模块。

### 如何实现模块化 ###

页面划分为不同区域,各个区域展示各自的数据,谁先获得数据谁先显示,总时间为最慢获得数据的模块使用时间.比如:页面由A和B两个模块构成,A获得数据需要8秒,B获得数据需要5秒,那么整个页面加载时间一共只需要8秒,如果A发生错误获取数据失败,不影响B获取并显示数据,反之亦然.


### 为什么用 node.js 去实现 ###

原因很简单,因为 node.js 是全异步非阻塞的,正好适合处理这种问题.
如果对 node.js 还有怀疑,请参考[全球最大团购网站Groupon用Rails迁移到node.js](https://engineering.groupon.com/2013/node-js/geekon-i-tier/) 和 [Linkedin迁移到node.js,30台服务器减少到3台,性能提升20倍](http://highscalability.com/blog/2012/10/4/linkedin-moved-from-rails-to-node-27-servers-cut-and-up-to-2.html),国内的[淘宝指数](http://shu.taobao.com/),[淘宝数据魔方](http://mofang.taobao.com/) 以及[网易的分布式高性能游戏框架pomelo](http://pomelo.netease.com/). 所以,性能和稳定性完全不必考虑,开发效率更是大大高于Java

项目所用到的技术

- `Express` --Web框架
- `Jade` --模板引擎
- JavaScript的 `Promises` 机制
# 小歆记账 for 微信小程序

## 简介

小歆记账是一款轻量级的云记账工具，该项目（小歆记账 for 微信小程序）是一个基于微信小程序 + WeUI的记账工具，兼容所有可运行微信的设备，以下简称小歆记账WeChat。

> GitHub：https://github.com/xiaoxinpro/xxjzWeChat

小歆记账WeChat数据存储部分在服务端，与[小歆记账WebApp项目](https://github.com/xiaoxinpro/xxjzWeb)共用数据库，通过小程序的Request与[小歆记账WebApp](https://github.com/xiaoxinpro/xxjzWeb)后台通信。其中使用WeUI作为前端框架，WeChat负责逻辑处理和编译任务。

> 注意：小歆记账WeChat必须与[小歆记账WebApp项目](https://github.com/xiaoxinpro/xxjzWeb)配套使用，不能单独工作。

## 下载使用

使用微信扫描下面的小程序码，进入小歆记账主界面。

![小歆记账 发布版](https://upload-images.jianshu.io/upload_images/1568014-ca759146496e4773.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 项目搭建

### 搭建前准备工作

首先需要完成服务端的部署，具体流程请查看 [小歆记账WebApp项目](https://github.com/xiaoxinpro/xxjzWeb) 这里不再赘述。

接下来需要注册微信小程序账号与安装微信开发者工具开发，安装与使用请参见微信官方资料。

官方文档: https://mp.weixin.qq.com/debug/wxadoc/dev/

开发工具: https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html

### 微信小程序开发设置

使用微信小程序账号登陆后台 https://mp.weixin.qq.com/ 在左侧选择`开发`按钮，最后在顶部选择`开发设置`界面。

![开发设置界面](https://upload-images.jianshu.io/upload_images/1568014-06d0e3bcf240a7eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在这里需要记录你的`AppID(小程序ID)`和`AppSecret(小程序密钥)`，后面在服务端配置与小程序配置中需要用到。

接下来在下面找到`服务器域名`，点击右侧的修改按钮，分别将你的`https://服务端域名`添加到`request合法域名`、`uploadFile合法域名`、`downloadFile合法域名`中，另外还需要将`https://wx.qlogo.cn`域名添加到`downloadFile合法域名`中用于下载微信头像。

![服务器域名配置](https://upload-images.jianshu.io/upload_images/1568014-3e94f6d78e42a86d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 另外，如果你有图片缓存服务器还需要将`https://图片缓存服务器域名`分别添加到`uploadFile合法域名`、`downloadFile合法域名`中。

最后在左侧列表最下端`设置`页面中可以设置小程序一些内容，可根据自身需要来配置，这里不再赘述。

### 记账服务端设置

小歆记账WebApp项目的`/Application/Common/Conf/config.php`文件中，分别修改以下几个配置：

* WX_ENABLE 修改为`true`
* WX_OPENID 修改为前面记录的`AppID(小程序ID)`
* WX_SECRET 修改为前面记录的`AppSecret(小程序密钥)`
* ADMIN_UID 选择一个管理员的UID将其设置，默认为初始安装是设置的账号

另外也可根据需要修改`/Application/Home/Conf/config.php`文件中的具体配置。

### 小程序项目设置

下载最新的Releases源码：https://github.com/xiaoxinpro/xxjzWeChat/releases

解压后使用微信小程序开发工具打开项目

打开根目录下的`app.js`文件，修改以下几个配置：

* URL      修改为https://服务端的域名
* AdminUid 修改为管理员的UID，与服务端配置的ADMIN_UID相同
* Demo     服务端注册一个Demo账号，并将其用户名和密码修改

> 根据微信小程序最新的审核标准，没有这个Demo账号将无法审核通过，此账号用于体验功能与官方审核使用。

以上完成了基础搭建工作，后续可根据需要进行其他响应的更改。

## 目录结构

    xxjzWeChat 微信小程序目录
        ├─ec-canvas 图表插件
        ├─image 图片目录
        │ └─icon_class 分类图标目录
        ├─pages 页面目录
        │ ├─chart 图表目录
        │ ├─index 首页目录
        │ ├─list 列表页目录
        │ ├─login 登陆页目录
        │ ├─main 主页目录
        │ ├─tool 工具目录
        │ └─user 用户页目录
        ├─utils 公共目录
        │ ├─base64.js 加密解密库
        │ └─util.js 公共函数库
        ├─we-cropper 图片裁剪插件
        ├─app.js 小程序逻辑
        ├─app.json 小程序公共设置
        ├─app.wxss 小程序公共样式表
        ├─iconfont.wxss 字体图标样式
        ├─weui.wxss WeUI样式
        ├─weuiPuls.wxss WeUI增强样式
        └─README.md 描述文件

## 参考

* [Base64](http://en.wikipedia.org/wiki/Base64)
* [ECharts](https://github.com/ecomfe/echarts-for-weixin)
* [iconfont](http://www.iconfont.cn/)
* [xxjzWeb](https://github.com/xiaoxinpro/xxjzWeb)
* [WeChat](https://mp.weixin.qq.com/debug/wxadoc/dev/index.html)
* [WeUI](https://github.com/Tencent/weui)
* [we-cropper](https://github.com/we-plugin/we-cropper)

# 小歆记账 for 微信小程序

## 简介

小歆记账是一款轻量级的云记账工具，该项目（小歆记账 for 微信小程序）是一个基于微信小程序 + WeUI的记账工具，兼容所有可运行微信的设备，以下简称小歆记账WeChat。

> GitHub：https://github.com/xiaoxinpro/xxjzWeChat

小歆记账WeChat数据存储部分在服务端，与[小歆记账WebApp项目](https://github.com/xiaoxinpro/xxjzWeb)共用数据库，通过小程序的Request与[小歆记账WebApp](https://github.com/xiaoxinpro/xxjzWeb)后台通信。其中使用WeUI作为前端框架，WeChat负责逻辑处理和编译任务。

> 注意：小歆记账WeChat必须与[小歆记账WebApp项目](https://github.com/xiaoxinpro/xxjzWeb)配套使用，不能单独工作。

## 下载使用

使用微信扫描下面的小程序码，进入小歆记账主界面。

![小歆记账 发布版](https://upload-images.jianshu.io/upload_images/1568014-ca759146496e4773.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 项目说明

小歆记账WeChat基于微信开发者工具开发，安装与使用请参见微信官方资料。

官方文档: https://mp.weixin.qq.com/debug/wxadoc/dev/

开发工具: https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html

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

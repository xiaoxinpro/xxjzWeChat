//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    motto: '小歆记账',
    login: '绑定已有帐号',
    regist: '新建帐号',
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },
  bindViewLogin: function() {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  bindViewRegist: function() {
    wx.showModal({
      title: '暂不支持注册',
      content: '微信小程序暂不支持小歆记账新用户注册，请到小歆记账官网注册后再来登陆！',
      showCancel: false,
      confirmText: '知道了'
    })
  },
  onLoad: function () {
    console.log('加载小程序，检测URL：', getApp().URL);
    var that = this

    // 清除PHPSESSID
    wx.removeStorageSync('PHPSESSID');

    //获取登陆用户数据
    let user = wx.getStorageSync('user');
    if (user && user.uid > 0) {
      wx.navigateTo({
        url: '../login/login?username=' + user.username + '&password=' + user.password,
      });
      return;
    }

    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
      //缓存用户信息
      wx.setStorage({
        key: 'userInfo',
        data: userInfo
      })
      //缓存用户头像
      wx.downloadFile({
        url: userInfo.avatarUrl,
        success: function(res){
          var path = res.tempFilePath;
          console.log('头像临时路径', path);
          wx.saveFile({
            tempFilePath: path,
            success: function(res){
              path = res.savedFilePath;
              console.log('头像永久路径', path);
              wx.setStorage({
                key: 'avatarPath',
                data: path,
              })
            }
          })
        }
      })
      console.log('加载用户信息：', userInfo);
    })
  }
})

//index.js
//获取应用实例
var app = getApp();
var that = this;
var code = "";
Page({
  data: {
    motto: '小歆记账',
    login: '绑定已有帐号',
    regist: '新建帐号',
    lock: true,
    refresh: false,
    demo: app.Demo,
    windowHeight: 0,
    screenHeight: 0,
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function () {
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },
  bindViewLogin: function () {
    wx.navigateTo({
      url: '../login/login?code=' + code,
    })
  },
  bindViewRegist: function () {
    wx.navigateTo({
      url: '../login/regist?code=' + code,
    })
  },
  bindViewRefresh: function (res) {
    that = this;
    console.log(res);
    if (res.detail.errMsg == "getUserInfo:ok") {
      InitApp();
    } else {
    wx.getSetting({
      success: (res) => {
        console.log("授权信息：", res.authSetting);
        if (res.authSetting["scope.userInfo"]) {
          InitApp();
        } else {
          wx.openSetting({
            success: (res) => {
              console.log("授权信息：", res.authSetting);
              if (res.authSetting["scope.userInfo"]) {
                InitApp();
              }
            }
          })
        }
      }
    });
    }
  },
  onLoad: function (e) {
    that = this;
    this.setData({
      windowHeight: app.globalData.windowHeight,
      screenHeight: app.globalData.screenHeight,
    });
    console.log('加载小程序，检测URL：', getApp().URL, e);
    var sessid = wx.getStorageSync('PHPSESSID');
    var user = wx.getStorageSync('user');
    if (sessid && user) {
      console.log('加载用户信息：', user, sessid);
      var url = "../main/main?";
      if(e.hasOwnProperty('jump')) {
        url = url + "url=" + e.jump + "&";
      }
      wx.reLaunch({ url: url + "uid=" + user.uid + "&uname=" + user.username });
    }else{
      wx.getSetting({
        success: (res) => {
          var auth = res.authSetting;
          if (auth["scope.userInfo"] == true) {
            InitApp();
          } else {
            console.log("初次使用需要用户授权访问");
            that.setData({
              refresh: true
            });
          }
        }
      });
    }
  }
})

function InitApp() {
  // 清除PHPSESSID
  wx.removeStorageSync('PHPSESSID');

  //调用应用实例的方法获取全局数据
  app.getUserInfo(function (userInfo) {
    //更新数据
    that.setData({
      userInfo: userInfo,
      refresh: false
    })
    //缓存用户信息
    wx.setStorage({
      key: 'userInfo',
      data: userInfo
    })
    //缓存用户头像
    wx.downloadFile({
      url: userInfo.avatarUrl,
      success: function (res) {
        var path = res.tempFilePath;
        console.log('头像临时路径', path);
        wx.saveFile({
          tempFilePath: path,
          success: function (res) {
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
    // 尝试登陆
    Login(that);
  })
}

function LoadDone() {
  wx.hideLoading();
  that.setData({
    lock: false
  });
}

function Login(that) {
  // 尝试登陆
  wx.showLoading({
    title: '加载中',
  });
  wx.login({
    success: function (res) {
      wx.hideLoading();
      if (res.code) {
        code = res.code;
        console.log('获取用户登录态成功：' + res.code)
        wx.request({
          url: getApp().URL + '/xxjzApp/index.php?s=/Home/Login/login_weixin',
          data: {
            js_code: res.code
          },
          method: 'GET',
          success: function (res) {
            console.log('提交登陆完成：', res.data);
            //保存sessionid
            if (res.data.hasOwnProperty('sessionid')) {
              wx.setStorageSync('PHPSESSID', res.data.sessionid);
            }
            //处理登陆结果
            var uid = parseInt(res.data.uid);
            var uname = res.data.uname;
            if (uid == 0) {
              wx.showModal({
                title: '登陆失败',
                content: uname,
              });
            } else if (uid > 0) {
              wx.showToast({
                title: '登陆成功',
              });
              wx.setStorage({
                key: 'user',
                data: {
                  uid: uid,
                  username: uname,
                },
                success: function () {
                  //跳转到用户主页
                  wx.reLaunch({ url: "../main/main?uid=" + uid + "&uname=" + uname });
                }
              });
            } else {
              LoadDone();
            }
          }
        });
      } else {
        LoadDone();
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    },
    fail: function () {
      LoadDone();
    }
  });
}

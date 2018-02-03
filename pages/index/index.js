//index.js
//获取应用实例
var app = getApp();
var code = "";
Page({
  data: {
    motto: '小歆记账',
    login: '绑定已有帐号',
    regist: '新建帐号',
    lock: true,
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
      url: '../login/login?code=' + code,
    })
  },
  bindViewRegist: function() {
    wx.navigateTo({
      url: '../login/regist?code=' + code,
    })
    // wx.showModal({
    //   title: '暂不支持注册',
    //   content: '微信小程序暂不支持小歆记账新用户注册，请到小歆记账官网注册后再来登陆！',
    //   showCancel: false,
    //   confirmText: '知道了'
    // })
  },
  onLoad: function () {
    console.log('加载小程序，检测URL：', getApp().URL);
    var that = this

    // 清除PHPSESSID
    wx.removeStorageSync('PHPSESSID');

    //获取登陆用户数据
    // let user = wx.getStorageSync('user');
    // if (user && user.uid > 0) {
    //   wx.navigateTo({
    //     url: '../login/login?username=' + user.username + '&password=' + user.password,
    //   });
    //   return;
    // }

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
      // 尝试登陆
      Login(that);
    })
  }
})

function LoadDone(that) {
  wx.hideLoading();
  setTimeout(function (){
    that.setData({
      lock: false
    },2000);
  });
}

function Login(that) {
  // 尝试登陆
  wx.showLoading({
    title: '加载中',
  });
  wx.login({
    success: function (res) {
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
                success: function(){
                  setTimeout(function () {
                    //跳转到用户主页
                    wx.reLaunch({ url: "../main/main?uid=" + uid + "&uname=" + uname });
                  }, 500);
                }
              });
            }
          }
        });
      } else {
        LoadDone(that);
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    },
    fail: function () {
      LoadDone(that);
    }
  });
}

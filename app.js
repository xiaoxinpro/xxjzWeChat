//app.js
App({
  //全局变量
  URL: 'https://ide.xxgzs.org',
  // URL: 'https://jz.xxgzs.org',

  onLaunch: function () {

  },

  // 获取用户信息
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            },
            fail: function () {
              console.log("未获取的登陆权限。");
              // wx.openSetting({
              //   success: (res) => {
              //     console.log("权限：", res.authSetting);
              //   }
              // })
            }
          })
        }
      })
    }
  },

  // 保存用户头像，并返回本地路径
  saveUserAvatar: function(url, callback) {
    wx.downloadFile({
      url: url,
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
            });
            callback(path);
          }
        })
      }
    })
  },

  // 获取分类数据
  GetClassData: function(uid, callback) {
    //console.log('uid:',uid)
    if(uid > 0) {
      var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
      if (session_id != "" && session_id != null) {
        var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
      } else {
        callback(false, 0, "内存数据出错，请登陆后再试。");
      } 
      wx.request({
        url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/aclass',
        data: { type: 'get' },
        header: header,
        success: function (res) {
          console.log('获取分类数据:', res);
          if (res.hasOwnProperty('data')) {
            let ret = res['data'];
            if (ret['uid'] == uid) {
              let data = ret['data'];
              wx.setStorage({
                key: 'inClass',
                data: data.in
              });
              wx.setStorage({
                key: 'outClass',
                data: data.out
              });
              wx.setStorage({
                key: 'allClass',
                data: data.all
              });
              callback(true, Object.getOwnPropertyNames(data.all).length, data);
            } else {
              callback(false, 0, "登录验证已过期，请重新登录。");
            }
          }
        }
      });
    } else {
      callback(false, 0, "用户登陆超时，请重新登陆。");
    }
  },

  // 退出登陆
  Logout: function(callback) {
    wx.clearStorage();
    callback({ url: "/pages/index/index" });
  },

  globalData:{
    userInfo:null
  }
})
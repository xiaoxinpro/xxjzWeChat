//app.js
App({
  //全局变量
  // URL: 'https://ide.xxgzs.org',
  URL: 'https://jz.xxgzs.org',

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

  Logout: function() {
    wx.removeStorageSync('user');
    wx.reLaunch({ url: "/pages/index/index" });
  },

  globalData:{
    userInfo:null
  }
})
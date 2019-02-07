// user.js
var that = this;
var app = getApp();
var user = {};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid: 0,
    uname: "",
    email: "",
    avatarPath: "",
    userInfo: {},
  },

  /**
   * 打开意见反馈
   */
  bindOpenFeedback: function () {
    wx.showModal({
      title: '意见反馈',
      content: '请到Github中的Issues反馈意见。',
      confirmText: '复制链接',
      cancelText: '取消',
      success: function (res) {
        if (res.confirm) {
          var url = 'https://github.com/xiaoxinpro/xxjzWeb/issues';
          wx.setClipboardData({
            data: url,
            success: function () {
              wx.showToast({
                title: '复制成功',
                icon: 'success'
              });
              console.log('复制成功：', url);
            }
          })
        }
      }
    })
  },

  /**
   * 退出按钮事件
   */
  btnLogout: function () {
    wx.showModal({
      title: "退出登陆",
      content: "你确定要退出当前登陆的帐号？",
      confirmText: "退出",
      confirmColor: "#FF0000",
      success: function (res) {
        if (res.confirm) {
          getApp().Logout(function (path) {
            wx.redirectTo({ url: "/pages/login/login" });
          });
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    that = this;
    user = wx.getStorageSync('user');
    initData(user);
    getUserData(user.uid, function (res) {
      if ((user.username != res.username) || (user.email != res.email)) {
        user.username = res.username || user.username;
        user.email = res.email || user.email;
        initData(user);
        wx.setStorage({
          key: 'user',
          data: user,
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

/** 初始化数据 */
function initData(user) {
  if (user.hasOwnProperty('uid') && user.hasOwnProperty('username')) {
    var userInfo = wx.getStorageSync('userInfo');
    var avatarPath = wx.getStorageSync('avatarPath');
    if (avatarPath) {
      wx.getSavedFileInfo({
        filePath: avatarPath,
        success: function (res) {
          console.log('获取到本地头像', res);
          that.setData({
            uid: user.uid,
            uname: user.username,
            email: user.email ? user.email : '',
            avatarPath: avatarPath,
          });
        },
        fail: function (res) {
          console.log('本地头像不存在', res);
          wx.removeStorageSync('avatarPath');
          that.setData({
            uid: user.uid,
            uname: user.username,
            email: user.email ? user.email : '',
          });
          UpdataAvatar();
        }
      });
    } else {
      that.setData({
        uid: user.uid,
        uname: user.username,
        email: user.email ? user.email : '',
      });
      UpdataAvatar();
    }
  } else {
    app.Logout();
  }
}

/** 退出账号 */
function Logout() {
  wx.removeStorageSync('user');
  wx.reLaunch({ url: "../index/index" });
}

/** 获取用户数据 */
function getUserData(uid, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  wx.request({
    url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/user',
    method: 'GET',
    data: { uid: uid },
    header: header,
    success: function (res) {
      console.log('获取用户数据：', res);
      if (res.hasOwnProperty('data')) {
        let ret = res['data'];
        callback(ret);
      } else {
        callback({
          uid: 0,
          data: err['msg'] + '（请联系管理员）'
        });
      }
    }
  });
}

/** 更新用户头像 */
function UpdataAvatar() {
  app.getUserInfo(function (res) {
    console.log(res);
    var avatarUrl = res.avatarUrl;
    wx.setStorage({
      key: 'userInfo',
      data: res,
    });
    app.saveUserAvatar(avatarUrl, function (path) {
      that.setData({
        avatarPath: path,
      });
    })
  });
}

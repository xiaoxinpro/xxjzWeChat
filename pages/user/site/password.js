var that = this;
var user = {};

var Base64 = require('../../../utils/base64.js')
var util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 修改密码
   */
  changePassword: function (e) {
    that = this;
    var formData = e.detail.value;
    var pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,16}$/;
    if (formData.old_password.length < 6) {
      wx.showModal({
        title: '旧密码错误',
        content: '旧密码错误，请重新输入！',
        showCancel: false,
        cancelText: '知道了'
      });
    } else if (!pattern.test(formData.new_password)) {
      wx.showModal({
        title: '新密码格式错误',
        content: '新密码必须包含大小写字母和数字，长度8-16。',
        showCancel: false,
        cancelText: '知道了'
      });
    } else if (formData.new_password != formData.new_password2) {
      wx.showModal({
        title: '确认密码错误',
        content: '确认密码与新密码不同，请重新输入。',
        showCancel: false,
        cancelText: '知道了'
      });
    } else {
      //封装数据
      var passwordData = {};
      passwordData.uid = user.uid;
      passwordData.old = formData.old_password;
      passwordData.new = formData.new_password;

      //加密封装数据
      var strData = Base64.encoder(JSON.stringify(passwordData));

      //发送数据
      console.log("发送数据：", passwordData, strData);
      wx.showLoading({
        title: '提交中',
        success: function () {
          changePassword(user.uid, strData, function (res) {
            wx.hideLoading();
            console.log("修改密码结果：", res);
            if (res.uid == user.uid) {
              wx.showToast({
                title: '修改完成',
                success: function () {
                  setTimeout(function () {
                    getApp().Logout(function (path) {
                      wx.redirectTo(path);
                    });
                  }, 1000);
                }
              });
            } else {
              wx.showModal({
                title: '修改失败',
                content: res.username,
                showCancel: false,
                confirmText: '确定'
              });
            }
          });
        }
      });
    }
    console.log(e.detail.value);
  },

  /**
   * 返回按钮
   */
  navigateBack: function (e) {
    wx.navigateBack();
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
    user = wx.getStorageSync('user');
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

/**
 * 修改密码方法
 */
function changePassword(uid, data, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  wx.request({
    url: getApp().Config.URL + '/index.php?s=/Home/Api/user',
    method: 'POST',
    data: { uid: uid, type: 'updataPassword', data: data },
    header: header,
    success: function (res) {
      console.log('发送修改密码POST：', res);
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
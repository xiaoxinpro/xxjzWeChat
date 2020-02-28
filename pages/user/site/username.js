var that = this;
var user = {};

var Base64 = require('../../../utils/base64.js')
var util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: "",
  },

  /**
   * 修改用户名
   */
  changeUsername: function (e) {
    that = this;
    console.log("修改用户名表单：", e.detail.value);
    var formData = e.detail.value;
    var pattern = /[A-Za-z0-9_\-\u4e00-\u9fa5]{2,12}/;
    if (!pattern.test(formData.new_username)) {
      wx.showModal({
        title: '修改失败',
        content: '输入的用户名格式错误！',
        showCancel: false,
        confirmText: '知道了'
      });
    } else if (formData.txt_password.length < 6) {
      wx.showModal({
        title: '验证密码失败',
        content: '输入的密码格式错误！',
        showCancel: false,
        confirmText: '知道了'
      });
    } else if (formData.txt_email != user.email) {
      wx.showModal({
        title: '验证邮箱失败',
        content: '输入的邮箱错误！',
        showCancel: false,
        confirmText: '知道了'
      });
    } else {
      //封装数据
      var userData = {};
      userData.uid = user.uid;
      userData.username = formData.new_username;
      userData.password = formData.txt_password;
      userData.email = formData.txt_email;

      //加密封装数据
      var strData = Base64.encoder(JSON.stringify(userData));

      //发送数据
      console.log("发送数据：", userData, strData);
      wx.showLoading({
        title: '提交中',
        success: function () {
          changeUsername(user.uid, strData, function (res) {
            wx.hideLoading();
            console.log("修改用户名结果：", res);
            if (res.uid == user.uid) {
              that.setData({ username: res.username });
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
  },

  /**
   * 返回上一层
   */
  navigateBack: function () {
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
    that = this;
    wx.getStorage({
      key: 'user',
      success: function (res) {
        user = res.data;
        that.setData({
          username: user.username,
        });
      },
    })

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
 * 修改用户名方法
 */
function changeUsername(uid, data, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  wx.request({
    url: getApp().URL + '/index.php?s=/Home/Api/user',
    method: 'POST',
    data: { uid: uid, type: 'updataUsername', data: data },
    header: header,
    success: function (res) {
      console.log('发送修改用户名POST：', res);
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
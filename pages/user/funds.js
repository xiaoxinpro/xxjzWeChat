// pages/user/funds.js
var that = this;
var uid = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 编辑按钮
   */
  btnFundsEdit: function(res) {
    console.log(res.target.dataset);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    uid = wx.getStorageSync('user').uid;
    initData(function(data){
      that.setData({
        FundsList: data,
      })
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})

/** 初始化函数 */
function initData(callback) {
  if(!callback) {
    return wx.getStorageSync('Funds')
  } else {
    getFundsData(function(data){
      callback(data);
    });
  }
}

/** 获取资金账户 */
function getFundsData(callback) {
  getApp().GetFundsData(parseInt(uid), function(ret, len, data) {
    if (ret) {
      callback(data);
    } else {
      wx.showModal({
        title: '重新登录',
        content: '登录验证已过期，请重新登录。',
        showCancel: false,
        success: function() {
          getApp().Logout(function(path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
}
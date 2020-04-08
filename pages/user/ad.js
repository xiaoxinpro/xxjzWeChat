// pages/user/ad.js
var that = this;
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    adFunctionConfig: app.AdFunctionConfig,
  },

  /**
   * switchEnable
   */
  switchEnable: function (e) {
    that = this;
    const ENABLE = e.detail.value;
    if (ENABLE == false) {
      wx.showModal({
        title: '确认关闭广告',
        content: '由于服务器开销压力，关闭广告后将同时关闭附加功能。',
        confirmText: '关闭功能',
        success: function (res) {
          if (res.confirm) {
            updataConfig('enable', ENABLE);
          } else {
            updataConfig('enable', true);
          }
        }
      })
    } else {
      updataConfig('enable', ENABLE);
    }
  },

  /**
   * switchConfig
   */
  switchConfig: function (e) {
    that = this;
    const KEY = e.currentTarget.dataset.key;
    const ENABLE = e.detail.value;
    if (that.data.adFunctionConfig.enable == false) {
      wx.showModal({
        title: '未显示广告',
        content: '由于服务器开销压力，必须先显示广告才可以开启功能。',
        confirmText: '显示广告',
        cancelText: '关闭',
        success: function (e) {
          if (e.confirm) {
            updataConfig('enable', true, false);
            updataConfig(KEY, ENABLE);
          } else {
            updataConfig('enable', false);
          }
        }
      })
    } else {
      updataConfig(KEY, ENABLE);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const source = options.source;
    console.log('广告开关界面入口:',source);
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
    this.setData({
      adFunctionConfig: app.AdFunctionConfig,
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

/**
 * 更新配置
 */
function updataConfig(key, enable, isUpdata = true) {
  app.AdFunctionConfig[key] = enable;
  app.SetAdFunctionConfig();
  if (isUpdata) {
    that.setData({
      adFunctionConfig: app.AdFunctionConfig,
    });
  }
}
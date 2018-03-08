var that = this;
var user = {};
var autoCopyString = {};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    enable: false,
    strData: "",
    autoGetData: true,
    isAdmin: false,
  },

  /**
   * switchEnable
   */
  switchEnable: function (e) {
    that = this;
    autoCopyString.enable = e.detail.value;
    setCopyData();
  },

  /**
   * switchAutoGet
   */
  switchAutoGet: function (e) {
    that = this;
    autoCopyString.autoGetData = e.detail.value;
    setCopyData();
  },

  /**
   * submitData
   */
  submitData: function (e) {
    that = this;
    autoCopyString.strData = e.detail.value;
    setCopyData();
  },

  /**
   * 上传文本内容（管理员功能）
   */
  updataString: function (e) {
    console.log("上传文本内容（管理员功能）", e);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    user = wx.getStorageSync('user');
    autoCopyString = wx.getStorageSync('autoCopyString') || that.data;
    autoCopyString.isAdmin = (user.uid == getApp().AdminUid) ? true : false;
    that.setData(autoCopyString);
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
 * 设置复制数据
 */
function setCopyData() {
  that.setData(autoCopyString);
  wx.setStorage({
    key: 'autoCopyString',
    data: autoCopyString,
  });
}
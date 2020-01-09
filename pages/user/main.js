// pages/user/main.js
var that = this;
var TopList = {
  name: ['最近7天', '最近30天', '最近60天', '最近90天', '最近180天', '最近一年', '历年', '今天', '本月', '今年', '昨天', '上月', '去年'],
  id:['Recent7Day', 'Recent30Day', 'Recent60Day', 'Recent90Day', 'Recent180Day', 'Recent365Day', 'Sum', 'Today', 'Month', 'Year','LastToday', 'LastMonth', 'LastYear'],
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    TopListIndex: 0,
    TopList: {},
  },

  /**
   * 顶部列表改变
   */
  bindTopList: function (e) {
    const index = parseInt(e.detail.value);
    console.log('顶部列表变更为：', this.data.TopList.name[index], this.data.TopList.id[index]);
  },

  /**
   * 返回按钮
   */
  bindBack: function (e) {
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
    InitShow();
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
 * 初始化显示
 */
function InitShow() {
  var topList = {name:[], id:[]};
  for (let index = 0; index < TopList.name.length; index++) {
    topList.name[index] = TopList.name[index] + "收支";
    topList.id[index] = TopList.id[index];
  }
  that.setData({
    TopListIndex: 1,
    TopList: topList,
  });
}
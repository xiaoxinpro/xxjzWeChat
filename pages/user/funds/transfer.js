// pages/user/funds/transfer.js
var that;
var Base64 = require('../../../utils/base64.js')
var util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    FundsIndexOut: 0,
    FundsIndexIn: 0,
    FundsList: {name:[], value:[]},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    initForm(true);
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

/** 初始化表单 */
function initForm(isReload = true) {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var txtNow = "" + year + "年" + month + "月" + day + "日";
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  var strNow = "" + year + "-" + month + "-" + day;

  var FundsList = getFunds();
  var FundsIndexOut = that.data.FundsIndexOut;
  var FundsIndexIn = that.data.FundsIndexIn;

  that.setData({
    adFunctionConfig: getApp().AdFunctionConfig,
    FundsList: FundsList,
    FundsIndexOut: FundsIndexOut,
    FundsIndexIn: FundsIndexIn,
    // moneyFocus: true,
  });
}

/** 获取资金账户 */
function getFunds() {
  var FundsObj = wx.getStorageSync('Funds');
  var FundsList = {value: [], name: []};
  for(var i in FundsObj) {
    if (FundsObj[i]) {
      FundsList.value.push(parseInt(FundsObj[i].id));
      FundsList.name.push(FundsObj[i].name);
    }
  }
  console.log('加载资金账户数据:', FundsList);
  return FundsList;
}
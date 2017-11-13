// more.js
var varYear = 0;
var varMonth = 0;
var varDay = 0;
var varType = 'day';
var varOldUrl = '';

let date = new Date()
let maxYearNum = 2108;
let minYearNum = 2000;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    years: [],
    year: 0,
    months: [],
    month: 0,
    days: [],
    day: 0,
    value: [9999, 1, 1],
  },

  bindChange: function (e) {
    const val = e.detail.value;
    varYear = this.data.years[val[0]];
    varMonth = this.data.months[val[1]];
    varDay = this.data.days[val[2]];

    var Dates = initDateArr(varYear, varMonth);

    this.setData({
      years: Dates[0],
      months: Dates[1],
      days: Dates[2],
      year: varYear,
      month: varMonth,
      day: varDay
    });
  },

  submit: function () {
    wx.redirectTo({
      url: './day?year=' + varYear + '&month=' + varMonth + '&day=' + varDay,
    })
  },

  goBack: function () {
    console.log(varOldUrl);
    wx.redirectTo({
      url: varOldUrl
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("加载更多日期账单页面", options);
    varYear = parseInt(options.year);
    varMonth = parseInt(options.month);
    varDay = parseInt(options.day);
    varOldUrl = './day?year=' + varYear + '&month=' + varMonth + '&day=' + varDay;
    var Dates = initDateArr(varYear, varMonth);
    if (Dates == null) {
      wx.showToast({
        title: '页面参数出错',
      });
      setTimeout(function(){
        wx.navigateBack({
          delta: 1
        });
      },1000);
    }

    this.setData({
      years: Dates[0],
      months: Dates[1],
      days: Dates[2],
    });
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
      year: varYear,
      month: varMonth,
      day: varDay,
      value: [varYear - 2000, varMonth - 1, varDay - 1],
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

function initDateArr(year, month) {
  var maxDayNum = 31;
  var maxMonthNum = 12;
  var Years = [];
  var Months = [];
  var Days = [];

  if (!((parseInt(year) > 0) && (parseInt(month) > 0))) {
    return null;
  }
  
  if (parseInt(month) == 2){
    if (((year % 4) == 0) && ((year % 100) != 0) || ((year % 400) == 0)) {
      maxDayNum = 29;
    } else {
      maxDayNum = 28;
    }
  } else if (Array(4, 6, 9, 11).indexOf(parseInt(month))>=0){
    maxDayNum = 30;
  } else{
    maxDayNum = 31;
  }

  for (var i = minYearNum; i <= maxYearNum; i++) {
    Years.push(i);
  }

  for (var i = 1; i <= maxMonthNum; i++) {
    Months.push(i);
  }

  for (var i = 1; i <= maxDayNum; i++) {
    Days.push(i);
  }

  return Array(Years, Months, Days);
}

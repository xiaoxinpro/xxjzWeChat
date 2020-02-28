// all.js
var that;
var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')
var isLoading = false;
var varYear = 0;
var varMonth = 0;
var varDay = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    year: 0,
    inMoney: 0.00,
    outMoney: 0.00,
    overMoney: 0.00,
    inMoneyList: [],
    outMoneyList: [],
    overMoneyList: [],
    isLoadMore: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("加载历年账单页面", options);
    that = this;
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
    //初始化页面
    initData();
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
    initData();
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

//** 初始化页面 */
function initData() {
  //设置页面标题
  wx.setNavigationBarTitle({ title: '历年账单' });

  //初始化数据
  that.setData({
    inMoney: 0.00,
    outMoney: 0.00,
    overMoney: 0.00,
    inMoneyList: [],
    outMoneyList: [],
    overMoneyList: [],
    isLoadMore: true,
  });

  //获取列表数据
  getListData(function () {
    wx.stopPullDownRefresh();
  });
}

/** 获取指定页数据 */
function getListData(callback) {
  //整理Api参数
  var jsonData = {};
  jsonData.type = 'get_all_year';
  jsonData.data = Base64.encoder(JSON.stringify({
    uid: wx.getStorageSync('user').uid
  }));

  //获取网络数据
  getData(jsonData, function (ret) {
    if (ret) {
      if (ret.uid) {
        var ListData = ret.data;
        that.setData({
          inMoney: getApp().ValueToMoney(ListData.InSumMoney),
          outMoney: getApp().ValueToMoney(ListData.OutSumMoney),
          overMoney: getApp().ValueToMoney(ListData.InSumMoney - ListData.OutSumMoney),
          inMoneyList: getApp().ValueToMoney(ListData.InMoney),
          outMoneyList: getApp().ValueToMoney(ListData.OutMoney),
          overMoneyList: getApp().ValueToMoney(ListData.SurplusMoney),
          isLoadMore: false,
        });
        if (callback) {
          callback();
        }
      } else {
        wx.showToast({
          title: '未登录',
        });
      }
    }
  });
}

/** 获取网络数据 */
function getData(jsonData, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  wx.request({
    url: getApp().URL + '/index.php?s=/Home/Api/account',
    method: 'GET',
    data: jsonData,
    header: header,
    success: function (res) {
      console.log('获取账单数据：', res);
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
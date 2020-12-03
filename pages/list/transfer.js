// pages/list/transfer.js
var that;
var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')
var varPage = 1;
var varPageMax = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 返回按钮
   */
  bindBack: function () {
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //设置页面标题
    // wx.setNavigationBarTitle({ title: '转账明细' });
    console.log("加载转账明细页面：", options);
    that = this;
    if (this.getOpenerEventChannel) {
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on('EventTransferChange', (res) => {
        console.log(res.data)
        initList();
      });
      initList();
    }
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
    if (this.getOpenerEventChannel) {
      //通过事件刷新列表
    } else {
      initList();
    }
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
    that = this;
    initList();
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

/** 初始列表数据 */
function initList(callback) {
    //初始化数据
    varPage = 1;
    varPageMax = 1;
    that.setData({
      arrList: [],
      isLoadMore: true,
      isAddData: false,
    });
    wx.showLoading({
      title: '加载中',
      success: function(){
        //获取列表数据
        getTransferListData(varPage, function (ListData) {
          if (Array.isArray(ListData) && ListData.length > 0) {
            that.setData({
              arrList: ListData,
              isLoadMore: false,
              isAddData: true,
            });
          }
          setTimeout(() => {
            wx.hideLoading();
          }, 300);
          if (callback) {
            callback();
          }
        });
      }
    });
}

/** 获取列表数据 */
function getTransferListData(p, callback) {
  //整理Api参数
  var jsonData = {};
  jsonData.type = 'get';
  jsonData.data = Base64.encoder(JSON.stringify({
    page: p
  }));

  //获取网络数据
  getData(jsonData, function (ret) {
    if (ret && ret.hasOwnProperty('uid') && ret.uid > 0) {
      var ListData = ret.data;
      console.log("获取转账数据完成", ListData);
      varPage = ListData.page;
      varPageMax = ListData.pagemax;
      callback(ListData.data)
    } else {
      wx.showToast({
        title: '未登录',
      });
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
    url: getApp().Config.URL + '/index.php?s=/Home/Api/transfer',
    method: 'GET',
    data: jsonData,
    header: header,
    success: function (res) {
      console.log('获取转账数据：', res);
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

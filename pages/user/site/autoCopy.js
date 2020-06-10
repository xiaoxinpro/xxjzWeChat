var that = this;
var user = {};
var autoCopyString = {};
var enableWeb = false;
var enableWebPullDown = false;
var strWebData = "";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    enable: false,
    enablePullDown: false,
    strData: "",
    autoGetData: true,
    isAdmin: false,
    enableWeb: false,
    enableWebPullDown: false,
    strWebData: "",
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
   * switchEnablePullDown
   */
  switchEnablePullDown: function (e) {
    that = this;
    autoCopyString.enablePullDown = e.detail.value;
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
   * switchWebEnable（管理员功能）
   */
  switchWebEnable: function (e) {
    enableWeb = e.detail.value;
    console.log(enableWeb);
  },

  /**
   * switchWebEnablePullDown（管理员功能）
   */
  switchWebEnablePullDown: function (e) {
    enableWebPullDown = e.detail.value;
  },

  /**
   * submitWebData（管理员功能）
   */
  submitWebData: function(e) {
    strWebData = e.detail.value;
  },

  /**
   * 获取服务器文本内容（管理员功能）
   */
  getString: function(e) {
    that = this;
    wx.showLoading({
      title: '获取中',
      success: function(){
        getApp().GetAutoCopyData(function (res) {
          wx.hideLoading();
          enableWeb = res.enable ? res.enable : false;
          enableWebPullDown = res.enablePullDown ? res.enablePullDown : false;
          strWebData = res.strData;
          that.setData({
            enableWeb: enableWeb,
            enableWebPullDown: enableWebPullDown,
            strWebData: strWebData
          });
        });
      }
    })
  },

  /**
   * 上传文本内容（管理员功能）
   */
  updataString: function (e) {
    var webData = {
      enable: enableWeb,
      enablePullDown: enableWebPullDown,
      data: strWebData
    }
    console.log("上传文本内容（管理员功能）", webData);
    updataAutoCopyData(webData, function (res) {
      console.log(res);
      if (res.strData == strWebData) {
        wx.showToast({title: '上传完成'});
      } else {
        wx.showModal({
          title: '上传失败',
          content: res.strData,
          showCancel: false,
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    user = wx.getStorageSync('user');
    autoCopyString = wx.getStorageSync('autoCopyString') || that.data;
    autoCopyString.isAdmin = (user.uid == getApp().Config.AdminUid) ? true : false;
    that.setData(autoCopyString);
    console.log('获取页面数据：', autoCopyString);
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

/** 
 * 更新自动复制数据(文本数据, 回调函数) 
 */
function updataAutoCopyData(webData, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  webData.type = 'updata';
  wx.request({
    url: getApp().Config.URL + '/index.php?s=/Home/Api/autocopy',
    method: 'POST',
    data: webData,
    header: header,
    success: function (res) {
      console.log('更新自动复制文本：', res);
      if (res.hasOwnProperty('data')) {
        let ret = res['data'];
        callback(ret);
      } else {
        callback({strData:'访问服务器失败。'});
      }
    }
  });
}
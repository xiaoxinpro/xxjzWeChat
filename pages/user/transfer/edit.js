// pages/user/transfer/edit.js
var that;
var Base64 = require('../../../utils/base64.js')
var util = require('../../../utils/util.js')
var varId;
var varTransfer;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    textTopTips: "错误提示",

    money: "",

    mark: "",

    date: "",
    dateStr: "",
  },

  /**
   * 资金账户改变事件
   */
  bindFundsChange: function(e) {
    const type = e.currentTarget.dataset.type;
    const index = e.detail.value;
    let FundsIndex = {};
    if (type === 'out') {
      FundsIndex['FundsOutIndex'] = index;
    }
    if (type === 'in') {
      FundsIndex['FundsInIndex'] = index;
    }
    this.setData(FundsIndex);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;

    //加载页面数据
    varId = parseInt(options.id);

    //验证页面数据
    if (isNaN(varId) || varId == 0) {
      console.log("加载页面数据错误: id=", varId);
      wx.showModal({
        title: '加载页面错误',
        content: '页面传输的数据有误，无法初始化页面，请返回。',
        showCancel: false,
        confirmText: "返回",
        success: function() {
          wx.navigateBack({
            delta: 1
          });
        }
      });
    }
  },

  /**
   * 日期改变事件
   */
  bindDateChange: function(e) {
    var date = new Date(e.detail.value);
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    this.setData({
      date: e.detail.value,
      dateStr: "" + year + "年" + month + "月" + day + "日"
    })
  },

  /**
   * 返回按钮
   */
  bindBack: function() {
    getApp().listUpdata.isUpdata = false;
    wx.navigateBack({
      delta: 1
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
    //获取页面数据
    wx.showLoading({
      title: '加载中',
      success: function() {
        var jsonData = {};
        jsonData.type = 'get_id';
        jsonData.data = Base64.encoder(JSON.stringify({
          tid: varId,
          jiid: wx.getStorageSync('user').uid
        }));
        getIdData(jsonData, function (ret) {
          //初始化表单
          ret = ret['data'];
          if (ret.hasOwnProperty('ret') && ret['ret']) {
            varTransfer = ret['msg'];
            initForm(varTransfer);
          } else if(ret.hasOwnProperty('msg')) {
            wx.showModal({
              showCancel: false,
              confirmText: "返回",
              title: "获取转账记录失败",
              content: ret['msg'],
              success: function() {
                wx.navigateBack();
              }
            })
          } else {
            wx.navigateBack();
          }
          wx.hideLoading();
        });
      }
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

function initForm(objData) {
  let FundsList = getFunds();
  that.setData({
    FundsList: FundsList,
    FundsInIndex: getFundsIndex(FundsList, objData.target_fid),
    FundsOutIndex: getFundsIndex(FundsList, objData.source_fid),
    money: objData.money,
    mark: objData.mark,
    date: objData.time,
    dateStr: util.intTimeFormat(objData.time, 'yyyy年m月d日'),
  });
}

/** 获取资金账户 */
function getFunds() {
  var FundsObj = wx.getStorageSync('Funds');
  var FundsList = {
    value: [],
    name: []
  };
  for (var i in FundsObj) {
    if (FundsObj[i]) {
      FundsList.value.push(parseInt(FundsObj[i].id));
      FundsList.name.push(FundsObj[i].name);
    }
  }
  return FundsList;
}

/** 获取资金账户索引 */
function getFundsIndex(FundsList, FundsId) {
  for (let index = 0; index < FundsList.value.length; index++) {
    if (FundsList.value[index] == parseInt(FundsId)) {
      return index;
    }
  }
  return null;
}

/** 获取网络数据 */
function getIdData(jsonData, callback) {
  var session_id = wx.getStorageSync('PHPSESSID'); //本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = {
      'content-type': 'application/x-www-form-urlencoded',
      'Cookie': 'PHPSESSID=' + session_id
    }
  } else {
    var header = {
      'content-type': 'application/x-www-form-urlencoded'
    }
  }
  wx.request({
    url: getApp().Config.URL + '/index.php?s=/Home/Api/transfer',
    method: 'GET',
    data: jsonData,
    header: header,
    success: function(res) {
      console.log('获取转账id数据：', res);
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
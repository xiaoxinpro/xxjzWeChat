// pages/user/funds.js
var that = this;
var uid = 0;

var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 返回按钮
   */
  bindBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 提交添加资金账户事件
   */
  submit_funds: function(res) {
    that = this;
    console.log(res.detail.value);
    cmdAddFunds(res.detail.value.funds_name);
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
    initData(function(data) {});
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
    that = this;
    initData(function(data) {});
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

/** 
 * 错误提示 
 */
function showTopTips(text) {
  that.setData({
    showTopTips: true,
    textTopTips: text
  });
  setTimeout(function() {
    that.setData({
      showTopTips: false,
      textTopTips: ""
    });
  }, 3000);
}

/** 
 * 校验名称 
 */
function checkFundsName(FundsName) {
  var pattern = /[A-Za-z0-9_\-\u4e00-\u9fa5]+/;
  return pattern.test(FundsName);
}

/**
 * 资金账户数据处理
 */
function fundsDataProcess(fundsList) {
  var fundsJson = Array();
  var key = 0;
  for (var i in fundsList) {
    if (fundsList[i]) {
      let money = { in: fundsList[i].money.in.toFixed(2),
        out: fundsList[i].money.out.toFixed(2),
        over: fundsList[i].money.over.toFixed(2),
        count: fundsList[i].money.count
      }
      fundsJson.push({
        key: key++,
        id: parseInt(fundsList[i].id),
        name: fundsList[i].name,
        money: money
      });
    }
  }
  return fundsJson;
}

/** 添加资金账户命令 */
function cmdAddFunds(FundsName) {
  if (!checkFundsName(FundsName)) {
    showTopTips('资金账户名称格式错误，请重新输入。')
    return;
  }
  var addData = {
    fundsname: FundsName,
    uid: uid
  };
  var strData = Base64.encoder(JSON.stringify(addData));
  //发送数据
  wx.showLoading({
    title: '添加资金账户中',
    success: function() {
      sendFundsData(strData, 'add', function(ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //添加资金账户成功
            wx.showToast({
              title: '添加成功',
            });
            console.log('添加数据完成：', ret);
            //更新资金账户数据
            initData(function() {
              // that.setData({
              //   FundsList: data,
              // })
            });
          } else {
            //添加资金账户失败
            wx.showModal({
              title: '添加失败',
              content: ret.data[1] ? ret.data[1] : '未知错误？',
              showCancel: false
            })
          }
        } else {
          //未登陆
          getApp().Logout(function(path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
}

/** 初始化函数 */
function initData(callback) {
  if (!callback) {
    return wx.getStorageSync('Funds')
  } else {
    getFundsData(function(data) {
      that.setData({
        FundsList: fundsDataProcess(data)
      });
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

/** 
 * 发送分类数据(data数组, 回调函数) 
 */
function sendFundsData(data, type, callback) {
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
    url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/funds',
    method: 'POST',
    data: {
      type: type,
      data: data
    },
    header: header,
    success: function(res) {
      console.log('发送分类POST：', res);
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
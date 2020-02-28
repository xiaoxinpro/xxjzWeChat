// pages/user/funds/edit.js
var that = this;
var uid = 0;
var FundsId = 0;

var Base64 = require('../../../utils/base64.js')
var util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectFundsId: 0,
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
   * 资金账户选择列表
   */
  bindFundsChange: function(res) {
    this.setData({
      selectFundsId: res.detail.value
    });
  },

  /**
   * 资金账户编辑事件
   */
  submit_edit: function(res) {
    that = this;
    cmdEditFunds(res.detail.value.funds_name);
  },

  /**
   * 资金账户删除事件
   */
  submit_delete: function(res) {
    that = this;
    wx.showModal({
      title: '确认转移并删除',
      content: '请仔细核对删除与转移的资金账户，确认后不可恢复！',
      confirmText: '确认',
      confirmColor: '#e51c23',
      success(ret) {
        if (ret.confirm) {
          cmdDeleteFunds(that.data.FundsList.id[res.detail.value.funds_id])
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    uid = wx.getStorageSync('user').uid;
    FundsId = options.id;
    if (!FundsId || FundsId < 1) {
      wx.showModal({
        title: '无法编辑',
        content: '抱歉，默认资金账户不可编辑！',
        showCancel: false,
        confirmText: '返回',
        success: function() {
          wx.navigateBack({});
        }
      })
    } else {
      var FundsData;
      var FundsArr = wx.getStorageSync('Funds');
      var FundsList = {
        id: [],
        name: []
      };
      for (var i in FundsArr) {
        if (FundsArr[i].id == FundsId) {
          FundsData = FundsArr[i];
        } else {
          FundsList.id.push(FundsArr[i].id);
          FundsList.name.push(FundsArr[i].name);
        }
      }
      if (FundsData) {
        that.setData({
          FundsCount: parseInt(FundsData.money.count),
          FundsName: FundsData.name,
          FundsList: FundsList
        });
      } else {
        wx.showModal({
          title: '无法编辑',
          content: '抱歉，未找到可编辑的资金账户！',
          showCancel: false,
          confirmText: '返回',
          success: function () {
            wx.navigateBack({});
          }
        })
      }
    }
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
 * 资金账户数据处理
 */
function fundsDataProcess(fundsList, delId = -1) {
  var fundsJson = Array();
  var key = 0;
  for (var i in fundsList) {
    if (fundsList[i] && fundsList[i].id != delId) {
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
 * 编辑资金账户命令
 */
function cmdEditFunds(FundsName) {
  if (!checkFundsName(FundsName)) {
    showTopTips('资金账户名称格式错误，请重新输入。')
    return;
  }
  var editData = {
    fundsid: FundsId,
    fundsname: FundsName,
    uid: uid
  };
  var strData = Base64.encoder(JSON.stringify(editData));
  //发送数据
  wx.showLoading({
    title: '提交中',
    success: function() {
      sendFundsData(strData, 'edit', function(ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //修改资金账户成功
            wx.showToast({
              title: '修改成功',
            });
            console.log('修改数据完成：', ret);
            //返回
            wx.navigateBack({});
          } else {
            //修改资金账户失败
            wx.showModal({
              title: '修改失败',
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

/**
 * 删除资金账户命令
 */
function cmdDeleteFunds(newFundsId) {
  var deleteData = {
    fundsid_old: FundsId,
    fundsid_new: newFundsId,
    uid: uid
  };
  var strData = Base64.encoder(JSON.stringify(deleteData));
  //发送数据
  wx.showLoading({
    title: '删除中',
    success: function() {
      sendFundsData(strData, 'del', function(ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //删除资金账户成功
            wx.showToast({
              title: '删除成功',
            });
            console.log('删除数据完成：', ret);
            //返回
            wx.navigateBack({});
          } else {
            //删除资金账户失败
            wx.showModal({
              title: '删除失败',
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
    url: getApp().URL + '/index.php?s=/Home/Api/funds',
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
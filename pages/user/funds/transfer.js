// pages/user/funds/transfer.js
var that;
var Base64 = require('../../../utils/base64.js')
var util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    FundsIndexOut: false,
    FundsIndexIn: false,
    FundsList: {name:[], value:[]},
  },

  /**
   * 金额输入事件
   */
  bingMoneyInput: function(e) {
    // inputMoney = e.detail.value;
  },

  /**
   * 清除文本按钮事件
   */
  bindResiteInput: function (event) {
    var value = event.currentTarget.dataset.value;
    var obj = {};
    if (value) {
      obj[value] = "";
      this.setData(obj);
    }
    console.log(event, value, obj);
  },

  /**
   * 账户控件改变事件
   */
  bindFundsChange: function (res) {
    that = this;
    // console.log(res);
    const funds = res.currentTarget.dataset.funds;
    let value = parseInt(res.detail.value);
    if (value === that.data.FundsIndexOut || value === that.data.FundsIndexIn) {
      showTopTips("账户错误：转入与转出账户不能相同！");
      value = false;
    }
    if (funds == 'out') {
      that.setData({FundsIndexOut: value});
    }
    if (funds == 'in') {
      that.setData({FundsIndexIn: value});
    }
  },

  /**
   * 日期改变事件
   */
  bindDateChange: function (e) {
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
   * 转账按钮
   */
  submit: function(e) {
    that = this;
    var DataObj = e.detail.value;

    if (DataObj.add_funds_out === false || DataObj.add_funds_in === false) {
      showTopTips("请务必选择转入转出账户，若没有账户请先新建账户！");
      return false;
    }

    //整理发送内容
    var TransferData = {};
    TransferData.money = parseFloat(DataObj.add_money);
    TransferData.mark = DataObj.add_mark;
    TransferData.source_fid = parseInt(that.data.FundsList.value[DataObj.add_funds_out]);
    TransferData.target_fid = parseInt(that.data.FundsList.value[DataObj.add_funds_in]);
    TransferData.time = DataObj.add_time;

    //校验发送数据
    if (!checkTransferData(TransferData)) {
      return;
    }

    //发送数据加密
    console.log(JSON.stringify(TransferData));
    var strData = Base64.encoder(JSON.stringify(TransferData));
    console.log(strData);

    //发送数据
    wx.showLoading({
      title: '记账中',
      success: function () {
        sendTransferData(strData, function(ret){
          wx.hideLoading();
          if (ret && ret.uid) {
            if (ret.data.ret) {
              //显示转账完成提示框
              wx.showToast({
                title: '转账完成',
              });
              //延时页面跳转
              initForm();
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                });
              }, 500);
            } else {
              //转账失败
              wx.showModal({
                title: '转账失败',
                content: ret.data.msg,
                showCancel: false
              });
            }
          } else {
            initForm();
            wx.showToast({
              title: '未登录',
            });
          }
        });
      }
    });

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

/** 错误提示 */
function showTopTips(text) {
  //var that = this;
  that.setData({
    showTopTips: true,
    textTopTips: text
  });
  setTimeout(function () {
    that.setData({
      showTopTips: false,
      textTopTips: ""
    });
  }, 3000);
}

/** 初始化表单 */
function initForm(isReload = true) {
  var FundsList = getFunds();
  var FundsIndexOut = that.data.FundsIndexOut;
  var FundsIndexIn = that.data.FundsIndexIn;

  that.setData({
    date: getNowDate(),
    dateStr: getNowDate('china'),
    adFunctionConfig: getApp().AdFunctionConfig,
    FundsList: FundsList,
    FundsIndexOut: FundsIndexOut,
    FundsIndexIn: FundsIndexIn,
    moneyFocus: true,
  });
}

/** 获取今日日期 */
function getNowDate(format='') {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  if (format == 'china') {
    return "" + year + "年" + month + "月" + day + "日";
  }
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }
  return "" + year + "-" + month + "-" + day;
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

/** 转账表单数据验证 */
function checkTransferData(data) {
  if (!util.cheakMoney(data['money'])) {
    showTopTips("请输入一个有效的金额!");
    return false;
  }

  if (!util.cheakFunds(data['source_fid'])) {
    showTopTips("请务必选择一个转出账户，若没有账户请先新建账户！");
    return false;
  }

  if (!util.cheakFunds(data['target_fid'])) {
    showTopTips("请务必选择一个转入账户，若没有账户请先新建账户！");
    return false;
  }

  if (!util.cheakMark(data['mark'])) {
    showTopTips("备注信息不能为空!");
    return false;
  }

  if (!util.cheakTime(data['time'])) {
    showTopTips("时间格式有误，请重新输入!");
    return false;
  }

  return true;
}

/** 发送记账数据(data数组, 回调函数) */
function sendTransferData(data, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  wx.request({
    url: getApp().Config.URL + '/index.php?s=/Home/Api/transfer',
    method: 'POST',
    data: { type: 'add', data: data },
    header: header,
    success: function (res) {
      console.log('发送转账POST：', res);
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

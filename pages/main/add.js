// add.js

var _that;
var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    textTopTips: "错误提示",

    typeName: "类型",
    typeValue: "支出",
    typeItems: [
      { name: '支出', value: '2', checked: true },
      { name: '收入', value: '1' }
    ],

    money: "",

    isHiddenFunds: true,

    ClassIndex: 0,
    ClassList: { value: [], name: [] },

    mark: "",

    date: "",
    dateStr: "",
  },

  /**
   * 收支选择事件
   */
  typeChange: function (e) {
    var typeValue = "";
    var typeItems = this.data.typeItems;
    for (var i in typeItems) {
      typeItems[i].checked = typeItems[i].value == e.detail.value;
      if (typeItems[i].checked) {
        typeValue = typeItems[i].name;
      }
    }
    var FundsList = getFunds();
    this.setData({
      typeItems: typeItems,
      typeValue: typeValue,
      ClassIndex: 0,
      ClassList: getClass(typeValue),
      FundsIndex: 0,
      FundsList: FundsList,
      isHiddenFunds: (FundsList.name.length <= 1),
    });

  },

  /**
   * 资金账户改变事件
   */
  bindFundsChange: function (e) {
    this.setData({
      FundsIndex: e.detail.value
    })
  },

  /**
   * 分类改变事件
   */
  bindClassChange: function (e) {
    this.setData({
      ClassIndex: e.detail.value
    })
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
   * 提交表单
   */
  submit: function (e) {
    _that = this;

    //获取表单并转换数据
    var DataObj = e.detail.value;
    DataObj['add_fundsname'] = _that.data.FundsList.name[DataObj['add_funds']];
    DataObj['add_funds'] = _that.data.FundsList.value[DataObj['add_funds']];
    DataObj['add_classname'] = _that.data.ClassList.name[DataObj['add_class']];
    DataObj['add_class'] = _that.data.ClassList.value[DataObj['add_class']];
    DataObj['add_typename'] = _that.data.typeValue;
    if (_that.data.typeValue == '收入') {
      DataObj['add_type'] = 1;
    } else if (_that.data.typeValue == '支出') {
      DataObj['add_type'] = 2;
    } else {
      DataObj['add_type'] = 0;
    }

    //上报事件表单
    wx.reportAnalytics('xxjz_main_add', DataObj);

    //整理发送内容
    var AddData = {};
    AddData.acmoney = DataObj['add_money'];
    AddData.fid = DataObj['add_funds'];
    AddData.acclassid = DataObj['add_class'];
    AddData.actime = DataObj['add_time'];
    AddData.acremark = DataObj['add_mark'];
    AddData.zhifu = DataObj['add_type'];
    console.log('表单处理后结果：', AddData);

    //校验发送数据
    if (!cheakAddData(AddData)) {
      return;
    }

    //发送数据加密
    console.log(JSON.stringify(AddData));
    var strData = Base64.encoder(JSON.stringify(AddData));

    //发送数据
    wx.showLoading({
      title: '记账中',
      success: function () {
        sendAddData(strData, function (ret) {
          wx.hideLoading();
          if (ret) {
            if (ret.uid) {
              if (ret.data.ret) {
                //显示记账完成提示框
                wx.showToast({
                  title: '记账完成',
                });
                //延时页面跳转
                setTimeout(function () {
                  initForm(_that);
                  wx.switchTab({ url: 'main' });
                }, 500);
              } else {
                //记账失败
                wx.showModal({
                  title: '记账失败',
                  content: ret.data.msg,
                  showCancel: false
                })
              }
            } else {
              initForm(_that);
              wx.showToast({
                title: '未登录',
              });
            }
          }
        });
      }
    });
  },

  /**
   * 返回主页
   */
  gotoMain: function () {
    wx.switchTab({ url: 'main' });
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
    initForm(this);
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
function initForm(that) {
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

  var ClassList;
  if (that.data.typeValue == "收入") {
    ClassList = getClass('收入');
  } else { //支出 
    ClassList = getClass('支出');
  }

  var FundsList = getFunds();

  that.setData({
    money: "",
    mark: "",
    date: strNow,
    dateStr: txtNow,
    ClassIndex: 0,
    ClassList: ClassList,
    FundsIndex: 0,
    FundsList: FundsList,
    isHiddenFunds: (FundsList.name.length <= 1),
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

/** 获取分类(收支类别) */
function getClass(type) {
  if (type == '收入') {
    var ClassObj = wx.getStorageSync('inClass');
  } else {
    var ClassObj = wx.getStorageSync('outClass');
  }
  var ClassList = { value: [], name: [] };
  for (var i in ClassObj) {
    ClassList.value.push(parseInt(i));
    ClassList.name.push(ClassObj[i]);
  }
  console.log('加载分类数据:', ClassList);
  if (!ClassObj) {
    wx.showModal({
      title: '未添加' + type + '分类',
      content: '请先添加' + type + '分类！',
      confirmText: '添加分类',
      cancelText: '稍后提醒',
      success: function (res) {
        if (res.confirm) {
          //进入到分类添加页面
          wx.navigateTo({ url: ('../user/class?type=' + (type == '收入' ? '1' : '0'))});
        }
      }
    })
  }
  return ClassList;
}

// /** 校验输入金额 */
// function cheakMoney(value) {
//   var pat = RegExp("([1-9]\d*(\.\d{1,2})?|0\.((\d?[1-9])|([1-9]0?)))");
//   return pat.test(value);
// }

// /** 校验分类 */
// function cheakClass(value) {
//   return (Number(value) > 0);
// }

// /** 校验输入备注 */
// function cheakMark(value) {
//   var mark = value.trim();
//   return (mark.length > 0);
// }

// /** 校验输入时间 */
// function cheakTime(value) {
//   var cheak = /(\d+\D\d+\D\d+)/.test(value);
//   return cheak;
// }


/** 错误提示 */
function showTopTips(text) {
  //var that = this;
  _that.setData({
    showTopTips: true,
    textTopTips: text
  });
  setTimeout(function () {
    _that.setData({
      showTopTips: false,
      textTopTips: ""
    });
  }, 3000);
}

/** 校验记账数据 */
function cheakAddData(data) {
  if (!util.cheakMoney(data['acmoney'])) {
    showTopTips("请输入一个有效的金额!");
    return false;
  }

  if (!util.cheakClass(data['acclassid'])) {
    showTopTips("请务必选择一个有效分类，若没有分类请先新建分类！");
    return false;
  }

  if (!util.cheakMark(data['acremark'])) {
    showTopTips("备注信息不能为空!");
    return false;
  }

  if (!util.cheakTime(data['actime'])) {
    showTopTips("时间格式有误，请重新输入!");
    return false;
  }

  return true;
}

/** 发送记账数据(data数组, 回调函数) */
function sendAddData(data, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  wx.request({
    url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/account',
    method: 'POST',
    data: { type: 'add', data: data },
    header: header,
    success: function (res) {
      console.log('发送记账POST：', res);
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


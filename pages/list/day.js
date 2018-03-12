// day.js
var that;
var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')
var isLoading = false;
var lastListDate = "";
var varYear = 0;
var varMonth = 0;
var varDay = 0;
var varPage = 1;
var varPageMax = 1;
var addMoney = 0.00;
var sumInMoney = 0;
var sumOutMoney = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    srollHeight: 500,
    inMoney: 0.00,
    outMoney: 0.00,
    overMoney: 0.00,
    arrList: [],
    isLoadMore: true,
    isAddData: false,
  },

  /**
   * 更多按钮
   */
  bindLoadMore: function () {

    wx.showActionSheet({
      itemList: [
        varYear + '年度账单', //0
        varMonth + '月份账单', //1
        '更多日账单' //0
      ],
      success: function (res) {
        switch (res.tapIndex) {
          case 0:
            wx.redirectTo({
              url: './year?year=' + varYear,
            })
            break;
          case 1:
            wx.redirectTo({
              url: './month?year=' + varYear + '&month=' + varMonth,
            })
            break;
          case 2:
            wx.redirectTo({
              url: './more?type=day&year=' + varYear + '&month=' + varMonth + '&day=' + varDay,
            })
            break;
          default:
            break;
        }
      },
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("加载月账单页面", options);
    //加载页面数据
    varYear = parseInt(options.year);
    varMonth = parseInt(options.month);
    varDay = parseInt(options.day);
    that = this;

    //验证页面数据
    if (isNaN(varYear) || isNaN(varMonth) || isNaN(varDay)) {
      console.log("加载页面数据错误:", varYear, varMonth, varDay);
      wx.showModal({
        title: '加载页面错误',
        content: '页面传输的数据有误，无法初始化页面，请返回。',
        showCancel: false,
        confirmText: "返回",
        success: function () {
          wx.navigateBack({ delta: 1 });
        }
      })
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

    //设置页面高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          srollHeight: res.windowHeight
        });
      }
    });

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
    if (isLoading || (varPageMax <= varPage)) {
      return;
    }
    isLoading = true;

    //获取下一页数据
    varPage = varPage + 1;
    getListData(varPage, function (ret) {
      isLoading = false;
      //隐藏加载更多按钮
      if (varPageMax == varPage) {
        that.setData({
          isLoadMore: false
        });
      }
    });
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
  wx.setNavigationBarTitle({ title: '日账单' });

  //初始化数据
  varPage = 1;
  varPageMax = 1;
  lastListDate = "";
  that.setData({
    arrList: [],
    isLoadMore: true,
    isAddData: false,
  });

  //获取列表数据
  getListData(varPage, function () {
    wx.stopPullDownRefresh();
  });
}

/** 获取指定页数据 */
function getListData(p, callback) {
  //整理Api参数
  var jsonData = {};
  jsonData.type = 'get';
  jsonData.data = Base64.encoder(JSON.stringify({
    gettype: "day",
    year: varYear,
    month: varMonth,
    day: varDay,
    page: p
  }));

  //获取网络数据
  getData(jsonData, function (ret) {
    if (ret) {
      if (ret.uid) {
        var ListData = ret.data;
        that.setData({
          inMoney: ListData.SumInMoney.toFixed(2),
          outMoney: ListData.SumOutMoney.toFixed(2),
          overMoney: (ListData.SumInMoney - ListData.SumOutMoney).toFixed(2),
        });
        varPage = ListData.page;
        varPageMax = ListData.pagemax;
        JsonToList(ListData.data);
        that.setData({
          isLoadMore: (varPage < varPageMax)
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
    url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/account',
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

/** 网络数据转为网页数组 */
function JsonToList(ListData) {
  var json = [];
  var strDate = "";
  var arrClass = wx.getStorageSync('allClass');
  var key = that.data.arrList.length;

  if (ListData.length <= 0) {
    that.setData({
      isLoadMore: false,
      isAddData: true
    });
    return;
  }

  for (var i = 0; i < ListData.length; i++) {
    strDate = util.strDateFormat(ListData[i].actime, 'yyyy年m月d日 星期w ');

    //添加日期头
    if (lastListDate != ListData[i].actime) {
      //设置上个日期头的合计金额
      var titleIndex = json.length;
      while (titleIndex-- > 0) {
        if (json[titleIndex].isTitle == true) {
          json[titleIndex].overMoney = addMoney.toFixed(2);
          break;
        }
      }
      //初始化日期头
      lastListDate = ListData[i].actime;
      addMoney = 0.00;
      json.push({
        key: key++,
        isTitle: true,
        date: strDate,
        overMoney: 0.00
      });
    }

    //添加账单数据
    var classType = ListData[i].zhifu == "1" ? "收入" : "支出";
    var className = arrClass[ListData[i].acclassid];
    var classIcon = getApp().GetClassIcon(classType, className);
    json.push({
      key: key++,
      isTitle: false,
      id: ListData[i].acid,
      type: classType,
      class: className,
      money: ListData[i].acmoney,
      mark: ListData[i].acremark,
      icon: classIcon,
    });

    //计算合计金额
    if (ListData.zhifu == 1) {
      addMoney += parseFloat(ListData[i].acmoney);
    } else {
      addMoney -= parseFloat(ListData[i].acmoney);
    }
  }

  //从网络获取最后一个日期头的金额
  //整理Api参数
  var jsonData = {};
  jsonData.type = 'get';
  jsonData.data = Base64.encoder(JSON.stringify({
    gettype: "day",
    year: varYear,
    month: varMonth,
    day: util.strDateFormat(ListData[ListData.length - 1].actime, 'd'),
    page: 0
  }));
  getData(jsonData, function (ret) {
    if (ret.uid > 0) {
      var titleIndex = json.length;
      while (titleIndex-- > 0) {
        if (json[titleIndex].isTitle == true) {
          json[titleIndex].overMoney = (ret.data.SumInMoney - ret.data.SumOutMoney).toFixed(2);
          break;
        }
      }
      console.log("新增arrList数据：", json);

      that.setData({
        arrList: that.data.arrList.concat(json)
      });
    }
  });
}
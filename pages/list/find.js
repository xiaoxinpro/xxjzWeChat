// find.js
var that;
var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')

var isLoading = false;
var lastListDate = "";
var varYear = 0;
var varMonth = 0;
var varPage = 1;
var varPageMax = 1;
var addMoney = 0.00;
var sumInMoney = 0;
var sumOutMoney = 0;
var FindData = "";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inMoney: 0.00,
    outMoney: 0.00,
    overMoney: 0.00,
    arrList: [],
    isLoadMore: true,
    isAddData: false,
    isHiddenFunds: true,
  },

  /**
   * 更多按钮
   */
  bindLoadMore: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var strData = options.strData;
    strData = strData.replace(/;/g, '=');
    console.log(strData);
    FindData = JSON.parse(Base64.decoder(strData));
    console.log('搜索结果页面', FindData);
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
    wx.showLoading({
      title: '搜索中',
      success: initData()
    })
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
  wx.setNavigationBarTitle({ title: '搜索账单' });

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
    wx.hideLoading();
  });
}

/** 获取指定页数据 */
function getListData(p, callback) {
  //整理Api参数
  FindData.page = p;
  var jsonData = {};
  jsonData.type = 'find';
  jsonData.data = Base64.encoder(JSON.stringify(FindData));

  //获取网络数据
  getData(jsonData, function (ret) {
    if (ret) {
      if (ret.uid) {
        var ListData = ret.data.msg;
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
  var arrFunds = wx.getStorageSync('Funds');
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
    var className = arrClass[ListData[i].acclassid].name;
    var classIcon = arrClass[ListData[i].acclassid].icon;
    var fundsName = getApp().GetFundsName(ListData[i].fid);
    json.push({
      key: key++,
      isTitle: false,
      id: ListData[i].acid,
      type: classType,
      class: getApp().ShowString(className),
      funds: getApp().ShowString(fundsName),
      money: ListData[i].acmoney,
      mark: getApp().ShowString(ListData[i].acremark),
      icon: classIcon,
    });

    //计算合计金额
    if (ListData[i].zhifu == "1") {
      addMoney += parseFloat(ListData[i].acmoney);
    } else {
      addMoney -= parseFloat(ListData[i].acmoney);
    }
  }

  //从网络获取最后一个日期头的金额
  //整理Api参数
  var findData = {};
  for(var key in FindData) {
    findData[key] = FindData[key];
  }
  findData.starttime = lastListDate;
  findData.endtime = findData.starttime;
  findData.page = 0;
  var jsonData = {};
  jsonData.type = 'find';
  jsonData.data = Base64.encoder(JSON.stringify(findData));
  getData(jsonData, function (ret) {
    if (ret.uid > 0) {
      var titleIndex = json.length;
      while (titleIndex-- > 0) {
        if (json[titleIndex].isTitle == true) {
          var ListData = ret.data.msg;
          json[titleIndex].overMoney = (ListData.SumInMoney - ListData.SumOutMoney).toFixed(2);
          break;
        }
      }
      console.log("新增arrList数据：", json);

      that.setData({
        arrList: that.data.arrList.concat(json),
        isHiddenFunds: (arrFunds.length <= 1),
      });
    }
  });
}
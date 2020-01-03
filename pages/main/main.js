var url;
var uid = 0;
var username;
var that = this;
var app = getApp();
var autoCopyString = {};
Page({
  data: {
    uid: 0,
    uname: "",
    is_haader_recent30day: false,
    header_day: 21,
    header_month: 5,
    header_year: 2017,
    month_in_money: 0.00,
    month_out_money: 0.00,
    month_over_money: 0.00,
    day_in_money: 0.00,
    day_out_money: 0.00,
    year_in_money: 0.00,
    year_out_money: 0.00,
    all_in_money: 0.00,
    all_out_money: 0.00,
    main_tool_config: [],
  },

  btnAdd: function() {
    wx.switchTab({
      url: 'add'
    });
  },

  btnGoToToolSite: function(res) {
    console.log("长按事件：", res.target.dataset.id)
    wx.navigateTo({
      url: '../tool/site?id=' + res.target.dataset.id,
    })
  },

  onPullDownRefresh: function() {
    //下拉复制文本
    if (autoCopyString.enablePullDown) {
      wx.setClipboardData({
        data: autoCopyString.strData
      });
    }

    //重新获取数据
    initData(function(data) {
      updataPageData(data);
      wx.stopPullDownRefresh();
    });
  },

  onLoad: function(option) {
    that = this;
    console.log(option);
    if(option.hasOwnProperty('url')) {
      url = option.url;
    }

    // 获取用户信息
    var user = wx.getStorageSync('user');
    if (user.hasOwnProperty('uid') && user.hasOwnProperty('username')) {
      uid = user.uid;
      username = user.username;
    } else {
      Logout();
    }

    // Demo账号提醒
    if (app.Demo.username == username) {
      wx.showModal({
        title: '体验账号',
        content: '您当前使用的是体验账号，\r\n任何添加的数据均为公开浏览，\r\n建议体验后注册正式账号继续使用。',
        confirmText: '注册',
        confirmColor: '#1aad19',
        cancelText: '继续体验',
        cancelColor: '#888',
        success: function (res) {
          if (res.confirm) {
            Logout();
          }
        }
      })
    }
  },

  onShow: function() {
    // 获取统计数据
    initData(function(data) {
      updataPageData(data);
      if(url && url != 'main') {
        var now = new Date();
        var str = url;
        url = null;
        switch(str) {
          case 'month':
            var month = now.getMonth() == 0 ? 12 : now.getMonth();
            var year = now.getMonth() == 0 ? now.getFullYear() - 1 : now.getFullYear();
            wx.navigateTo({
              url: '../list/month?year=' + year + '&month=' + month,
            });
            break;
          default:
            break;
        }
      }
    });

    // 获取分类数据
    getClassData();

    // 获取资金账户数据
    getFundsData();

    //自动复制文本
    wx.getStorage({
      key: 'autoCopyString',
      success: function(res) {
        autoCopyString = res.data;
        console.log("自动复制文本: ", autoCopyString);
        if (autoCopyString.enable) {
          wx.getClipboardData({
            success(Clipboard) {
              if (Clipboard.data != autoCopyString.strData){
                wx.setClipboardData({
                  data: autoCopyString.strData
                });
              }
            }
          })
        }
        if (autoCopyString.autoGetData) {
          app.GetAutoCopyData(function(res) {
            for (var i in res) {
              autoCopyString[i] = res[i];
            }
            wx.setStorage({
              key: 'autoCopyString',
              data: autoCopyString,
            })
          });
        }
      },
    })
  }
})

/** 初始化页面数据 */
function initData(callback) {
  var valType = "all";
  var tmpData = wx.getStorageSync('mainPageData');
  if (getNowFormatDate() != wx.getStorageSync('getDataTime')) {
    valType = "retime";
    wx.showLoading({
      title: '加载中'
    });
  } else if (tmpData) {
    console.log("缓存主页数据:", tmpData);
    callback(tmpData);
  }
  getData(valType, function(data) {
    wx.setStorage({
      key: 'getDataTime',
      data: getNowFormatDate(),
    });
    wx.setStorage({
      key: 'mainPageData',
      data: data,
    })
    callback(data);
    setTimeout(function() {
      wx.hideLoading();
    }, 500);
  });
}

/** 更新页面数据 */
function updataPageData(data) {
  var now = new Date();
  var MonthOverMoney = data['MonthInMoney'] - data['MonthOutMoney'];
  var mainToolConfig = app.GetMainToolConfig();
  console.log('获取主页工具栏：', mainToolConfig);
  var isRecent30Day = data.hasOwnProperty('Recent30DayInMoney');
  that.setData({
    is_haader_recent30day: isRecent30Day,
    header_day: now.getDate(),
    header_month: now.getMonth() + 1,
    header_year: now.getFullYear(),
    recent_30day_in_money: isRecent30Day ? getApp().ValueToMoney(data['Recent30DayInMoney']) : '0.00',
    recent_30day_out_money: isRecent30Day ? getApp().ValueToMoney(data['Recent30DayOutMoney']) : '0.00',
    recent_30day_over_money: isRecent30Day ? getApp().ValueToMoney(data['Recent30DayInMoney'] - data['Recent30DayOutMoney']) : '0.00',
    month_in_money: getApp().ValueToMoney(data['MonthInMoney']),
    month_out_money: getApp().ValueToMoney(data['MonthOutMoney']),
    month_over_money: getApp().ValueToMoney(MonthOverMoney),
    day_in_money: getApp().ValueToMoney(data['TodayInMoney']),
    day_out_money: getApp().ValueToMoney(data['TodayOutMoney']),
    year_in_money: getApp().ValueToMoney(data['YearInMoney']),
    year_out_money: getApp().ValueToMoney(data['YearOutMoney']),
    all_in_money: getApp().ValueToMoney(data['SumInMoney']),
    all_out_money: getApp().ValueToMoney(data['SumOutMoney']),
    main_tool_config: mainToolConfig,
  });
}

/** 获取主页数据 */
function getData(valType, callback) {
  valType = valType || "all"; //设置参数默认值
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
    url: app.URL + '/xxjzApp/index.php?s=/Home/Api/statistic',
    data: {
      type: valType
    },
    header: header,
    success: function(res) {
      console.log('获取主页数据:', res);
      if (res.hasOwnProperty('data')) {
        let ret = res['data'];
        if (ret['uid'] == uid) {
          callback(ret['data']);
        } else {
          Logout();
        }
      }
    }
  });
}

/** 获取资金账户数据 */
function getFundsData() {
  app.GetFundsData(parseInt(uid), function (ret, len, data) { 
    console.log('获取资金账户完成', ret, len, data);
  });
}

/** 获取分类数据 */
function getClassData() {
  app.GetClassAllData(parseInt(uid), function (ret, len, data) { 
    console.log('获取分类完成（加强版）', ret, len, data);
    if (ret) {
      if (len == 0) {
        wx.reLaunch({
          url: "../user/fastClass"
        });
      }
    } else {
      Logout();
    }
  });
}

/** 获取当前时间，格式YYYY-MM-DD */
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

/** 退出登陆 */
function Logout() {
  app.Logout(function(path) {
    wx.redirectTo(path);
  });
}
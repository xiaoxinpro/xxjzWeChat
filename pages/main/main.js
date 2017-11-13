var uid = 0;
var that;
Page({
  data: {
    uid: 0,
    uname: "",
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
    all_in_money:0.00,
    all_out_money: 0.00,
  },

  btnAdd: function () {
    wx.switchTab({url: 'add'});
  },

  bindTest: function(){
    var day = this.data.header_day;
    if(++day > 31){
      day = 1;
    }
    this.setData({
      header_day: day
    });
  },

  onPullDownRefresh: function () {
    initData(function () {
      wx.stopPullDownRefresh();
    });
  },

  onLoad: function (option) {
    that = this;

    // 获取用户信息
    wx.getStorage({
      key: 'user',
      success: function(res) {
        let user = res.data;
        if (user.hasOwnProperty('uid') && user.hasOwnProperty('username')) {
          uid = user.uid;
        } else {
          Logout();
        }
      },
    });
    
    // 获取分类数据
    getClassData();
  },

  onShow: function(){
    // 获取统计数据
    wx.showLoading({
      title: '加载中',
      success: function () {
        initData(function () {
          wx.hideLoading();
        });
      }
    });
  }
})

/** 初始化页面数据 */
function initData(callback) {
  getData(function (data) {
    var now = new Date();
    var MonthOverMoney = data['MonthInMoney'] - data['MonthOutMoney'];
    that.setData({
      header_day: now.getDate(),
      header_month: now.getMonth() + 1,
      header_year: now.getFullYear(),
      month_in_money: data['MonthInMoney'].toFixed(2),
      month_out_money: data['MonthOutMoney'].toFixed(2),
      month_over_money: MonthOverMoney.toFixed(2),
      day_in_money: data['TodayInMoney'].toFixed(2),
      day_out_money: data['TodayOutMoney'].toFixed(2),
      year_in_money: data['YearInMoney'].toFixed(2),
      year_out_money: data['YearOutMoney'].toFixed(2),
      all_in_money: data['SumInMoney'].toFixed(2),
      all_out_money: data['SumOutMoney'].toFixed(2),
    });
    callback();
  });
}


/** 获取主页数据 */
function getData(callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  } 
  wx.request({
    url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/statistic',
    data: { type: 'all'},
    header: header,
    success: function(res){
      console.log('获取主页数据:', res);
      if (res.hasOwnProperty('data')) {
        let ret = res['data'];
        if (ret['uid'] == uid) {
          callback(ret['data']);
        } else {
          wx.showModal({
            title: '重新登录',
            content: '登录验证已过期，请重新登录。',
            showCancel: false,
            success: function(){
              Logout();
            }
          });
        }
      }
    }
  });
}

/** 获取分类数据 */
function getClassData(){
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  } 
  wx.request({
    url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/aclass',
    data: { type: 'get' },
    header: header,
    success: function (res) {
      console.log('获取分类数据:', res);
      if (res.hasOwnProperty('data')) {
        let ret = res['data'];
        if (ret['uid'] == uid) {
          let data = ret['data'];
          wx.setStorage({
            key: 'inClass',
            data: data.in
          });
          wx.setStorage({
            key: 'outClass',
            data: data.out
          });
          wx.setStorage({
            key: 'allClass',
            data: data.all
          });
          if(!data.all){
            wx.showModal({
              title: '欢迎使用',
              content: '请先添加收支分类！',
              confirmText: '添加分类',
              cancelText: '稍后提醒',
              success: function(res){
                if(res.confirm){
                  //进入到分类添加页面
                }
              }
            })
          }
        } else {
          wx.showModal({
            title: '重新登录',
            content: '登录验证已过期，请重新登录。',
            showCancel: false,
            success: function () {
              Logout();
            }
          });
        }
      }
    }
  });
}

/** 退出登陆 */
function Logout() {
  wx.removeStorageSync('user');
  wx.reLaunch({ url: "../index/index" });
}
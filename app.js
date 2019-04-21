//app.js
App({
  //全局变量
  // URL: 'https://ide.xiaoxin.pro',
  URL: 'https://jz.xiaoxin.pro',
  AdminUid: 3,

  onLaunch: function() {

  },

  // 获取用户信息
  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function() {
          wx.getUserInfo({
            success: function(res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            },
            fail: function(res) {
              console.log("未获取的登陆权限。", res);
              // wx.openSetting({
              //   success: (res) => {
              //     console.log("权限：", res.authSetting);
              //   }
              // })
            }
          })
        }
      })
    }
  },

  // 保存用户头像，并返回本地路径
  saveUserAvatar: function(url, callback) {
    wx.downloadFile({
      url: url,
      success: function(res) {
        var path = res.tempFilePath;
        console.log('头像临时路径', path);
        wx.saveFile({
          tempFilePath: path,
          success: function(res) {
            path = res.savedFilePath;
            console.log('头像永久路径', path);
            wx.setStorage({
              key: 'avatarPath',
              data: path,
            });
            callback(path);
          }
        })
      }
    })
  },

  // 根据资金账户ID获取名称
  GetFundsName: function (id) {
    var FundData = wx.getStorageSync('Funds');
    for (var i in FundData) {
      if (FundData[i].id == id) {
        return FundData[i].name;
      }
    }
  },

  // 根据资金账户名称获取ID
  GetFundsId: function(name) {
    var FundData = wx.getStorageSync('Funds');
    for (var i in FundData) {
      if (FundData[i].name == name) {
        return parseInt(FundData[i].id);
      }
    }
  },

  // 获取资金账户数据
  GetFundsData: function(uid, callback) {
    if (uid > 0) {
      var session_id = wx.getStorageSync('PHPSESSID'); //本地取存储的sessionID  
      if (session_id != "" && session_id != null) {
        var header = {
          'content-type': 'application/x-www-form-urlencoded',
          'Cookie': 'PHPSESSID=' + session_id
        }
      } else {
        callback(false, 0, "内存数据出错，请登陆后再试。");
      }
    } else {
      callback(false, 0, "用户登陆超时，请重新登陆。");
    }
    wx.request({
      url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/funds',
      data: {
        type: 'get'
      },
      header: header,
      success: function (res) {
        console.log('获取资金账号数据:', res);
        if (res.hasOwnProperty('data')) {
          let ret = res['data'];
          if (ret['uid'] == uid) {
            let data = ret['data'];
            // var arrFunds = Array();
            // for (var i in data) {
            //   arrFunds[data[i].id] = {
            //     id: data[i].id,
            //     name: data[i].name,
            //     money: data[i].money,
            //   };
            // }
            wx.setStorageSync('Funds', data);
            callback(true, data.length, data);
          } else {
            callback(false, 0, "登录验证已过期，请重新登录。");
          }
        }
      }
    });
  },

  // 获取分类数据
  GetClassData: function(uid, callback) {
    //console.log('uid:',uid)
    if (uid > 0) {
      var session_id = wx.getStorageSync('PHPSESSID'); //本地取存储的sessionID  
      if (session_id != "" && session_id != null) {
        var header = {
          'content-type': 'application/x-www-form-urlencoded',
          'Cookie': 'PHPSESSID=' + session_id
        }
      } else {
        callback(false, 0, "内存数据出错，请登陆后再试。");
      }
      wx.request({
        url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/aclass',
        data: {
          type: 'get'
        },
        header: header,
        success: function(res) {
          console.log('获取分类数据:', res);
          if (res.hasOwnProperty('data')) {
            let ret = res['data'];
            if (ret['uid'] == uid) {
              let data = ret['data'];
              wx.setStorageSync('inClass', data.in);
              wx.setStorageSync('outClass', data.out);
              var arrClass = wx.getStorageSync('allClass') || {};
              for (var i in data.all) {
                arrClass[i] = {
                  name: data.all[i],
                  icon: getApp().GetClassIcon(0, data.all[i])
                };
              }
              wx.setStorageSync('allClass', arrClass);
              callback(true, data.all ? Object.getOwnPropertyNames(data.all).length : 0, data);
            } else {
              callback(false, 0, "登录验证已过期，请重新登录。");
            }
          }
        }
      });
    } else {
      callback(false, 0, "用户登陆超时，请重新登陆。");
    }
  },

  // 获取分类图标名称
  GetClassIcon(calssType, className) {
    var iconName = 'other.png';
    switch (className) {
      case '吃饭':
      case '饮食':
      case '食物':
        iconName = 'food.png';
        break;
      case '电子':
        iconName = 'electric.png';
        break;
      case '电器':
        iconName = 'camera.png';
        break;
      case '衣服':
      case '服装':
      case '服饰':
        iconName = 'clothes.png';
        break;
      case '生活':
      case '生活用品':
        iconName = 'life.png';
        break;
      case '工资':
        iconName = 'jobs.png';
        break;
      case '送礼':
        iconName = 'gift.png';
        break;
      case '红包':
      case '礼金':
        iconName = 'gifts.png';
        break;
      case '奖金':
        iconName = 'prize.png';
        break;
      case '交通':
      case '公交':
      case '出行':
      case '地铁':
      case '路费':
      case '油费':
        iconName = 'traffic.png';
        break;
      case '住宿':
      case '住房':
      case '房租':
      case '房子':
        iconName = 'house.png';
        break;
      case '药品':
        iconName = 'drug.png';
        break;
      case '健身':
        iconName = 'fitness.png';
        break;
      case '医院':
      case '医疗':
        iconName = 'Injecting.png';
        break;
      default:
        iconName = 'other.png';
        break;
    }
    return iconName;
  },

  // 获取自动复制文本
  GetAutoCopyData: function(callback) {
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
      url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/autocopy',
      method: 'GET',
      data: {
        type: 'get'
      },
      header: header,
      success: function(res) {
        console.log('获取自动复制文本：', res);
        if (res.hasOwnProperty('data')) {
          callback(res['data']);
        }
      }
    });
  },

  GetMainToolConfig: function() {
    var ret = wx.getStorageSync('mainToolConfig');
    if (!ret) {
      ret = [{
          id: 0,
          tid: 0,
          name: '+',
          button: 'none',
          path: '../tool/site?id=0'
        },
        {
          id: 1,
          tid: 0,
          name: '+',
          button: 'none',
          path: '../tool/site?id=1'
        },
        {
          id: 2,
          tid: 1,
          name: '好评工具',
          button: 'info',
          path: '../tool/goodEvaluate'
        }
      ];
    }
    return ret;
  },

  SetMainToolConfig: function(data, item = null) {
    if (item == null) {
      wx.setStorage({
        key: 'mainToolConfig',
        data: data,
      });
    } else {
      item = parseInt(item);
      if (item < 3) {
        var config = getApp().GetMainToolConfig();
        config[item] = data;
        wx.setStorage({
          key: 'mainToolConfig',
          data: config,
        });
      }
    }
  },

  // 退出登陆
  Logout: function(callback) {
    // wx.clearStorage();
    wx.removeStorage({
      key: 'user'
    });
    wx.removeStorage({
      key: 'PHPSESSID'
    });
    wx.removeStorage({
      key: 'userInfo'
    });
    wx.removeStorage({
      key: 'avatarPath'
    });
    wx.removeStorage({
      key: 'getDataTime'
    });
    wx.removeStorage({
      key: 'mainPageData'
    });
    wx.removeStorage({
      key: 'inClass'
    });
    wx.removeStorage({
      key: 'outClass'
    });
    wx.removeStorage({
      key: 'allClass'
    });
    callback({
      url: "/pages/index/index"
    });
  },

  // 数值转化为货币格式
  ValueToMoney: function(val) {
    if (val) {
      if (typeof val == "object") {
        var ret = {};
        for (var i in val) {
          ret[i] = val[i].toFixed(2);
        }
        return ret;
      } else if (typeof val == "function") {
        return val;
      } else {
        return val.toFixed(2);
      }
    } else {
      return val;
    }
  },

  //显示字符串处理（字符串内容，最大长度）
  ShowString: function (str, len = 16) {
    if (len > 2) {
      var l = 0;
      for (var i = 0; i < str.length; i++) {
        l = (escape(str.charAt(i)).length > 4) ? l + 1.75 : l + 1;
        if (l > len) {
          return (str.substring(0, i - 1) + "..");
        }
      }
    } else {
      str = ".."
    }
    return str;
  },

  globalData: {
    userInfo: null
  }
})
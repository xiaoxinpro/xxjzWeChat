//app.js
App({
  //全局常量
  // URL: 'https://ide.xiaoxin.pro',
  URL: 'https://jz.xiaoxin.pro',
  AdminUid: 3,
  MinServerVersion: '2.0.0',
  Demo:{username:'demo',password:'xxgzs.org'},

  //全局变量（初始化时自动赋值）
  ServerVersion: '0.0.1',
  ClassAllData: null,

  onLaunch: function() {
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo = res
        this.globalData.windowHeight = res.windowHeight / (res.windowWidth / 750)
        this.globalData.screenHeight = res.screenHeight / (res.screenWidth / 750)
      }
    });
    this.getVersion();
    this.clearDemoInfo();
  },

  getVersion: function() {
    var that = this;
    wx.request({
      url: that.URL + '/xxjzApp/index.php?s=/Home/Api/version',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log('版本获取成功：',res.data)
        wx.setStorageSync('Server', res.data);
        if (res.statusCode == 200) {
          //比较版本号
          that.ServerVersion = res.data['version'];
          if (that.ChangeVersion(that.ServerVersion, that.MinServerVersion)) {
            //符合版本要求
          } else {
            wx.showModal({
              title: '服务端版本过低',
              content: '检测到' + that.URL + '服务器版本过低，请安装最新版本小歆记账。',
              showCancel: false,
            })
          }
        } else {
          //版本较低或服务器有问题
        }
      }
    })
  },

  // 清除体验账号信息
  clearDemoInfo: function() {
    var user = wx.getStorageSync('user');
    if (user && user['username'] == this.Demo['username']) {
      wx.removeStorageSync('user');
    }
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
            //删除旧头像
            path = wx.getStorageSync('avatarPath');
            if (path) {
              wx.removeSavedFile({
                filePath: path,
              });
            }
            //保存新头像
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

  // 获取分类数据（加强版）
  GetClassAllData: function (uid, callback) {
    var that = this;
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
          type: 'getalldata'
        },
        header: header,
        success: function (res) {
          console.log('获取分类数据(加强版):', res);
          if (res.hasOwnProperty('data')) {
            let ret = res['data'];
            if (ret['uid'] == uid) {
              let data = ret['data'];
              let inData = [];
              let outData = [];
              for (var i in data) {
                data[i]['icon'] = that.GetClassIcon(0, data[i]['name']);
                if (data[i]['type'] == 1) {
                  inData.push(data[i]);
                } else if (data[i]['type'] == 2) {
                  outData.push(data[i]);
                }
              }
              that.ClassAllData = {
                'in': inData,
                'out': outData,
                'all': data,
              };
              callback(true, that.ClassAllData ? Object.getOwnPropertyNames(that.ClassAllData).length : 0, that.ClassAllData);
              wx.setStorageSync('ClassAllData', that.ClassAllData);
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

  // 获取默认分类id
  GetDefaultClass() {
    var ret = wx.getStorageSync('defaultClass');
    if(ret) {
      return ret;
    } else {
      ret = {};
      var listClass = wx.getStorageSync('inClass');
      if (Object.keys(listClass).length > 0) {
        ret['in'] = parseInt(Object.keys(listClass).shift());
      }
      listClass = wx.getStorageSync('outClass');
      if (Object.keys(listClass).length > 0) {
        ret['out'] = parseInt(Object.keys(listClass).shift());
      }
      return ret;
    }
  },

  // 获取分类图标名称
  GetClassIcon(calssType, className) {
    var iconList = {};
    iconList['food.png'] = ['饭', '饮', '食', '下馆子'];
    iconList['electric.png'] = ['电子'];
    iconList['camera.png'] = ['电器'];
    iconList['clothes.png'] = ['服'];
    iconList['life.png'] = ['生活'];
    iconList['jobs.png'] = ['工资', '商务'];
    iconList['gift.png'] = ['送礼'];
    iconList['gifts.png'] = ['红包', '礼金'];
    iconList['prize.png'] = ['奖金'];
    iconList['traffic.png'] = ['交通', '公交', '出行', '地铁', '路费', '油费', '火车'];
    iconList['house.png'] = ['住', '房', '旅店', '宿'];
    iconList['drug.png'] = ['药'];
    iconList['fitness.png'] = ['健身'];
    iconList['Injecting.png'] = ['医'];
    iconList['entertainment.png'] = ['文娱', '娱乐', '歌'];
    iconList['wage.png'] = ['借', '还', '补贴', '分红', '信用卡'];
    iconList['xianyu.png'] = ['闲鱼','咸鱼','二手'];
    for(var iconName in iconList) {
      for(var item in iconList[iconName]) {
        if (className.indexOf(iconList[iconName][item]) >= 0) {
          return iconName;
        }
      }
    }
    return 'other.png';
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
          name: '+',
          button: 'none',
          path: '../tool/site?id=0'
        },
        {
          id: 1,
          name: '+',
          button: 'none',
          path: '../tool/site?id=1'
        },
        {
          id: 2,
          name: '好评工具',
          button: 'info',
          path: '../tool/goodEvaluate?id=2'
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

  // 版本号比较（目标版本号，实际版本号）
  ChangeVersion: function(ver1, ver2) {
    var version1pre = parseFloat(ver1);
    var version2pre = parseFloat(ver2);
    var version1next = ver1.replace(version1pre + ".", "");
    var version2next = ver2.replace(version2pre + ".", "");
    if (version1pre > version2pre) {
      return true;
    } else if (version1pre < version2pre) {
      return false;
    } else {
      if (version1next >= version2next) {
        return true;
      } else {
        return false;
      }
    }
  },

  globalData: {
    userInfo: null,
    systemInfo: null,
    windowHeight: null, // rpx换算px后的窗口高度
    screenHeight: null, // rpx换算px后的屏幕高度
  }
})

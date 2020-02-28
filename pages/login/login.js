//login.js

var isAutoLogin = false;
var userLogin = {};
var user = {
  uid: "",
  username: "",
  password: ""
};
var code = null;

Page({
  data: {
    title: "登陆帐号",
    username: "用户名",
    password: "密码",
    submit: "登陆",
    username_value: "",
    password_value: "",
    windowHeight: 0,
  },

  formSubmit: function(e) {
    let username = e.detail.value.username;
    let password = e.detail.value.password;
    LoginProcess(username, password);
  },

  btnWexinLogin: function(e) {
    getApp().Logout(function(path) {
      wx.redirectTo(path);
    });
  },

  onLoad: function(option) {
    var tmpUser = wx.getStorageSync('user');
    if (tmpUser) {
      user = tmpUser;
    }
    this.setData({
      windowHeight: getApp().globalData.windowHeight,
      screenHeight: getApp().globalData.screenHeight,
    });
    wx.setNavigationBarTitle({
      title: '登陆帐号'
    });
    if (option.hasOwnProperty('password')) {
      this.setData({
        username_value: option.username,
        password_value: option.password,
      });
      userLogin = option;
      isAutoLogin = true;
    } else {
      var userInfo = wx.getStorageSync('userInfo')
      if (userInfo.nickName) {
        console.log(userInfo.nickName)
        this.setData({
          username_value: userInfo.nickName
        });
      }
      if (option.hasOwnProperty('code')) {
        code = option.code;
      }
    }
  },

  onShow: function() {
    console.log("显示登陆页面：", isAutoLogin, userLogin);
    if (isAutoLogin === true) {
      isAutoLogin = false;
      LoginProcess(userLogin.username, userLogin.password);
    }
  }
})

/** 登陆处理函数 */
function LoginProcess(username, password) {
  wx.showLoading({
    title: '登陆中',
    mask: true,
    success: function() {
      if (username.length < 2 || password.length < 6) {
        wx.hideLoading();
        wx.showModal({
          title: "登陆失败",
          content: "用户名或密码不正确，请重新输入！",
          showCancel: false
        });
      } else {
        sendPostLogin(username, password, function(ret) {
          wx.hideLoading();
          console.log("网络请求返回：", ret);
          if (ret['uid'] > 0) {
            //封装用户配置
            user.uid = ret['uid'];
            user.username = username;
            user.password = password;

            //保存用户配置
            wx.setStorage({
              key: 'user',
              data: user
            });

            //保存Sessionid
            wx.setStorage({
              key: 'PHPSESSID',
              data: ret['sessionid']
            });

            //弹出登陆成功窗口
            wx.showToast({
              title: '登陆成功',
              duration: 1000,
              complete: function() {
                setTimeout(function() {
                  //跳转到用户主页
                  wx.reLaunch({
                    url: "../main/main?uid=" + user['uid'] + "&uname=" + user['username']
                  });
                }, 500);
              }
            });

          } else {
            //清空用户信息
            wx.removeStorage({
              key: 'user'
            });
            //弹出登陆失败窗口
            wx.showModal({
              title: "登陆失败",
              content: ret['uname'],
              showCancel: false
            });
          }
        });
      }
    }
  });
}

/** 发送登录命令 */
function sendPostLogin(username, password, callback) {
  var url = getApp().URL + '/index.php?s=/Home/Login/login_api';
  var data = {
    username: username,
    password: password,
    submit: 'xxjzAUI'
  };
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
  if (code) {
    url = getApp().URL + '/index.php?s=/Home/Login/bind_weixin';
    data.js_code = code;
    data.submit = 'weixin';
  }
  wx.request({
    url: url,
    data: data,
    method: 'GET',
    header: header,
    success: function(res) {
      callback(res.data);
    },
    fail: function() {
      callback({
        uid: 0,
        uname: err['msg'] + '（请联系管理员）'
      });
    }
  });
}
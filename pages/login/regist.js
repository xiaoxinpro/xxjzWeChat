//regist.js
var userRegist = {};
var user = { uid: "", username: "", password: "" };
var code = "";

Page({
  data: {
    title: "新建帐号",
    username: "用户名",
    password: "密码",
    email: "邮箱",
    submit: "注册",
    username_value: "",
    password_value: "",
    email_value: "",
  },

  formSubmit: function (e) {
    let username = e.detail.value.username;
    let password = e.detail.value.password;
    let email = e.detail.value.email;
    RegistProcess(username, password, email);
  },

  onLoad: function (option) {
    code = option.code;
    console.log('微信登陆code:', code);
    var userInfo = wx.getStorageSync('userInfo')
    if (userInfo.nickName) {
      console.log('获取用户名', userInfo.nickName)
      this.setData({
        username_value: userInfo.nickName
      });
    }
  },

  onShow: function () {

  }
})

/** 注册处理函数 */
function RegistProcess(username, password, email) {
  wx.showLoading({
    title: '加载中',
    mask: true,
    success: function () {
      if (username.length < 2 || username.length > 24) {
        wx.hideLoading();
        wx.showModal({
          title: "注册失败",
          content: "用户名长度要在2-24位之间，请重新输入！",
          showCancel: false
        });
      } else if (password.length < 6 || password.length > 32) {
        wx.hideLoading();
        wx.showModal({
          title: "注册失败",
          content: "密码长度要在6-32位之间，请重新输入！",
          showCancel: false
        });
      } else if (checkEmail(email)) {
        wx.hideLoading();
        wx.showModal({
          title: "注册失败",
          content: "邮箱格式有误，请重新输入！",
          showCancel: false
        });
      } else {
        sendPostRegist(username, password, email, function (ret) {
          wx.hideLoading();
          console.log("网络请求返回：", ret);
          if (ret['uid'] > 0) {
            //封装用户配置
            user.uid = ret['uid'];
            user.username = username;
            user.password = password;
            user.email = email;

            //保存用户配置
            wx.setStorage({
              key: 'user',
              data: user
            });

            //弹出注册成功窗口
            wx.showToast({
              title: '注册成功',
              duration: 1000,
              complete: function () {
                setTimeout(function () {
                  //跳转到用户主页
                  wx.reLaunch({ url: "../main/main?uid=" + user['uid'] + "&uname=" + user['username'] });
                }, 500);
              }
            });

          } else {
            //清空用户信息
            wx.removeStorage({ key: 'user' });
            //弹出注册失败窗口
            wx.showModal({
              title: "注册失败",
              content: ret['msg'] ? ret['msg'] : "未知错误。。。",
              showCancel: false
            });
          }
        });
      }
    }
  });
}

/** 发送注册命令 */
function sendPostRegist(username, password, email, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  wx.request({
    url: getApp().URL + '/index.php?s=/Home/Login/regist_weixin',
    data: {
      js_code: code,
      regist_username: username,
      regist_password: password,
      regist_email: email,
      submit: 'Weixin'
    },
    method: 'GET',
    header: header,
    success: function (res) {
      callback(res.data);
    },
    fail: function () {
      callback({
        uid: 0,
        msg: err['msg'] + '（请联系管理员）'
      });
    }
  });
}

/** 验证邮箱是否合法 */
function checkEmail(email) {
  var reg = new RegExp('^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$')
  return reg.test(email);
}
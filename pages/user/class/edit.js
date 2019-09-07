// pages/user/class/edit.js
var that = this;
var uid = 0;
var ClassId = 0;

var Base64 = require('../../../utils/base64.js')
var util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectClassIndex: 0,

    typeItems: [
      { name: '支出', value: '2', checked: true },
      { name: '收入', value: '1' }
    ],
  },

  /**
   * 收支选择事件
   */
  typeChange: function (e) {
    that = this;
    var typeId = e.detail.value;
    var ClassData = initClassData(ClassId, typeId);
    console.log(e, ClassData);
    if (ClassData) {
      this.setData(ClassData);
    }
  },

  /**
   * 分类选择列表
   */
  bindClassChange: function(res) {
    // console.log('bindClassChange', res);
    this.setData({
      selectClassIndex: res.detail.value
    });
  },

  /**
   * 分类编辑事件
   */
  submit_edit: function(res) {
    that = this;
    var newClassName = res.detail.value.class_name;
    var ClassData = getApp().GetClassId(ClassId);
    console.log('编辑分类按钮', ClassData, newClassName);
    if (ClassData.name == newClassName) {
      wx.showToast({
        title: '分类名未修改'
      });
    } else if (!checkClassName(newClassName)) {
      showTopTips('分类名格式错误！');
    } else {
      cmdEditClass(ClassData.id, ClassData.type, newClassName);
    }
  },

  /**
   * 分类删除事件
   */
  submit_delete: function(res) {
    that = this;
    var ClassData = getApp().GetClassId(ClassId);
    if (that.data.ClassCount == 0) {
      wx.showModal({
        title: '删除【' + ClassData.name + '】',
        content: '请确认将【' + ClassData.name + '】分类删除。',
        confirmText: '删除',
        confirmColor: '#e51c23',
        success(ret) {
          if (ret.confirm) {
            console.log(ClassData);
          }
        }
      });
    } else {
      var classIndex = that.data.selectClassIndex;
      var moveClassData = that.data.ClassArr[classIndex];
      wx.showModal({
        title: '移动并删除【' + ClassData.name + '】',
        content: '请确认将【' + ClassData.name + '】分类中的记录移动到【' + moveClassData.name + '】分类中，并删除【' + ClassData.name + '】分类。',
        confirmText: '删除',
        confirmColor: '#e51c23',
        success(ret) {
          if (ret.confirm) {
            console.log(ClassData, moveClassData);
          }
        }
      });
    }
  },

  /**
   * 切换类别按钮事件
   */
  bindClassType: function() {
    console.log("切换类别按钮");
    var ClassData = getApp().GetClassId(ClassId);
    var typeId = ClassData.type;
    var typeName = (typeId == 2) ? "收入" : "支出";
    var className = ClassData.name;
    wx.showModal({
      title: '切换类别',
      content: '你是否要将【' + className + '】切换为' + typeName + '吗？',
      cancelText: '否',
      confirmText: '是',
      confirmColor: '#e51c23',
      success: function (res) {
        if (res.confirm) {
          cmdChangeClass(ClassId, typeId, className);
        }
      }
    });
  },

  /**
   * 设为默认按钮事件
   */
  bindDefault: function() {
    that = this;
    var ClassData = getApp().GetClassId(ClassId);
    console.log("设为默认按钮", ClassData);
    setDefaultClass(ClassData.type == 1 ? "in" : "out", ClassData.id);
    wx.showToast({
      title: '设置完成',
    });
    WaitBack();
  },

  /**
   * 返回按钮
   */
  bindBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    uid = wx.getStorageSync('user').uid;
    ClassId = options.id;
    var ClassData = initClassData(ClassId);
    if (ClassData) {
      that.setData(ClassData);
    } else {
      wx.showModal({
        title: '无法编辑',
        content: '抱歉，未找到可编辑的分类！',
        showCancel: false,
        confirmText: '返回',
        success: function() {
          wx.navigateBack({});
        }
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})

/**
 * 获取Class显示数据
 */
function initClassData(classId, typeId = false) {
  var ClassData = getApp().GetClassId(ClassId);
  var ClassArr = [];
  if(typeId) {
    ClassData.type = typeId;
  }
  if (ClassData.type == 1) {
    ClassArr = getApp().ClassAllData.in;
  } else {
    ClassArr = getApp().ClassAllData.out;
  }

  var typeItems = that.data.typeItems;
  for (var i in typeItems) {
    typeItems[i].checked = (ClassData.type == parseInt(typeItems[i].value));
  }

  var ClassList = [];
  for (var i in ClassArr) {
    if (ClassArr[i].id == ClassId) {
      continue;
    } else {
      ClassList.push(ClassArr[i]);
    }
  }

  if(ClassData) {
    return {
      selectClassIndex: 0,
      typeItems: typeItems,
      ClassCount: parseInt(ClassData.count),
      ClassName: ClassData.name,
      ClassArr: ClassList,
    };
  } else {
    return null;
  }
}

/**
 * 更新分类数据
 */
function updataClassData() {
  getApp().GetClassAllData(uid, function (ret, len, data){
    if(ret) {
      that.setData(initClassData(ClassId));
    } else {
      wx.showModal({
        title: '重新登录',
        content: '登录验证已过期，请重新登录。',
        showCancel: false,
        success: function () {
          getApp().Logout(function (path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
}

/** 错误提示 */
function showTopTips(text) {
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

/**
 * 校验分类名称
 */
function checkClassName(className) {
  var pattern = /[A-Za-z0-9_\-\u4e00-\u9fa5]+/;
  return pattern.test(className);
}

/**
 * 编辑分类名称
 */
function cmdEditClass(classid, classtype, classname) {
  var editData = {};
  editData.classid = classid;
  editData.classname = classname;
  editData.classtype = classtype;
  editData.ufid = uid;
  console.log('表单处理后结果：', editData);

  //数据加密
  //console.log(JSON.stringify(editData));
  var strData = Base64.encoder(JSON.stringify(editData));

  //发送数据
  wx.showLoading({
    title: '提交中',
    success: function () {
      sendClassData(strData, 'edit', function (ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //编辑分类成功
            wx.showToast({
              title: '编辑分类成功',
            });
            console.log('编辑分类完成：', ret);
            //更新分类数据
            updataClassData();
            //延时返回页面
            WaitBack();
          } else {
            //添加分类失败
            wx.showModal({
              title: '编辑分类失败',
              content: ret.data[1] ? ret.data[1] : '未知错误？',
              showCancel: false
            })
          }
        } else {
          //未登陆
          getApp().Logout(function (path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
}

/**
 * 删除分类
 */
function cmdDeleteClass(classid) {
  var delData = {
    classid: classid
  };

  //数据加密
  var strData = Base64.encoder(JSON.stringify(delData));

  //发送数据
  wx.showLoading({
    title: '提交中',
    success: function () {
      sendClassData(strData, 'del', function (ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //删除分类成功
            wx.showToast({
              title: '删除成功',
            });
            console.log('删除分类完成：', ret);
            //更新分类数据
            updataClassData();
          } else {
            //删除分类失败
            wx.showModal({
              title: '删除分类失败',
              content: ret.data[1] ? ret.data[1] : '未知错误？',
              showCancel: false
            })
          }
        } else {
          //未登陆
          getApp().Logout(function (path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
}

/**
 * 移动并删除分类
 */
function cmdMoveAndDeleteClass(oldId, newId) {
  var moveData = {
    classid1: oldId,
    classid2: newId,
  }

  //数据加密
  var strData = Base64.encoder(JSON.stringify(moveData));

  //发送数据
  wx.showLoading({
    title: '移动中',
    success: function () {
      sendClassData(strData, 'move', function (ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //移动分类成功
            cmdDeleteClass(oldId);
          } else {
            //移动分类失败
            wx.showModal({
              title: '移动分类失败',
              content: ret.data[1] ? ret.data[1] : '未知错误？',
              showCancel: false
            })
          }
        } else {
          //未登陆
          getApp().Logout(function (path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
}

/**
 * 分类转移
 */
function cmdChangeClass(classid, classtype, classname) {
  var editData = {};
  editData.classid = classid;
  editData.classname = classname;
  editData.classtype = classtype;
  editData.ufid = uid;

  //数据加密
  var strData = Base64.encoder(JSON.stringify(editData));

  //发送数据
  wx.showLoading({
    title: '提交中',
    success: function () {
      sendClassData(strData, 'change', function (ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //转移分类成功
            wx.showToast({
              title: '转移分类成功',
            });
            console.log('转移分类完成：', ret);
            //更新分类数据
            updataClassData();
            //延时返回页面
            WaitBack();
          } else {
            //添加分类失败
            wx.showModal({
              title: '转移分类失败',
              content: ret.data[1] ? ret.data[1] : '未知错误？',
              showCancel: false
            })
          }
        } else {
          //未登陆
          getApp().Logout(function (path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
}

/**
 * 设置默认分类id
 */
function setDefaultClass(classType, classId) {
  var defaultClass = getApp().GetDefaultClass();
  defaultClass[classType] = classId;
  wx.setStorage({
    key: 'defaultClass',
    data: defaultClass,
  });
  return defaultClass;
}

/** 
 * 发送分类数据(data数组, 回调函数) 
 */
function sendClassData(data, type, callback) {
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
    url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/aclass',
    method: 'POST',
    data: {
      type: type,
      data: data
    },
    header: header,
    success: function (res) {
      console.log('发送分类POST：', res);
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

/**
 * 获取分类数据
 */
function getClassData(callback) {
  getApp().GetClassAllData(parseInt(uid), function (ret, len, data) {
    if (ret) {
      callback(data);
    } else {
      wx.showModal({
        title: '重新登录',
        content: '登录验证已过期，请重新登录。',
        showCancel: false,
        success: function () {
          getApp().Logout(function (path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
}

/** 
 * 延时返回 
 */
function WaitBack(time = 500) {
  setTimeout(function () {
    wx.navigateBack();
  }, time);
}

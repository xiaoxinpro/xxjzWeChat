// pages/user/fastClass.js
var that = this;
var strEditClassName = "";
var strAddClassName = "";

var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    Step: 1,
    ListTitle: '支出分类',
    OutClassList: [],
    InClassList: [],

    editClassId: 0,
    editClassType: "out",
    editClassName: "分类名称",
    hiddenmodalput: true,

    addClassName: "",
  },

  /**
 * 编辑分类名称（提交）按钮
 */
  btnEditClassNameConfirm: function () {
    that = this;
    console.log("编辑分类名称（提交）按钮", strEditClassName);
    this.setData({
      hiddenmodalput: true
    });
    if (strEditClassName == this.data.editClassName) {
      // wx.showToast({title: '分类名未修改'});
    } else if (!checkClassName(strEditClassName)) {
      wx.showModal({
        title: '编辑失败',
        content: '分类名格式错误！',
        showCancel: false,
        confirmText: '知道了',
      });
    } else {
      cmdEditClass(this.data.editClassType, this.data.editClassId, strEditClassName);
    }
  },

  /**
   * 编辑分类名称（取消）按钮
   */
  btnEditClassNameCancel: function () {
    console.log("编辑分类名称（取消）按钮");
    strEditClassName = "";
    this.setData({
      hiddenmodalput: true
    });
  },

  /**
   * 编辑分类名称输入框
   */
  inputEditClassName: function (e) {
    strEditClassName = e.detail.value;
  },

  /**
   * 编辑分类按钮
   */
  btnClassEdit: function (e) {
    console.log("编辑分类：", e.target.dataset);
    var data = e.target.dataset;
    strEditClassName = data.name;
    this.setData({
      editClassId: data.key,
      editClassType: data.type,
      editClassName: data.name,
      hiddenmodalput: false,
    })
  },

  /**
   * 删除分类按钮
   */
  btnClassDelete: function (e) {
    console.log("删除分类：", e.target.dataset);
    var data = e.target.dataset;
    if (cmdDeleteClass(data.type, data.key)) {
      // wx.showToast({title: '删除完成'})
    }
  },

  /**
   * 添加分类输入文本框
   */
  inputAddClassName: function (e) {
    strAddClassName = e.detail.value;
  },

  /**
   * 添加分类按钮
   */
  btnClassAdd: function (e) {
    console.log("添加分类", e.target.dataset);
    var data = e.target.dataset;
    this.setData({ addClassName: "" });
    if (!checkClassName(strAddClassName)) {
      wx.showModal({
        title: '添加失败',
        content: '分类名格式错误！',
        showCancel: false,
        confirmText: '知道了',
      });
    } else {
      if (cmdAddClass(data.type, strAddClassName)) {
        // wx.showToast({title: '添加成功'})
      }
    }
    strAddClassName = "";
  },

  /**
   * 下一步按钮
   */
  btnStepNext: function (e) {
    console.log("下一步：", e.target.dataset);
    var step = e.target.dataset.step + 1;
    this.setData({
      Step: step,
    });
    strEditClassName = "";
    strAddClassName = "";
    if (step >= 3) {
      that = this;
      cmdSubmit(function (res) {
        if (res) {
          wx.reLaunch({url: '../main/main'});
        } else {
          getApp().Logout(function (path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  },

  /**
   * 返回按钮
   */
  btnStepPrevious: function (e) {
    console.log("返回：", e.target.dataset);
    var step = e.target.dataset.step - 1;
    this.setData({
      Step: step,
    });
    strEditClassName = "";
    strAddClassName = "";
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    wx.setNavigationBarTitle({ title: '添加分类向导' });
    InitData();
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

/**
 * 初始化数据
 */
function InitData() {
  var inClassJson = [];
  var outClassJson = [];
  var key = 0;
  //初始化收入分类列表
  key = 0;
  inClassJson.push({ key: key++, name: "工资" });// 工资
  inClassJson.push({ key: key++, name: "补贴" });// 补贴
  inClassJson.push({ key: key++, name: "奖金" });// 奖金
  // -----
  // 收益
  // 兼职
  // 红包
  // 其他

  //初始化支出分类列表
  key = 0;
  outClassJson.push({ key: key++, name: "饮食" });// 饮食
  outClassJson.push({ key: key++, name: "服饰" });// 服饰
  outClassJson.push({ key: key++, name: "交通" });// 交通
  outClassJson.push({ key: key++, name: "住宿" });// 住宿
  outClassJson.push({ key: key++, name: "文娱" });// 文娱
  outClassJson.push({ key: key++, name: "生活用品" });// 生活用品
  // -----
  // 医疗
  // 电器
  // 美妆
  // 书籍
  // 红包
  // 其他

  //输出显示
  that.setData({
    InClassList: inClassJson,
    OutClassList: outClassJson,
  })

}

/**
 * 编辑分类处理
 */
function cmdEditClass(classType, key, name) {
  var classList = getClassList(classType);
  if (!checkClassRename(name, classList)) {
    wx.showModal({
      title: '编辑失败',
      content: name + '分类名重复，无法编辑。',
      showCancel: false,
      cancelText: '知道了',
    });
    return false;
  } else {
    classList[key].name = name;
    setClassProcess(classType, classList);
    return true;
  }
}

/**
 * 删除分类处理
 */
function cmdDeleteClass(classType, key) {
  var classList = getClassList(classType);
  if (classList.length <= key) {
    wx.showModal({
      title: '删除失败',
      content: '删除的分类号不存在。',
      showCancel: false,
      cancelText: '知道了',
    });
    return false;
  } else if (classList.length <= 1) {
    wx.showModal({
      title: '删除失败',
      content: '分类不可为空，请最少保留一个分类。',
      showCancel: false,
      cancelText: '知道了',
    });
    return false;
  } else {
    classList.splice(key, 1);
    setClassProcess(classType, classList);
    return true;
  }
}

/**
 * 添加分类处理
 */
function cmdAddClass(classType, name) {
  var classList = getClassList(classType);
  if (!checkClassRename(name, classList)) {
    wx.showModal({
      title: '添加失败',
      content: name + '分类名已经存在，无法添加。',
      showCancel: false,
      cancelText: '知道了',
    });
    return false;
  } else if (classList.length > 16) {
    wx.showModal({
      title: '添加失败',
      content: '您添加的分类过多，请先完成向导后再添加。',
      showCancel: false,
      cancelText: '知道了',
    });
    return false;
  } else {
    classList.push({
      key: classList.length,
      name: name
    });
    setClassProcess(classType, classList);
    return true;
  }
}

/**
 * 校验分类名称
 */
function checkClassName(className) {
  var pattern = /[A-Za-z0-9_\-\u4e00-\u9fa5]+/;
  return pattern.test(className);
}

/**
 * 判断分类名是否重复
 */
function checkClassRename(className, classList) {
  for (var i in classList) {
    if (className == classList[i].name) {
      return false;
    }
  }
  return true;
}

/**
 * 获取分类列表
 */
function getClassList(classType) {
  if (classType == 'in') {
    return that.data.InClassList;
  } else {
    return that.data.OutClassList;
  }
}

/**
 * 分类数据整理并推送显示
 */
function setClassProcess(classType, classList) {
  var key = 0;
  for (var i in classList) {
    classList[i].key = key++;
  }
  if (classType == 'in') {
    that.setData({
      InClassList: classList,
    })
  } else {
    that.setData({
      OutClassList: classList,
    })
  }
}

/**
 * 提交数据
 */
function cmdSubmit(callback) {
  var fastData = [];
  var inClassList = that.data.InClassList;
  var outClassList = that.data.OutClassList;
  for (var i in inClassList) {
    fastData.push({ 'classname': inClassList[i].name, 'classtype': 1 });
  }
  for (var i in outClassList) {
    fastData.push({ 'classname': outClassList[i].name, 'classtype': 2 });
  }

  //数据加密
  console.log(JSON.stringify(fastData));
  var strData = Base64.encoder(JSON.stringify(fastData));

  //发送数据
  wx.showLoading({
    title: '提交中',
    success: function () {
      sendClassData(strData, 'addall', function (ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //添加分类向导完成
            wx.showToast({
              title: '完成',
            });
            console.log('添加分类向导完成', ret);
            setTimeout(function(){
              callback(true);
            },1000);
          } else {
            //添加分类向导失败
            wx.showModal({
              title: '提交失败',
              content: ret.data[1] ? ret.data[1] : '未知错误？',
              showCancel: false,
              success: function () {
                callback(false);
              }
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
 * 发送分类数据(data数组, 回调函数) 
 */
function sendClassData(data, type, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  wx.request({
    url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/aclass',
    method: 'POST',
    data: { type: type, data: data },
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
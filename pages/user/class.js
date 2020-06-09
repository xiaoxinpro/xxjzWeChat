// class.js
var that = this;
var uid = 0;
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var strEditClassName = "";
var intEditClassId = 0;

var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    textTopTips: "错误提示",

    tabs: ["支出分类", "收入分类"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    outClassList: [],
    inClassList: [],
    defaultClass: {},

    editClassId: 0,
    editClassType: "out",
    editClassName: "分类名称",
    hiddenmodalput: true,
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
   * 点击标签事件
   */
  tabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  /**
   * 添加支出分类
   */
  submit_outClass: function(e) {
    that = this;
    var className = e.detail.value.class_name;
    cmdAddClass(2, className);
    console.log("添加支出分类：", e.detail.value);
    this.setData({
      outClass: ""
    });
  },

  /**
   * 添加收入分类
   */
  submit_inClass: function(e) {
    that = this;
    var className = e.detail.value.class_name;
    cmdAddClass(1, className);
    console.log("添加收入分类：", e.detail.value);
    this.setData({
      inClass: ""
    });
  },

  /**
   * 弹出分类菜单
   */
  btnClassMenu: function(e) {
    that = this;
    // console.log(e.currentTarget.dataset);
    var classData = e.currentTarget.dataset;
    e.target = e.currentTarget;
    wx.showActionSheet({
      itemList: ['设为默认', '编辑', '转移', '删除'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
          switch (res.tapIndex) {
            case 0:
              that.btnClassDefault(e);
              break;
            case 1:
              that.btnClassEdit(e);
              break;
            case 2:
              that.btnClassChange(e);
              break;
            case 3:
              that.btnClassDelete(e);
              break;
            default:
              break;
          }
        }
      }
    });
  },

  btnClassEditPage: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: './class/edit?id=' + id,
    });
  },

  /**
   * 设为默认分类
   */
  btnClassDefault: function(e) {
    that = this;
    var classId = e.target.dataset.id;
    var classType = e.target.dataset.type;
    var className = e.target.dataset.name;
    console.log("设为默认分类：", e.target.dataset);
    var defaultClass = setDefaultClass(classType, classId);
    if(defaultClass) {
      that.setData({
        defaultClass: defaultClass,
      });
    }
  },

  /**
   * 转移分类
   */
  btnClassChange: function(e) {
    that = this;
    var classId = e.target.dataset.id;
    var classType = e.target.dataset.type;
    var className = e.target.dataset.name;
    console.log("转移分类：", e.target.dataset);
    var typeId = 0;
    var typeName = "";
    if (classType == 'in') {
      typeId = 2;
      typeName = "支出";
    } else {
      typeId = 1;
      typeName = "收入";
    }
    wx.showModal({
      title: '转移分类',
      content: '你是否要将【' + className + '】转为' + typeName + '？',
      cancelText: '否',
      confirmText: '是',
      confirmColor: '#e51c23',
      success: function(res) {
        if (res.confirm) {
          cmdChangeClass(classId, typeId, className);
        }
      }
    });
  },

  /**
   * 删除分类
   */
  btnClassDelete: function(e) {
    that = this;
    var classId = e.target.dataset.id;
    var classType = e.target.dataset.type;
    var className = e.target.dataset.name;
    console.log("删除分类：", e.target.dataset);
    wx.showModal({
      title: '删除分类',
      content: '你是否要将【' + className + '】分类删除？',
      cancelText: '否',
      confirmText: '是',
      confirmColor: '#e51c23',
      success: function(res) {
        if (res.confirm) {
          cmdDeleteClass(classId);
        }
      }
    });
  },

  /**
   * 编辑分类
   */
  btnClassEdit: function(e) {
    var classId = e.target.dataset.id;
    var classType = e.target.dataset.type;
    var className = e.target.dataset.name;
    console.log("编辑分类：", e.target.dataset);
    strEditClassName = className;
    this.setData({
      editClassId: classId,
      editClassType: classType,
      editClassName: className,
      hiddenmodalput: false,
    })
  },

  /**
   * 编辑分类名称（提交）按钮
   */
  btnEditClassNameConfirm: function() {
    that = this;
    console.log("编辑分类名称（提交）按钮", strEditClassName);
    this.setData({
      hiddenmodalput: true
    });
    if (strEditClassName == this.data.editClassName) {
      wx.showToast({
        title: '分类名未修改',
      })
    } else if (!checkClassName(strEditClassName)) {
      showTopTips('分类名格式错误！');
    } else {
      cmdEditClass(this.data.editClassId, this.data.editClass == 'in' ? 1 : 2, strEditClassName);
    }
  },

  /**
   * 编辑分类名称（取消）按钮
   */
  btnEditClassNameCancel: function() {
    console.log("编辑分类名称（取消）按钮");
    strEditClassName = "";
    this.setData({
      hiddenmodalput: true
    });
  },

  /**
   * 编辑分类名称输入框
   */
  inputEditClassName: function(e) {
    strEditClassName = e.detail.value;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var frmType = options.type ? options.type : 0;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * frmType,
          activeIndex: frmType,
        });
      }
    });
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
    that = this;
    initData(function() {
      //更新完成
    });
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
 * 初始化数据
 */
function initData(callback) {
  uid = wx.getStorageSync('user').uid;
  if (!callback) {
    var outClass = getApp().ClassAllData.out;
    var inClass = getApp().ClassAllData.in;
    var defaultClass = getApp().GetDefaultClass();
    console.log('获取分类信息：', defaultClass, inClass, outClass);
    return {
      out: classDataProcess(outClass),
      in: classDataProcess(inClass),
      defaultClass: defaultClass,
    };
  } else {
    getClassData(function(data) {
      var defaultClass = getApp().GetDefaultClass();
      console.log('获取默认分类：', defaultClass);
      that.setData({
        outClassList: classDataProcess(data.out),
        inClassList: classDataProcess(data.in),
        defaultClass: defaultClass,
      })
    });
  }
}

/** 错误提示 */
function showTopTips(text) {
  that.setData({
    showTopTips: true,
    textTopTips: text
  });
  setTimeout(function() {
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
 * 添加分类（收支，分类名称）
 */
function cmdAddClass(classtype, classname) {
  if (!checkClassName(classname)) {
    showTopTips('分类名格式错误！');
    return;
  }
  var addData = {};
  addData.classname = classname;
  addData.classtype = classtype;
  addData.ufid = uid;
  console.log('表单处理后结果：', addData);

  //发送数据加密
  //console.log(JSON.stringify(addData));
  var strData = Base64.encoder(JSON.stringify(addData));

  //发送数据
  wx.showLoading({
    title: '添加分类中',
    success: function() {
      sendClassData(strData, 'add', function(ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //添加分类成功
            wx.showToast({
              title: '添加成功',
            });
            console.log('添加数据完成：', ret);
            //更新分类数据
            initData(function() {
              //更新完成
            });
          } else {
            //添加分类失败
            wx.showModal({
              title: '添加失败',
              content: ret.data[1] ? ret.data[1] : '未知错误？',
              showCancel: false
            })
          }
        } else {
          //未登陆
          getApp().Logout(function(path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
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
    success: function() {
      sendClassData(strData, 'edit', function(ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //编辑分类成功
            wx.showToast({
              title: '编辑分类成功',
            });
            console.log('编辑分类完成：', ret);
            //更新分类数据
            initData(function() {
              //更新完成
            });
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
          getApp().Logout(function(path) {
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
    success: function() {
      sendClassData(strData, 'change', function(ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //转移分类成功
            wx.showToast({
              title: '转移分类成功',
            });
            console.log('转移分类完成：', ret);
            //更新分类数据
            initData(function() {
              //更新完成
            });
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
          getApp().Logout(function(path) {
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
    success: function() {
      sendClassData(strData, 'del', function(ret) {
        wx.hideLoading();
        if (ret.hasOwnProperty('uid') && (ret.uid > 0)) {
          if (ret.hasOwnProperty('data') && ret.data[0]) {
            //删除分类成功
            wx.showToast({
              title: '删除成功',
            });
            console.log('删除分类完成：', ret);
            //更新分类数据
            initData(function() {
              //更新完成
            });
          } else {
            //添加分类失败
            wx.showModal({
              title: '删除分类失败',
              content: ret.data[1] ? ret.data[1] : '未知错误？',
              showCancel: false
            })
          }
        } else {
          //未登陆
          getApp().Logout(function(path) {
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
    url: getApp().Config.URL + '/index.php?s=/Home/Api/aclass',
    method: 'POST',
    data: {
      type: type,
      data: data
    },
    header: header,
    success: function(res) {
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
  getApp().GetClassAllData(parseInt(uid), function(ret, len, data) {
    if (ret) {
      callback(data);
    } else {
      wx.showModal({
        title: '重新登录',
        content: '登录验证已过期，请重新登录。',
        showCancel: false,
        success: function() {
          getApp().Logout(function(path) {
            wx.redirectTo(path);
          });
        }
      });
    }
  });
}

/**
 * 分类数据处理
 */
function classDataProcess(classList) {
  var classJson = [];
  var key = 0;
  for (var i in classList) {
    var classData = getApp().GetClassId(parseInt(classList[i].id));
    // console.log(classData, classList[i].id);
    classData['key'] = key++;
    classData['money'] = getApp().ValueToMoney(parseFloat(classData['money']));
    classJson.push(classData);
  }
  return classJson;
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
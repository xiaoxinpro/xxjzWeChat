// edit.js

var that;
var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')
var Image = require('../../utils/image.js')
var varId = 0;
var varAccount = null;
var videoAd = null;
var arrUpload = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    textTopTips: "错误提示",

    typeName: "类型",
    typeValue: "支出",
    typeId: '2',
    typeItems: [{
        name: '支出',
        value: '2',
        checked: true
      },
      {
        name: '收入',
        value: '1'
      }
    ],

    money: "",

    isHiddenFunds: true,

    ClassIndex: 0,
    ClassList: [{
      id: 0,
      name: "123"
    }],

    mark: "",

    date: "",
    dateStr: "",

    files: [],

    adFunctionConfig: getApp().AdFunctionConfig,
    imageConfig: getApp().ImageConfig,
  },

  /**
   * 收支选择事件
   */
  typeChange: function(e) {
    var typeValue = "";
    var typeId = 2;
    var typeItems = this.data.typeItems;
    for (var i in typeItems) {
      typeItems[i].checked = typeItems[i].value == e.detail.value;
      if (typeItems[i].checked) {
        typeValue = typeItems[i].name;
        typeId = typeItems[i].value;
      }
    }

    that = this;
    getClass(typeValue);
    getFunds();

    this.setData({
      typeItems: typeItems,
      typeValue: typeValue,
      typeId: typeId,
    });
  },

  /**
   * 资金账户改变事件
   */
  bindFundsChange: function(e) {
    this.setData({
      FundsIndex: e.detail.value
    })
  },

  /**
   * 分类改变事件
   */
  bindClassChange: function(e) {
    this.setData({
      ClassIndex: e.detail.value
    })
  },

  /**
   * 日期改变事件
   */
  bindDateChange: function(e) {
    var date = new Date(e.detail.value);
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    this.setData({
      date: e.detail.value,
      dateStr: "" + year + "年" + month + "月" + day + "日"
    })
  },
  
  /**
   * 增加可上传文件数量按钮
   */
  bindAddFileCount: function(e) {
    that = this;
    showAd();
  },

  /**
   * 图片加载完毕事件
   */
  bindImageLoad: function (res) {
    const id = res.currentTarget.dataset.id;
    let files = this.data.files;
    files[id].loading = false;
    files[id].percent = 100;
    this.setData({ files: files });
  },

  /**
   * 图片加载失败事件
   */
  bindImageError: function (res) {
    const id = res.currentTarget.dataset.id;
    let files = this.data.files;
    files[id].loading = false;
    files[id].percent = -1;
    this.setData({ files: files });
  },

  /**
   * 图片长按弹出删除菜单
   */
  bindImageLong: function (ret) {
    that = this;
    const index = ret.currentTarget.dataset.id;
    console.log('长按图片：', ret, arrUpload);
    wx.showActionSheet({
      itemList: ['删除图片'],
      itemColor: '#F00',
      success: function (res) {
        if (res.tapIndex === 0) {
          wx.showLoading({
            title: '删除中',
            success: function () {
              console.log('正在删除：', arrUpload[index]);
              Image.remove(arrUpload[index].acid, arrUpload[index].id, function (params) {
                wx.hideLoading();
                if (params.data.ret) {
                  arrUpload.splice(index, 1);
                  that.data.files.splice(index, 1);
                  that.setData({
                    files: that.data.files,
                  });                  
                } else {
                  wx.showModal({
                    title: '删除失败',
                    content: params.data.msg,
                    showCancel: false,
                  });
                }
              });
            }
          });
        }
      }
    })
  },

  /**
   * 上传图片按钮事件
   */
  chooseImage: function (e) {
    var that = this;
    var files = that.data.files;
    var image = that.data.imageConfig;
    if (files.length >= image.maxCount) {
      wx.showModal({
        title: '无法上传',
        content: '可上传数量已满，无法继续上传。',
        showCancel: false,
      })
      return;
    } else if (files.length >= image.freeCount) {
      wx.showModal({
        title: '上传受限',
        content: '免费上传图片数量已用完，可长按图片删除已有图片，或观看一次视频广告增加上传次数。',
        cancelText: '取消上传',
        confirmText: '观看广告',
        success(res) {
          if (res.confirm) {
            showAd();
          }
        }
      })
      return;
    }
    console.log('可上传文件数量：', image.freeCount - files.length);
    wx.chooseImage({
      count: image.freeCount - files.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let files = that.data.files;
        res.tempFilePaths.forEach(fileUrl => {
          files.push({
            url: fileUrl,
            loading: true,
            percent: 0,
          })
        });
        that.setData({
          files: files
        }, () => {
          Image.upload(varId, res.tempFilePaths, function (ret) {
            console.log('上传图片事件：', ret);
            if (ret.isDone) {
              if (parseInt(ret.data.uid) > 0) {
                arrUpload.push(ret.data.upload.pop())
              } else {
                wx.showModal({
                  title: '上传失败',
                  content: ret.data.data,
                  showCancel: false,
                })
              }
            }
          })
        });
      }
    })
  },

  /**
   * 浏览图片事件
   */
  previewImage: function (e) {
    let filesUrl = [];
    this.data.files.forEach(file => {
      filesUrl.push(file.url);
    });
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: filesUrl // 需要预览的图片http链接列表
    })
  },

  /**
   * 提交表单
   */
  submit: function(e) {
    that = this;
    // console.log("提交编辑数据：", e.detail.value);
    //获取表单并转换数据
    var DataObj = e.detail.value;
    DataObj['edit_funds'] = that.data.FundsList.value[DataObj['edit_funds']];
    DataObj['edit_class'] = that.data.ClassList.value[DataObj['edit_class']];
    if (that.data.typeValue == '收入') {
      DataObj['edit_type'] = 1;
    } else if (that.data.typeValue == '支出') {
      DataObj['edit_type'] = 2;
    } else {
      DataObj['edit_type'] = 0;
    }

    //整理发送内容
    var EditData = {};
    EditData.acid = varId;
    EditData.acmoney = DataObj['edit_money'];
    EditData.fid = DataObj['edit_funds'];
    EditData.acclassid = DataObj['edit_class'];
    EditData.actime = DataObj['edit_time'];
    EditData.acremark = DataObj['edit_mark'];
    EditData.zhifu = DataObj['edit_type'];
    console.log('表单处理后结果：', EditData);

    //验证表单数据
    if (!cheakEditData(EditData)) {
      return;
    }

    //发送数据加密
    var strData = Base64.encoder(JSON.stringify(EditData));

    //发送数据
    wx.showLoading({
      title: '编辑中',
      success: function() {
        sendEditData(strData, function(ret) {
          wx.hideLoading();
          if (ret) {
            if (ret.uid) {
              if (ret.data.ret) {
                //显示记账完成提示框
                wx.showToast({
                  title: '编辑完成',
                });
                //设定列表更新标志
                getApp().listUpdata.isUpdata = true;
                //延时页面跳转
                setTimeout(function() {
                  wx.navigateBack({
                    delta: 1
                  });
                }, 500);
              } else {
                //记账失败
                wx.showModal({
                  title: '编辑失败',
                  content: ret.data.msg,
                  showCancel: false
                })
              }
            } else {
              wx.showToast({
                title: '未登录',
              });
            }
          }
        });
      }
    });

  },

  /**
   * 删除按钮
   */
  bindDelete: function() {
    wx.showModal({
      title: '确认删除',
      content: '你确定要删除该账单？',
      confirmText: '删除',
      confirmColor: '#E64340',
      success: function(res) {
        if (res.confirm) {
          //触发删除命令
          var EditData = {};
          EditData.acid = varId;
          var strData = Base64.encoder(JSON.stringify(EditData));
          wx.showLoading({
            title: '删除中',
            success: function() {
              sendDelData(strData, function(ret) {
                wx.hideLoading();
                if (ret) {
                  if (ret.uid) {
                    if (ret.data.ret) {
                      //显示记账完成提示框
                      wx.showToast({
                        title: '删除成功',
                      });
                      //设定列表更新标志
                      getApp().listUpdata.isUpdata = true;
                      //延时页面跳转
                      setTimeout(function() {
                        wx.navigateBack({
                          delta: 1
                        });
                      }, 500);
                    } else {
                      //记账失败
                      wx.showModal({
                        title: '删除失败',
                        content: ret.data.msg,
                        showCancel: false
                      })
                    }
                  } else {
                    wx.showToast({
                      title: '未登录',
                    });
                  }
                }
              });
            }
          });
        }
      }
    })
  },

  /**
   * 返回按钮
   */
  bindBack: function() {
    getApp().listUpdata.isUpdata = false;
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    //加载页面数据
    varId = parseInt(options.id);

    //验证页面数据
    if (isNaN(varId) || varId == 0) {
      console.log("加载页面数据错误: id=", varId);
      wx.showModal({
        title: '加载页面错误',
        content: '页面传输的数据有误，无法初始化页面，请返回。',
        showCancel: false,
        confirmText: "返回",
        success: function() {
          wx.navigateBack({
            delta: 1
          });
        }
      });
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
    //获取页面数据
    wx.showLoading({
      title: '加载中',
    });
    var jsonData = {};
    jsonData.type = 'get_id';
    jsonData.data = Base64.encoder(JSON.stringify({
      acid: varId,
      jiid: wx.getStorageSync('user').uid
    }));
    getIdData(jsonData, function (ret) {
      //初始化表单
      varAccount = ret['data'];
      initForm(varAccount);
      wx.hideLoading();
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

/** 初始化表单 */
function initForm(objData, isReload = true) {
  var typeValue = "";
  var typeItems = that.data.typeItems;

  for (var i in typeItems) {
    typeItems[i].checked = typeItems[i].value == objData.zhifu;
  }

  if (objData.zhifu == '1') {
    typeValue = '收入';
  } else { //支出 
    typeValue = '支出';
  }
  getClass(typeValue, objData.acclassid);

  getFunds(objData.fid);

  var files = [];
  if (isReload) {
    that.setData({
      typeValue: typeValue,
      typeItems: typeItems,
      typeId: parseInt(objData.zhifu),
      money: objData.acmoney,
      mark: objData.acremark,
      date: objData.actime,
      dateStr: util.strDateFormat(objData.actime, 'yyyy年m月d日'),
      adFunctionConfig: getApp().AdFunctionConfig,
      files: [],
    }, Image.get(varId, function (retFiles) {
      if (retFiles.uid > 0) {
        retFiles.data.forEach(item => {
          arrUpload.push(item);
          files.push({
            id: item.id,
            url: '',
            loading: true,
            percent: 0,
          });
        });
        var imageConfig = that.data.imageConfig;
        if (imageConfig.freeCount < arrUpload.length) {
          imageConfig.freeCount = arrUpload.length;
        }
        that.setData({
          files: files,
          imageConfig: imageConfig,
        }, Image.download(retFiles.data, function (retImage) {
          for (let index = 0; index < files.length; index++) {
            if (files[index].id === retImage.id) {
              files[index].url = retImage.path;
            }
          }
          that.setData({
            files: files,
          });
        }));
      } else {
        console.log('图片获取失败：', retFiles);
      }
    }));
  }
}


/** 获取资金账户 */
function getFunds(fundsid) {
  var FundsIndex = 0;
  var FundsObj = wx.getStorageSync('Funds');
  var FundsList = {
    value: [],
    name: []
  };
  for (var i in FundsObj) {
    if (FundsObj[i]) {
      FundsList.value.push(parseInt(FundsObj[i].id));
      FundsList.name.push(FundsObj[i].name);
      if (parseInt(FundsObj[i].id) == fundsid) {
        FundsIndex = FundsList.value.length - 1;
      }
    }
  }
  console.log('加载资金账户数据:', FundsList);
  that.setData({
    FundsIndex: FundsIndex,
    FundsList: FundsList,
    isHiddenFunds: (FundsList.name.length <= 1),
  });
}

/** 获取分类(收支类别) */
function getClass(type, classId) {
  var classIndex = 0;
  if (type == '收入') {
    var ClassObj = getApp().ClassAllData.in;
  } else {
    var ClassObj = getApp().ClassAllData.out;
  }
  var ClassList = {
    value: [],
    name: []
  };
  for (var i in ClassObj) {
    ClassList.value.push(parseInt(ClassObj[i].id));
    ClassList.name.push(ClassObj[i].name);
    if (parseInt(classId) == parseInt(ClassObj[i].id)) {
      classIndex = ClassList.value.length - 1;
    }
  }
  console.log('加载分类数据:', ClassList, classIndex);
  that.setData({
    ClassIndex: classIndex,
    ClassList: ClassList,
  });
}

/** 获取网络数据 */
function getIdData(jsonData, callback) {
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
    url: getApp().Config.URL + '/index.php?s=/Home/Api/account',
    method: 'GET',
    data: jsonData,
    header: header,
    success: function(res) {
      console.log('获取记账id数据：', res);
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

/** 加载激励广告组件 */
function loadAd(callback) {
  if (wx.createRewardedVideoAd) {
    wx.showLoading({
      title: '加载中',
      success: function () {
        videoAd = wx.createRewardedVideoAd({
          adUnitId: 'adunit-7ccaa4a589fd311a'
        });
        console.log(videoAd);
        videoAd.onLoad(() => {
          console.log("激励广告加载完成！");
          callback({
            enable: true,
            error: '加载完成',
          });
          wx.hideLoading();
          videoAd.offLoad();
        })
        videoAd.onError((err) => {
          console.log('激励广告加载失败:', err);
          callback({
            enable: false,
            error: err.errMsg,
          });
          wx.hideLoading();
        })
        videoAd.onClose((res) => {
          console.log('激励广告关闭事件:', res);
          if (res.isEnded) {
            let config = that.data.imageConfig;
            if (config.freeCount < config.maxCount) {
              config.freeCount += 1;
            }
            that.setData({
              imageConfig: config,
            });
          }
        })
      }
    });
  } else {
    callback({
      enable: false,
      error: '微信版本过低，部分组件无法加载，请升级微信再试。',
    });
  }
}

/** 显示广告 */
function showAd() {
  if (videoAd == null) {
    loadAd(function (ret) {
      if (ret.enable) {
        showAd();
      } else {
        videoAd = null;
        wx.showModal({
          title: '无法增加',
          content: ret.error,
          showCancel: false,
        });
      }
    });
  } else {
    videoAd.show().catch(() => {
      // 失败重试
      videoAd.load()
        .then(() => videoAd.show())
        .catch(err => {
          wx.showModal({
            title: '无法增加',
            content: '广告显示失败，请关闭后再试。',
            showCancel: false,
          });
        })
    });
  }
}

/** 错误提示 */
function showTopTips(text) {
  //var that = this;
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

/** 校验记账数据 */
function cheakEditData(data) {
  if (!util.cheakMoney(data['acmoney'])) {
    showTopTips("请输入一个有效的金额!");
    return false;
  }

  if (!util.cheakClass(data['acclassid'])) {
    showTopTips("请务必选择一个有效分类，若没有分类请先新建分类！");
    return false;
  }

  if (!util.cheakMark(data['acremark'])) {
    showTopTips("备注信息不能为空!");
    return false;
  }

  if (!util.cheakTime(data['actime'])) {
    showTopTips("时间格式有误，请重新输入!");
    return false;
  }

  return true;
}

/** 发送记账数据(data数组, 回调函数) */
function sendEditData(data, callback) {
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
    url: getApp().Config.URL + '/index.php?s=/Home/Api/account',
    method: 'POST',
    data: {
      type: 'edit',
      data: data
    },
    header: header,
    success: function(res) {
      console.log('发送编辑POST：', res);
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

/** 发送删除记账命令(data数组, 回调函数) */
function sendDelData(data, callback) {
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
    url: getApp().Config.URL + '/index.php?s=/Home/Api/account',
    method: 'POST',
    data: {
      type: 'del',
      data: data
    },
    header: header,
    success: function(res) {
      console.log('发送删除POST：', res);
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
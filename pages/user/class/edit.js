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
    selectClassId: 0,

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
    var ClassData = getClassSetData(ClassId, typeId);
    console.log(e, ClassData);
    if (ClassData) {
      this.setData(ClassData);
    }
  },

  /**
   * 返回按钮
   */
  bindBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 分类选择列表
   */
  bindClassChange: function(res) {
    this.setData({
      selectClassId: res.detail.value
    });
  },

  /**
   * 分类编辑事件
   */
  submit_edit: function(res) {
    that = this;
    var newClassName = res.detail.value.Class_name;
    var newClassType = res.detail.value.Class_type;
    var ClassData = getApp().GetClassId(ClassId);
    if (ClassData.name != newClassName) {
      
    }
    if (ClassData.type != newClassType) {

    }
  },

  /**
   * 设为默认分类按钮事件
   */
  bindDefault: function() {
    var ClassData = getApp().GetClassId(ClassId);
  },

  /**
   * 分类删除事件
   */
  submit_delete: function(res) {
    that = this;
    wx.showModal({
      title: '确认转移并删除',
      content: '请仔细核对删除与转移的分类，确认后不可恢复！',
      confirmText: '确认',
      confirmColor: '#e51c23',
      success(ret) {
        if (ret.confirm) {
          cmdDeleteClass(that.data.ClassList.id[res.detail.value.Class_id])
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    uid = wx.getStorageSync('user').uid;
    ClassId = options.id;
    var ClassData = getClassSetData(ClassId);
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
function getClassSetData(classId, typeId = false) {
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

  var ClassList = { 'id': [], 'name': [], 'type': [] };
  for (var i in ClassArr) {
    if (ClassArr[i].id == ClassId) {
      continue;
    } else {
      ClassList.id.push(ClassArr[i].id);
      ClassList.name.push(ClassArr[i].name);
      ClassList.type.push(ClassArr[i].type)
    }
  }

  if(ClassData) {
    return {
      typeItems: typeItems,
      ClassCount: parseInt(ClassData.count),
      ClassName: ClassData.name,
      ClassList: ClassList
    };
  } else {
    return null;
  }
}
// find.js
var that;
var Base64 = require('../../utils/base64.js')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    textTopTips: "错误提示",

    typeName: "类型",
    typeIndex: 0,
    typeItems: {
      name: ['全部', '收入', '支出',],
      value: [0, 1, 2],
    },

    money: "",

    ClassIndex: 0,
    ClassHide: true,
    ClassList: { value: [], name: [] },

    mark: "",

    dateStart: "",
    dateStartStr: "",
    dateEnd: "",
    dateEndtStr: "",
  },

  /**
   * 收支改变事件
   */
  bindTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value,
      ClassHide: e.detail.value == 0,
      ClassIndex: 0,
      ClassList: getClass(e.detail.value)
    })
  },

  /**
   * 分类改变事件
   */
  bindClassChange: function (e) {
    this.setData({
      ClassIndex: e.detail.value
    })
  },

  /**
   * 开始日期改变事件
   */
  bindStartDateChange: function (e) {
    this.setData({
      dateStart: e.detail.value,
      dateStartStr: DateToStr(e.detail.value)
    })
  },

  /**
   * 结束日期改变事件
   */
  bindEndDateChange: function (e) {
    this.setData({
      dateEnd: e.detail.value,
      dateEndStr: DateToStr(e.detail.value)
    })
  },

  /**
   * 清除文本按钮事件
   */
  bindResiteInput: function (event) {
    var value = event.currentTarget.dataset.value;
    var obj = {};
    if (value) {
      obj[value] = "";
      this.setData(obj);
    }
    console.log(event, value, obj);
  },

  /**
   * 提交表单
   */
  submit: function (e) {
    that = this;

    //获取表单并转换数据
    var DataObj = e.detail.value;
    DataObj['find_class'] = that.data.ClassList.value[DataObj['find_class']];

    //整理发送内容
    var FindData = {};
    FindData.jiid = wx.getStorageSync('user').uid;
    if (DataObj['find_type'] !== 0) {
      FindData.zhifu = parseInt(DataObj['find_type']);
      if (DataObj['find_class'] !== 0) {
        FindData.acclassid = parseInt(DataObj['find_class']);
      }
    }
    if (DataObj['find_start_time']) {
      FindData.starttime = DataObj['find_start_time'];
    }
    if (DataObj['find_end_time']) {
      FindData.endtime = DataObj['find_end_time'];
    }
    if (DataObj['find_mark']) {
      FindData.acremark = DataObj['find_mark'];
    }
    console.log('搜索表单处理后结果：', FindData);

    var strData = Base64.encoder(JSON.stringify(FindData));
    strData = strData.replace(/=/g,';');
    console.log('搜索表单数据串：'+ strData);
    wx.navigateTo({
      url: '../list/find?strData=' + strData,
    })
  },

  /**
   * 重置按钮事件
   */
  bindResite: function () {
    initForm();
  },

  /**
   * 返回主页
   */
  gotoMain: function () {
    wx.switchTab({ url: 'main' });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    initForm();
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

/** 初始化表单 */
function initForm() {
  that.setData({
    typeIndex: 0,
    ClassIndex: 0,
    ClassHide: true,
    mark: "",
    dateStart: "",
    dateStartStr: "",
    dateEnd: "",
    dateEndtStr: "",
  });
}

/** 获取分类(收支类别) */
function getClass(type) {
  var ClassList = { value: [0], name: ['全部'] };
  if (type == 1) {
    var ClassObj = wx.getStorageSync('inClass');
  } else if (type == 2) {
    var ClassObj = wx.getStorageSync('outClass');
  } else {
    return ClassList;
  }

  for (var i in ClassObj) {
    ClassList.value.push(parseInt(i));
    ClassList.name.push(ClassObj[i]);
  }
  console.log('加载分类数据:', ClassList);
  return ClassList;
}

/** 日期格式转字符串 */
function DateToStr(d) {
  var date = new Date(d);
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return ("" + year + "年" + month + "月" + day + "日");
}

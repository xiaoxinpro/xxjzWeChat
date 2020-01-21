// pages/user/main.js
var that = this;
var app = getApp();
var TopList = app.MainConfigTopList;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    TopListIndex: 0,
    TopList: {},

    TypeItems: [
      { name: '支出', value: '2', checked: true },
      { name: '收入', value: '1', checked: false},
    ],
  },

  /**
   * 顶部列表改变
   */
  bindTopList: function (e) {
    const index = parseInt(e.detail.value);
    console.log('顶部列表变更为：', this.data.TopList.name[index], this.data.TopList.id[index]);
    app.SetMainTopIndex(index);
    this.setData({
      TopListIndex: index,
    })
  },

  /**
   * 默认类别改变事件
   */
  bindTypeChange: function (e) {
    var typeItems = this.data.TypeItems;
    for (var i in typeItems) {
      typeItems[i].checked = typeItems[i].value == e.detail.value;
      if (typeItems[i].checked) {
        app.SetMainTypeId(typeItems[i].value);
      }
    }
    this.setData({
      TypeItems: typeItems,
    });
  },

  /**
   * 返回按钮
   */
  bindBack: function (e) {
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    that = this;
    InitShow();
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
 * 初始化显示
 */
function InitShow() {
  var topList = {name:[], id:[]};
  var topIndex = 1;
  var topId = app.MainPageConfig.top;
  for (let index = 0; index < TopList.name.length; index++) {
    topList.name[index] = TopList.name[index] + "收支";
    topList.id[index] = TopList.id[index];
    if(topId == topList.id[index]) {
      topIndex = index;
    }
  }

  var typeId = app.GetMainTypeId();
  var typeItems = that.data.TypeItems;
  for (let i = 0; i < typeItems.length; i++) {
    typeItems[i].checked = typeItems[i].value == typeId;
  }

  that.setData({
    TopListIndex: topIndex,
    TopList: topList,
    TypeItems: typeItems,
  });
}
// pages/tool/aromaLamp.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    colorItems: [
      {name: '冷光',value: '0',checked: true},
      {name: '暖光',value: '1'},
      {name: '冷暖光',value: '3'}
    ],

  },

  /**
   * 色温选择事件
   */
  colorChange: function(e) {
    var colorItems = this.data.colorItems;
    for (var i in colorItems) {
      colorItems[i].checked = colorItems[i].value == e.detail.value;
      if (colorItems[i].checked) {
        //获取选择色温
      }
    }
    // 更新UI
    this.setData({
      colorItems: colorItems,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '香薰灯'
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
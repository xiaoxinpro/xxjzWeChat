// pages/tool/site.js
var id = 0;
var tid = 0;
var tName = '+';
var tButton = 'none';
var toolConfig = {};
var toolNames = ['空', '好评工具', '其他'];
var toolPages = [
  '../tool/site',
  '../tool/goodEvaluate',
  '../tool/goodEvaluate',
];
var buttons = [
  { value: 'none', checked: true },
  { value: 'primary', checked: false },
  { value: 'success', checked: false },
  { value: 'info', checked: false },
  { value: 'warning', checked: false },
  { value: 'danger', checked: false },
];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    toolCodes: toolNames,
    toolCodeIndex: 0,
    toolName: tName,
    toolButton: tButton,
    toolButtons: buttons,
  },

  /**
   * 工具选择栏
   */
  bindtoolCodeChange: function(e) {
    tid = parseInt(e.detail.value);
    tName = toolNames[tid];
    console.log(e)
    if(tid == 0){
      tName = "+"
    }
    this.setData({
      toolName: tName,
      toolCodeIndex: tid,
    });
  },

  /**
   * 样式按钮选择
   */
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);

    var radioItems = this.data.toolButtons;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }

    this.setData({
      toolButtons: radioItems,
      toolButton: e.detail.value
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    id = parseInt(options.id);
    toolConfig = getApp().GetMainToolConfig()[id];
    tid = toolConfig.tid;
    tName = toolConfig.name;
    tButton = toolConfig.button;
    this.setData({
      id: id + 1,
      toolCodeIndex: tid,
      toolName: toolConfig.name,
      toolButton: toolConfig.button,
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
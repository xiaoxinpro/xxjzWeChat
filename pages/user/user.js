// user.js
var that = this;
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var strModalInput = "";
var strModalType = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //页面相关
    tabs: ["帐号相关", "密码修改", "邮箱变更"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,

    //Modal相关
    hiddenModal: true,
    titleModal: "标题",
    inputName: "",

    //账号相关
    avatarPath: "",
    userName: "",
    email: "",
    autoCopy: "",
  },

  /**
   * 点击标签事件
   */
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  /**
   * 跳转到邮箱标签
   */
  tabEmail: function (e) {
    that = this;
    goTab(2);
  },

  /**
   * 修改用户名
   */
  changeUsername: function (strData) {
    console.log("修改用户名：", strData);
  },

  /**
   * 打开Modal弹窗
   */
  openModal: function (e) {
    console.log("打开Modal弹窗", e.currentTarget.dataset);
    var title = e.currentTarget.dataset.title || "";
    strModalInput = e.currentTarget.dataset.value || "";
    strModalType = e.currentTarget.dataset.type;
    this.setData({
      titleModal: title,
      inputName: strModalInput,
      hiddenModal: false,
    })
  },

  /**
   * Modal弹窗确定按钮事件
   */
  btnModalConfirm: function () {
    that = this;
    console.log("Modal弹窗确定按钮事件", strModalInput);
    this.setData({
      hiddenModal: true
    });
    this[strModalType](strModalInput);
  },

  /**
   * Modal弹窗取消按钮事件
   */
  btnModalCancel: function () {
    console.log("Modal弹窗取消按钮");
    strModalInput = "";
    this.setData({
      hiddenModal: true
    });
  },

  /**
   * Modal弹窗输入框
   */
  inputModal: function (e) {
    strModalInput = e.detail.value;
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    goTab(options.type ? options.type : 0);
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
    initPage();
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
 * 初始化页面
 */
function initPage() {
  var avatarPath = wx.getStorageSync('avatarPath');
  var autoCopyString = wx.getStorageSync('autoCopyString');
  var user = wx.getStorageSync('user');
  var autoCopy = (autoCopyString.enable || autoCopyString.enablePullDown) ? "已开启" : "未开启";
  that.setData({
    avatarPath: avatarPath,
    userName: user.username,
    email: user.email,
    autoCopy: autoCopy,
  });
}

/**
 * 转到指定标签
 */
function goTab(frmType) {
  wx.getSystemInfo({
    success: function (res) {
      that.setData({
        sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
        sliderOffset: res.windowWidth / that.data.tabs.length * frmType,
        activeIndex: frmType
      });
    }
  });
}


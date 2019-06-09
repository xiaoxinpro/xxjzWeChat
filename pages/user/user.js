// user.js
var that = this;
var strModalInput = "";
var strModalType = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {

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
   * 修改头像
   */
  changeAvatar: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        wx.redirectTo({
          url: `./site/avatar?src=${res.tempFilePaths[0]}`
        });
      },
      complete: function (res) {
        console.log(res);
      },
    });
  },

  /**
   * 跳转到邮箱标签
   */
  tabEmail: function (e) {
    that = this;
    wx.showModal({
      title: '邮箱不可修改',
      content: '邮箱为验证用户的唯一标示，如要求修改请联系管理员。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 修改用户名
   */
  changeUsername: function (strData) {
    // that = this;
    // var pattern = /[A-Za-z0-9_\-\u4e00-\u9fa5]{2,12}/, str = strData;
    // console.log("修改用户名：", strData, pattern.test(str));
    // if (!pattern.test(str)) {
    //   wx.showModal({
    //     title: '修改失败',
    //     content: '输入的用户名格式错误！',
    //     showCancel: false,
    //     confirmText: '知道了'
    //   });
    // } else {
    // //跳转至修改名字页面
    // wx.navigateTo({ url: './site/username' });
    // }
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



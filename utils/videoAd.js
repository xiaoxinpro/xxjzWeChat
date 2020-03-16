
var videoAd = null;

/** 加载激励广告组件 */
function loadAd(callback) {
  if (wx.createRewardedVideoAd) {
    videoAd = wx.createRewardedVideoAd({
      adUnitId: 'adunit-7ccaa4a589fd311a'
    })
    videoAd.onLoad(() => {
      console.log("激励广告加载完成！");
      callback({
        status: 'load',
        message: '广告组件加载完成',
      });
      videoAd.offLoad();
    })
    videoAd.onError((err) => {
      console.log('激励广告加载失败:', err);
      callback({
        status: 'error',
        message: err.errMsg,
      });
    })
    videoAd.onClose((res) => {
      console.log('激励广告关闭事件:', res);
      if (res.isEnded) {
        callback({
          status: 'finsh',
          message: '广告观看完成',
        });
      }
    })
  } else {
    callback({
      status: 'error',
      message: '微信版本过低，部分组件无法加载，请升级微信再试。',
    });
  }
}

/** 显示广告 */
function showAd() {
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

/** 开始执行 */
function startAd(callback) {
  if (videoAd) {
    showAd();
  } else {
    wx.showLoading({
      title: '加载广告',
      success: function () {
        loadAd(function (res) {
          wx.hideLoading();
          if (res.status == 'load') {
            showAd();
          } else if (res.status == 'error') {
            videoAd = false;
            wx.showModal({
              title: '无法增加',
              content: res.error,
              showCancel: false,
            });
          } else {
            callback(videoAd);
          } 
        });
      }
    });
  }
}

export const start = startAd;

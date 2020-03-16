export class VideoAd {

  constructor() {
    this.videoAd = null;
  }

  /** 加载激励广告组件 */
  loadAd = (callback) => {
    var that = this;
    if (wx.createRewardedVideoAd) {
      that.videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-7ccaa4a589fd311a'
      })
      that.videoAd.onLoad(() => {
        console.log("激励广告加载完成！");
        callback({
          status: 'load',
          message: '广告组件加载完成',
        });
        that.videoAd.offLoad();
      })
      that.videoAd.onError((err) => {
        console.log('激励广告加载失败:', err);
        callback({
          status: 'error',
          message: err.errMsg,
        });
      })
      that.videoAd.onClose((res) => {
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
  showAd = () => {
    var that = this;
    that.videoAd.show().catch(() => {
      // 失败重试
      that.videoAd.load()
        .then(() => that.videoAd.show())
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
  start = (callback) => {
    var that = this;
    if (that.videoAd) {
      that.showAd();
    } else {
      wx.showLoading({
        title: '加载广告',
        success: function () {
          that.loadAd(function (res) {
            wx.hideLoading();
            if (res.status == 'load') {
              that.showAd();
            } else if (res.status == 'error') {
              that.videoAd = false;
              wx.showModal({
                title: '无法增加',
                content: res.error,
                showCancel: false,
              });
            } else {
              callback(that.videoAd);
            } 
          });
        }
      });
    }
  }

  close = () => {
    if (this.videoAd) {
      try {
        this.videoAd.offLoad();
        this.videoAd.offError();
        this.videoAd.offClose();
        if (this.videoAd.destroy) {
          this.videoAd.destroy(function () {
            this.videoAd = null;
          });
        } else {
          this.videoAd = null;
        }
      } catch (error) {
        console.log('强制销毁广告实例', error);
      }
    }
  }
}

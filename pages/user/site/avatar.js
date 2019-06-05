// pages/user/site/avatar.js
import WeCropper from '../../../we-cropper/we-cropper.js'

const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 75

Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      },
      boundStyle: {
        color: 'rgba(0, 0, 0, 0.95)',
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      }
    }
  },
  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage() {
    this.cropper.getCropperImage(function (path, err) {
      if (err) {
        wx.showModal({
          title: '温馨提示',
          content: err.message
        })
      } else {
        console.log(path);
        SaveAvatarFile(path);
      }
    })
  },
  getDefaultImage() {
    wx.removeStorageSync('avatarPath');
    wx.navigateBack();
  },
  uploadTap() {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有['original', 'compressed']
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值
        self.cropper.pushOrign(src)
      }
    })
  },
  onLoad(option) {
    const {
      cropperOpt
    } = this.data

    cropperOpt.boundStyle.color = 'rgba(0, 0, 0, 0.95)'

    this.setData({
      cropperOpt
    })

    if (option.src) {
      cropperOpt.src = option.src
      this.cropper = new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
          // console.log(`wecropper is ready for work!`)
        })
        .on('beforeImageLoad', (ctx) => {
          // console.log(`before picture loaded, i can do something`)
          // console.log(`current canvas context:`, ctx)
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          // console.log(`picture loaded`)
          // console.log(`current canvas context:`, ctx)
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
          // console.log(`before canvas draw,i can do something`)
          // console.log(`current canvas context:`, ctx)
        })
    }
  }
})

function SaveAvatarFile(path) {
  wx.saveFile({
    tempFilePath: path,
    success: function (res) {
      //获取旧头像并删除
      var avatarPath = wx.getStorageSync('avatarPath');
      if (avatarPath) {
        wx.removeSavedFile({
          filePath: avatarPath,
        });
      }

      //更新新头像配置
      avatarPath = res.savedFilePath;
      console.log(avatarPath);
      wx.setStorage({
        key: 'avatarPath',
        data: avatarPath,
      });

      //提示成功并延时&返回
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 800,
        success: function () {
          setTimeout(function () {
            wx.navigateBack();
          }, 800);
        }
      });
    },
    fail: function (err) {
      console.log('保存文件失败：', err);
      wx.getSavedFileList({
        success(res) {
          for (var path in res.fileList) {
            console.log('文件路径：', res.fileList[path].filePath);
            wx.removeSavedFile({
              filePath: res.fileList[path].filePath,
            });
          }
        }
      });
    }
  });
}

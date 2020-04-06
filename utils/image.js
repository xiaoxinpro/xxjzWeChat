import { encoder } from './base64.js';

/** 获取Header */
function getHeader() {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  return header;
}

/** 下载图片 */
function downloadImage(info, callback, isCDN = true) {
  const config = getApp().ImageConfig;
  var imageUrl = getApp().URL + config.path + '/' + info.savepath + info.savename;
  if (isCDN && config.cdn.indexOf('http') === 0) {
    imageUrl = imageUrl.replace(getApp().URL, config.cdn);
  }
  console.log('当前待下载图片URL：', imageUrl);
  wx.getImageInfo({
    src: imageUrl,
    success (res) {
      info.path = res.path;
      console.log('图片下载成功：', info);
      callback(info);
    }, 
    fail (res) {
      console.log('图片下载失败：', res);
      if (isCDN) {
        downloadImage(info, function (ret) {
          callback(ret);
        }, false);
      } else {
        //图片下载失败
      }
    }
  })
}

/** 下载服务器图片 */
function downloadServerImage(arrFiles, callback) {
  var delay = 100;
  arrFiles.forEach(item => {
    setTimeout(function () {
      downloadImage(item, function (ret) {
        callback(ret);
      });
    }, delay);
    delay += 100;
  });
}

/** 获取服务器图片 */
function getServerImage(acid, callback) {
  wx.request({
    url: getApp().URL + '/index.php?s=/Home/Api/account',
    method: 'GET',
    data: { type: 'get_image', data: encoder(JSON.stringify({acid: acid}))},
    header: getHeader(),
    success: function (res) {
      console.log('获取服务器图片Get：', res);
      if (res.hasOwnProperty('data') && res.data.hasOwnProperty('data') && res.data.data.hasOwnProperty('ret')) {
        if (res.data.data.ret == true) {
          callback({
            uid: res.data.uid,
            data: res.data.data.msg,
          });
        }
      } else {
        console.warn('获取图片时发未知错误:', res);
        callback({
          uid: 0,
          data: '获取图片时发未知错误请联系管理员。'
        });
      }
    }
  });
}

/** 删除服务器图片 */
function delServerImage(acid, id, callback) {
  wx.request({
    url: getApp().URL + '/index.php?s=/Home/Api/account',
    method: 'POST',
    data: { type: 'del_image', data: encoder(JSON.stringify({acid: acid, id: id}))},
    header: getHeader(),
    success: function (res) {
      console.log('删除服务器图片Post：', res);
      if (res.hasOwnProperty('data')) {
        let ret = res['data'];
        callback(ret);
      } else {
        callback({
          uid: 0,
          data: err['msg'] + '（请联系管理员）'
        });
      }
    }
  });
}

/** 上传图片 */
function uploadImage(acid, filesUrl, callback, cnt = 0) {
  if (cnt < filesUrl.length) {
    let file = filesUrl[cnt];
    wx.uploadFile({
      url: getApp().URL + '/index.php?s=/Home/Add/upload',
      name: 'file[]',
      filePath: file,
      formData: {acid: acid},
      header: getHeader(),
      success(res) {
        callback({
          index: cnt,
          isDone: true,
          isError: false,
          data: JSON.parse(res.data),
        })
      },
      fail(res) {
        console.log('上传失败：', res);
        callback({
          index: cnt,
          isDone: false,
          isError: true,
          data: res.errMsg,
        })
      },
      complete(res) {
        uploadImage(acid, filesUrl, callback, cnt + 1);
      }
    });
  }
}

export const get = getServerImage;
export const remove = delServerImage;
export const upload = uploadImage;
export const download = downloadServerImage;
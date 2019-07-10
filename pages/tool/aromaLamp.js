// pages/tool/aromaLamp.js
var bakTimeStamp = 0;
var _discoveryStarted = false;
var _devices = {};
var _write = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {

    nightLight: false,

    colorItems: [
      {name: '冷光',value: '0',checked: true},
      {name: '暖光',value: '1'},
      {name: '冷暖光',value: '3'}
    ],

    adjustLampValue: 0,
    adjustAromaValue: 0,

    timeLampIndex: 0,
    timeAromaIndex: 0,
    timeItmes: ['关闭', '30分钟', '60分钟', '120分钟', '180分钟'],

    mute: false,
  },

  /**
   * 夜灯开关事件
   */
  switchNightLight: function(e) {
    const NIGHT_LIGHT = e.detail.value;
    aromaLampWriteCommand(0x09, NIGHT_LIGHT ? 0x01 : 0x00);
    this.setData({
      nightLight: NIGHT_LIGHT,
    })
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
   * 调节滚动条触发事件
   */
  bindAdjustChang: function(e) {
    if((e.type == 'change') || (e.timeStamp - bakTimeStamp > 100)) {
      bakTimeStamp = e.timeStamp;
      // 获取调节数据e.detail.value; 来源e.target.id
    }
    // 更新UI
    if (e.type == 'change'){
      var tmpData = {};
      tmpData[e.target.id] = e.detail.value;
      this.setData(tmpData);
    }
  },

  /**
   * 定时选项改变事件
   */
  bindTimeChange: function(e) {
    const TIME_INDEX = e.detail.value;
    const TIME_NAME = e.target.id;
    const TIME_VALUE = this.data.timeItmes[TIME_INDEX];
    console.log('获取定时器内容', TIME_NAME, TIME_INDEX, TIME_VALUE);
    var tmpData = {};
    tmpData[TIME_NAME] = TIME_INDEX;
    this.setData(tmpData);
  },

  /**
   * 静音开关
   */
  switchMute: function(e) {
    const MUTE = e.detail.value;
    this.setData({
      mute: MUTE,
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
    openBluetoothAdapter();
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

// 获取指定数字Key中的数据
function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

/**
 * 开启蓝牙扫描
 */
function openBluetoothAdapter() {
  wx.openBluetoothAdapter({
    success: (res) => {
      console.log('openBluetoothAdapter success', res)
      startBluetoothDevicesDiscovery()
    },
    fail: (res) => {
      if (res.errCode === 10001) {
        wx.onBluetoothAdapterStateChange(function (res) {
          console.log('onBluetoothAdapterStateChange', res)
          if (res.available) {
            startBluetoothDevicesDiscovery()
          }
        })
      } else {
        wx.showModal({
          title: '蓝牙开启失败',
          content: res.errMsg,
          confirmText: '重试',
          cancelText: '退出',
          success: function (e) {
            if (e.confirm) {
              openBluetoothAdapter();
              return;
            } else {
              wx.navigateBack();
            }
          }
        })
      }
    }
  })
}

/**
 * 开启蓝牙设备发现
 */
function startBluetoothDevicesDiscovery() {
  if (_discoveryStarted) {
    return
  }
  wx.showLoading({
    title: '搜索蓝牙',
  });
  _discoveryStarted = true
  wx.startBluetoothDevicesDiscovery({
    allowDuplicatesKey: true,
    success: (res) => {
      console.log('startBluetoothDevicesDiscovery success', res)
      onBluetoothDeviceFound()
    },
  })
}

/**
 * 监听蓝牙设备发现(检测设备并开启)
 */
function onBluetoothDeviceFound() {
  wx.onBluetoothDeviceFound((res) => {
    res.devices.forEach(device => {
      if (!device.name && !device.localName) {
        return
      }
      console.log('onBluetoothDeviceFound:', device);
      if(device.name == 'Tomozaki01') {
        createBLEConnection(device.deviceId);
        return;
      }
    })
  })
}

/**
 * 创建蓝牙连接
 */
function createBLEConnection(deviceId) {
  wx.hideLoading();
  wx.stopBluetoothDevicesDiscovery();
  wx.showLoading({
    title: '连接蓝牙',
  })
  wx.createBLEConnection({
    deviceId,
    success: (res) => {
      console.log('createBLEConnection', res)
      getBLEDeviceServices(deviceId)
      wx.hideLoading();
    }
  })
}

/**
 * 获取蓝牙设备服务
 */
function getBLEDeviceServices(deviceId) {
  wx.getBLEDeviceServices({
    deviceId,
    success: (res) => {
      console.log('getBLEDeviceServices', res)
      for (let i = 0; i < res.services.length; i++) {
        if (res.services[i].isPrimary) {
          getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
          // return
        }
      }
    }
  })
}

/**
 * 获取蓝牙设备特征
 */
function getBLEDeviceCharacteristics(deviceId, serviceId) {
  wx.getBLEDeviceCharacteristics({
    deviceId,
    serviceId,
    success: (res) => {
      console.log('getBLEDeviceCharacteristics success', res.characteristics)
      for (let i = 0; i < res.characteristics.length; i++) {
        let item = res.characteristics[i]
        // if (item.properties.read) {
        //   wx.readBLECharacteristicValue({
        //     deviceId,
        //     serviceId,
        //     characteristicId: item.uuid,
        //     success(res) {
        //       console.log('readBLECharacteristicValue:', res.errCode)
        //     }
        //   })
        // }
        if (item.properties.write) {
          _write['deviceId'] = deviceId;
          _write['serviceId'] = serviceId;
          _write['characteristicId'] = item.uuid;
          // writeBLECharacteristicValue()
        }
        if (item.properties.notify || item.properties.indicate) {
          wx.notifyBLECharacteristicValueChange({
            deviceId,
            serviceId,
            characteristicId: item.uuid,
            state: true,
            success(resNotify) {
              console.log('notifyBLECharacteristicValueChange success', resNotify.errMsg)
            }
          })
        }
      }
    },
    fail(res) {
      console.error('getBLEDeviceCharacteristics', res)
    }
  })
  // 操作之前先监听，保证第一时间获取数据
  wx.onBLECharacteristicValueChange((characteristic) => {
    console.log('onBLECharacteristicValueChange', characteristic)
    // const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
    // const data = {}
    // if (idx === -1) {
    //   data[`chs[${this.data.chs.length}]`] = {
    //     uuid: characteristic.characteristicId,
    //     value: ab2hex(characteristic.value)
    //   }
    // } else {
    //   data[`chs[${idx}]`] = {
    //     uuid: characteristic.characteristicId,
    //     value: ab2hex(characteristic.value)
    //   }
    // }
  })
}


/**
 * 发生蓝牙数据
 */
function writeBLECharacteristicValue(buffer) {
  wx.writeBLECharacteristicValue({
    deviceId: _write['deviceId'],
    serviceId: _write['serviceId'],
    characteristicId: _write['characteristicId'],
    value: buffer,
  })
}

/**
 * 香薰灯发送应答帧
 */
function aromaLampWriteAnswer(rxBuffer) {
  var buffer = new Uint8Array(rxBuffer);
  buffer[2] = 0x02;
  buffer[4] = 0x00;
  buffer[5] = checkSum(buffer);
  console.log(buffer);
  writeBLECharacteristicValue(buffer.buffer);
}

/**
 * 香薰灯发送命令帧
 */
function aromaLampWriteCommand(cmd, text) {
  var buffer = new Uint8Array(6);
  buffer[0] = 0x52;
  buffer[1] = 0x01;
  buffer[2] = 0x01;
  buffer[3] = cmd;
  buffer[4] = text;
  buffer[5] = checkSum(buffer);
  console.log(buffer);
  writeBLECharacteristicValue(buffer.buffer);
}

/**
 * 计算校验和函数
 */
function checkSum(buffer) {
  var sum = 1;
  for (var i = 0; i < buffer.length - 1; i++) {
    sum += buffer[i];
  }
  return sum % 255;
}

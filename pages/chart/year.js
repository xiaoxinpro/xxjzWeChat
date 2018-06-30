// pages/chart/year.js
import * as echarts from '../../ec-canvas/echarts';

var that = this;
var year = 2018;
var chartData = {};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    InSumMoney: 0.00,
    OutSumMoney: 0.00,
    OverSumMoney: 0.00,
    ec: {
      lazyLoad: true
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.year) {
      year = options.year;
    }
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
    getChartData();
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

function getChartData() {
  getData({ type: 'year', date: (Date.parse(new Date(year, 1, 1)) / 1000) }, function (ret) {
    chartData.InMoney = objToArr(ret.InMoney);
    chartData.OutMoney = objToArr(ret.OutMoney);
    chartData.OverMoney = objToArr(ret.SurplusMoney);
    chartData.InClassMoney = objToArr(ret.InClassMoney);
    chartData.OutClassMoney = objToArr(ret.OutClassMoney);
    chartData.InSumMoney = ret.InSumMoney;
    chartData.OutSumMoney = ret.OutSumMoney;
    chartData.InSumClassMoney = objToKeyArr(ret.InSumClassMoney, 0);
    chartData.OutSumClassMoney = objToKeyArr(ret.OutSumClassMoney, 0);
    chartData.OverSumMoney = objToArr(ret.SurplusSumMoney);
    //console.log(chartData);
    initChart();

    that.setData({
      InSumMoney: chartData.InSumMoney.toFixed(2),
      OutSumMoney: chartData.OutSumMoney.toFixed(2),
      OverSumMoney: (chartData.InSumMoney - chartData.OutSumMoney).toFixed(2)
    });
  });
}

function initChart() {
  // 获取组件
  that.ecComponent = that.selectComponent('#chart-dom-year');
  that.ecComponent.init((canvas, width, height) => {
    // 获取组件的 canvas、width、height 后的回调函数
    // 在这里初始化图表
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });
    setOption(chart);

    // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
    that.chart = chart;

    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return chart;
  });
}

function setOption(chart) {

  var labelBarOption = {
    normal: {
      show: true,
      rotate: 90,
      align: 'left',
      verticalAlign: 'middle',
      position: 'top',
      distance: 3,
      formatter: '{c}',
      fontSize: 10
    }
  };

  const option = {
    title: {
      text: year + '年收入与支出金额汇总',
      top: 'top',
      x: 'center'
    },
    color: [
      "#72d572", //绿
      "#f36360", //红
      "#ffb74d", //橙
      "#4fc3f7", //蓝
      "#a1887f", //棕
      "#dce775", //黄
      "#9575cd"  //紫
    ],
    // tooltip: {
    //   trigger: 'axis',
    //   extraCssText: 'text-align: left;',
    //   //formatter: chartMainFormatter,
    //   axisPointer: {            // 坐标轴指示器，坐标轴触发有效
    //     type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
    //   }
    // },
    legend: {
      data: ['收入', '支出', '月剩余', '年剩余'],
      selected: {
        '收入': true,
        '支出': true,
        '月剩余': false,
        '年剩余': false
      },
      top: 'bottom',
      x: 'center'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    },
    yAxis: {
      type: 'value'
    },
    barGap: '5%',
    series: [{
      name: '收入',
      type: 'bar',
      data: chartData.InMoney,
      label: labelBarOption,
      animationDelay: function (idx) {
        return idx * 30;
      }
    }, {
      name: '支出',
      type: 'bar',
      data: chartData.OutMoney,
      label: labelBarOption,
      animationDelay: function (idx) {
        return idx * 30 + 30;
      }
    }, {
      name: '月剩余',
      type: 'line',
      smooth: true,
      data: chartData.OverMoney
    }, {
      name: '年剩余',
      type: 'line',
      smooth: true,
      data: chartData.OverSumMoney
    }]
  };
  chart.setOption(option);
}

/** 获取网络数据 */
function getData(data, callback) {
  var session_id = wx.getStorageSync('PHPSESSID');//本地取存储的sessionID  
  if (session_id != "" && session_id != null) {
    var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'PHPSESSID=' + session_id }
  } else {
    var header = { 'content-type': 'application/x-www-form-urlencoded' }
  }
  wx.request({
    url: getApp().URL + '/xxjzApp/index.php?s=/Home/Api/chart',
    method: 'GET',
    data: data,
    header: header,
    success: function (res) {
      console.log('获取账单数据：', res);
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

/** 对象转数组 */
function objToArr(obj) {
  var arr = [];
  for (var key in obj) {
    if (typeof (obj[key]) === 'object') {
      arr[key] = objToArr(obj[key]);
    } else {
      arr.push(obj[key]);
    }
  }
  return arr;
}

/** 对象转带键值数组 */
function objToKeyArr(obj, minValue) {
  var arr = [];
  for (var key in obj) {
    if (typeof (obj[key]) === 'object') {
      arr[key] = objToKeyArr(obj[key]);
    } else {
      if ((typeof (minValue) === 'number') && obj[key] <= minValue) {
        continue;
      }
      arr.push({
        name: key,
        value: obj[key]
      });
    }
  }
  if ((typeof (minValue) === 'number') && (arr.length === 0)) {
    arr.push({
      name: '无数据',
      value: 0
    });
  }
  return arr;
}
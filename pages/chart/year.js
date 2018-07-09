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
    ChartHeight: 500,
    InSumMoney: 0.00,
    OutSumMoney: 0.00,
    OverSumMoney: 0.00,
    HiddenToolTip: true,
    ec: {
      lazyLoad: true
    },
    ec_InClass: {
      lazyLoad: true
    },
    ec_OutClass: {
      lazyLoad: true
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.year) {
      year = options.year;
    }

    var windowHeight = wx.getSystemInfoSync().windowHeight;
    that.setData({
      ChartHeight: windowHeight - 100
    })
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
  wx.showLoading({
    title: '加载中',
    success: function () {
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
          OverSumMoney: (chartData.InSumMoney - chartData.OutSumMoney).toFixed(2),
          HiddenToolTip: false
        });

        wx.hideLoading();
      });
    }
  });
}

function initChart() {
  // 获取组件
  //that.ecComponent = that.selectComponent('#chart-dom-year');
  that.selectComponent('#chart-dom-year').init((canvas, width, height) => {
    // 获取组件的 canvas、width、height 后的回调函数
    // 在这里初始化图表
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });
    setOptionYear(chart);

    // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    return chart;
  });

  that.selectComponent('#chart-dom-inclass').init((canvas, width, height) => {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });

    setOptionInClass(chart);

    return chart;
  });

  that.selectComponent('#chart-dom-outclass').init((canvas, width, height) => {
    const chart = echarts.init(canvas, null, {
      width: width,
      height: height
    });

    setOptionOutClass(chart);

    return chart;
  });
}

/** 设置年度收支汇总图表 */
function setOptionYear(chart) {

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

/** 设置收入分类图表 */
function setOptionInClass(chart) {
  const option = {
    title: {
      text: year + '年收入分类汇总',
      subtext: '总收入' + chartData.InSumMoney + '元',
      x: 'center'
    },
    color: [
      "#2ec7c9",
      "#b6a2de",
      "#5ab1ef",
      "#ffb980",
      "#d87a80",
      "#8d98b3",
      "#e5cf0d",
      "#97b552",
      "#95706d",
      "#dc69aa",
      "#07a2a4",
      "#9a7fd1",
      "#588dd5",
      "#f5994e",
      "#c05050",
      "#59678c",
      "#c9ab00",
      "#7eb00a",
      "#6f5553",
      "#c14089"
    ],
    tooltip: {
      trigger: 'item',
      formatter: "{b} : ({d}%)<br/>{c} 元"
    },
    series: [
      {
        name: '收入分类',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: chartData.InSumClassMoney,
        labelLine: {
          normal: {
            smooth: true
          }
        },
        itemStyle: {
          normal: {
            borderColor: "#FFF",
            borderWidth: 1
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  chart.setOption(option);
}

/** 设置支出分类图表 */
function setOptionOutClass(chart) {
  const option = {
    title: {
      text: year + '年支出分类汇总',
      subtext: '总支出' + chartData.OutSumMoney + '元',
      x: 'center'
    },
    color: [
      "#2ec7c9",
      "#b6a2de",
      "#5ab1ef",
      "#ffb980",
      "#d87a80",
      "#8d98b3",
      "#e5cf0d",
      "#97b552",
      "#95706d",
      "#dc69aa",
      "#07a2a4",
      "#9a7fd1",
      "#588dd5",
      "#f5994e",
      "#c05050",
      "#59678c",
      "#c9ab00",
      "#7eb00a",
      "#6f5553",
      "#c14089"
    ],
    tooltip: {
      trigger: 'item',
      formatter: "{b} : ({d}%)<br/>{c} 元"
    },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: chartData.OutSumClassMoney,
        labelLine: {
          normal: {
            smooth: true
          }
        },
        itemStyle: {
          normal: {
            borderColor: "#FFF",
            borderWidth: 1
          },
          emphasis: {
            borderWidth: 0,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
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
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 时间戳转字符串格式 (时间戳为标准10位整数, 需在js时间戳/1000)
 */
function intTimeFormat (intTime, format) {
  intTime = parseInt(intTime);
  var d = new Date(intTime * 1000);
  var strDate = (d.getFullYear()) + "-" + (d.getMonth() + 1) + "-" + (d.getDate());
  return strDateFormat(strDate, format);
}

/**
 * 日期字符串格式
 */
function strDateFormat (strDate, format) {
  var obj = DateProcess(strDate);
  if (obj) {
    format = format.toLowerCase();
    if (/y/g.test(format)) {
      format = format.replace(/y+/g, obj.year);
    }
    if (/mm/g.test(format)) {
      if (obj.month.length === 1) {
        obj.month = '0' + obj.month;
      }
      format = format.replace(/mm/g, obj.month);
    } else if (/m/g.test(format)) {
      obj.month = '' + parseInt(obj.month);
      format = format.replace(/m+/g, obj.month);
    }
    if (/dd/g.test(format)) {
      if (obj.day.length === 1) {
        obj.day = '0' + obj.day;
      }
      format = format.replace(/dd/g, obj.day);
    } else if (/d/g.test(format)) {
      obj.day = '' + parseInt(obj.day);
      format = format.replace(/d+/g, obj.day);
    }
    if (/w/g.test(format)) {
      var arrWeek = ['日', '一', '二', '三', '四', '五', '六', '日'];
      var week = new Date(obj.year + '/' + obj.month + '/' + obj.day).getDay();
      format = format.replace(/w+/g, arrWeek[week]);
    }
    return format;
  } else {
    return false;
  }
}

/**
 * 日期字符串分解
 * obj.year、obj.month、obj.day
 */
function DateProcess (strDate) {
  strDate = strDate.replace(/[\'\s]+/g, '');
  if (strDate) {
    var date = strDate.match(/\d+/g);
    if (date.length === 3) {
      var obj = {};
      obj.year = date[0];
      obj.month = date[1];
      obj.day = date[2];
      return obj;
    }
  }
  return false;
}


/** 
 * 校验输入金额 
 */
function cheakMoney(value) {
  var pat = RegExp("([1-9]\d*(\.\d{1,2})?|0\.((\d?[1-9])|([1-9]0?)))");
  return pat.test(value);
}

/** 
 * 校验分类 
 */
function cheakClass(value) {
  return (Number(value) > 0);
}

/** 
 * 校验账户
 */
function cheakFunds(value) {
  return (Number(value) > 0);
}

/** 
 * 校验输入备注 
 */
function cheakMark(value) {
  var mark = value.trim();
  return (mark.length > 0);
}

/** 
 * 校验输入时间 
 */
function cheakTime(value) {
  var cheak = /(\d+\D\d+\D\d+)/.test(value);
  return cheak;
}


module.exports = {
  formatTime: formatTime,
  intTimeFormat: intTimeFormat,
  strDateFormat: strDateFormat,
  cheakMoney: cheakMoney,
  cheakClass: cheakClass,
  cheakFunds: cheakFunds,
  cheakMark: cheakMark,
  cheakTime: cheakTime
}

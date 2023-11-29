export function getCurrentDate(tim) {
    if(!tim){return}

    var myDate = new Date(tim);
  
    var year = myDate.getFullYear(); //年
  
    var month = myDate.getMonth() + 1; //月
  
    var day = myDate.getDate(); //日
  
    var hour = myDate.getHours(); //时
  
    var min = myDate.getMinutes(); //分
  
    var seconds = myDate.getSeconds(); //秒
    var str = year + "-" + zeroFill(month) + "-" + zeroFill(day) + ' ' + zeroFill(hour) + ":" + zeroFill(min) + ":" + zeroFill(seconds);
    // var str = year + "/" + zeroFill(month) + "/" + zeroFill(day);
  
    return str;
  
  }
  
  function zeroFill(num) {
    return Number(num) < 10 ? '0' + num : num
  }
import axios from "axios";
/**
 * @param {date} time 需要转换的时间
 * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss、HH:mm:ss.SSS
 */
export function fmtTime(time, fmt) {
    if (!time) return '';
    else {
        const date = new Date(time);
        const o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'H+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            S: date.getMilliseconds(),
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                (date.getFullYear() + '').substr(4 - RegExp.$1.length)
            );
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1
                        ? o[k]
                        : ('00' + o[k]).substr(('' + o[k]).length)
                );
            }
        }
        return fmt;
    }
}


/**
 * 求两点之间的距离
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {number}
 */
export function distance(x1, y1, x2, y2) {
    var x12 = (x2 - x1);
    var y12 = (y2 - y1);
    var p12 = x12 * x12 + y12 * y12;
    return Math.sqrt(p12);// 开平方根
}


//通用axis.get查询: url?id=xxx&name=yyy
export function axiosget(url, params, cb) {
    axios.get(url, { params: params })
        .then(res => {
            if (res.status == 200) {
                if (typeof (cb) === 'function') {
                    cb(res.data)
                }
            } else if (res.data.message) {
                console.error('查询失败', res.data.message)
            } else {
                console.error('查询失败', res.data)
            }
        }).catch(err => {
            console.error('查询失败', err);
        })
}

//根据一行json数据生成ATable列定义
export function makeColumns(row, lefts, excludes) {
    console.log('row,lefts,excludes', Object.keys(row), row, lefts, excludes)
    lefts = Array.isArray(lefts) ? lefts : [];
    excludes = Array.isArray(excludes) ? excludes : [];
    //从每第一行数据生成字段定义
    var columns = [], columns2 = [];
    //把重要的lefts列放在左侧
    let keys = Object.keys(row);
    keys = keys.filter(key => !excludes.includes(key));
    keys.forEach((key) => {
        if (lefts.includes(key)) {
            columns.push({ title: key, dataIndex: key, key: key })
        } else {
            columns2.push({ title: key, dataIndex: key, key: key })
        }
    })

    columns = columns.concat(columns2);
    return columns;
}

/**
 * 判断访问终端类型
 */
export function getClientType() {
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { //判断iPhone|iPad|iPod|iOS
        return 'ios'
    } else if (/(Android)/i.test(navigator.userAgent)) {  //判断Android
        //window.location.href ="Android.html";
        return 'android'
    } else { //pc
        return 'pc'
    }
}

export function printObject(title, d){
    if(title){
        console.log(title, ':object-------------')
    }
    let ss = []
    Object.keys(d).forEach(k=>{
        if(d[k]==0||d[k]){//只打印有值的
            ss.push(`${k}:${d[k]}`)
        }
    })
    // console.log(ss.join(','))
}
export function printList(title,data){
    if(Array.isArray(data)){
        console.log(title + ":list----------------")
        data.forEach(d=>{
            if(Object.keys(d).length){
                printObject('', d)
            }else{
                console.log(d)
            }
        })
    }else if(Object.keys(data).length){
        printObject(title, data)
    }else{
        console.log(data)
    }
}

/**
 * @description 获取浏览器默认语言
 * @returns {String}
 */
export function getBrowserLang() {
  let defaultBrowserLang = "";
  const browserLang = navigator.language ? navigator.language : navigator.browserLanguage;
  if (["cn", "zh", "zh-cn"].includes(browserLang.toLowerCase())) {
    defaultBrowserLang = "ch";
  } else {
    defaultBrowserLang = "ch";
  }
  console.log(defaultBrowserLang,"-----------");
  return defaultBrowserLang;
}

// 初始化设置语言
export function getInitLocaleLanguage() {
  let localeLange = localStorage.getItem("language");
  console.log(localeLange)
  if((localeLange && localeLange === "undefined") || !localeLange) {
    localeLange = getBrowserLang();
    localStorage.setItem("language",localeLange);
  }
  return localeLange;
}

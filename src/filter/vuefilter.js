/**
 * todo 全局过滤器
 * 1.部分简单字典类型的数据转换，主要用于vue模板的管道.
 * 2.其它类型的过滤、转换
 * <!-- 在双花括号中 -->
 {{ message | capitalize }}

 <!-- 在 `v-bind` 中 -->
 <div v-bind:id="name | strUpper"></div>
 */
// import Vue from 'vue'
// Vue.filter('strUpper', function (str) {
//     return str.charAt(0).toUpperCase() + str.slice(1)
// })
// Vue.filter('fmtTime', function (str) {
//     return str==null?'':str;
// })

import moment from "moment";
import axios from "axios";

let groups = null;
function queryGroup(){
    axios.get(`api/stationGroup/list`).then(res => {
        if (res.status == 200 && res.data) {
            groups = res.data.map(item => { return { value: item.group, label: item.remark } })
        }
    })
}
queryGroup()

export default {
    strUpper: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
    },
    fmtDate: function (str) {
        return str == null ? '' : moment(str).format('YYYY-MM-DD');
    },
    fmtTime: function (str) {
        return str == null ? '' : moment(str).format('HH:mm:ss');
    },
    fmtTimeS: function (str) {
        return str == null ? '' : moment(str).format('HH:mm:ss.S');
    },
    fmtDateTime: function (str) {
        return str == null ? '' : moment(str).format('YYYY-MM-DD HH:mm:ss');
    },
    fmtDuration: function (ms) {
        //毫秒 转 时分秒
        if (ms < 60000) {
            return (ms / 1000).toFixed(0) + '秒'
        } else if (ms < 3600000) {
            return (ms / 60000).toFixed(0) + '分'
        } else {
            return (ms / 3600000).toFixed(0) + '时' + ((ms % 3600000) / 60000).toFixed(0) + '分'
        }
    },
    transLoadings(val) {
        if (val == 0) {
            return '空'
        } else if (val == 1) {
            return '上空下满'
        } else if (val == 16) {
            return '上满下空'
        } else if (val == 17) {
            return '上满下满'
        }
    },

    fmtGroup(val) {
        let gs = [...groups];
        let group = gs.find(e => e.value == val);
        if (group) {
            return group.label;
        }
        return val;
    },

    getGroups(){
        return groups;
    }
}
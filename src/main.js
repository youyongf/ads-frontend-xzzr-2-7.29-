import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { ConfigProvider } from 'ant-design-vue'
import JsonExcel from 'vue-json-excel'
import store from './store/index.js'
// import Vuex from 'vuex'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
// 引入echarts
import echarts from "./echarts/echarts";
import i18n from './language/i18n';

// Vue.use(Vuex)

// 挂载到vue实例中
Vue.prototype.$echarts = echarts

Vue.prototype.$transformI18n = function (data, fieldName="title") {
  let resultData = null;
  console.log(data)
  if(Array.isArray(data) && fieldName) {
    console.log(resultData)
    resultData = data.map(item=>{
      const value = item[fieldName].includes(".") ? this.$tcache(item[fieldName]) : item[fieldName];
      // const dataVal=data.value.map(val=>{
      //   const valuelist = val[val.value].includes(".") ? this.$tcache(val[val.value]) : val[val.value];
      //   return {...val, ['value']: valuelist}
      // })
      // console.log(dataVal)
      return {...item, [fieldName]: value}
    })
  } else if(Object.prototype.toString.call(data).include("Object")) {
    for(let key in data) {
      resultData[key] = this.$tcache(data[key]);
    }
  }
  console.log(resultData)
  return resultData;
}

Vue.prototype.$tcache = function (key, params = undefined) {
  if(params) return this.$t(key,params);
  const languageCache =  this.$store.state.languageCache;
  let val = languageCache[key]
  if(!val) {
    val = this.$t(key);
    const payload = {
      key,
      val:val
    }
    this.$store.dispatch("addCacheLang", payload);
  }
  return val;
}

// if (process.env.NODE_ENV === 'development' && process.env.VUE_APP_VCONSOLE_STATUS === 'OPEN') {
//   const VConsole  = require('vconsole');
//   let vConsole = new VConsole({ theme: 'dark' });
//   Vue.use(vConsole);
//  } 
Vue.component('downloadExcel',JsonExcel)
Vue.use(ConfigProvider)

axios.defaults.baseURL= process.env["VUE_APP_PUBLIC_PATH"]
// axios.defaults.headers.post['Content-type'] = 'multipart/form-data'
Vue.use(VueAxios, axios)

//全局过滤器
import filters from './filter/vuefilter';
Object.keys(filters).forEach(key=>{
  Vue.filter(key, filters[key])
})

Vue.use(Antd)
Vue.use(ViewUI)
// 引入全局css
// import './assets/scss/style.scss';

Vue.config.productionTip = false

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    if (localStorage.getItem('Authorization')) {
      config.headers.Authorization = localStorage.getItem('Authorization');
    }
    return config;
  },
  error => { return Promise.reject(error); }
);
new Vue({
  render: h => h(App),
  router,
  store,
  i18n
}).$mount('#app')

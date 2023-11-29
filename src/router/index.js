import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store';
// import { changeLanguageAction,changeAdsLanguageAction } from '../store';
Vue.use(Router)
console.log(store.state,"---------------store");
const routes = [
  {
    path: '/login',
    name: '登录界面',
    component: () => import('../pages/login.vue'),
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('../pages/map.vue'),
  },
  
  {
    path: '/',
    name: 'index',
    component: () => import('../pages/index.vue'),
    //定义嵌套路由
    children: [
      {
        path: '/menuRole',
        name: 'menuRole',
        component: () => import('../pages/menuRole'),
      },{
        path: '/userManagement',
        name: 'userManagement',
        component: () => import('../pages/userManagement.vue'),
      },
      {
        path: '/home',
        name: 'home',
        component: () => import('../pages/home'),
      }, {
        path: '/403',
        name: '403',
        component: () => import('../pages/403'),
      },{
        path: '/monitor_station',
        name: 'monitor_station',
        component: () => import('../pages/monitor/station'),
      }, {
        path: '/monitor_stationCardList',
        name: 'monitor_stationCardList',
        component: () => import('../pages/monitor/stationCardList'),
      }, {
        path: '/monitor_agv',
        name: 'AGV监视',
        component: () => import('../pages/monitor/agv.vue'),
      }, {
        path: '/monitor_agvstate',
        name: 'AGV实时状态列表',
        component: () => import('../pages/monitor/agvstate_list'),
      }, {
        path: '/monitor_lockp',
        name: '点位锁列表',
        component: () => import('../pages/monitor/lockp'),
      },{
        path: '/monitor_warn_journal',
        name: '警告日志',
        component: () => import('../pages/monitor/warn_journal'),
      },  {
        path: '/admin_station',
        name: '机台',
        component: () => import('../pages/admin/stationlist.vue'),
      }, {
        path: '/cache_list',
        name: '缓存机',
        component: () => import('../pages/admin/cache_list.vue'),
      }, {
        path: '/admin_stationmap',
        name: '对接工位分布图',
        component: () => import('../pages/admin/station_map.vue'),
      }, {
        path: '/admin_pointmap',
        name: ' 点位分布图',
        component: () => import('../pages/admin/point_map.vue'),
      }, {
        path: '/admin_camap',
        name: '交管区分布图',
        component: () => import('../pages/admin/ca_map.vue'),
      }, {
        path: '/admin_agv',
        name: 'AGV',
        component: () => import('../pages/admin/agvlist.vue'),
      }, {
        path: '/admin_config',
        name: 'config',
        component: () => import('../pages/admin/config.vue'),
      }, {
        path: '/admin_point',
        name: '点列表',
        component: () => import('../pages/admin/pointlist.vue'),
      }, {
        path: '/admin_route',
        name: '路线列表',
        component: () => import('../pages/admin/routelist.vue'),
      }, {
        path: '/admin_control',
        name: '交管',
        component: () => import('../pages/admin/control.vue'),
      }, {
        path: '/admin_routefiles',
        name: '路线文件',
        component: () => import('../pages/admin/routefiles.vue'),
      }, {
        path: '/admin_routeUpload',
        name: '路线上传',
        component: () => import('../pages/admin/routeUpload.vue'),
      }, {
        path: '/admin_routeUpload_new',
        name: '新路线上传',
        component: () => import('../pages/admin/routeUpload_new.vue'),
      }, {
        path: '/admin_routeImport',
        name: '路线导入',
        component: () => import('../pages/admin/routeImport.vue'),
      }, {
        path: '/admin_step',
        name: 'step',
        component: () => import('../pages/admin/steplist.vue'),
      }, {
        path: '/admin_stepTargetOutput',
        name: 'stepTargetOutput',
        component: () => import('../pages/admin/stepTargetOutput.vue'),
      }, {
        path: '/admin_stationgroup',
        name: 'stationgroup',
        component: () => import('../pages/admin/station_group.vue'),
      }, {
        path: '/admin_cachelayergroup',
        name: 'cachelayergroup',
        component: () => import('../pages/admin/cachelayer_group.vue'),
      }, {
        path: '/admin_on_line_qtime',
        name: '在制信息配置',
        component: () => import('../pages/admin/on_line_qtime.vue'),
      }, {
        path: '/monitor_offlinepointmap',
        name: '离线点位图',
        component: () => import('../pages/monitor/offline_point_map.vue'),
      }, {
        path: '/check_transferlog',
        name: '传输历史',
        component: () => import('../pages/check/transferlog.vue'),
      }, {
        path: '/check_agvAnomaly',
        name: 'AGV异常统计',
        component: () => import('../pages/check/agvAnomaly.vue'),
      }, {
        path: '/check_statelog',
        name: 'AGV状态历史',
        component: () => import('../pages/check/statelog.vue'),
      }, {
        path: '/check_car',
        name: '小车搬运率',
        component: () => import('../pages/check/car.vue'),
      }, {
        path: '/check_groupOnLineQtimeBaskVol',
        name: '定线在制车辆',
        component: () => import('../pages/check/groupOnLineQtimeBaskVol.vue'),
      }, {
        path: '/transfer_step_output',
        name: '历史搬运率',
        component: () => import('../pages/report/transfer_step_output.vue'),
      }, {
        path: '/transfer_day',
        name: '每日工序搬运量统计',
        component: () => import('../pages/report/transfer_day.vue'),
      }, {
        path: '/transfer_month',
        name: '每月工序搬运量统计',
        component: () => import('../pages/report/transfer_month.vue'),
      }, {
        path: '/Qtime',
        name: 'Qtime',
        component: () => import('../pages/report/Qtime.vue'),
      }, {
        path: '/onLineQtimeBaskVol',
        name: '实时在制',
        component: () => import('../pages/report/onLineQtimeBaskVol.vue'),
      }, {
        path: '/newPassword',
        name: '密码修改',
        component: () => import('../pages/newPassword.vue'),
      },{
        path: '/onlineInfo',
        name: '机台上线情况',
        component: () => import('../pages/onlineInfo.vue'),
      }, {
        path: '/agvStatus',
        name: 'AGV状态视图',
        component: () => import('../pages/report/agvStatus.vue'),
      }, {
        path: '/anomaly_agv_station',
        name: 'agv与机台异常',
        component: () => import('../pages/anomaly_agv_station.vue'),
      }, {
        path: '/cacheAgvBasketNum',
        name: '缓存机花篮',
        component: () => import('../pages/monitor/cacheAgvBasketNum.vue'),
      }, {
        path: '/cacheLayer',
        name: '缓存机分层',
        component: () => import('../pages/admin/cacheLayer.vue'),
      }, {
        path: '/group',
        name: 'group',
        component: () => import('../pages/admin/group.vue'),
      }, {
        path: '/systemLog',
        name: '调度日志',
        component: () => import('../pages/systemLog.vue'),
      }, {
        path: '/pointDecide',
        name: '决策点',
        component: () => import('../pages/admin/pointDecide.vue'),
      }, {
        path: '/pointPark',
        name: '待命点',
        component: () => import('../pages/admin/pointPark.vue'),
      }, {
        path: '/cachePosition',
        name: '缓存位置',
        component: () => import('../pages/admin/cachePosition.vue'),
      }, {
        path: '/door',
        name: '自动门',
        component: () => import('../pages/monitor/door.vue'),
      }, {
        path: '/sysOperLog',
        name: '操作日志',
        component: () => import('../pages/sysOperLog.vue'),
      }, {
        path: '/stepArea',
        name: '步骤区域',
        component: () => import('../pages/admin/stepArea.vue'),
      }, {
        path: '/nextStations',
        name: '下一可选机台',
        component: () => import('../pages/admin/nextStations.vue'),
      }, {
        path: '/agvQtime',
        name: 'agv在制时间',
        component: () => import('../pages/monitor/agvQtime.vue'),
      }, {
        path: '/singleStation',
        name: '单机台搬运量',
        component: () => import('../pages/check/singleStation.vue'),
      }, {
        path: '/AgvChange',
        name: '人工修改目的地统计',
        component: () => import('../pages/check/AgvChange.vue'),
      }, {
        path: '/abnormalMachine',
        name: '异常机台',
        component: () => import('../pages/abnormalMachine.vue'),
      }, {
        path: '/taskDuration',
        name: '任务时长统计',
        component: () => import('../pages/check/taskDuration.vue'),
      }
    ]
  },

  // stepTargetOutput
]
const router = new Router({
  mode: "history",
  // mode: "hash",
  routes
})

// 导航守卫
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
router.beforeEach(async (to, from, next) => {
  const localLang = localStorage.getItem("language");
  const redirectPath = sessionStorage.getItem("redirectPath");
  if(redirectPath) {
    sessionStorage.removeItem("redirectPath");
    next(redirectPath);
    return;
  }
  if(localLang && store.state.language !== localLang) {
    store.dispatch("clearCacheLang");
    sessionStorage.setItem("redirectPath", to.fullPath)
    location.reload(true);
    return;
  }
  if(store.state.userInfo && from.path === '/login') {
    const userInfo = JSON.parse(store.state.userInfo);
    let userlanguage = userInfo.principal.language;
    if(userlanguage === 'zh') userlanguage = 'ch';
    if (userlanguage !== localLang) {
      localStorage.setItem("language", userlanguage);
      sessionStorage.setItem("redirectPath", to.fullPath)
      location.reload(true);
      return;
    }
  }
  let authorities = JSON.parse(localStorage.getItem('authorities'));
  let no_login=['/login']
  // console.log(authorities,to,(!authorities) && (!no_login.includes(to.path)))
  let no_validate=['/login','/','/home','/403','/onlineInfo','/agvStatus'];
  if ((!authorities) && (!no_login.includes(to.path))) {
    next('/login')
  }else if((authorities?.length!=0)&&!no_validate.includes(to.path)){
    let passPath=localStorage.getItem('RoleMenu')
    let isAdmin=localStorage.getItem('isAdmin')=='true'?true:false
    if(passPath?.includes(to.path)||isAdmin){next();}else{next('/403')}
  }else if(to.path=='/'){
    next('/login')
  }else{console.log("you");next()}


  // if (localStorage.getItem('loginTime')&&localStorage.getItem('Authorization')) {
  //   let loginTime = Number(localStorage.getItem('loginTime')) + 2*3600*1000;//token过期时间
  //   let nowTime = new Date().getTime();
  //   if (nowTime >= loginTime) { alert('登录已过期，请重新登录'); localStorage.removeItem('loginTime'); localStorage.removeItem('Authorization') }
  //   // console.log(nowTime,Number(loginTime))
  // }
  // let token = localStorage.getItem('Authorization');
  // console.log(token)
  // if (to.path != '/login' && !token) {
  //   next('/login')
  // } else {
  //   if (to.path == '/login' && token) {
  //     next('/home')
  //   } else {
  //     next()
  //   }
  // }
})

export default router

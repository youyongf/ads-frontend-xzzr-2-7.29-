<template>
  <a-layout ref="components_layout_side" id="components-layout-side" hasSider style="height:100vh;user-select:none;overflow:hidden;">
    <a-layout-header class="header">
      <div class="logo" :style="{width: sidebarWidth + 'px'}"></div>
      <div class="nav-wrapper" :style="{width: `calc(100vw - ${sidebarWidth}px )`}">
        <div class="nav-bar">
          <div class="left-nav" @click="toggleCollapsed">
            <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" :style="{ fontSize: '16px'}" />
          </div>
          <div class="full_screen" @click="toggleScreen">
            <a-icon :type="screen ? 'fullscreen' : 'fullscreen-exit'" :style="{ fontSize: '16px'}" />
          </div>
          <div class="login-info">
            <div class="language-switch" style="margin-right:18px" ><Language :size="16" :color="'#2db7f5'" /></div>
            <div class="user-name"><a-icon type="user"></a-icon><span style="display:inline-block;padding-left:4px;">{{$tcache('welcome')}}，{{userInfo ? JSON.parse(userInfo).name : ""}}</span></div>
            <div class="logos logout" @click="logout"><a-icon type="logout"></a-icon><span style="display:inline-block;padding-left:4px;">{{$tcache('login.logOut')}}</span></div>
          </div>
        </div>
      </div>
    </a-layout-header> 
    <a-layout-sider v-model="collapsed" :width="sidebarWidth + 'px'" :style="{'paddingTop':'50px'}" :trigger="null" collapsible :title="$tcache('directory.tips')">
      <div class="hight">
        <a-menu style="float:left" :open-keys="state.openKeys" @openChange="onOpenChange"
          theme="dark" mode="inline" @click="handleMenuClick" :selectedKeys="[`${title1}`]"
          >
          <a-menu-item key="home">
            <a-icon type="home" />
            <span>{{$tcache('menu.home')}}</span>
          </a-menu-item>
          <a-menu-item key="map" v-if="isAdmin||RoleMenu.includes('/map')">
            <a-icon type="pic-left" />
            <span>{{$tcache('menu.map')}}</span>
          </a-menu-item>

          <a-sub-menu v-for="m in menus" :key="m.title">
            <span slot="title"><a-icon :type="m.icon" /><span>{{m.title}}</span></span>
            <a-menu-item v-for="l in m.value" :key="l.path" 
              v-show="RoleMenu.includes('/'+l.path)
              ||isAdmin
              ||(l.path=='admin_stationgroup'&&RoleMenu.includes('/group/admin_stationgroup'))
              ||(l.path=='admin_route'&&RoleMenu.join(',').includes('/admin_route'))"
              >
              <span>{{$tcache(`${l.value}`)}}</span>
            </a-menu-item>
          </a-sub-menu>
          
          <a-menu-item key="systemLog" v-if="isAdmin||RoleMenu.includes('/systemLog')">
            <a-icon type="info-circle" />
            <span>{{$tcache('menu.slog')}}</span>
          </a-menu-item>
          <a-menu-item key="sysOperLog" v-if="isAdmin||RoleMenu.includes('/sysOperLog')">
            <a-icon type="info-circle" />
            <span>{{$tcache('menu.olog')}}</span>
          </a-menu-item>
        </a-menu>
      </div>

    </a-layout-sider>


    <a-layout :style="{'paddingTop':'50px'}">
      <div class="layout-right">
          <!--      <a-layout-header style="margin: 16px 16px;background: #fff; padding: 20px;" >-->
          <!--        <a-breadcrumb style="text-align: left;">-->
          <!--          <a-breadcrumb-item>{{title1}}</a-breadcrumb-item>-->
          <!--          <a-breadcrumb-item>{{title2}}</a-breadcrumb-item>-->
          <!--        </a-breadcrumb>-->
          <!--      </a-layout-header>-->
          <!-- <div ref="indexTagBox" class="tagbox" style="display:flex;flex-wrap: wrap;"> -->
          <div ref="indexTagBox" class="tagbox">
            <Tag class="tag" style="color:white;border-radius:0;margin:0" size="large"
              :class="item.name == title2 ? 'col' : 'nocol'" v-for="item in tags" :key="item.key" :name="item.key"
              :closable='item.key !== "home"' @on-close="handleClose2" @click.native="handleChange(item)">
              <span :class="item.name == title2 ? 'col' : 'nocol'">{{ item.name }}</span>
            </Tag>
          </div>
        <div class="content-wrapper">
          <a-layout-content style="margin: 0px 16px;">
            <div :style="{ padding: '24px', background: '#fff', minHeight: '680x' }">
              <router-view />
            </div>
          </a-layout-content>
          <a-layout-footer class="footer" style="text-align: center">
            ADS ©2018 Created by LanhaiRobot
          </a-layout-footer>
        </div>
      </div>
    </a-layout>
  </a-layout>

</template>
<script>
import { getClientType } from "../utils";
import { mapMutations, mapState } from 'vuex';
import Language from '@/components/language.vue';
const menuJson = require('../data/allMenus.json');
export default {
  data() {
    return {
      collapsed: true,
      screen:true, //屏幕是否全屏状态
      title1: "home",
      title2: this.$tcache('menu.home'),
      tags: [{key: 'home', name: this.$tcache('menu.home'), path: 'home'}],//标签集合
      tagIndex: '',
      tagName: '',
      lastTagName: 'home',//所在标签名
      state: {
        // rootSubmenuKeys: ['设备调试', '实时监控', '业务查询', '统计分析','基础数据','系统管理'],
        rootSubmenuKeys: [this.$tcache('data.i18nKey239'), this.$tcache('data.i18nKey242'), this.$tcache('data.i18nKey250'), this.$tcache('data.i18nKey256'),this.$tcache('data.i18nKey260'), this.$tcache('data.i18nKey265')],
        openKeys: [],
        selectedKeys: [],
      },
      isAdmin: this.$store.state.isAdmin,//判断是否为管理员
      // roleMenu:false,
      isLogin:localStorage.getItem('RoleMenu')?true:false,
      RoleMenu:[],
      menus: [],
    }
  },
  computed:{
    ...mapState(['userInfo','language','languageCache']),
    sidebarWidth() {
      return this.language === "ch" ? 200 : 236
    },
    menusData() {
      return this.$transformI18n(menuJson);
    },
    // navWidth() {
    //   return this.language === "ch" ? this.sidebarWidth : this.sidebarWidth + 4
    // }
  },
  mounted() {
    this.RoleMenu=JSON.parse(localStorage.getItem('RoleMenu'))
    console.log(this.RoleMenu)
    // setTimeout(()=>{this.roleMenu=localStorage.getItem('RoleMenu')?.includes('newPassword')},1000)
    this.$router.push(this.$store.defaultPath).catch(err => { err })
    if (getClientType() == 'pc') {
      this.collapsed = false
    }
    this.menus=this.menusData.filter(m=>{
      let has=[]
      if(!this.isAdmin){
        this.RoleMenu.forEach(r => {
          let rr=r.replace('/','')
          if(rr=='group/admin_stationgroup'){
            rr='admin_stationgroup'
          }else if(rr=='admin_routeUpload/admin_routeImport/admin_routefiles/admin_routeUpload_new/admin_route'){
            rr='admin_route'
          }
          // console.log(m.title,rr,JSON.stringify(m.value).includes(rr))
          has.push(JSON.stringify(m.value).includes(rr))
        });
      }
      return has.includes(true)||this.isAdmin
    })
    console.log(this.RoleMenu)
    console.log(this.menus)
  },
  methods: {
    ...mapMutations(['clearAll']),
    onOpenChange(openKeys) {
      console.log(openKeys,"--------------")
      const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
      if (this.state.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.state.openKeys = openKeys;
      } else {
        this.state.openKeys = latestOpenKey ? [latestOpenKey] : [];
      }
    },

    getSideBarTitleName(code) {
      const codeStr = 'sidebar.' + code;
      return this.$tcache(codeStr)
    },

    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    toggleScreen() {
      if(this.screen){
        this.$refs.components_layout_side.$el.requestFullscreen()
      }else{
        if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
      }
      this.screen = !this.screen;
    },

    handleAdd() {
      let thetagkey = this.tags.find(item => item.key == this.tagName.key)
      console.log(thetagkey)
      if (!thetagkey) {
        this.tags.push({ key: this.tagName.key, name: this.tagName.domEvent.target.innerText, path: this.tagName.keyPath[0] })
        console.log(this.tags);
        this.$nextTick(() => {
          const containerElement = this.$refs["indexTagBox"];
          const rollingDistance = containerElement.scrollWidth - containerElement.offsetWidth;
          containerElement.scrollLeft = rollingDistance;

        });
      }
    },
    handleChange(item) {
      // 处理四个卡片跳转特殊路径
      const cardPathList = ['/onlineInfo','/abnormalMachine','/agvStatus','/onLineQtimeBaskVol'];
      const currentPath = this.$route.fullPath;
      if(cardPathList.includes(currentPath) && item.key === 'home') {
        this.$router.push(item.key);
      } else {
        if (item.key == this.lastTagName) { return; }
        this.$router.push(item.key)
        this.lastTagName = item.key
        this.title1 = item.path
        this.title2 = item.name
        console.log(item)
      }
      
    },
    handleClose2(event, name) {
      console.log(event, name)
      const index = this.tags.findIndex(item => item.key == name)
      console.log('before',this.tags)
      this.tags.splice(index, 1);
      console.log('after',this.tags)
      if(name==this.lastTagName&&this.tags.length!==0){
        console.log(name,this.lastTagName)
        this.$router.push(`/${this.tags[this.tags.length-1].key}`)
        this.lastTagName = this.tags[this.tags.length-1].key
        this.title1 = this.tags[this.tags.length-1].key
        this.title2 = this.tags[this.tags.length-1].name
      }
    },
    clearLocalStorageExcept(keyToKeep) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!keyToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      }
    },
    logout() {
      this.clearAll('')
      // localStorage.clear()
      // localStorage.setItem("language",this.language);
      // localStorage.setItem("langcache",this.languageCache)
      let noDelete=["language","langcache"]
      this.clearLocalStorageExcept(noDelete)
      this.$router.push('/login')
    },
    handleMenuClick(evt) {
      console.log(evt)
      if (evt.key == "monitor_lockp") {
        let key = evt.keyPath[1]
        sessionStorage.setItem('key', key)
        console.log(sessionStorage.getItem('key'))
        //  this.state.openKeys=sessionStorage.getItem('key')
        let { href } = this.$router.resolve({
          path: '/' + evt.key
        });
        window.open(href, '_blank');
        this.title1 = evt.keyPath[1]
        this.title2 = evt.domEvent.target.innerText || evt.keyPath[0]
        this.lastTagName = evt.key
        this.$router.push(evt.key).catch(err => { err })
        return;
      }
      // if(evt.key=="Map2"){window.location.href = `http://${window.location.host}/ca_editer/agv_broad.html`;return;}
      if (evt.key == "Map2") { window.open(`/ca_editer/agv_broad.html`); this.lastTagName = evt.key; return; }
      if (evt.key == "admin_trafficControl") { window.open(`/ca_editer/map.html`); this.lastTagName = evt.key; return; }
      this.$router.push(evt.key).catch(err => { err }) //注意：没有catch部分vue-router3.1以后版本会报错：Uncaught (in promise) NavigationDuplicated:..
      this.title1 = evt.keyPath[0]
      this.title2 = evt.domEvent.target.innerText || evt.keyPath[0]
      this.lastTagName = evt.key
      this.tagName = evt
      this.handleAdd()
    },
  },
  components:{
    Language
  }

};
</script>

<style lang="scss" scoped>
.nav-bar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  -webkit-box-shadow: 0 1px 4px rgba(0,21,41,.08);
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  .left-nav{
    padding: 14px 16px;
    cursor: pointer;
    line-height: 22px;
  }
  .left-nav:hover{
    background: rgba(0,0,0,.025);
  }
  .full_screen{margin-right: auto;cursor: pointer;}
}
.header{
  width: 100%;
  height: 50px;
  position: absolute;
  display: flex;
  top: 0px;
  right: 0;
  z-index: 10;
}
::v-deep .ant-layout-header{
  padding: 0px;
}
#components-layout-side .logo {
  height: 50px;
  // margin: 10px 0px;
  color: #5cc5d3;
  background: #ededed url("~@/assets/img/logo.png") no-repeat 10px center;
  background-size: 165px 35px;
  box-shadow: 0 0 6px 1px #ededed;
  box-sizing: border-box;
}

#components-layout-side .trigger {
  flex: 0 0 40px;
  max-width: 40px;
  min-width: 40px;
  width: 40px;
}

/*.ant-menu-inline-collapsed{*/
/*  width: 40px;*/
/*}*/
.hight {
  height: calc(100vh - 50px);
  overflow: auto;
}
.nav-wrapper{
  width: calc(100vw - 200px);
}
.login-info{
  display: flex;
  .user-name{
    padding-right: 18px;
    color: #2db7f5;
  }
  .logout {
  // position: fixed;
  // bottom: 0;
  // left: 60px;
  color: #b5bcc4;
  cursor: pointer;
  font-size: 14px;
  margin-right: 16px;
  
  &:hover {
    color: #40a9ff !important;
    // font-weight: bold;
  }
}
  
}


::v-deep .ant-menu-dark{
  background-color: #163447;
}
::v-deep .ant-menu-item:hover{
  background: #1f2d3d !important;
}
::v-deep .ant-menu-dark.ant-menu-inline .ant-menu-item,
::v-deep .ant-menu-dark.ant-menu-inline .ant-menu-submenu-title {
  text-align: left;
}
::v-deep .ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected{
  background-color: #1a3b5a;
}
::v-deep .ant-menu.ant-menu-dark .ant-menu-item-selected,
::v-deep .ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
  background-color: #1f2d3d;
  border-left: 6px solid #1f3a58;
  border-radius: 3px;
}

.col {
  background: #2db7f5;
  color: white;
  font-weight: bold;
}

.nocol {
  background: white;
  color: black;
}

.tag:hover {
  border: 1px solid #40a9ff;
}
.nocol ::v-deep .ivu-icon-ios-close:before{
  color: black;
}
::v-deep .ivu-icon-ios-close{
  position: relative;
  top: 1px;
  left: 2px;
  border-radius: 50%;
  background-color: transparent;
  transition: all .2s;
}

::v-deep .ivu-icon-ios-close:before {
  // color: black;
  font-size: 14px;
  color: white;
}

::v-deep .ivu-icon-ios-close:hover {
  
  // font-size: 12px;
  // background-color: #40a9ff;
  background-color: #a2b4b9;
  color: white;
}

::v-deep .ant-layout-sider-zero-width-trigger {
  right: -18px;
  width: 18px;
  height: 100px;
  padding-top: 30px;
  color: #40a9ff;
  background: repeating-linear-gradient(75deg, #163447, transparent 100px);
}

::v-deep .ant-layout-sider-children {
  // background: repeating-linear-gradient(45deg, #163447, transparent 100px);
  background: linear-gradient(#163447, #343e49);
  // background: #2f4a5b;
}

::v-deep .ant-menu-inline {
  background: rgba(255, 255, 255, 0);
  // overflow: auto;
  // max-height: 87vh;
}

::v-deep .ant-menu-dark .ant-menu-inline.ant-menu-sub {
  // background: linear-gradient(#14171a, #163447);
  // background: #ffffff12;
  background: rgb(48, 65, 86);
}

::v-deep .ant-menu-item,
::v-deep .ant-menu-submenu-title {

  // border-bottom: 1px solid #ffffff17;
  &:hover {
    background: #5099bc7a;
    font-weight: bold;
  }
}
// 定义滚动条的轨道颜色、内阴影及圆角
::-webkit-scrollbar-track{
    border-radius: 4px;
    /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3); */
    background-color: rgb(169, 167, 167);
}

.layout-right {
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
}
.content-wrapper{
  margin-top: 10px;
  height: calc(100% - 80px);
  overflow: auto;
}
.tagbox {
  text-align: left;
  height: 40px;
  width: 100%;
  padding: 4px 0;
  white-space: nowrap;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,.12), 0 0 3px 0 rgba(0,0,0,.04);
  scrollbar-width: none; /* firefox */
  -ms-overflow-style: none; /* IE 10+ */
  overflow-x:auto;
  overflow-y: hidden;
  padding-right: 10px;
}
.tagbox::-webkit-scrollbar{
  display: none;
}

.tagbox ::v-deep .ivu-tag {
  border-radius: 5px !important;
  // margin: 0 1px !important;
  margin-left: 8px !important;
  cursor: pointer;
  transition: border .2s;
}
::v-deep .ant-layout{
  overflow: hidden ;
  height: 100vh ;
}

::v-deep .ant-layout-footer{
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  padding: 0;
}
</style>

<template>
  <a-config-provider :locale="locale">
    <div id="app" @click="isTimeOut">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script>
import antdZhCN from 'ant-design-vue/es/locale-provider/zh_CN';
import antdEnUS from 'ant-design-vue/es/locale-provider/en_US';
import antdEnTH from 'ant-design-vue/es/locale-provider/th_TH';
import { mapMutations, mapState, mapActions } from 'vuex';
let timer_config=null;

const languageMap = {
  'ch': antdZhCN,
  'en': antdEnUS,
  'th': antdEnTH,
}

export default {
  data() {
    return {
      now:null,
      timeOut:30*60*1000,
      loginTime:null,

    };
  },
  name: "App",
  created(){
    this.queryConfig()
  },
  computed:{
    ...mapState(["language"]),
    locale() {
      const languageKey = this.language;
      return languageMap[languageKey];
    }
  },
  methods: {
    ...mapActions(["changeLanguage"]),
    ...mapMutations(['clearAll','recordLoginTime']),
    //全局监听得点击事件
    isTimeOut() {
      if(!this.loginTime){return}
      //点击前端界面任意位置，更新登录时间
      this.loginTime=this.now
      this.recordLoginTime(this.loginTime)
    },

    countDown() {
      let secondsToGo = 3;
      const modal = this.$success({
        title: '登录已超时(30分钟)',
        content: `将在${secondsToGo}秒后退出登录.`,
      });
      const interval = setInterval(() => {
        secondsToGo -= 1;
        modal.update({
          content: `将在${secondsToGo}秒后退出登录.`,
        });
      }, 1000);
      setTimeout(() => {
        clearInterval(interval);
        modal.destroy();
        this.$router.push('/login')
      }, secondsToGo * 1000);
    },

    queryConfig(){
      this.axios.get(`config/list`).then(res=>{
        console.log(res.data)
        if(Array.isArray(res.data)){
          res.data.forEach(d=>{
            if(d.key=='timeOut'){
              localStorage.setItem('timeOut',d.value)
            }
          })
        }else{
          this.$message.warning("config表数据请求失败")
        }
      }).catch(err =>{this.$message.error(`${err}`)})
      if(timer_config){
        clearTimeout(timer_config)
      }
      timer_config=setTimeout(()=>{this.queryConfig()},60000)
      
      this.loginTime = this.$store.state.loginTime;
      if(!this.loginTime){return}
      this.loginTime=Number(this.loginTime)
      this.now = Date.now()
      let s=localStorage.getItem('timeOut')
      if(s)this.timeOut=Number(s)*60*1000
      // 判断现在点击时间减去登录时的时间是否大于设定的时间
      // console.log('timeOut:'+this.timeOut/60000,'now-loginTime:'+(this.now-this.loginTime)/60000)
      if (this.now - this.loginTime > this.timeOut) {
        console.log(`登录超过${this.timeOut/60000}分钟，将退出登录`)
        this.clearAll('')
        localStorage.clear()
        this.countDown()
      }
    },

  },
};
</script>

<style lang="scss">
// $color:#5cc5d3;
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.Width_350 {
  width: 350px !important;
  // width: 460px;
}

.Width_200 {
  width: 200px !important;
  // width: 300px;
}

.fontSty {
  color: #40a9ff !important;
  font-weight: bold !important;
}

.ant-form-item-label{
  text-overflow: ellipsis;
}
</style>

<template>
  <div style="padding: 100px;">
    <a-row>
      <a-input-number @change="onChange" :placeholder="$tcache('monitor.carPlaceholder')" style="width: 200px;" autoFocus/>
    </a-row>
    <a-row>
      <a-tag type="flex" v-for="agv in agvs" :key="agv.id" @click="onClick" :data-id="agv.id" style="margin: 5px;">
        <b>{{agv.id}}:</b>{{agv.ip}}-{{agv.remark}}
      </a-tag>
    </a-row>


    <!-- 侧边栏 -->
    <a-drawer
        :title="$tcache('monitor.vehicle') + agv.id + ':' + agv.ip"
        :visible="visible_drawer"
        placement="bottom"
        @close="onDrawerClose"
        :body-style="{ paddingBottom: '20px' }"
        height="700"
    >
      <a-divider ><b>{{$tcache("monitor.vFeedback")}}</b></a-divider>
      <a-row type="flex" :gutter="[16,8]">
        <a-col :span="12"><b>{{$tcache('common.point')}}:</b> {{agvInfo.point|fmtPoint}}</a-col>
        <a-col :span="12"><b>{{$tcache('common.route')}}:</b> {{agvInfo.routeId}}</a-col>
        <a-col :span="12"><b>{{$tcache('common.state')}}:</b> {{agvInfo.state}}{{agvInfo.stateTitle}}</a-col>
        <!-- <a-col :span="12"><b>反馈时间:</b> <span :class="agvInfo.cssblink">{{agvInfo.ts|fmtTimeS}}</span> </a-col> -->
        <a-col :span="12"><b>{{$tcache('monitor.tFeedback')}}:</b> <span :class="agvInfo.cssblink">{{agvInfo.ts|fmtTime}}</span> </a-col>
        <!-- <a-col :span="12"><b>状态变化时间:</b> <span :class="agvInfo.cssblink">{{agvInfo.lastStateTs|fmtTs}}</span></a-col> -->
        <a-col :span="12"><b>{{$tcache('monitor.cahngeTime')}}:</b> <span :class="agvInfo.cssblink">{{agvInfo.lastStateTs|fmtTime}}</span></a-col>
      </a-row>
      <a-divider ><b>{{$tcache('monitor.aOtherInfo')}}</b></a-divider>
      <a-row type="flex" :gutter="[16,8]">
        <a-tag v-for="(v,key) in agvInfoOther" :key="key">
          <b>{{key}}:</b>
          <span v-if="key=='ts'" class="textblink" id="agvTs">{{v}}</span>
          <span v-else>{{v}}</span>
        </a-tag>
      </a-row>
      <a-divider ><b>{{$tcache('monitor.dInstruction')}}</b></a-divider>
      <a-row type="flex" :gutter="[16,8]">
        <!-- <a-col :span="12"><b>下发时间:</b> <span :class="toagv.cssblink">{{toagv.ts|fmtTs}}</span></a-col> -->
        <a-col :span="12"><b>{{$tcache('monitor.deliveryTime')}}:</b> <span :class="toagv.cssblink">{{toagv.ts|fmtTime}}</span></a-col>
        <a-col :span="12"><b>{{$tcache('monitor.instruction')}}:</b> {{toagv.message}}</a-col>
        <a-col :span="12"><b>{{$tcache('common.point')}}:</b> {{toagv.pointId}}</a-col>
        <a-col :span="12"><b>UDP:</b> {{toagv.data}}</a-col>
      </a-row>
      <a-divider v-if="routes&&(isAdmin||editable)" ><b>{{$tcache('common.operation')}}</b></a-divider>
      <a-row v-if="routes&&(isAdmin||editable)" >
        <label>{{$tcache('monitor.routing')}}：</label>
        <a-select @change="handleChangeRoute" style="width: 99%;" v-model="routeId">
          <a-select-option v-for="d in routes" :value="d.id" :key="d.id">{{d.id}}:{{d.points}}|{{d.otherPoints}}[{{d.remark}}]</a-select-option>
        </a-select>
        <a-button @click="sendRoute">{{$tcache('monitor.reroute')}}</a-button>
      </a-row>
    </a-drawer>
  </div>
</template>

<script>
import {getCurrentDate} from '../../utils/date.js'
export default {
  data(){
    return{
      agvs:[],
      agv:{},
      id: null, //选中的车辆ID

      all:[],
      visible_drawer: false,
      agvInfo:{},
      agvInfoCache:{},
      agvInfoOther:{},
      toagv:{},
      toagvCache:{},

      pointId:0, //车辆点位
      routes:null,
      routeId:null,//更改的路线
      isAdmin:this.$store.state.isAdmin,
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
    }
  },
  created() {
    this.queryData()
    this.clearCss_timer = setInterval(()=>{
      this.clearCss()
    }, 1000)
  },
  watch:{
    pointId(newVal, oldVal){
      console.log(newVal, oldVal)
      this.queryRelatedRoutes()
    }
  },
  beforeDestroy() {
    clearInterval(this.timer_agvinfo)
    clearInterval(this.timer_toagv)
    clearTimeout(this.timer_initWebSocket);
    this.timer_initWebSocket = null;
    clearTimeout(this.ws_timer);
    this.ws_timer = null;
    this.socket && this.socket.close()
    clearInterval(this.clearCss_timer);
    this.clearCss_timer = null;
  },
  methods:{
    queryData(){
      this.axios.get(`/agv/all`)
      .then(res=>{
        if(res.status ==200){
          this.all = res.data
          this.agvs = res.data
          console.log(res.data)
        }else{
          this.$message.warning(this.$tcache("common.queryFailure"))
        }
      }).catch(e=>{
        this.$message.error(e)
      })
    },
    queryAgvInfo(){
      return this.axios.get(`/cache/agvinfo/${this.id}`)
    },
    queryToAgv(){
      return this.axios.get(`/cache/toagv/${this.id}`)
    },
    queryLatestCache(){
      let that = this
      this.axios.all([this.queryAgvInfo(), this.queryToAgv()])
          .then(this.axios.spread((res1, res2)=>{
              console.log(res1,res2)
              if(res1.status ==200){
                that.agvInfo = res1.data
                that.makeAgvInfoOther(res1.data)
                that.setPointId(that.agvInfo)
              }else{
                that.$message.warning(this.$tcache("common.AFDFailed"))
              }
              if(res2.status ==200){
                that.toagv = res2.data
              }else{
                that.$message.warning(this.$tcache("common.ASDFailed"))
              }

            }
          )).catch(e=>{
            this.$message.error(e)
      })
    },
    setPointId(agvInfo){
      //设置当前AGV点位id,watch it and query routes
      if(agvInfo.point){
        this.pointId = agvInfo.point.id
      }
    },
    makeAgvInfoOther(agvInfo){
      let other = {}
      Object.keys(agvInfo).forEach(key => {
        if( ! ['ts','point','lastStateTs','state','routeId'].includes(key)){
          other[key] = agvInfo[key]
        }
      })
      this.agvInfoOther = other
    },
    onChange(value) {
      console.log('changed', value);
      if(value){
        // this.agvs = this.all.filter(e=>e.id.indexOf(value)!=-1)
        this.agvs = this.all.filter(e=>e.id == value)
      }else{
        this.agvs = this.all
      }
    },
    onClick(evt){
      let id = evt.target.dataset.id
      this.id = id
      console.log(id)
      let agvs = this.agvs.filter(e=>e.id == id)
      if(agvs.length){
        this.agv = Object.assign({}, agvs[0])
        this.visible_drawer = true
        this.queryLatestCache()
        if(this.socket){
          try{
            this.socket.close()
          }catch (e){console.error(e)}
        }
        clearTimeout(this.timer_initWebSocket);
        this.timer_initWebSocket = null;
        this.initWebSocket()
        this.queryRelatedRoutes() //查询点位关联路线
      }
    },
    onDrawerClose(){
      this.visible_drawer = false
    },

    initWebSocket(){
      //初始化websocket
      if(typeof(WebSocket) === "undefined"){
        this.$message.info(this.$tcache("common.NSupportWs"))
      }else{
        try {
          var url = new URL(document.location.href);
          var wsurl = `ws://${url.hostname}:${url.port||80}${process.env.VUE_APP_WS_PATH}/msg?agvid=${this.id}`;
          console.log(process.env)
          if(process.env.VUE_APP_PROXY){
            wsurl = 'ws://' + process.env.VUE_APP_PROXY + `/msg?agvid=${this.id}`
          }
          // var wsurl = `ws://${url.host}/agvinfo`;
          this.$message.info(this.$tcache("common.setupWs") + ': ' +  wsurl);
          this.socket = new WebSocket(wsurl);
          this.socket.onopen = this.onSocketOpen;
          this.socket.onerror = this.onSocketError;
          this.socket.onmessage = this.onSocketMessage;
          this.socket.onclose = ()=>{console.log('socket is closed')};
        }catch (e) {
          console.error(e);
        }

      }
    },
    onSocketOpen(){
      console.log(this.$tcache("common.socketSuccess"))
      this.$message.success(this.$tcache("common.socketSuccess"))
      this.ws_timer = setTimeout(()=>{
        this.socket.close();this.$message.success(this.$tcache("common.socketClosed"));
        clearInterval(this.timer_agvinfo)
        clearInterval(this.timer_toagv)
      },1000*60*10)
      this.timer_agvinfo = setInterval(()=>{
        if(Object.keys(this.agvInfoCache).length!=0){
          this.agvInfo = Object.assign({}, this.agvInfoCache, {cssblink: 'textblink', recvTs: Date.now()})
          this.makeAgvInfoOther(this.agvInfo)
          this.setPointId(this.agvInfo)
        }
      },1000)
      this.timer_toagv = setInterval(()=>{
        this.toagv = Object.assign({}, this.toagvCache, {cssblink: 'textblink', recvTs: Date.now()})
        if(Object.keys(this.toagvCache).length!=0){
          this.toagv = Object.assign({}, this.toagvCache, {cssblink: 'textblink', recvTs: Date.now()})
        }
      },1000)
    },
    onSocketError(){
      console.log(this.$tcache("common.socketFailed"))
      this.$message.error(this.$tcache("common.socketFailed"))
      this.timer_initWebSocket=setTimeout(this.initWebSocket, 10000); //会在每一次Err后执行，
    },

    onSocketMessage(evt){
      //{"battery":100,"commandStatus":0,"currentX":-931,"currentY":-514,"dataStr":"A1010505015DFCFEFD006400","direction":1,"id":1,"ip":"127.0.0.1","loadings":0,"port":63597,"routeId":5,"state":5,"stateTitle":"TZ","ts":1618565978961}
      var data = evt.data;
      if(typeof(data) === 'string'&&data.startsWith('{')){
        data = eval('('+data+')');
      }
      if(data && data.objType && data.objType == 'agvinfo') {
        this.agvInfoCache=data
        // this.agvInfo = Object.assign({}, data, {cssblink: 'textblink', recvTs: Date.now()})
        // this.makeAgvInfoOther(this.agvInfo)
        // this.setPointId(this.agvInfo)
      }else if(data && data.objType && data.objType == 'toagv'){
        this.toagvCache = data
        // this.toagv = Object.assign({}, data, {cssblink: 'textblink', recvTs: Date.now()})
      }
    },

    clearCss(){
      let t = Date.now();
      if(this.agvInfo.cssblink){
        if(this.agvInfo.ts && t - this.agvInfo.ts > 1000){
          this.agvInfo.cssblink = ''
        }
      }
      if(this.toagv.cssblink){
        if(this.toagv.ts && t - this.toagv.ts > 1000){
          this.toagv.cssblink = ''
        }
      }
    },

    queryRelatedRoutes() {
      if(!this.id) return;
      if(!this.agvInfo.point) return;
      let that = this
      this.axios.get(`/route/bypoint/${this.agvInfo.point.id}`)
      .then(res=>{
        if(res.status == 200){
          if(res.data.length){
            that.routes = res.data
          }else{
            this.routes = null
          }
        }else{
          that.$message.warning(this.$tcache("monitor.queryRouteFailed"))
        }
      }).catch(e=>{
        that.$message.error(e)
      })
    },
    handleChangeRoute(value){
      if(value){
        console.log(value)
        this.sendRoute()
      }
    },
    sendRoute(){
      let that = this
      this.$confirm({
        title:that.$tcache("common.prompt"),
        content:that.$tcache("monitor.changeRoute")`${that.routeId}？`,
        onOk(){
          that.axios.put(`agv/sendroute/${that.id}/${that.routeId}`).then(res=>{
            if(res.status == 200){
              if(res.data.success){
                that.$message.success(res.data.message||that.$tcache("monitor.routeSuccess"))
              }else{
                that.$message.warning(res.data.message||that.$tcache("monitor.routeFailed"))
              }
            }else{
              that.$message.warning(res.data.message|| that.$("common.requestException"))
            }
          }).catch(err=>{
            that.$message.error(that.$("common.requestException") + `:${err}`)
          })
        }
      })
    },
  },

  filters:{
    fmtPoint(val){
      if(val){
        return `${val.id}:${val.type}:${val.remark}[${val.x},${val.y}]`
      }
      return null
    },
    fmtTime(val){
      let ts = getCurrentDate(Number(val))
      if(ts&&val){
        return ts
      }
      return val
    },
  }
}
</script>

<style scoped>

.textblink{
  animation: blink .2s 3 steps(1);
  color: deeppink;
}
@keyframes blink{
  50% {
    color: transparent;
  }
}
</style>
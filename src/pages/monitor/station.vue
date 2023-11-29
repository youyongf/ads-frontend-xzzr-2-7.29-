<template>
  <div @click="close" class="box">
    <div class="flex">
      <a-row>
        <a-divider style="font-weight: bold;cursor: pointer;z-index:2"><span class="span" @click="change_on_off">{{$tcache('monitor.gxAbutment')}}<img v-show="!on_off" class="menu-img" src="../../assets/img/menu.png" alt=""><img v-show="on_off" class="menu-img" src="../../assets/img/menu2.png" alt=""></span></a-divider>
      </a-row>
      <!-- <a-row v-show="this.on_off">
        <a-divider style="font-weight: bold;margin:0;cursor: pointer;"><span class="span2" @click="change_on_off2">机台列表 <img v-show="!on_off2" class="menu-img menu-img2" src="../../assets/img/menu.png" alt=""><img v-show="on_off2" class="menu-img" src="../../assets/img/menu2.png" alt=""></span></a-divider>
      </a-row> -->
      <a-row>
        <a-divider  style="font-weight: bold;margin:0;">{{$tcache('monitor.abutmentInfo')}}</a-divider>
      </a-row>
    </div>

    <div class="position" v-show="on_off">
      <a-row>
        <!-- <a-radio-group style="border: 1px solid #40a9ff94;" v-model="step" v-for="item in steps" :key="'g'+item.id" @change="handleChangeGroup" button-style="solid"> -->
        <div class="stepsList"   v-for="item in steps" :key="'g'+item.id"  button-style="solid">
          <div @mouseover="openRight(item)" class="list-title1">{{item.id}}:{{item.name}} <span>></span></div>
          <div class="right"  v-show="item.id==stepId" style="display:flex;">
            <a-radio-group v-model="id" v-for="item in group[stepId]" :key="'s'+item[0]" @change="handleChangeStation">
              <a-radio-button  :value="item[0]">
                {{item[1]}}({{item[0]}})
              </a-radio-button>
            </a-radio-group>
          </div>
        </div>
        <!-- </a-radio-group> -->
      </a-row>
    </div>

    <!-- <div class="fixed second" v-show="on_off2">
      <a-row>
        <a-radio-group style="border: 1px solid #40a9ff94;" v-model="id" v-for="item in subgroup" :key="'s'+item[0]" @change="handleChangeStation">
          <a-radio-button style="width:190px;background: beige;" :value="item[0]">
            {{item[1]}}({{item[0]}})
          </a-radio-button>
        </a-radio-group>
      </a-row>
    </div> -->

    <!-- <a-row>
      <a-divider  style="font-weight: bold;margin:0;">机台对接信息</a-divider>
    </a-row> -->
    <a-row>
      <station-card :stationInfo="stationInfo" :station="station" :agvInfo="agvInStation" :tostation="tostation" :toagv="toagv"/>
    </a-row>
  </div>
</template>

<script>    
import {axiosget} from '../../utils'
import stationCard from "@/components/station/stationCard";
export default {
  components:{
    stationCard
  },
  data(){
    return{
      on_off:false,//对接步骤的展开与关闭
      on_off2:false,//机台列表的展开与关闭
      steps:[],//对接步骤
      stepId:-1,

      ids:[],
      stations:[],
      group:{},
      subgroup:[], //一个对接步骤的所有机台ID和名称列表： [[id, name],[id,name],...]
      step: null, // 对接步骤

      id:null, //当前选定机台ID
      //doPoint: null,  // 当前机台对接点id
      station:{}, //当前选择的机台配置

      stationInfo:{},//机台反馈
      agvInStation:{}, //进入机台对接的agv的反馈
      tostation: {},//发送给机台的指令
      toagv:{}, //发送给AGV指令
      stationInfoCache:null,
      agvInStationCache:null,
      tostationCache:null,
      toagvCache:null
    }
  },
  created() {
    this.querySteps()
    this.queryData()
  },
  beforeDestroy() {
    clearInterval(this.timer_Info)
    clearTimeout(this.timer_initWebSocket);
    this.timer_initWebSocket = null;
    clearTimeout(this.ws_timer);
    this.ws_timer = null;
    this.socket && this.socket.close()
  },
  methods:{
    openRight(item){
      this.stepId=item.id
    },
    close(){
    //   console.log(e.target.classList[1])
    //   if(e.target.classList[0]!="span"&&e.target.classList[0]!="menu-img"){
    //     console.log(this.on_off);this.on_off=false;console.log(this.on_off);
    //   }
    //   if(e.target.classList[0]!="span2"&&e.target.classList[1]!="menu-img2"){
    //     console.log(this.on_off2);this.on_off2=false;console.log(this.on_off2);
    //   }
    },
    change_on_off(){
      console.log(this.on_off);
      this.on_off=!this.on_off
      this.on_off2=this.on_off
      console.log(this.on_off);
    },
    change_on_off2(){
      this.on_off2=!this.on_off2
    },
    querySteps(){
      axiosget(`step/all`,{},(data)=>{
        this.steps = data
      })
    },
    queryData(){
      this.axios.post(`station/list`, {})
          .then(res=>{
            if(res.status==200){
              let ids =[]
              let group = {}
              res.data.forEach(item=>{
                ids.push(item.id)
                if(group[item.step]){
                  group[item.step].push([item.id,item.name])
                }else{
                  group[item.step] = [[item.id,item.name]]
                }
              })
              this.ids = ids
              this.group = group
              this.stations = res.data
              console.log('this.group',this.group)
            }else{
              this.$message.warning(this.$tcache('monitor.stationQueryFail01'))
            }
          }).catch(err=>{
        this.$message.error(`${this.$tcache('monitor.stationQueryFail02')}：${err}`)
      })
    },
    handleChangeGroup(){
      // this.on_off=!this.on_off
      this.on_off2=this.on_off
      //let val = evt.target.value
      // this.subgroup = this.group[this.step]
      for(let i=0;i<this.steps.length;i++){
        this.subgroup=this.subgroup.concat(this.group[this.steps[i].id])
      }
      console.log(this.subgroup)
    },
    handleChangeStation(){
      this.on_off=!this.on_off
      this.on_off2=!this.on_off2
      let station = this.stations.find(e=>e.id == this.id)
      if(! station){
        this.$message.error(this.id + this.$tcache('monitor.stationQueryFail03'))
        return;
      }
      this.station = station
      this.toagv = {}
      this.stationInfo = {}
      this.tostation = {}
      this.agvInStation = {}
      if(this.socket){
        try{
          this.socket.close(0, "socket close")
        }catch (e){
          console.error(e)
        }
      }
      clearTimeout(this.timer_initWebSocket);
      this.timer_initWebSocket = null;
      this.initWebSocket()
    },

    initWebSocket(){
      //初始化websocket
      if(this.socket){this.socket.close()}
      if(this.timer_Info){clearInterval(this.timer_Info)}
      if(typeof(WebSocket) === "undefined"){
        this.$message.info(this.$tcache('common.NSupportWS'))
      }else{
        try {
          // var wsurl = `ws://${process.env.VUE_APP_ADS_HOST}:81/text`||'ws://127.0.0.1:81/text';
          var url = new URL(document.location.href);
          console.log(url)
          var wsurl = `ws://${url.hostname}:${url.port||80}${process.env.VUE_APP_WS_PATH}/msg?pointid=${this.station.doPoint}`;
          if(process.env.VUE_APP_PROXY){
            wsurl = 'ws://' + process.env.VUE_APP_PROXY + `/msg?pointid=${this.station.doPoint}`
          }
          this.$message.info(this.$tcache('common.setupWs') + ': ' +  wsurl);
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
      console.log(`socket连接成功`)
      this.$message.success(this.$tcache('common.socketSuccess'))
      this.ws_timer = setTimeout(()=>{this.socket.close();this.$message.success(this.$tcache('common.socketClosed'));clearInterval(this.timer_Info)},1000*60*10)
      this.timer_Info=setInterval(()=>{
        console.log(this.stationInfoCache,this.agvInStationCache,this.tostationCache,this.toagvCache)
        if(this.stationInfoCache){
          if(this.stationInfoCache&&Object.keys(this.stationInfoCache).length>0){
            this.stationInfo=this.stationInfoCache
            // this.station=this.stationInfo
            // Object.assign(this.station,this.stationInfo)
            Object.keys(this.stationInfo).forEach(k=>{
              this.$set(this.station,k,this.stationInfo)
            })
          }else{
            this.stationInfo=null
          }
        }
        if(this.agvInStationCache){
          if(Object.keys(this.agvInStationCache).length>0){
            this.agvInStation=this.agvInStationCache
          }else{
            this.agvInStation=null
          }
        }
        if(this.tostationCache){
          if(Object.keys(this.tostationCache).length>0){this.tostation=this.tostationCache}else{this.tostation=null}
        }
        if(this.toagvCache){
          if(Object.keys(this.toagvCache).length>0){this.toagv=this.toagvCache}else{this.toagv=null}
        }
      },2000)
    },
    onSocketError(){
      console.log(`socket连接失败`)
      this.$message.error(this.$tcache('common.socketFailed'))
      console.log(this.socket)
      if(this.socket){
       this.timer_initWebSocket=setTimeout(this.initWebSocket, 10000); //会在每一次Err后执行，
      }
    },
    onSocketMessage(evt){
      //{"battery":100,"commandStatus":0,"currentX":-931,"currentY":-514,"dataStr":"A1010505015DFCFEFD006400","direction":1,"id":1,"ip":"127.0.0.1","loadings":0,"port":63597,"routeId":5,"state":5,"stateTitle":"TZ","ts":1618565978961}
      var data = evt.data;
      if(typeof(data) === 'string'&&data.startsWith('{')){
        data = eval('('+data+')');
      }
      if(data && data.objType && data.objType == 'stationinfo') {
        console.log(data)
        this.stationInfoCache = null
        if(data.doPoint && data.doPoint == this.station.doPoint){//车辆点位 == 机台doPoint
          this.stationInfoCache = data
        }
      }else if(data && data.objType && data.objType == 'agvinfo') {
        this.agvInStationCache = null
        if(data.point && data.point.id == this.station.doPoint){// 车辆点位 == 机台doPoint
          this.agvInStationCache = data
        }
      }else if(data && data.objType && data.objType == 'tostation') {
        console.log(data)
        this.tostationCache = null
        if(this.station && this.station.id == data.id){
          this.tostationCache = data
        }
      }else if(data && data.objType && data.objType == 'toagv') {
        this.toagvCache = null
        if(data.pointId && data.pointId == this.station.id){ //AGV点位==当前机台id(dotno）
          this.toagvCache = data
        }
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.menu-img{
  width: 20px;
  height: 20px;
}
.fixed{
  position: fixed;
  z-index: 2;
  left: 290px;
  top: 177px;
  width: 608px;
}
.second{
  top: 386px;
}
/* ::v-deep .ant-radio-button-wrapper:first-child:last-child{
  width: 150px;
} */
.flex{
  display: flex;
  /* justify-content: center; */
  align-items: center;
}
.box{
  height: 100vh;
}
.bgcol{
  background:#f0f8ff;
}
.stepsList{
  display: flex;
  // float: left;
  height: 25px;
  .list-title1{
    white-space: nowrap;
    width: 150px;
    // text-align: left;
    display: flex;
    // justify-content: space-between;
    // border: 1px solid #000;
    background: white;
    height: 25px;
    box-shadow:5px 10px 10px #888888;
    cursor: pointer;
    padding-left: 15px;
    &:hover{
      background: #eeeeee;
    }
    span{
    }
  }
  .list-title2{
    // padding: 10px;
  }
  .right{
    flex-wrap: wrap;
    // width: 550px;
    width: calc(100% - 150px);
    // width: 500px;
    // position: ;
    // background: #f0f8ff;
    // box-shadow:10px 10px 20px #888888;
    // border: 1px solid saddlebrown;
  }
}
::v-deep .ant-radio-button-wrapper{
  // border: none;
  box-shadow: 5px 5px 8px #888888;
}
.position{
  position: fixed;
  z-index: 5;
}
</style>
<template>
  <div style="background-color: #ececec; padding:0 20px;user-select:none;">
    <div style="display:flex;align-items: center;">
      
  
      <a-row>
        <a-divider style="font-weight: bold;margin:0;">
          {{$tcache('monitor.stationInfo')}}
          <a-select v-model="select">
            <a-select-option v-for="item in selects" :key="item.name" :value="item.id">{{item.name}}</a-select-option>
          </a-select>
        </a-divider>
      </a-row>
      <a-select v-model="step" style="width: 120px;margin-right: 5px;">
        <a-select-option v-for="item in steps" :key="'g'+item.id" :value="item.id" @click="handleChangeGroup(item.id)">{{item.name}}</a-select-option>
      </a-select>
      <a-button @click="stationType=-stationType" :style="{boxShadow: stationType>0?'1px 1px 5px 0 #676262 inset':'none',marginRight:'5px'}"><span class="fontSty">{{$tcache('common.cacheStation')}}</span></a-button>
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
      <!-- <div class="slider"><div>实时请求接口速度(秒/次):</div><div style="align-items: center;"><a-slider id="test" :max="max" v-model="count" /></div></div> -->
    </div>
    <div v-show="select=='card'">
       <!-- TODO 中文判断 -->
      <a-row :gutter="0" type="flex">
        <a-card v-for="item in listdata" :key="'s'+item.id" :title="item.name" :bordered="false" class="card" @click="handleClickStation" v-show="item.stationType>stationType"
         :style="{boxShadow:item.offline?'0px 0px 5px 0px inset':item.stringByControlState=='正常'?'0px 0px 5px 0px inset green':item.stringByControlState=='异常'?'0px 0px 5px 0px inset red':'0px 0px 5px 0px inset'}">
          <div class="cardbody">
            <span :style="{display:item.agvId?'block':'none'}">agv：<span style="color:rgb(0,140,255);font-weight: bold;">{{item.agvId}}，</span></span>
            <span>机台状态：<span :style="{color:item.controlState==2?'red':item.controlState==1?'green':'',fontWeight:'bold'}">{{item.controlState==1?'正常':item.controlState==2?'异常':''}}</span>，</span>
            <span>{{cacheLangage.abutmentPoint}}：{{item.doPoint}}，</span>
            <span>{{cacheLangage.threshold}}：{{item.limits}}，</span>
            <!-- <span>对接步骤：{{item.step|fmtStep}}，</span> -->
            <span>{{cacheLangage.enableOrNot}}：<span :style="{color:item.enabled?'green':'red',fontWeight:'bold'}">{{item.enabled?$tcache('admin.enabling'):$tcache('admin.closing')}}，</span></span>
            <span>{{cacheLangage.feedingStatus}}：{{item.inState|fmtState }}，</span>
            <span>{{cacheLangage.blankingStatus}}：{{item.outState|fmtState  }}，</span>
            <span>{{cacheLangage.feedQuantity}}：{{item.inNum}}，</span>
            <span>{{cacheLangage.dischargeQuantity}}：{{item.outNum}}，</span>
            <span>{{cacheLangage.group}}：{{item.group}}，</span>
            <span>{{cacheLangage.region}}：{{ item.area }}，</span>
            <span>IP：{{item.ip}}，</span>
            <span>{{cacheLangage.time}}：{{item.ts|fmtTime}}</span>
            <div v-if="item.cacheLayerInfos" style="text-align:center;width: 100%;margin:5px;">
              <a-popover v-for="k in Object.keys(item.cacheLayerInfos)" :key="k" :title="item.cacheLayerInfos[k].name" >
                <template slot="content">
                  <p>action: {{item.cacheLayerInfos[k].action}}</p>
                  <p>组别: {{item.cacheLayerInfos[k].group}}</p>
                  <p>进料状态: {{item.cacheLayerInfos[k].inState|fmtState}}</p>
                  <p>出料状态: {{item.cacheLayerInfos[k].outState|fmtState}}</p>
                  <p>层级: {{item.cacheLayerInfos[k].layer}}</p>
                  <p>最大花篮数: {{item.cacheLayerInfos[k].maxBasket}}</p>
                  <p>超时时间: {{item.cacheLayerInfos[k].timeOut}}</p>
                  <p>transferLayer: {{item.cacheLayerInfos[k].transferLayer}}</p>
                </template>
                <a-tag color="blue" style="cursor: pointer;">{{k}}</a-tag>
              </a-popover>
              <!-- <a-tag color="blue" v-for="k in Object.keys(item.cacheLayerInfos)" :key="k" style="cursor: pointer;">{{k}}</a-tag> -->
            </div>
            <a-space v-if="isAdmin||editable" style="width: 100%;display: flex;justify-content: center;">
              <a-button :type="item.enabled?'danger':'primary'" :data-id="item.id" @click="handleEnabled" size="small">
                {{item.enabled? cacheLangage.close: cacheLangage.enable}}
              </a-button>
              <a-button v-if="item.agvId" @click="unlockStation(item.id)" type="danger" size="small">
                <a-icon type="lock" />{{cacheLangage.unlock}}[agv{{item.agvId}}]
              </a-button>
              <a-tag v-else><a-icon type="unlock" />{{cacheLangage.idle}}</a-tag>
            </a-space>
          </div>
        </a-card>
      </a-row>
    </div>
    <a-modal  v-model="visible" :title="$tcache('common.details')" @ok="handleOk">
      <p>{{modalMsg}}</p>
    </a-modal>

    <div v-show="select=='table'">
      <a-row>
        <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :dataSource="listdata" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}" :bordered="true">
          <div slot="enabled" slot-scope="text" :style="{color:text?'green':'red',fontWeight:'bold'}" >{{text?$tcache('admin.enabling'):$tcache('admin.closing')}}</div>
          <div slot="stringByControlState" slot-scope="text" :style="{color:text=='正常'?'green':'red',fontWeight:'bold'}" >{{text}}</div>
          <div slot="step" slot-scope="text" :data-id="text" >{{text|fmtStep}}</div>
          <div slot="agvId" slot-scope="text" :data-id="text" style="color:rgb(0,140,255);font-weight: bold;" >{{text}}</div>
          <div slot="inState" slot-scope="text" :data-id="text" >{{text|fmtState}}</div>
          <div slot="outState" slot-scope="text" :data-id="text" >{{text|fmtState}}</div>
          <div class="editBtn" v-if="isAdmin||editable" slot="commonAction" slot-scope="text, record">
            <a-button :type="record.enabled?'danger':'primary'" :data-id="record.id" @click="handleEnabled" size="small">
              {{record.enabled?$tcache('common.close'):$tcache('common.enable')}}
            </a-button>
            <a-divider type="vertical" />
            <a-button v-if="record.agvId" @click="unlockStation(record.id)" type="danger" size="small">
              <a-icon type="lock" />{{$tcache('common.unlock')}}[agv{{record.agvId}}]
            </a-button>
            <a-tag v-else><a-icon type="unlock" />{{$tcache('common.idle')}}</a-tag>
          </div>
        </a-table>
        <!-- <a-pagination  :page-size="pagination.pageSize" v-model="pagination.current"  style="margin-top:10px"  show-quick-jumper  :total="total" @change="ChangePage" /> -->
      </a-row>
    </div>
  </div>
</template>

<script>
// import {makeColumns} from '../../utils'
import { getCurrentDate } from "../../utils/date.js";
//查询机台实时缓存信息，简单机台维护，如开启对接等
// import {axiosget} from "../../utils";
let vueApp=null;
const tableHeader = require('../../data/columns_stationinfolist.json');
export default {
  name: "stationState",
  data(){
    return{
      cacheLangage: {
        abutmentPoint: this.$tcache('monitor.abutmentPoint'),
        threshold: this.$tcache('monitor.threshold'),
        enableOrNot:this.$tcache('monitor.enableOrNot'),
        feedingStatus:this.$tcache('monitor.feedingStatus'),
        blankingStatus:this.$tcache('monitor.blankingStatus'),
        feedQuantity:this.$tcache('monitor.feedQuantity'),
        dischargeQuantity:this.$tcache('monitor.dischargeQuantity'),
        group:this.$tcache('admin.group'),
        region:this.$tcache('common.region'),
        time:this.$tcache('common.time'),
        close:this.$tcache('common.close'),
        enable:this.$tcache('common.enable'),
        unlock:this.$tcache('common.unlock'),
        idle:this.$tcache('common.idle'),
      },
      select:localStorage.getItem("stationsShowType")?localStorage.getItem("stationsShowType"):"card",//数据显示模式，true为卡片，false为表格
      selects:[//机台列表样式
        {id:'card',name: this.$tcache('monitor.card')},
        {id:'table',name: this.$tcache('common.table')}
      ],

      data:[],//查询结果
      visible: false,
      record:{}, //操作的行

      steps:[],//对接步骤
      step: this.$tcache('monitor.dockingSteps'), //当前选择的对接步骤

      allstations: [], //所有机台缓存状态
      group:{}, //{step1:[[id,name],[id,name],..], step2:[],...}
      subgroup:[], //一个对接步骤的所有机台ID和名称列表： [[id, name],[id,name],...]
      //卡片列表数据
      listdata:[],
      
      // count:10,//请求queryStationInfo的秒数
      max:10,//滑动块最大值
      modalMsg:'',
      isAdmin:this.$store.state.isAdmin,
      listdataCache:{},
      editable:localStorage.getItem('RoleMenu')?.includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      isUnlock:true,
      isUnlockAgvId:'',
      stationState:[
        {code:'Reset',desc: this.$tcache('monitor.stationState01')},
        {code:'Info',desc: this.$tcache('monitor.stationState02')},
        {code:'AllowTrans',desc: this.$tcache('monitor.stationState03')},
        {code:'AllowLeave',desc: this.$tcache('monitor.stationState04')},
        {code:'Error',desc: this.$tcache('monitor.stationState05')},
        {code:'Receive',desc: this.$tcache('monitor.stationState06')},
        {code:'Stop',desc: this.$tcache('monitor.stationState07')}
      ],
      stationType:-1
    }
  },
  computed: {
    columns() {
      return this.$transformI18n(tableHeader);
    }
  },
  watch:{
    select(){
      console.log(this.select)
      localStorage.setItem("stationsShowType",this.select)
    },
  },
  filters:{
    fmtStep:val=>{
      let steps = [...vueApp.steps]
      let step = steps.find(e=>e.id == val)
      if(step){
        return step.name
      }
      return val
    },
    fmtState:val=>{
      let states = [...vueApp.stationState]
      let state = states.find(e=>e.code == val)
      if(state){
        return state.desc
      }
      return val
    },
    fmtTime(val){
      let ts = getCurrentDate(val)
      if(ts){
        return ts
      }
      return val
    },
  },
  created() {
    this.queryStations().then(resolve=>{
      console.log(resolve)
      this.initWebSocket()
    })
  },
  beforeMount() {
    this.querySteps()
    if(this.editable||this.isAdmin)this.addRender()
    vueApp=this
  },
  beforeDestroy() {
    clearInterval(this.timer_stationinfo)
    clearTimeout(this.ws_timer);
    if(this.socket)this.socket.close()
    clearTimeout(this.timer_stationinfoError);
  },
  methods:{
    showModal(item){
      this.visible = true;
      this.modalMsg=JSON.stringify(item).replace(/\{/,'').replace(/\}/,'').split(',').join(' , ')
    },

    handleOk(e){
      console.log(e);
      this.visible = false;
    },
    addRender(){
      let b = this.columns.find(e=>e.dataIndex=='commonAction')
      if(b == undefined){//避免重复mounted时重复push(一般在开发模式下发生）
        let col = { title: this.$tcache('common.operation'), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right',width:180, scopedSlots: { customRender: 'commonAction' } }
        this.columns.push(col)
      }
    },

    clearForm(){
      this.step = this.$tcache('monitor.dockingSteps')
      this.isUnlock=true
      this.stationType = -1
      this.queryStations()
    },


    querySteps(){
      this.axios.get(`step/all`).then(res=>{
        let data=res.data
        if(Array.isArray(data)){
          this.steps = data
          console.log(`step`, data)
        }else {
          this.$notification.warn({message: this.$tcache('monitor.queryStepFail')})
        }
      })
    },
    queryStations(){
     return this.axios.get(`station/all`)
        .then(res=>{
          if(res.status==200 && Array.isArray(res.data)){
            // let group = {}
            res.data.forEach(item=>{
              if(typeof(item) == 'string'){
                item = JSON.parse(item)
              }
              // if(group[item.step]){
              //   group[item.step].push([item.id,item.name])
              // }else{
              //   group[item.step] = [[item.id,item.name]]
              // }
            })
            this.allstations = res.data;
            return this.queryStationInfo()
            // this.allstations = res.data
            // if(this.isUnlock){this.listdata=res.data}else{
            //   const index = this.listdata.findIndex(item=>item.id==this.isUnlockAgvId)
            //   let obj=this.allstations.filter(item=>item.id==this.isUnlockAgvId)
            //   this.$set(this.listdata,index,obj[0])
            //   this.isUnlock=true
            // }
          }else{
            this.$message.warning(this.$tcache('monitor.stationQueryFail01'))
          }
        }).catch(err=>{
          this.$notification.error({message:this.$tcache('monitor.stationQueryFail04'),description: err})
        })
    },
    queryStationInfo(){
      return this.axios.get(`cache/stationinfo/list`).then(res=>{
        let data=res.data
        if(Array.isArray(data)){
          data.forEach(s=>{
            let index=this.allstations.findIndex(a=>a.id==s.id)
            if(index!==-1){
              this.allstations[index].offline=true
              this.allstations[index].ts=s.ts
              this.allstations[index].inState=s.inState
              this.allstations[index].outState=s.outState
              this.allstations[index].inNum=s.inNum
              this.allstations[index].outNum=s.outNum
              this.allstations[index].stringByControlState=s.stringByControlState
              this.allstations[index].controlState=s.controlState
              if(s.cacheLayerInfos)this.allstations[index].cacheLayerInfos=s.cacheLayerInfos
            }
          })
          if(this.isUnlock){this.listdata=this.allstations}else{
            const index = this.listdata.findIndex(item=>item.id==this.isUnlockAgvId)
            let obj=this.allstations.filter(item=>item.id==this.isUnlockAgvId)
            console.log(obj)
            this.$set(this.listdata,index,obj[0])
            this.isUnlock=true
          }
          this.checkAgvLocked()
        }
      }).catch(()=>{
        this.$message.error(this.$tcache('monitor.stationQueryFail05'))
      })
    },
    handleChangeGroup(step){
      console.log(step)
      // this.listdata=[]
      // this.subgroup = this.group[step]
      // if(!this.subgroup){ this.$notification.warn({message:'查询结果为空'});return;}
      //过滤当前对接步骤的所有机台
      // let ids = this.subgroup.map(d=>d[0])
      let stations = this.allstations.filter(d=>d.step==step)
      console.log(stations)
      this.listdata = stations
      this.checkAgvLocked()
    },


    initWebSocket(){
      //初始化websocket
      if(typeof(WebSocket) === "undefined"){
        this.$message.info(this.$tcache('common.NSupportWS'))
      }else{
        try {
          //方式一：走服务端的代理，即需要nginx配置/msg代理转发
          var url = new URL(document.location.href);
          var wsurl = `ws://${url.hostname}:${url.port||80}${process.env.VUE_APP_WS_PATH}/msg?type=stationinfo`
          if(process.env.VUE_APP_PROXY){
            //方式二：若指定了服务地址VUE_APP_PROXY，则采用VUE_APP_PROXY与后台建立连接，不通过nginx代理
            wsurl = 'ws://' + process.env.VUE_APP_PROXY + `/msg?type=stationinfo`
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
      this.ws_timer=setTimeout(()=>{this.socket.close();this.$message.success(this.$tcache('common.socketClosed'));clearInterval(this.timer_stationinfo)},1000*60*10)
      this.timer_stationinfo=setInterval(()=>{
        if(Object.keys(this.listdataCache).length!=0&&this.listdataCache){
          this.listdata.forEach(lis=>{
            lis.offline=true
            lis.stringByControlState='离线'
          })
          this.allstations.forEach(a=>{
            a.offline=true
            a.stringByControlState='离线'
          })
          Object.keys(this.listdataCache).forEach((item)=>{
            let index=this.listdata.findIndex(d=>d.id==item)
            let index2=this.allstations.findIndex(d=>d.id==item)
            console.log(index,index2)
            // this.$set(this.listdata,item,this.listdataCache[item])
            if(index!=-1){
              Object.assign(this.listdata[index],this.listdataCache[item])
              this.listdataCache[item]=this.listdata[index]
            }
            if(index2!=-1){
              Object.assign(this.allstations[index2],this.listdataCache[item])
              this.listdataCache[item]=this.allstations[index2]
            }
          })
        }
        this.checkAgvLocked()
      },5000)
    },
    onSocketError(){
      console.log(`socket连接失败`)
      this.$message.error(this.$tcache('common.socketFailed'))
      this.timer_stationinfoError=setTimeout(this.initWebSocket, 10000); //会在每一次Err后执行，
    },
    onSocketMessage(evt){
      //{"power":100,"commandStatus":0,"currentX":-931,"currentY":-514,"dataStr":"A1010505015DFCFEFD006400","direction":1,"id":1,"ip":"127.0.0.1","loadings":0,"port":63597,"routeId":5,"state":5,"stateTitle":"TZ","ts":1618565978961}
      var data = evt.data;
      if(typeof(data) === 'string'&&data.startsWith('{')){
        data = eval('('+data+')');
      }
      console.log(data)
      if(data && data.objType && data.objType == 'stationinfo'){//机台反馈信息：id,name,outNum,inNum,controlState机台状态，ts
        // console.log('stationinfo',data)
        // if(data.controlState!=1){
        //   if(this.timer) clearTimeout(this.timer)
        //   this.timer= setTimeout(() => {this.$notification.info({message:`机台异常`,description:`${data.id}-${data.name}`})}, 1000);
        // }
        data.offline=false
        this.listdataCache[data.id]=data
      }
    },


    handleClickStation(evt){
      console.log(evt)
    },
    handleEnabled(evt){
      console.log(evt)
      let id = evt.target.dataset.id
      let station = this.listdata.find(d=>d.id == id)
      let enabled = station.enabled ? false: true
      this.axios.put(`station/enabled/${id}/${enabled}`)
      .then(res => {
        if(res.status == 200){
          if(res.data.success){
            this.$message.success(this.$tcache('common.operateSuccess'))
            station.enabled = enabled
          }else{
            this.$message.warning(this.$tcache('common.operateFail')||res.data.message)
          }
        }else{
          this.$message.warning(this.$tcache('monitor.responseFail'))
        }
      }).catch(err=>{
        this.$message.error(`${this.$tcache('common.operateFail')}: ${err}`)
      })
    },
    releaseStation(id){
      this.axios.put(`station/releaseStation/${id}`)
      .then(res=>{
        this.isUnlock=false
        this.isUnlockAgvId=id
        this.queryStations()
        this.$message.success(res.data.message)
      }).catch(err=>{this.$message.error(err)})
    },
    unlockStation(id){
      console.log(id)
      this.releaseStation(id)
    },
    /**
     * 通过遍历agvinfo中的targetPoint，锁定机台的车号. todo 这是一个临时方法，后续将改为从缓存lockp获得锁信息
     * @author Zhengys
     */
    checkAgvLocked(){
      //卡片模式下，存在前页数据时检查AGV锁状态
      if(this.listdata && this.listdata.length){
        this.axios.get(`cache/lockp`).then(res=> {
          if(res.status == 200){
            this.makeLockData(res.data);
          }else{
            this.$message.warning(this.$tcache('monitor.queryAvgFail'))
          }
        }).catch(err=>{
          this.$message.error(`${this.$tcache('monitor.queryAvgFail')}, ${err}`)
        })
      }
    },
    //检查机台锁信息 agvinfo.targetPoint
    makeLockData(agvInfos){
      // let lockp = {}
      // agvInfos.forEach(agv=>{
      //   if(agv.targetPoint > 0){
      //     lockp[agv.targetPoint] = agv.id
      //   }
      // })
      let points = Object.keys(agvInfos)
      // console.log(`lockp<doPoint:agvId>`, agvInfos)
      // console.log(`points:`, points)
      // console.log(`listdata:`, this.listdata)
      if(points.length){
        this.listdata.forEach((d,i)=>{
          if(d.relPids){
            let exitPoint=d.relPids.split(',')[0]
            let doPoint=d.relPids.split(',')[1]
            if(points.includes(doPoint)){
              d['agvId'] = agvInfos[doPoint] //agvId
              this.$set(this.listdata,i,d)
            }else if(points.includes(exitPoint)){
              d['agvId'] = agvInfos[exitPoint] //agvId
              this.$set(this.listdata,i,d)
            }else{
              d['agvId']=''
              this.$set(this.listdata,i,d)
            }
          }
          // console.log(`doPoint:${d.doPoint},exitPoint:${d.exitPoint},agvId:${lockp[d.doPoint]}`)
        })
      }
      // this.listdata.forEach(d=>{
      //   if(d.agvId) console.log(`station${d.id} locked by ${d.agvId}`)
      // })
    },

  }
}
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/style.scss';
.card{
  margin:10px 0 5px 5px; 
  max-width: 220px;
  border-radius: 3px;
  .cardbody{
    padding: 5px 0 10px 10px;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  span{
    display: inline-block;
  }
}
::v-deep .ant-tag{
  font-size: 14px;
  margin-right:25px;
}
::v-deep .ant-card-body{
  padding: 10px;
}
::v-deep .ant-table-thead > tr > th,::v-deep .ant-table-tbody > tr > td{
  text-align: center;
}
.flex{
  display: flex;
  justify-content: center;
  align-items: center;
}
.add{
  padding: 5px 10px;
  margin-bottom: 10px;
  border: 1px solid #d9d9d9;
}
::v-deep .ant-table-scroll table{
  background: white;
}
::v-deep .ant-radio-button-wrapper:first-child:last-child{
  width: 150px;
}
.menu-img{
  width: 20px;
  height: 20px;
}
.fixed{
  position: fixed;
  z-index: 2;
  left: 291px;
  top: 168px;
  width: 608px;
}
::v-deep .ant-row-flex{
  justify-content: space-around;
}
::v-deep .ant-slider {
  // width: 200px;
  margin: 0;
  padding: 0;
}
::v-deep .ant-slider-rail{
  height: 10px;
}
::v-deep .ant-slider-track{
  height: 10px;
}
::v-deep .ant-slider-handle{
  height: 20px;
  width: 20px;
}
.slider{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 500px;
  height: 30px;
  div{
    flex: 1;
    font-weight: bold;
  }
}
::v-deep .ant-table-thead > tr > th{
  background-color: $bgcolor !important;
  color: $color;
  font-weight: bold;
}
::v-deep .table-striped {
  background-color: #f0f0f0;
}
::v-deep .ant-modal-footer{
  display: none;
}
.editBtn{
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
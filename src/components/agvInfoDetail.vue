<template>
  <AForm :form="agv" layout="vertical" hide-required-mark>
    <a-row type="flex" :gutter="[16,10]">
      <a-col flex="300px" :span="1"><b>{{$tcache('common.point')}}:</b> {{agv.point|showPointInfo}}</a-col>
      <!-- <a-col flex="300px" :span="1"><b>IP:</b> {{agv.ip}}</a-col> -->
      <a-col flex="300px" :span="1"><b>{{$tcache('components.agvInfoDetail_C01')}}:</b> {{agv.power}}%</a-col>
      <a-col flex="300px" :span="1"><b>{{$tcache('components.agvInfoDetail_C02')}}:</b> {{agv.commandStatus == 1? $tcache('components.agvInfoDetail_C03'):$tcache('components.agvInfoDetail_C04')}}</a-col>
      <a-col flex="300px" :span="1">
        <b>{{$tcache('components.agvInfoDetail_C06')}}:</b> {{agv.stateTitle}}({{agv.state}}) {{$tcache('components.agvInfoDetail_C05')}}：{{(agv.ts-agv.lastStateTs)/1000}}
      </a-col>
      <a-col flex="300px" :span="1">
        <b>{{$tcache('components.agvInfoDetail_C07')}}：</b> {{agv.ts|fmtTime}}
      </a-col>
      <!-- <a-col flex="300px" :span="1"><b>物料:</b> {{agv.loadings|transLoadings}}</a-col> -->
      <a-col flex="300px" :span="1"><b>{{$tcache('components.agvInfoDetail_C08')}}:</b> {{agv.loadingsTitle}}</a-col>
      <a-col flex="300px" :span="1"><b>{{$tcache('components.agvInfoDetail_C09')}}:</b> {{agv2.from}}-&gt;<b>{{$tcache('components.agvInfoDetail_C10')}}</b>：{{agv2.to}}</a-col>
      <a-col flex="300px" :span="1"><b>{{$tcache('components.agvInfoDetail_C17')}}:</b> {{agv.routeId}}</a-col>
      <a-col flex="300px" :span="1"><b>{{$tcache('components.agvInfoDetail_C16')}}</b>：{{agv.batteryState?$tcache('monitor.charging'):$tcache('monitor.uncharged')}}<a-icon :style="{color:agv.batteryState?'green':'gray'}" type="thunderbolt" /></a-col>
      <!-- <a-col flex="300px" :span="1">
        <b>当前线号:</b> {{agv.routeId}}
        <a-input-number v-model="agv.routeIdNew" placeholder="手动输入路线号" style="width:80px;"/>
      </a-col> -->
      <!-- <a-col flex="300px" >
        <a-select show-search placeholder="选择一条路线" :filter-option="filterOption" v-model="agv.routeIdNew"  style="width: 185px">
          <a-select-option v-for="option in agvRoutes" :key="option.id" :value="option.id" :title="option.routePoints">{{option.id}}:{{option.remark}}【{{option.routePoints}}】</a-select-option>
        </a-select>
        <a-button type="primary" size="small" @click="confirmChangeLine">更改</a-button>
      </a-col> -->
      
<!--      <a-col flex="300px">-->
<!--        <a-select show-search placeholder="选择路径" :filter-option="filterOption" v-model="pathId"  style="width: 185px">-->
<!--          <a-select-option v-for="item in paths" :key="item.id" :value="item.id" :title="item.remark">{{item.remark}}【{{item.routes}}】</a-select-option>-->
<!--        </a-select>-->
<!--        <a-button v-if="pathId" type="primary" size="small" @click="confirmPathTask">调车</a-button>-->
<!--      </a-col>-->

      <!-- <a-col flex="300px" >
        <a-space size="middle">
          <a-button v-if="agv.state==1" type="primary" size="small" shape="round" @click="pauseAgv">暂停</a-button> -->
          <!-- 充电位：充电或到达状态 -->
          <!-- <a-button v-if="agv.state==4||agv.point && agv.point.type==21" type="primary" size="small" shape="round" @click="finishTransfer">结束充电</a-button> -->
          <!-- 交管. (停止,避障,急停不能干预） -->
          <!-- <a-button v-if="[5].includes(agv.state)" type="primary" size="small" shape="round" @click="startAgv">启动</a-button>
          <a-button v-if="agv.ctrlAreaId" type="primary" size="small" shape="round" @click="releaseCa">释放交管区{{agv.ctrlAreaId}}</a-button> -->
          <!-- 传输状态 -->
          <!-- <a-button v-if="agv.state == 3 || agv.state >= 9 && agv.state%2==1" type="warn" size="small" shape="round" @click="stopTransfer">停止对接(暂未启用)</a-button>
          <a-button v-if="agv.state == 3 || agv.state >= 9 && agv.state%2==0" type="warn" size="small" shape="round" @click="finishTransfer">完成对接</a-button>
          <a-button v-if="agv.state < 9 && agv.state != 3 && agv.taskId" type="primary" size="small" shape="round" @click="cancelTask">取消任务</a-button>
        </a-space>
      </a-col> -->

      <a-col flex="300px">
        <a-button type="primary" size="small" @click="showMore(agv)">{{$tcache('common.more')}}</a-button>.
      </a-col>

    </a-row>
  </AForm>
</template>

<script>
import {getCurrentDate} from '../utils/date.js'
export default {
  name: "agvInfoDetail",
  props:{
    agv:{type:Object,default:()=>{return {}}},
    agv2:{type:Object,default:()=>{return {}}},
  },
  data(){
    return{
      pathId:null,
      paths:[],
      agvRoutes:[],
    }
  },
  filters:{
    showPointInfo(point){
      if(point!=null){
        return point.remark == null? point.id: `${point.id}(${point.remark})`;
      }
    },
    transLoadings(val){
      if(val==0){
        return this.$tcache('components.agvInfoDetail_C11')
      }else if(val==1){
        return this.$tcache('components.agvInfoDetail_C12')
      }else if(val==16){
        return this.$tcache('components.agvInfoDetail_C13')
      }else if(val==17){
        return this.$tcache('components.agvInfoDetail_C14')
      }
    },
    fmtTime(val){
      let ts = getCurrentDate(val)
      if(ts){
        return ts
      }
      return val
    },
  },
  methods:{
    showMore(msg){
      this.$notification.info({message: this.$tcache('components.agvInfoDetail_C14',{id: msg.id}), description:JSON.stringify(msg).slice(1,-1).split(',').join(', ')})
    },
    //过滤出去停车点的路线
    filterAgvRoutes(agvInfo){
      if(agvInfo.point){
        //todo query related route
        // var pid = agvInfo.point.id;
        //this.agvRoutes = ;
      }else{
        this.agvRoutes = []
      }
    },
    filterOption(input, option) {
      return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    pauseAgv(){
      this.$message.info(`coming...`)
    },
    confirmChangeLine(){
      this.$message.info(`coming...`)
    },
    finishTransfer(){

    },
    stopTransfer(){

    },
    startAgv(){

    },
    releaseCa(){

    },
    cancelTask(){

    }
  }
}
</script>

<style scoped>

</style>
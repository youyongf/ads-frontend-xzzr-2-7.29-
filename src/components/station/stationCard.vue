<template>
  <a-card hoverable style="width: 100%;">
    <a-row>
      <a-tag style="width:145px;" type="flex" v-for="(v,key) in station" :key="'st'+ key" :title="`${key}: ${v}`">
        <b>{{key}}:</b>{{v}}
      </a-tag>
    </a-row>

    <a-row>
      <a-col :span="12">
        <a-row><h3>{{$tcache('components.stationCard_C01')}}</h3></a-row>
        <a-row type="flex" v-for="(v,key) in stationInfo" :key="key">
          <a-col :span="12">{{key}}:</a-col>
          <a-col :span="12">
            <span v-if="key == 'ts'" class="ts">{{v|fmtTimeS}}</span>
            <span v-else>{{v}}</span>
          </a-col>
        </a-row>
        <a-row v-if="!station.id">{{$tcache('admin.steplist05')}}</a-row>
      </a-col>
      <a-col :span="12">
        <a-row><h3>{{$tcache('components.stationCard_C02')}}</h3></a-row>
        <a-row type="flex" v-for="(v,key) in agvInfo" :key="key">
          <a-col :span="12">{{key}}:</a-col>
          <a-col :span="12">
            <span v-if="key == 'ts'" class="ts">{{v|fmtTimeS}}</span>
            <span v-else>{{v}}</span>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12" class="cmd">
        <a-row><h3>{{$tcache('components.stationCard_C03')}}</h3></a-row>
        <div v-if="tostation['message']" >
          <a-row>{{tostation.message}}</a-row>
          <a-row v-if="tostation.data">{{tostation.data}}</a-row>
          <a-row class="ts">{{tostation.ts|fmtTimeS}}</a-row>
        </div>
        <a-col v-else >{{$tcache('admin.steplist05')}}</a-col>
      </a-col>
      <a-col :span="12" class="cmd">
        <a-row><h3>{{$tcache('components.stationCard_C04')}}</h3></a-row>
        <div v-if="toagv['message']">
          <a-row>{{toagv.message}}</a-row>
          <a-row v-if="toagv.data">{{toagv.data}}</a-row>
          <a-row class="ts">{{toagv.ts|fmtTimeS}}</a-row>
        </div>
        <a-row v-else>{{$tcache('admin.steplist05')}}</a-row>
      </a-col>
    </a-row>
    <!-- <template slot="actions" class="ant-card-actions" >
      <a-button value="1" @click="onAction"><a-icon type="pic-right" />{{$tcache('components.stationCard_C05')}}</a-button>
      <a-button value="2" @click="onAction"><a-icon type="swap" />{{$tcache('components.stationCard_C06')}}</a-button>
      <a-button value="3" @click="onAction"><a-icon type="export" />{{$tcache('components.stationCard_C07')}}</a-button>
      <a-button value="4" @click="onAction"><a-icon type="close-square" />{{$tcache('components.stationCard_C08')}}</a-button>
    </template> -->

    <a-row>
      <h3>{{$tcache('components.stationCard_C09')}}：</h3>
      <a-col :span="12">
        <div v-for="item in log_station" :key="item.ts"><a-tag>{{item.ts|fmtTimeS}}</a-tag>: {{item.msg}}</div>
      </a-col>
      <a-col :span="12">
        <div v-for="item in log_agv" :key="item.ts"><a-tag>{{item.ts|fmtTimeS}}</a-tag>: {{item.msg}}</div>
      </a-col>
    </a-row>
  </a-card>
</template>
<script>

export default {
  name: "StationCard",
  props:{
    stationInfo:{type:Object,default:()=>{return {}}},
    station:{
      type:Object,
      default:()=>{
        return{state:0}//对象或数组默认值必须从一个工厂函数获取
      }
    },
    agvInfo:{type:Object,default:()=>{return{state:0}}},
    tostation:{type:Object,default:()=>{return{message:''}}},
    toagv:{type:Object,default:()=>{return{message:''}}},
  },
  data(){
    return{
      logs:[],
      stationcmd: null,
      //信号日志流: 用于监视信号先后关系 [{msg,ts}]
      log_station:[],
      log_agv:[],
    }
  },
  watch:{
    stationInfo:{
      handler(newVal, oldVal) {
        console.log('stationinfo', newVal, oldVal)
        let msg = `${newVal?.state}: ${newVal.transDirection} | out:${newVal.outNum} | in:${newVal.inNum}`
        if(newVal.state != oldVal.state){
          this.log_station.push({ts:newVal.ts, msg: msg})
        }else {
          if(this.log_station.length){
            let lastIndex = this.log_station.length -1
            this.log_station[lastIndex] = {ts:newVal.ts, msg: msg}
          }else{
            this.log_station.push({ts:newVal.ts, msg: msg})
          }
        }
      },
      deep: true
    },
    agvInfo:{
      handler(newVal, oldVal){
        console.log('agvInfo', newVal, oldVal)
        if(!newVal.state) return
        let msg = `state: ${newVal.state}, loadings: ${newVal.loadings}`
        if(newVal.state != oldVal.state){
          this.log_agv.push({ts:newVal.ts, msg: msg})
        }else {
          if(this.log_agv.length){
            let lastIndex = this.log_agv.length -1
            this.log_agv[lastIndex] = {ts:newVal.ts, msg: msg}
          }else{
            this.log_agv.push({ts:newVal.ts, msg: msg})
          }
        }
      },
      deep:true
    },
    toagv:{
      handler(newVal, oldVal){
        console.log('toagv', newVal, oldVal)
        if(!newVal.message) return
        let msg = `[toagv]${newVal.message}[${newVal.data}]`
        if(newVal.data != oldVal.data){
          this.log_agv.push({ts: newVal.ts, msg: msg})
        }else{
          if(this.log_agv.length){
            let lastIndex = this.log_agv.length -1
            this.log_agv[lastIndex] = {ts:newVal.ts, msg: msg}
          }else{
            this.log_agv.push({ts:newVal.ts, msg: msg})
          }
        }
      },
      deep:true
    },
    tostation:{
      handler(newVal, oldVal){
        console.log('tostation', newVal, oldVal)
        if(!newVal.message) return
        let msg = `[tostation]${newVal.message}[${newVal.data}]`
        if(newVal.data != oldVal.data){
          this.log_station.push({ts: newVal.ts, msg: msg})
        }else{
          if(this.log_station.length){
            let lastIndex = this.log_station.length -1
            this.log_station[lastIndex] = {ts:newVal.ts, msg: msg}
          }else{
            this.log_station.push({ts:newVal.ts, msg: msg})
          }
        }
      },
      deep:true
    }
  },
  filters:{
    fmtType(val){
      //不好使：标签以字符显示
      if(typeof(val) === 'string'){
        return `<span style="color:red;">${val}</span>`
      }else if(typeof(val) === 'string'){
        return `<span style="color:green;">${val}</span>`
      }else {
        return val
      }
    },
    fmtEmphasis(val){
      if(['inNum','outNum'].includes(val)){
        return `<span style="font-width: bold;">${val}</span>`
      }else{
        return val
      }
    },
  },
  methods:{
    handleStationCmd(val){
      console.log(val)
    },
    onAction(evt){
      console.log(evt.target.value)
      this.$message.info(`coming soon ..`)
    },
  }
}
</script>

<style type="text/css">
.ant-card-body{
  padding: 0!important;
}
.ant-col{
  border: 1px gray dotted
}
.cmd{
  background-color: beige;
}
.ts{
  font-weight: bold;
  color: orangered;
}
.ant-tag{
  text-overflow: ellipsis;
  overflow: hidden;
}
.ant-row{
  padding: 5px;
}
</style>
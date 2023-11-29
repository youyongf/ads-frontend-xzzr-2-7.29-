
<template>
  <div>
    <a-row class="query-form">
      <a-date-picker v-model="workday" :placeholder="$tcache('common.selectDate')" @change="finishTime_onChange" />
      <a-button class="mr" @click="queryData"><span class="fontSty">{{$tcache('common.query')}}</span></a-button>
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
    </a-row>
    <div id="main"></div>
    <a-row class="query-form">
      {{$tcache('common.productionProcesses')}}：<a-select style="width:100px;" v-model="processName" :options="processData" :placeholder="$tcache('report.currentStep')"></a-select>
      <a-range-picker class="mr" v-model="workday2"  @change="time_onChange" />
      <a-button @click="queryData2"><span class="fontSty">{{$tcache('common.query')}}</span></a-button>
      <a-button class="mr" @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
    </a-row>
    <div id="maychar"></div>
  </div>
</template>
   
<script>
// import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import moment from "moment";
// import {getCurrentDate} from '../../utils/date.js'
export default {
  data() {
    return {
      dateFormat:'YYYY-MM-DD',
      // locale,//时间选择器中文
      workday: null,
      process:[],
      amount:[],
      
      process2:[],
      amount2:[],
      processName:'',
      processData:[],
      workday2: null,
    };
  },
  created(){
    let date=new Date()
    let day=date.getDate()-1
    if(day==0){
      date.setDate(0)
    }
    let year=date.getFullYear()<10?'0'+date.getFullYear():date.getFullYear()
    let month=date.getMonth()<9?'0'+(date.getMonth()+1):date.getMonth()+1
    day=date.getDate()<10?'0'+(date.getDate()-1):date.getDate()-1
    this.workday=moment(`${year}-${month}-${day}`)

    let date2=new Date()
    date2.setDate(0)
    let year2=date2.getFullYear()<10?'0'+date2.getFullYear():date2.getFullYear()
    let month2=date2.getMonth()<9?'0'+(date2.getMonth()+1):date2.getMonth()+1
    let day2=date2.getDate()<10?'0'+date2.getDate():date2.getDate()
    this.workday2=[moment(`${year2}-${month2}-01`),moment(`${year2}-${month2}-${day2}`)]
  },
  mounted() {
    this.queryData()
    // this.queryData2()
    this.queryProcess()
  },
  methods: {
    // 基本柱形图
    change() {
      const chartBox = this.$echarts.init(document.getElementById("main"));
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            label: {
              show: true
            }
          }
        },
        xAxis: {
          data: this.process.length==0?[]:this.process,
        },
        yAxis: {},
        series: [
          {
            type: "bar",
            data: this.amount.length==0?[]:this.amount,
            label: {
              show: true,
              position: 'top',
              valueAnimation: true,
              color: '#5470c6'
            }
          },
        ],
      };
      chartBox.setOption(option);
      // 根据页面大小自动响应图表大小
      window.addEventListener("resize", function () {
        chartBox.resize();
      });
    },
    finishTime_onChange(date, dateString) {
      console.log('finishTime',date, dateString=='');
      this.workday=moment(dateString)
      console.log(this.workday._i)
    },
    clearForm(){
      this.workday=''
    },
    queryData() {
      if(!this.workday._i){this.$message.info(this.$tcache("report.selectTimeQuery"));return}
      this.axios.get(`rpt/transfer/day/${this.workday._i}`).then((res) => {
        if(res.data?.length!=0){
          let data = res.data
          this.process=data.map(item=>{return item.process})
          this.amount=data.map(item=>{return item.amount})
          console.log(this.process,this.amount)
        }
        if(res.data?.length==0){
          this.$message.info(this.$tcache("report.dailyTransEmpty"));
          this.process=[];
          this.amount=[]
        }
        this.change();
      }).catch(err => { this.$message.error(err) })
    },




    // 折线图
    changetype() {
      // 获取组件实例
      const machart = this.$echarts.init(document.getElementById("maychar"));
      // 设置配置项
      const option = {
        xAxis: {
          data: this.process2.length==0?[]:this.process2,
        },
        yAxis: {},
        series: [
          {
            data: this.amount2.length==0?[]:this.amount2,
            type: "line",
            stack: "x",
          },
        ],
      };
      // 复制
      machart.setOption(option);
      // 根据页面大小自动响应图表大小
      window.addEventListener("resize", function () {
        machart.resize();
      });
    },
    queryProcess(){
      this.axios.get(`dict/process`).then((res) => {
        if(res.data?.length!=0){
          this.processData=res.data.map(item=>{
            return {value:item.value,label:item.label}
          })
          this.processName=this.processData[0].label
          this.queryData2()
        }
      }).catch(err => { this.$message.error(err) })
    },
    time_onChange(date, dateString) {
      console.log('time',date, dateString);
      this.workday2=[moment(dateString[0]),moment(dateString[1])]
      console.log(this.workday2)
      this.queryData2()
    },
    queryData2(){
      if((this.processName??'')==''){this.$message.info(this.$tcache("report.notSelectDataIncorrect"));return}
      let url = `${this.processName}?beginDay=${this.workday2[0]._i}&endDay=${this.workday2[1]._i}`
      this.axios.get(`rpt/transfer/day/process/${url}`).then((res) => {
        if(res.data?.length!=0){
          let data = res.data
          this.process2=data.map(item=>{return item.workday})
          this.amount2=data.map(item=>{return item.amount})
          // console.log(this.process2,this.amount2)
          this.changetype();
        }
        if(res.data?.length==0)this.$message.info(this.$tcache("report.trendisEmpty"))
      }).catch(err => { this.$message.error(err) })
    },
  }
};
</script>
   
<style lang="scss" scoped>
#main {
  min-width: 31.25rem;
  min-height: 31.25rem;
  // max-height: 500px;
}

#maychar {
  max-height: 500px;
  // max-height: 400px;
  height: 500px;
}

.mr {
  margin: 20px;
}
</style>
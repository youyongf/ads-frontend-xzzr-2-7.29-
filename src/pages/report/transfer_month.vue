
<template>
  <div>
    <a-row class="query-form">
      <a-month-picker v-model="workday" :placeholder="$tcache('common.selectDate')" :locale="locale" @change="finishTime_onChange" />
      <a-button class="mr" @click="queryData"><span class="fontSty">{{$tcache('common.query')}}</span></a-button>
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
    </a-row>
    <div id="main"></div>
  </div>
</template>
   
<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import moment from "moment";
// import {getCurrentDate} from '../../utils/date.js'
export default {
  data() {
    return {
      locale,//时间选择器中文
      workday: null,
      process:[],
      amount:[],
    };
  },
  created(){
    let date=new Date()
    let day=date.getDate()-1
    console.log(day)
    if(day==0){
      date.setDate(0)
    }
    console.log(date.getMonth())
    let year=date.getFullYear()<10?'0'+date.getFullYear():date.getFullYear()
    let month=date.getMonth()<9?'0'+(date.getMonth()+1):date.getMonth()+1
    this.workday=moment(`${year}-${month}`)
  },
  mounted() {
    this.queryData()
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
      console.log(this.workday._i)
      let arr=this.workday._i.split('-')
      let year=`${arr[0]}`
      let month=`${Number(arr[1])}`
      this.axios.get(`rpt/transfer/year/${year}/month/${month}`).then((res) => {
        if(res.data?.length!=0){
          let data = res.data
          this.process=data.map(item=>{return item.process})
          this.amount=data.map(item=>{return item.amount})
          console.log(this.process,this.amount)
        }
        if(res.data?.length==0)this.$message.info(this.$tcache("report.monthlyEmpty"))
        this.change();
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
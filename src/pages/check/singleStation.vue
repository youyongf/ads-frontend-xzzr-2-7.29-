<template>
  <div>
    <a-row class="query-form">
      {{$tcache('check.step')}}：<a-select v-model="step">
        <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      {{$tcache('check.shift')}}：<a-select  v-model="workshift" :options="workshifts"/>
      <a-date-picker :allowClear="false" v-model="keyValue_begin" :placeholder="$tcache('check.selectDate')" @change="finishTimeBegin_onChange" />
      <a-button class="check_btn" @click="checkQueryData"><span class="fontSty">{{$tcache('check.query')}}</span></a-button>
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearedCondition')}}</span></a-button>
    </a-row>
   <a-spin :spinning="spinning">
    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="false"    :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{x: true}">
        <!-- <a-tag class="fontColor" slot="agvAction" slot-scope="text" :data-id="text" :style="{color:text=='in'?'green':'red'}" >{{text=='in'?'传进':text=='out'?'传出':text=='inOut'?'换料':''}}</a-tag> -->
        <a-tag class="fontColor" slot="agvAction" slot-scope="text" :data-id="text" :style="{color:text=='传进'?'green':text=='传出'?'red':''}" >{{text}}</a-tag>
        <a-tag class="fontColor" slot="basketType" slot-scope="text" :data-id="text" >{{text==1?$tcache('check.flowerBasket'):''}}{{text==2?$tcache('check.origSilMalBox'):''}}{{text==3?$tcache('check.finishedMaterialBox'):''}}</a-tag>
        <a-tag class="fontColor" slot="materialType" slot-scope="text" :data-id="text" :style="{color:text==1?'green':'red'}"  >{{text==1?'料':'空篮'}}</a-tag>
        <div class="fontColor" slot="workday" slot-scope="text" :data-id="text" >{{text|fmtDateTime}}</div>
        <div class="fontColor" slot="countTime" slot-scope="text" :data-id="text" >{{text|fmtDateTime}}</div>
        <div class="fontColor" slot="step" slot-scope="text" :data-id="text" >{{text|fmtStep}}</div>
      </a-table>
      <div style="margin-top:10px" class="flex">
        <!-- <div class="flex fontSty">总条数: <button class="btn">{{total}}</button></div> -->
        <div class="flex fontSty">{{$tcache('common.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pageSize"  :placeholder="$tcache('common.rowsPerPage')"/></div>
        <a-pagination :page-size="pageSize"  v-model="current"  show-quick-jumper  :total="total" />
      </div>
    </a-row>
    </a-spin>
  </div>
</template>

<script>
// import {makeColumns} from '../../utils'
import {getCurrentDate} from '../../utils/date.js'
// import zhCN from 'antd/es/locale/zh_CN'
// import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
// import moment from 'moment';
// import 'moment/locale/zh-cn';
// moment.locale('zh-cn')
let vueApp=null;
const tableData = require('../../data/columns_singleStation.json');
export default {
  name: "check_transferlog",
  data(){
    return{
      agvActions:[//传输动作选项内容
        {id:'in',name:this.$tcache("check.passIn")},
        {id:'out',name:this.$tcache("check.outGoing")},
        {id:'inOut',name:this.$tcache("check.refueling")}
      ],
      steps:[],//对接步骤下拉内容
      keyValue:[],//时间选择器的值
      keyValue_begin:'',//开始时间选择器的值
      dateTime_begin:'',//开始时间(没有时分秒)
      startTime:'',//开始时间段
      endTime:'',//结束时间段
      keyValue_end:'',//结束时间选择器的值
      dateTime_end:'',//结束时间(没有时分秒)
      spinning:false,//是否加载中
      // locale,//日期选择器中文文件

      data:[],//查询结果
      page:'',//页数
      total:0,//查询得到数据的条数
      current: 1,
      pageSize:Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):Number(this.$store.state.defaultPageSize),//每页的行数
      step:'',
      workday:'',
      workshift:'',
      workshifts:[
        {value:'A',label:this.$tcache("check.dayShift")},
        {value:'B',label:this.$tcache("check.nightShift")}
      ]
    }
  },
  filters:{
    fmtStep(val){
      let steps = vueApp.steps
      let step=steps.find(e=>e.id == val)
      if(step){
        return step.name
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
  computed: {
    columns() {
      return this.$transformI18n(tableData, "title");
    },
  },
  beforeMount() {
    this.querySteps()
    vueApp=this
  },
  methods:{
    finishTimeBegin_onChange(date, dateString) {
      console.log('finishTimeBegin',date, dateString);
      // this.form.finishTimeBegin= new Date(dateString.replace(/-/g,'/')).getTime()
      this.workday=dateString
    },
    clearForm(){
      this.data=[]
      this.keyValue_begin=''
      this.workday=''
      this.step=''
      this.workshift=''
      this.total=0
      this.spinning=false
    },
    checkQueryData(){
      if(!this.step||!this.workday||!this.workshift){
        this.$message.warning(this.$tcache("check.allOptNoBeEmpty"))
        return
      }
      this.spinning=true;
      this.axios.get(`rpt/transfer/day/step/${this.step}/workday/${this.workday}/workshift/${this.workshift}`).then(res=>{
        if(res.status == 200&&Array.isArray(res.data)){
          if(res.data.length==0){this.$message.info(this.$tcache("check.queryIsEmpty"))}
          this.data = res.data
          this.spinning=false
          this.total=Number(this.data.length)
        }else{
          this.$message.error("数据有误")
          this.spinning=false;
        }
      }).catch(err=>{this.$message.error(err);this.spinning=false})
    },
    querySteps(){//获取对接步骤下拉内容
      this.axios.get(`step/all`).then( (res)=>{
        if(Array.isArray(res.data)&&res.data?.length!==0)this.steps =res.data
      }).catch(err=>{this.$message.error(err)})
    },
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
::v-deep .ant-table-thead > tr > th,::v-deep .ant-table-tbody > tr > td{
  text-align: center;
}
::v-deep .ant-table-fixed-right{
  display: none;
}
// ::v-deep .ant-pagination{
//   display: none;
// }
.page{
  float: right;
  span{
    display: inline-block;
    padding: 10px;
    border: 1px  solid #ada9a9;
    margin-right: 10px;
    margin-left: 20px;
    margin-top: 10px;
    border-radius: 5px;
    background-color: #f4f8fc;
    cursor: pointer;
  }
  // user-select:none;
}
.pagecount{
  border: 1px solid #1890ff;
  color: #1890ff;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}
.box{
  display: flex;
  justify-content: center;
  // user-select: none;
  span{
    cursor: pointer;
  }
}
.check_btn{
  margin-right: 20px;
}
::v-deep .ant-pagination-options-quick-jumper input{
  text-align: center;
}
::v-deep .ant-table-thead > tr > th{
  background-color: $bgcolor !important;
  color: $color;
  // font-weight: bold;
}
.flex{
  display: flex;
  justify-content: center;
  align-items: center;
}
.btn{
    padding: 1px 10px;
    margin: 0 10px;
    border-radius: 5px;
    border: 0;
    font-size: 18px;
    color: #7df9ff;
    box-shadow: 1px 1px 8px;
    cursor: pointer;
    font-weight: bold;
    background-color: rgb(0 0 0 / 25%);
}
::v-deep .table-striped {
  background-color: #f0f0f0;
}
.export-excel{
  display: inline;
}
</style>
<template>
  <div>
    <a-row class="query-form">
      <a-input v-model="form.agvId" :placeholder="$tcache('check.vehicleID')"/>
      <a-input v-model="form.pointId" :placeholder="$tcache('check.location')"/>
      <a-input v-model="form.state" :placeholder="$tcache('check.state')" />
      <a-date-picker :allowClear="false" v-model="keyValue_begin" :placeholder="$tcache('check.startDate')" @change="stateTimeBegin_onChange" />
      <a-time-picker :allowClear="false" v-model="startTime" :placeholder="$tcache('check.startTimePeriod')" @change="beginTimes" />
      <a-date-picker :allowClear="false" v-model="keyValue_end" :placeholder="$tcache('check.endDate')" @change="stateTimeEnd_onChange" />
      <a-time-picker :allowClear="false" v-model="endTime" :placeholder="$tcache('check.endTimePeriod')" @change="endTimes" />
      <a-select mode="multiple" v-model="form.dstep" :placeholder="$tcache('check.dockingSteps')">
        <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <a-input v-model="form.stationIp" :placeholder="$tcache('check.machineIP')" />
      <a-button class="check_btn" @click="check"><span class="fontSty">{{$tcache('check.query')}}</span></a-button>
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearedCondition')}}</span></a-button>
    </a-row>
    <a-spin :spinning="spinning">
    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="false" :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
        <div class="fontColor" slot="ts" slot-scope="text" :data-id="text" >{{text|fmtTime}}</div>
        <div class="fontColor" slot="step" slot-scope="text" :data-id="text" >{{text|fmtStep}}</div>
      </a-table>
      <div style="margin-top:10px" class="flex">
        <div class="flex fontSty">{{$tcache('check.totalNumberArticles')}}: <button class="btn">{{total}}</button></div>
        <div class="flex fontSty">{{$tcache('common.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pageSize" :placeholder="$tcache('common.rowsPerPage')"/></div>
        <a-pagination :page-size="pageSize"  v-model="current"  show-quick-jumper  :total="total" @change="ChangePage" />
      </div>
    </a-row>
    </a-spin>
  </div>
</template>

<script>
import {getCurrentDate} from '../../utils/date.js'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
// import moment from 'moment';
// import 'moment/locale/zh-cn';
// moment.locale('zh-cn')
let vueApp=null;
const tableData = require('../../data/columns_statelog.json');
export default {
  name: "check_statelog",
  data(){
    return{
      steps:[],
      keyValue:[],//时间选择器的值
      keyValue_begin:'',//开始时间选择器的值
      dateTime_begin:'',//开始时间(没有时分秒)
      startTime:'',//开始时间段
      endTime:'',//结束时间段
      keyValue_end:'',//结束时间选择器的值
      dateTime_end:'',//结束时间(没有时分秒)
      spinning:false,//加载中
      locale,//时间选择器中文文件
      form:{}, //查询条件
      stateTimeBegin: "",//开始时间
      stateTimeEnd: "",//结束时间

      data:[],//查询结果
      page:'',//页数
      current:1,
      total:0,//查询得到数据的条数
      pageSize:Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):Number(this.$store.state.defaultPageSize),//每页的行数
      bol:true,//true为查询状态，false则反之
    }
  },
  watch:{
    page(){
        this.queryData()
    },
    pageSize(){
      localStorage.setItem('pageSize', this.pageSize); 
      if(this.page==1){this.queryData();return;}
      this.page=1;
      this.current=1
    }
  },
  filters:{
    fmtStep(val){
      let steps = vueApp.steps
      let step = steps.find(e=>e.id == val)
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
    this.addRender()
    vueApp=this
  },
  methods:{
    querySteps(){//获取对接步骤下拉内容
      this.axios.get(`step/all`).then( (res)=>{
        this.steps =res.data
      }).catch(err=>{this.$message.error(err)})
    },
    stateTimeBegin_onChange(date, dateString) {
      console.log('stateTimeBegin',date, dateString);
      // this.form.stateTimeBegin= new Date(dateString.replace(/-/g,'/')).getTime()
      this.form.stateTimeBegin=dateString+' 00:00:00'
      this.dateTime_begin=dateString
      // console.log(dateString+' 00:00:00')
    },
    beginTimes(date, dateString) {
      console.log('beginTimes',date, dateString);
      if(this.form.stateTimeBegin){
        this.form.stateTimeBegin=this.dateTime_begin+" "+dateString
      }else{
        this.$message.error(this.$tcache("check.startDate"))
      }
    },
    stateTimeEnd_onChange(date, dateString) {
      console.log('stateTimeEnd',date, dateString);
      // this.form.stateTimeEnd=new Date(dateString.replace(/-/g,'/')).getTime()+24*3600*1000-1
      this.form.stateTimeEnd=dateString+' 23:59:59'
      this.dateTime_end=dateString
    },
    endTimes(date, dateString) {
      console.log('endTimes',date, dateString);
      if(this.form.stateTimeEnd){
        this.form.stateTimeEnd=this.dateTime_end+" "+dateString
      }else{
        this.$message.error(this.$tcache("check.endDate"))
      }
    },
    ChangePage(pageNumber){
      this.page=pageNumber
    },
    check(){
      if(this.page==1){this.queryData()}
      this.page=1
      this.current=1
      this.getCheckCount()
      // this.queryData()
    },
    clearForm(){
      this.form = {}
      this.data=[]
      // this.columns=[]
      this.page=''
      this.keyValue_begin=''
      this.keyValue_end=''
      this.startTime=''
      this.endTime=''
      this.dateTime_begin=''
      this.dateTime_end=''
      this.total=0
      this.spinning=false
    },
    getCheckCount(){
      if(Object.keys(this.form).length==0){
        return;
      }
      this.axios.get(`statelogcount`,{params:this.form})
      .then(res=>{
        this.total=Number(res.data)
      }).catch(err=>{this.$message.error(err)})
    },
    queryData(){
      console.log('this.page',this.page);
      if(Object.keys(this.form).length==0){
        this.data=[];
        this.$message.error(this.$tcache("common.enterQueryCriteria"))
        return;
      }
      this.spinning=true;
      let that = this
      this.axios.post(`statelog/list/${this.page}/${this.pageSize}`, that.form).then(res=>{
        if(res.status == 200){
          that.data = res.data
          this.bol=false
          if(that.data){this.spinning=false;}
        }else{
          that.$message.warning(this.$tcache('check.informationQueryFailed'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    addRender(){
      let b = this.columns.find(e=>e.dataIndex=='commonAction')
      if(b == undefined){//避免重复mounted时重复push(一般在开发模式下发生）
        let col = { title: this.$tcache("common.edit"), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right',width:60, scopedSlots: { customRender: 'commonAction' } }
        this.columns.push(col)
      }
    },
    handleOk(){
      this.visible = false
    },
    handleCancel(){
      this.visible = false
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
</style>
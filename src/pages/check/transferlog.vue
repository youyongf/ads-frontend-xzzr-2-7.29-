<template>
  <div>
    <a-row class="query-form">
      <a-input v-model.number="form.agvId" :placeholder="$tcache('check.vehicleID')"/>
      <a-select  v-model="form.agvAction" :placeholder="$tcache('check.transmissionAction')">
        <a-select-option v-for="item in agvActions" :key="item.name" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <!-- <a-input v-model.number="form.group"  :placeholder="$tcache('check.group')"/> -->
      <a-select v-model="form.group"  :placeholder="$tcache('check.group')" :options="groups" />
      <a-input :title="$tcache('check.dockingMachine')" v-model="form.stationName"  :placeholder="$tcache('check.dockingMachine')"/>
      <a-select mode="multiple" v-model="form.dstep" :placeholder="$tcache('check.dockingSteps')">
        <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <a-input :title="$tcache('check.previousProcessMachine')" v-model="form.lastStationName"  :placeholder="$tcache('check.previousProcessMachine')"/>
      <a-date-picker :allowClear="false" v-model="keyValue_begin" :placeholder="$tcache('check.startDate')"  @change="finishTimeBegin_onChange" />
      <a-time-picker :allowClear="false" v-model="startTime" :placeholder="$tcache('check.startTimePeriod')" @change="beginTimes" />
      <a-date-picker :allowClear="false" v-model="keyValue_end" :placeholder="$tcache('check.endDate')"  @change="finishTimeEnd_onChange" />
      <a-time-picker :allowClear="false" v-model="endTime" :placeholder="$tcache('check.endTimePeriod')" @change="endTimes" />
      <a-button class="check_btn" @click="check"><span class="fontSty">{{$tcache('check.query')}}</span></a-button>
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearedCondition')}}</span></a-button>
      <download-excel
        class="export-excel"
        :data="json_data"
        :name="$tcache('check.transmissionHistory')"
        :fields="json_fields"
        :before-generate="beforeDownload">
        <a-button class="button-export">{{$tcache('common.downloadTable')}}(<span style="color: #107c41;font-weight: bold;">Excel</span>)</a-button>
      </download-excel>
    </a-row>
   <a-spin :spinning="spinning">
    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="false"    :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{x: true}">
        <!-- <a-tag class="fontColor" slot="agvAction" slot-scope="text" :data-id="text" :style="{color:text=='in'?'green':'red'}" >{{text=='in'?'传进':text=='out'?'传出':text=='inOut'?'换料':''}}</a-tag> -->
        <a-tag class="fontColor" slot="agvAction" slot-scope="text" :data-id="text" :style="{color:text=='传进'?'green':text=='传出'?'red':''}" >{{text}}</a-tag>
        <a-tag class="fontColor" slot="basketType" slot-scope="text" :data-id="text" >{{text==1?$tcache('check.flowerBasket'):text==2?$tcache('check.origSilMalBox'):text==3?$tcache('check.finishedMaterialBox'):''}}</a-tag>
        <a-tag class="fontColor" slot="materialType" slot-scope="text" :data-id="text" :style="{color:text==1?'green':'red'}"  >{{text==1?$tcache('check.material'):$tcache('check.emptyBasket')}}</a-tag>
        <!-- <div class="fontColor" slot="finishTime" slot-scope="text" :data-id="text" >{{text|fmtTime}}</div> -->
        <div class="fontColor" slot="group" slot-scope="text" :data-id="text" >{{text|fmtGroup}}</div>
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
// import {makeColumns} from '../../utils'
import {getCurrentDate} from '../../utils/date.js'
// import zhCN from 'antd/es/locale/zh_CN'
// import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';

let vueApp=null;
const tableData = require('../../data/columns_transferlog.json');
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
      groups:[],
      keyValue:[],//时间选择器的值
      keyValue_begin:'',//开始时间选择器的值
      dateTime_begin:'',//开始时间(没有时分秒)
      startTime:'',//开始时间段
      endTime:'',//结束时间段
      keyValue_end:'',//结束时间选择器的值
      dateTime_end:'',//结束时间(没有时分秒)
      spinning:false,//是否加载中
      // locale,//日期选择器中文文件
      // moment,
      form:{}, //查询条件

      data:[],//查询结果
      page:'',//页数
      total:0,//查询得到数据的条数
      current: 1,
      pageSize:Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):Number(this.$store.state.defaultPageSize),//每页的行数
      bol:true,//true为查询状态，false则反之
      json_fields: {  //导出Excel表格的表头设置
        [this.$tcache('check.vehicleID')]: 'agvId',
	      [this.$tcache('check.vehicleMovement')]: 'agvAction',
	      [this.$tcache('check.group')]: 'group',
	      [this.$tcache('check.dockingSteps')]: 'step',
	      [this.$tcache('check.dockingMachine')]: 'stationName',
        [this.$tcache('check.previousProcessMachine')]: 'lastStationName',
        [this.$tcache('check.timeFinish')]: 'finishTime'
      },
      json_data:[],//需导出的数据
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
  watch:{
    page(){
      this.checkQueryData()
    },
    pageSize(){
      localStorage.setItem('pageSize', this.pageSize); 
      if(this.page==1){this.checkQueryData();return;}
      this.page=1;
      this.current=1
    }
  },
  computed: {
    columns() {
      return this.$transformI18n(tableData, "title");
    },
  },
  beforeMount() {
    this.querySteps()
    this.queryGroups()
    // this.addRender()
    vueApp=this
  },
  // mounted() {
  //   Object.keys(this.data[0]).forEach(item=>{
  //     this.json_data[`${item}`]=`${item}`
  //   })
  // },
  methods:{
    async  beforeDownload(){
      if(this.data?.length==0){
        this.$message.info(this.$tcache("common.exportDataIsEmpty"))
        return
      }
      console.log(this.form.finishTimeBegin,this.form.finishTimeEnd)
      if((this.form.finishTimeBegin??'')==''||(this.form.finishTimeEnd??'')==''){
        this.$message.info(this.$tcache("common.selectTimeBeforeDownloadTable"))
        return
      }
      let page=1
      let pageSize=this.total
      await  this.axios.post(`transferlog/list/${page}/${pageSize}`, this.form).then(res=>{
        console.log(res)
        this.json_data=res.data
        this.json_data.forEach(item=>{
          item.finishTime=getCurrentDate(item.finishTime)
          item.agvAction=item.agvAction=='in'?this.$tcache("check.passIn"):item.agvAction=='out'?this.$tcache("check.outGoing"):item.agvAction=='inOut'?this.$tcache("check.refueling"):''
          item.materialType=item.materialType==1?this.$tcache('check.material'):this.$tcache('check.emptyBasket')
        })
      })
    },
    finishTimeBegin_onChange(date, dateString) {
      console.log('finishTimeBegin',date, dateString);
      // this.form.finishTimeBegin= new Date(dateString.replace(/-/g,'/')).getTime()
      this.form.finishTimeBegin=dateString+' 00:00:00'
      this.dateTime_begin=dateString
    },
    beginTimes(date, dateString) {
      console.log('beginTimes',date, dateString);
      if(this.form.finishTimeBegin){
        this.form.finishTimeBegin=this.dateTime_begin+" "+dateString
      }else{
        this.$message.error(this.$tcache('check.startDate'))
      }
    },
    finishTimeEnd_onChange(date, dateString) {
      console.log('finishTimeEnd',date, dateString);
      this.form.finishTimeEnd = dateString+' 23:59:59'
      this.dateTime_end = dateString
    },
    endTimes(date, dateString) {
      console.log('endTimes',date, dateString);
      if(this.form.finishTimeEnd){
        this.form.finishTimeEnd=this.dateTime_end+" "+dateString
      }else{
        this.$message.error(this.$tcache('check.endDate'))
      }
    },
    ChangePage(pageNumber){
      console.log(pageNumber)
      this.page=pageNumber
    },
    check(){
      if(this.form.finishTimeBegin&&(!this.form.finishTimeEnd)){this.$message.error(this.$tcache('check.enterEndTime'));return;}
      if(this.page==1){this.checkQueryData()}
      this.page=1
      this.current=1
      this.getCheckCount()
    },
    clearForm(){
      this.form ={}
      this.data=[]
      // this.columns=[]
      this.keyValue_begin=''
      this.keyValue_end=''
      this.startTime=''
      this.endTime=''
      this.dateTime_begin=''
      this.dateTime_end=''
      this.page=''
      this.total=0
      this.spinning=false
    },
    getCheckCount(){
      if(Object.keys(this.form).length==0){
        return;
      }
      if(this.form.lastStationName==''){this.form.lastStationName=null}
      this.axios.get(`count`,{params:this.form})
      .then(res=>{
        this.total=Number(res.data)
      }).catch(err=>{this.$message.error(err)})
    },
    checkQueryData(){
      if(Object.keys(this.form).length==0){
        this.data=[];
        this.$message.error(this.$tcache('common.enterQueryCriteria'))
        return;
      }
      this.spinning=true;
      if(this.form.lastStationName==''){this.form.lastStationName=null}
      this.axios.post(`transferlog/list/${this.page}/${this.pageSize}`, this.form).then(res=>{
        if(res.status == 200&&Array.isArray(res.data)){
          if(res.data.length==0){this.$message.info(this.$tcache('check.queryIsEmpty'))}
          this.data = res.data
          this.data.forEach(item=>{
            item.finishTime=getCurrentDate(item.finishTime)
            item.agvAction=item.agvAction=='in'?this.$tcache('check.passIn'):item.agvAction=='out'?this.$tcache('check.outGoing'):item.agvAction=='inOut'?this.$tcache('check.refueling'):''
          })
          this.spinning=false
        }
      }).catch(err=>{this.$message.error(err);this.spinning=false})
    },
    // addRender(){
    //   let b = this.columns.find(e=>e.dataIndex=='commonAction')
    //   if(b == undefined){//避免重复mounted时重复push(一般在开发模式下发生）
    //     let col = { title: this.$tcache('common.edit'), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right',width:60, scopedSlots: { customRender: 'commonAction' } }
    //     this.columns.push(col)
    //   }
    // },
    querySteps(){//获取对接步骤下拉内容
      this.axios.get(`step/all`).then( (res)=>{
        if(Array.isArray(res.data)&&res.data?.length!==0)this.steps =res.data
      }).catch(err=>{this.$message.error(err)})
    },
    queryGroups(){//获取对接步骤下拉内容
      this.axios.get(`stationGroup/list`).then( (res)=>{
        if(Array.isArray(res.data)&&res.data?.length!==0){
          this.groups=res.data.map(g=>{
            return {value:g.group,label:g.remark};
          })
        }
      }).catch(err=>{this.$message.error(err)})
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
.export-excel{
  display: inline;
}
</style>
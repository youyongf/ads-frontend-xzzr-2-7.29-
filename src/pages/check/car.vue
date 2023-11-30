<template>
  <div>
    <a-row class="query-form">
      <a-date-picker v-model="keyValue" :placeholder="$tcache('check.selectDate')" @change="finishTime_onChange" />
      <a-button class="check_btn" @click="getRetTStep"><span class="fontSty">{{$tcache('check.query')}}</span></a-button>
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearedCondition')}}</span></a-button>
      <download-excel
        class="export-excel"
        :data="data"
        :name="$tcache('check.handlingRate')"
        :fields="json_fields"
        :before-generate="beforeDownload">
          <a-button class="button-export">{{$tcache('common.downloadTable')}}(<span style="color: #107c41;font-weight: bold;">Excel</span>)</a-button>
      </download-excel>
    </a-row>
    <a-table
    rowKey="id"
    :columns="columns"
    :data-source="data"
    :bordered="true"
    size="middle"
    :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)" 
    >
      <template slot="title">
        <div>{{$tcache('check.capacityPeriodStatisticsTable')}}</div>
      </template>
      <div class="inp" slot="daytimeTarget"  slot-scope="text, record,index"><input  type="number" v-model.number="data[index].daytimeTarget"  @input="daytime_count(index,record)" placeholder="0"/></div>
      <div class="inp" slot="daytimeDifference" slot-scope="text, record,index"><input disabled v-model="data[index].daytimeDifference" placeholder="0"/></div>
      <div class="inp" slot="daytimeCarry" slot-scope="text, record,index"><input disabled v-model="data[index].daytimeCarry" placeholder="0"/></div>
      <div class="inp" slot="nightTarget" slot-scope="text, record,index"><input  type="number" v-model.number="data[index].nightTarget" @input="night_count(index,record)" placeholder="0"/></div>
      <div class="inp" slot="nightDifference" slot-scope="text, record,index"><input disabled v-model="data[index].nightDifference"  placeholder="0"/></div>
      <div class="inp" slot="nightCarry" slot-scope="text, record,index"><input disabled v-model="data[index].nightCarry"  placeholder="0"/></div>
    </a-table>
    
   <div class="flex" style="padding:20px">
     <div class="flex fontSty">{{$tcache('check.totalDayShifts')}}: <button class="btn">{{dayNum}}</button></div>
     <div class="flex fontSty" style="margin:0 100px">{{$tcache('check.totalAmountPerDay')}}: <button class="btn">{{dayNum+nightNum}}</button></div>
     <div class="flex fontSty">{{$tcache('check.totalAmountEveningShift')}}: <button class="btn">{{nightNum}}</button></div>
   </div>

   <!-- 实时搬运率 -->
   <span style="float:right">*{{$tcache('check.rule')}}: {{$tcache('check.dataMorningEachDay')}}<span>{{workshop.includes('高邮')?'7:30':'8:30'}}</span>{{$tcache('check.andAtNight')}}<span>{{workshop.includes('高邮')?'19:30':'20:30'}}</span>{{$tcache('check.resetDataMsg')}}</span>
    <a-row style="margin-bottom:30px">
      <a-table :pagination="false" bordered :data-source="data_RT" :columns="columns_RT" :rowKey="$tcache('check.typeUnitMpieces')" size="small" :scroll="{ x: true}">
        <template slot="title">
          <div>{{$tcache('check.realTimeHandlingRate')}}</div>
        </template>
      </a-table>
    </a-row>
  </div>
</template>

<script>
import moment from 'moment'; // TODO
// import 'moment/locale/zh-cn';
// moment.locale('zh-cn')

export default {
  name: "car",
  components:{
  },
  data(){
    return{
      keyValue:'',
      // locale,//日期选择器中文文件
      form:{},//查询条件
      data:[],//查询结果
      columns:[
        {
          title: this.$tcache("check.productionProcesses"),
          dataIndex: 'stepName',
          key: 'id',
          width: 150,
          fixed: 'left',
        },
        {
          title: this.$tcache("check.dayShift"),
          children: [
          ],
        },
        {
          title: this.$tcache("check.nightShift"),
          children: [
          ],
        },
      ],
      steps:[],

      data_RT:[],//实时搬运率查询结果
      columns_RT:[], //表头
      visible_RT: false,
      visible: false,
      record_RT:{}, //操作的行
      obj_RT:{},

      data_pc:[],//工序车俩查询结果
      columns_pc:[], //表头_后段二循环
      columns_pc3:[], //表头_后段三循环
      visible_pc: false,
      stepName:[],
      agvId:[],
      docKingAgvId:[],
      emptyAgvId:[],
      list:[],
      obj:{},
      nightNum:0,
      dayNum:0,
      emptyCounts:0,
      emptyCounts2:0,//二循环空车数量
      emptyCounts3:0,//三循环空车数量
      emptyAgvIds:[''],
      emptyAgvIds2:[''],//二循环空车数据(弹窗数据)
      emptyAgvIds3:[''],//三循环空车数据(弹窗数据)
      // emptyAndUndistributedAgvIds:[]
      sName:'',//工序类型名称
      agvQuantity1:0,
      undistributedCount1:0,
      agvQuantity2:0,
      undistributedCount2:0,
      agvId1:[],
      undistributedAgvId1:[],
      agvId2:[],
      undistributedAgvId2:[],
      cyclic:[2,3],//二三循环
      cyclicJudge:0,//2为二循环，3为三循环
      region_id:localStorage.getItem('region_id'),//区分前后段
      json_fields: {  //导出Excel表格的表头设置
        [this.$tcache('check.dayShiftPro')]: 'chipsAmountA',
	      [this.$tcache('check.dayShiftTargetPro')]: 'daytimeTarget',
	      [this.$tcache('check.dayShiftProDiff')]: 'daytimeDifference',
	      [this.$tcache('check.dayShiftHandRate')]: 'daytimeCarry',
	      [this.$tcache('check.nightShiftPro')]: 'chipsAmountB',
	      [this.$tcache('check.nightShiftTargetPro')]: 'nightTarget',
	      [this.$tcache('check.nightShiftProDiff')]: 'nightDifference',
	      [this.$tcache('check.nightShiftHandRate')]: 'nightCarry',
      },
      json_data:[],
      workshop:localStorage.getItem('workshop_name')
    }
  },
  watch:{
  },
  created() {
    this.getStepName()
    let date=new Date()
    let day=date.getDate()-1
    if(day==0){
      date.setDate(0)
    }
    let year=date.getFullYear()<10?'0'+date.getFullYear():date.getFullYear()
    let month=date.getMonth()<9?'0'+(date.getMonth()+1):date.getMonth()+1
    day=date.getDate()<10?'0'+(date.getDate()-1):date.getDate()-1
    this.keyValue=moment(`${year}-${month}-${day}`)
    this.form.workday = `${year}-${month}-${day}`
    console.log("this.keyValue",this.keyValue, this.form.workday)
  },
  destroyed() {
    clearInterval(this.timer);
    this.timer = null;
  },
  methods:{
    beforeDownload(){
      if(this.data?.length==0){
        this.$message.info(this.$tcache("common.exportDataIsEmpty"))
        return
      }
    },
    change(e){
      this.agvId=e.agvId
      this.docKingAgvId=e.docKingAgvId
      this.agvId = this.agvId.filter(item=> this.docKingAgvId.indexOf(item) == -1);
      this.visible_pc = true
    },
    allEmptyAgvIds(e){
      this.cyclicJudge=e
      this.visible=true
    },
    querySteps(){//获取对接步骤下拉内容
      this.axios.post(`retTStep/shuju`).then( (res)=>{
        this.steps =res.data
      }).catch(err=>{this.$message.error(err)})
    },
    daytime_count(index,record){
      console.log(index,record)
      if(this.data[index].daytimeTarget){
        this.data[index].daytimeDifference=this.data[index].daytimeTarget-this.data[index].chipsAmountA
        this.data[index].daytimeCarry=Math.floor((this.data[index].chipsAmountA/this.data[index].daytimeTarget)*100)+'%'
      }else{
        this.data[index].daytimeDifference=0
        this.data[index].daytimeCarry=0
      }
    },
    night_count(index,record){
      if(this.data[index].nightTarget){
        this.data[index].nightDifference=this.data[index].nightTarget-record.chipsAmountB
        this.data[index].nightCarry=Math.floor((record.chipsAmountB/this.data[index].nightTarget)*100)+'%'
      }else{
        this.data[index].nightDifference=0
        this.data[index].nightCarry=0
      }
    },
    clearForm(){
      this.dayNum=0
      this.nightNum=0
      this.form = {}
      this.data=[]
      this.keyValue=''
    },
    dealtInfo(data) {
            if (data.length && this.columns[1].children.length == 0) {
                let d0 = {}
                d0.chipsAmountA = data[0].chipsAmountA
                d0.daytimeTarget = 0
                d0.daytimeDifference = 0
                d0.daytimeCarry = 0
                let cols = this.makeColumns(d0)
                this.addRender(cols)
                this.columns[1].children = cols
                for (let i = 0; i < this.columns[1].children.length; i++) {
                    if (this.columns[1].children[i].title == "chipsAmountA") { this.columns[1].children[i].title = this.$tcache("check.cumulativePro") }
                    if (this.columns[1].children[i].title == "daytimeTarget") { this.columns[1].children[i].title = this.$tcache("check.accumulatedGoals") }
                    if (this.columns[1].children[i].title == "daytimeDifference") { this.columns[1].children[i].title = this.$tcache("check.accumulatedDiff") }
                    if (this.columns[1].children[i].title == "daytimeCarry") { this.columns[1].children[i].title = this.$tcache("check.handlRate") }
                }
            }
            if (data.length && this.columns[2].children.length == 0) {
                let d0 = {}
                d0.chipsAmountB = data[0].chipsAmountB
                d0.nightTarget = 0
                d0.nightDifference = 0
                d0.nightCarry = 0
                let cols = this.makeColumns(d0)
                this.addRender(cols)
                this.columns[2].children = cols
                for (let i = 0; i < this.columns[2].children.length; i++) {
                    if (this.columns[2].children[i].title == "chipsAmountB") { this.columns[2].children[i].title = this.$tcache("check.cumulativePro") }
                    if (this.columns[2].children[i].title == "nightTarget") { this.columns[2].children[i].title = this.$tcache("check.accumulatedGoals") }
                    if (this.columns[2].children[i].title == "nightDifference") { this.columns[2].children[i].title = this.$tcache("check.accumulatedDiff") }
                    if (this.columns[2].children[i].title == "nightCarry") { this.columns[2].children[i].title = this.$tcache("check.handlRate") }
                }

      }
    },

        getRetTStep() {
            this.columns[1].title = this.$tcache("check.dayShift") + '(' + this.form.workday + ')'
            this.columns[2].title = this.$tcache("check.nightShift") + '(' + this.form.workday + ')'
            this.dayNum = 0
            this.nightNum = 0
            this.axios.get(`rpt/transfer/stepoutput/${this.form.workday}`).then((res) => {
              if(res.data?.length==0){this.$message.info(res.data.message?res.data.message:this.$tcache("check.resultEmptyOrDataIncorrect"));return}
                res.data = res.data.sort((a, b) => { return a.step - b.step })
                this.data = [...res.data]
                console.log(this.data)
                this.data.forEach((item, i) => {
                    for (let j = i + 1; j < this.data.length; j++) {
                        if (this.data[i].step == this.data[j].step) {
                            this.data.splice(j, 1)
                        }
                    }
                });
                for (let i = 0; i < this.data.length; i++) {
                    this.stepName.forEach(item=>{
                      if(item.id==this.data[i].step){
                        this.data[i].stepName=item.name
                        console.log(this.data)
                      }
                    })
                }
                console.log(this.data)
                let d=[]
                this.data.forEach((item)=>{
                    //删除this.data数据的step不等于step/list表id的数据
                    if(item.stepName){
                        this.dayNum += item.chipsAmountA
                        this.nightNum += item.chipsAmountB;
                        item.daytimeTarget = item.targetOutputA ? item.targetOutputA : ''
                        item.daytimeDifference = item.daytimeTarget - item.chipsAmountA
                        item.daytimeCarry = 0
                        if (item.daytimeTarget) item.daytimeCarry = Math.floor((item.chipsAmountA / item.daytimeTarget) * 100) + '%'
                        item.nightTarget = item.targetOutputB ? item.targetOutputB : ''
                        item.nightDifference = item.nightTarget - item.chipsAmountB
                        item.nightCarry = 0
                        if (item.nightTarget) item.nightCarry = Math.floor((item.chipsAmountA / item.nightTarget) * 100) + '%'
                        this.dealtInfo(this.data)
                        d.push(item)
                    }
                })
                this.data=d
                console.log(this.data)
                // this.dealtInfo(res)
            }).catch((err) => {this.$message.error(err) })
        },

    finishTime_onChange(date, dateString) {
      console.log('finishTime',date, dateString);
      this.form.workday=dateString
    },
    addRender(cols){
      //列中添加类似： "scopedSlots":{ "customRender":"createTime"}
      return cols.map(col=>{
        if(col.dataIndex == 'daytimeTarget' || col.dataIndex == 'daytimeDifference' 
        || col.dataIndex == 'daytimeCarry' || col.dataIndex == 'nightTarget' 
        || col.dataIndex == 'nightDifference' || col.dataIndex == 'nightCarry' 
        ){
          if(col.scopedSlots == undefined){
            col['scopedSlots'] = {"customRender":col.dataIndex}
          }
        }
        return col;
      })
    },

    sNameDeal(name1,name2){
      if(Object.keys(this.obj[name1]).length==0&&Object.keys(this.obj[name2]).length==0){return {str:'',agvId:[],docKingAgvId:[]}}else{
        if(Object.keys(this.obj[name1]).length==0){
          this.obj[name1].str=[0,0]
          this.obj[name1].agvId=[]
          this.obj[name1].docKingAgvId=[]
        }
        if(Object.keys(this.obj[name2]).length==0){
          this.obj[name2].str=[0,0]
          this.obj[name2].agvId=[]
          this.obj[name2].docKingAgvId=[]
        }
        return  {
              str:`${this.obj[name1].str[0]+this.obj[name2].str[0]}|${this.obj[name1].str[1]+this.obj[name2].str[1]}`,
              agvId:this.obj[name1].agvId.concat(this.obj[name2].agvId),
              docKingAgvId:this.obj[name1].docKingAgvId.concat(this.obj[name2].docKingAgvId)
            }
      }
    },
    getStepName(){
      this.axios.post(`step/list`,{}).then(res=>{
        if(res.status == 200&&res.data){
          this.stepName = res.data
          console.log(this.stepName)
          if(this.stepName.length>0){
            this.getRetTStep()
            this.timer = setInterval(this.queryData_RT, 1000*3600)
            this.queryData_RT()
          }
        }else{
          this.$message.warning(this.$tcache("check.informationQueryFailed"))
        }
      }).catch(()=>{this.$message.warning(this.$tcache("check.informationQueryFailed"))})
    },
    //以下为实时搬运率用到的方法(RT)
    queryData_RT(){
      let that = this
      console.log(this.workshop.includes('宿迁阿特斯'))
      this.axios.get(`retTStep/realTimeRet`).then(res=>{
        if(res.status == 200&&res.data){
          this.data_RT=[]
          this.obj_RT['类型(单位:万片)']=`${this.stepName[0].name}--${this.stepName[this.stepName.length-1].name}`
          for(let i=0;i<this.stepName.length;i++){
            this.obj_RT[this.stepName[i].name]='---'
            for(let j=0;j<res.data.length;j++){
              if(res.data[j].stepId==this.stepName[i].id){
                // if(res.data[j].stepId==1&&res.data[j].stepName=='发料机'){res.data[j].count=Math.floor(res.data[j].count*2.85)}
                // if(res.data[j].stepId==2&&res.data[j].stepName=='制绒上-料盒'){res.data[j].count=Math.floor(res.data[j].count*2.85)}
                // this.obj_RT[this.stepName[i].name]=res.data[j].count/10
                if(this.workshop.includes('宿迁阿特斯')){
                  if(res.data[j].stepName=='发料机'){
                    res.data[j].count=Math.floor(res.data[j].count*4500)
                  }else{
                    res.data[j].count=Math.floor(res.data[j].count*1200)
                  }
                }
                this.obj_RT[this.stepName[i].name]=res.data[j].count
              }
            }
          }
          this.data_RT.push(this.obj_RT)
          if(this.data_RT && this.columns_RT.length== 0){
            let cols = this.makeColumns(this.data_RT[0])
            this.addRender_RT(cols)
            that.columns_RT = cols
          }
        }else{
        //   that.$message.warning("机台对接信息查询失败")
        }
      }).catch(err=>{this.$message.error(err);})
    },
    addRender_RT(cols){
      //列中添加类似： "scopedSlots":{ "customRender":"createTime"}
      // console.log(cols)
      return cols.map(col=>{
        let type=['type','正膜上','氧化下','背膜下','制绒下料','链氧','碱抛后','背膜上','正膜下','碱抛上料','发料机','扩散后','区域空车','氧化后','丝网','丝网后','氧化上','碱抛下料','制绒上-料盒','扩散','区域空车(二)','背膜后','制绒上-空篮','SE后','SE','区域空车(三)','链氧后','碱抛下料','正膜后']
        if(type.includes(col.dataIndex)){
          if(col.scopedSlots == undefined){
            col['scopedSlots'] = {"customRender":col.dataIndex}
          }
        }
        return col;
      })
    },

   //根据一行json数据生成ATable列定义
    makeColumns(row, lefts, excludes) {
      console.log('row,lefts,excludes', Object.keys(row), row, lefts, excludes)
      lefts = Array.isArray(lefts) ? lefts : [];
      excludes = Array.isArray(excludes) ? excludes : [];
      //从每第一行数据生成字段定义
      var columns = [], columns2 = [];
      //把重要的lefts列放在左侧
      let keys = Object.keys(row);
      keys = keys.filter(key => !excludes.includes(key));
      keys.forEach((key) => {
          if (lefts.includes(key)) {
              columns.push({ title: key, dataIndex: key, key: key })
          } else {
              columns2.push({ title: key, dataIndex: key, key: key })
          }
      })
  
      columns = columns.concat(columns2);
      return columns;
    }
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
::v-deep .ant-table-title{
  background-color: $bgcolor;
  color: $color;
  font-weight: bold;
}
::v-deep .ant-table-thead > tr > th{
  background-color: $bgcolor !important;
  color: $color;
  // font-weight: bold;
}
::v-deep .ant-table-thead > tr > th,::v-deep .ant-table-tbody > tr > td{
  text-align: center;
}
.check_btn{
  margin-right: 20px;
}
.inp input{
  width: 80px;
  border-radius: 3px;
  border: 1px solid #5cc5d3;
  font-weight: bold;
}
.span-box{
  // width: 100px;
  // height: 100px;
  // border: 1px solid steelblue;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  // word-break: break-all;
  .span{
    font-weight: bold;
    padding:1px 5px;
    flex-wrap: wrap;
    margin: 5px;
  }
}
.box{
  display: flex;
  justify-content: center;
  align-items: center;
}
.fontcolor{
  color: #57b3ed;
}
::v-deep .ant-table-tbody > tr > td {
    color: #5cc5d3;
    font-weight: bold;
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
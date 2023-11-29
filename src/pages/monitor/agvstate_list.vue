<template>
  <div  style="padding: 20px;">
    <a-row class="query-form">
      <a-input type="number" v-model="form.id"  placeholder="id" />
      <a-select v-model="form.group" :options="groups" :placeholder="$tcache('monitor.group')"></a-select>
      <a-input v-model.number="form.to"  :placeholder="$tcache('monitor.destination')" />
      <a-select v-model="form.hcAction" :options="inOutState"  :placeholder="$tcache('monitor.condition')"  style="width: 170px;">
      </a-select>
      <a-select v-model="form.nextStep"  :placeholder="$tcache('monitor.nextStep')">
        <a-select-option v-for="item in step" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <!-- <a-select v-model="form.power"  placeholder="电量低于" >
        <a-select-option v-for="item in power_scales" :key="item.value" :value="item.value">{{item.text}}</a-select-option>
      </a-select> -->
      <!-- <a-input v-model="form.routeId" placeholder="当前路线" /> -->
      <a-button class="fontSty" @click="clearForm">{{$tcache('monitor.clearCondition')}}</a-button>
    </a-row>

    <a-row>
      <a-table  :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}" :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)">
        <div slot="hcAction" slot-scope="text" :data-ids="text">{{text=='in'? $tcache('monitor.feed') : text=='out' ? $tcache('monitor.discharge') : text=='inOut' ? $tcache('monitor.refueling') : ''}}</div>
        <div slot="nextStep" slot-scope="text" :data-ids="text" style="font-size:14px">{{text|fmtStep}}</div>
        <div slot="group" slot-scope="text" :data-ids="text" style="font-size:14px">{{text|fmtGroup}}</div>
        <div slot="lastStation" slot-scope="text" :data-ids="text" style="font-size:14px">{{text|fmtStationName}}</div>
        <div slot="targetPoint" slot-scope="text" :data-ids="text" style="font-size:14px">{{text|fmtPoints}}</div>
        <div slot="transFlag" slot-scope="text" :data-ids="text" style="font-size:14px">{{text==0?$tcache('monitor.noTransmission'):text==1?$tcache('monitor.toMachine'):text==2?$tcache('monitor.reMaterial'):''}}</div>
        <a-tag slot="power" slot-scope="text" :data-ids="text" :color="text<30?'darkred':text<70?'purple':'green'" >{{text}}</a-tag>
        <a-tag slot="ts" slot-scope="text" :data-ids="text" :color="text<Date.now()-1000?'darkred':'green'" >{{text|fmtDateTime}}</a-tag>
        <a-tag slot="point" slot-scope="text" :data-ids="text"  >{{text|fmtPoint}}</a-tag>
        <a-tag slot="batteryState" slot-scope="text" :data-ids="text"  >{{text?$tcache('monitor.charging'):$tcache('monitor.uncharged')}}</a-tag>
        <span class="commonAction" slot="commonAction" slot-scope="text, record,index">
          <a-button @click="() => recordEdit(index,record)">{{$tcache('monitor.releasePoint')}}</a-button>
          <a-button @click="() => change(index,record)">{{$tcache('common.modify')}}</a-button>
        </span>
      </a-table>
    </a-row>

    <a-row>
      <a-result
          :status="summary.status"
          :title="$tcache('monitor.vehicleInspection')"
          :sub-title="summary.subTitle"
      >
        <div class="desc">
          <p style="font-size: 16px;">
            <strong>{{$tcache('monitor.focusVehicle')}}:{{summary.list.length}}{{$tcache('common.car')}}，{{$tcache('common.time')}}：{{Date.now()|fmtDateTime}}</strong>
          </p>
          <p v-for="item in summary.list" :key="item.id">
            <a-icon :style="{ color: 'red' }" type="close-circle" />{{item.id}}:{{item.stateTitle}} - {{item.text}}【{{item.ts|fmtDateTime}}】
          </p>
        </div>
      </a-result>
    </a-row>

    <!-- 修改记录弹窗 -->
    <a-modal
        :title="$tcache('common.modify')"
        :visible="visible"
        :dialog-style="{ top: '20px' }"
        :okText="$tcache('common.save')"
        :width='800'
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk"
        @cancel="handleCancel"
    >
      <div class="flex">
        <a-form-model-item  class=" Width_350" :label="$tcache('monitor.nextStep')">
          <!-- <a-input class="Width_200" type='number'  v-model="arr.nextStep" placeholder="下个步骤" /> -->
          <a-select v-model="record.nextStep"  class="Width_200" >
            <a-select-option v-for="item in step" :key="item.id" :value="Number(item.id)">{{item.name}}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item  class="Width_350 " :label="$tcache('monitor.group')">
          <!-- <a-input class="Width_200" type='number'  v-model="record.group" placeholder="组别" /> -->
          <a-select v-model="record.group" :options="groups" class="Width_200"></a-select>
        </a-form-model-item>
        <!-- <a-form-model-item  class="Width_350 " label="id">
          <a-input class="Width_200" type='number'  v-model="record.id" placeholder="id" />
        </a-form-model-item> -->
        <a-form-model-item  class="Width_350 " :label="$tcache('monitor.condition')">
          <a-select v-model="record.hcAction" :options="inOutState" class="Width_200"></a-select>
        </a-form-model-item>
        <a-form-model-item  class="Width_350 " :label="$tcache('monitor.numberLayers')">
          <a-select v-model="record.hcLayer" :options="hcLayers" class="Width_200"></a-select>
        </a-form-model-item>
      </div>
    </a-modal>
  </div>
</template>

<script>
import {getCurrentDate} from '../../utils/date.js'
const agvStatesData = require('../../data/agv_state.json');
const tableData = require('../../data/columns_agvstate.json');
let vueApp = null
export default {
  data(){
    return{
      num:0,
      form:{}, //查询条件
      states: [],
      power_scales:[{value:30,text:this.$tcache('monitor.lessThan') + '30%'},{value:70,text: this.$tcache('monitor.lessThan') + '70%'},{value:90,text:this.$tcache('monitor.lessThan') + '90%'}],

      alldata:[],//全部结果
      data:[],//查询结果
      // columns: require('../../data/columns_agvstate.json'),

      //状态检查概要
      summary:{status:'success',subTitle:'',list:[]},

      visible: false,
      record:{},
      step:[],//弹窗的下一个缓存机选项
      isAdmin:this.$store.state.isAdmin,
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      stations:[],
      points:[],
      groups:[],
      inOutState:[
        {value:'in',label: this.$tcache('monitor.feed')},
        {value:'out',label: this.$tcache('monitor.discharge')},
        {value:'inOut',label: this.$tcache('monitor.refueling')},
      ],
      hcLayers:[
        {value:1,label:'1' + this.$tcache('monitor.layer')},
        {value:2,label:'2' + this.$tcache('monitor.layer')},
        {value:3,label:'3' + this.$tcache('monitor.layer')},
      ]
    }
  },
  computed: {
    columns() {
      return this.$transformI18n(tableData, "title");
    },
    agvstates() {
      return this.$transformI18n(agvStatesData);
    }
  },
  watch:{
    form:{
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        //delay query data:
        if(this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.filterData, 500)
      },
      deep: true
    },
  },
  filters:{
    fmtPoint(p){
      // console.log(p)
      if(p){
        if(p.remark){
          return `${p.id}:${p.remark}`
        }else{
          return `${p.id}`
        }
      }
    },
    fmtStep:val=>{
      let steps = [...vueApp.step]
      let step = steps.find(e=>e.id == val)
      if(step){
        return step.name
      }
      return val
    },
    fmtState:val=>{
      let states = [...vueApp.states]
      let state = states.find(e=>e.value == val)
      if(state){
        return state.text
      }
      return val
    },
    fmtStationName:val=>{
      let stations = [...vueApp.stations]
      let station = stations.find(e=>e.doPoint == val)
      if(station){
        return station.name
      }
      return val
    },
    fmtPoints:val=>{
      let points = [...vueApp.points]
      let point = points.find(e=>e.id == val)
      if(point){
        return point.remark
      }
      return val
    }
  },
  beforeMount() {
    // this.querySteps()
    if(this.editable||this.isAdmin)this.addRender()
    vueApp=this
  },
  mounted() {
    this.queryGroup()
    this.querySteps()
    
  },
  beforeDestroy(){
    clearTimeout(this.timer_agvState)
  },
  methods:{
    queryGroup(){
      this.axios.get(`stationGroup/list`).then(res=>{
        if(res.status == 200&&res.data){
          this.groups = res.data.map(item=>{return {value:item.group,label:item.remark}})
        }
      }).catch(err=>{this.$message.error(err)})
    },
    querySteps(){
      this.axios.get(`step/all`).then(data=>{
        this.step =data.data
        if(this.step)this.queryStations()
        
      }).catch(err=>{this.$message.error(err)})
    },
    clearForm(){
      this.form = {}
    },
    makeAgvStates(){
      this.states = this.agvstates.map(k=>{return {value:k.key, text:k.title}})
      this.queryData()
    },
    filterData(){
      console.log(this.alldata)
      let result = this.alldata
      if(this.form.id){
        result = result.filter(d=>d.id == this.form.id)
      }
      if(this.form.to){
        result = result.filter(d=>`${d.to}`.includes(`${this.form.to}`))
      }
      if(this.form.hcAction){
        console.log('result',result,this.form.hcAction)
        result = result.filter(d=>d.hcAction == this.form.hcAction)
      }
      if(this.form.routeId){
        result = result.filter(d=>d.routeId == this.form.routeId)
      }
      // if(this.form.power){
      //   result = result.filter(d=>d.power == this.form.power)
      // }
      if(this.form.group){
        result = result.filter(d=>d.group == this.form.group)
      }
      if(this.form.nextStep){
        result = result.filter(d=>d.nextStep == this.form.nextStep)
      }
      this.data = result
    },
    queryData(){
      this.axios.get(`cache/agvinfo/list`).then(res=>{
        if(res.status == 200){
          res.data.sort((a,b)=>a.id-b.id)
          this.alldata = res.data
          for(let j=0;j<res.data.length;j++){
            if(res.data[j].lastStateTs){res.data[j].lastStateTs=getCurrentDate(res.data[j].lastStateTs)}
            if(res.data[j].routes){
              let arr=[]
              for(let i=0;i<res.data[j].routes.length;i++){
                arr.push(res.data[j].routes[i].id)
              }
              if(res.data[j].routes.length==0){res.data[j].routes='';}else{
                res.data[j].routes='['+arr+']'
              }
            }
            // if(res.data[j].nextStep){
            //   let arr=this.step
            //   let stepArr=arr.filter(item=>res.data[j].nextStep==item.id)
            //   console.log(stepArr)
            //   res.data[j].nextStep=stepArr[0].name
            // }
          }
          if(this.data.length!=0){
            this.data.forEach((item,index)=>{
              let d=res.data.find(r=>r.id==item.id)
              this.$set(this.data,index,d)
            })
          }else{
            this.data=res.data
          }
          if(this.timer_agvState)clearTimeout(this.timer)
          this.timer_agvState=setTimeout(()=>{
            this.queryData()
          },5000)
        }
      }).catch(err=>{this.$message.error(err)})
    },
    queryStations(){
      this.axios.post(`station/list`, {}).then(res=>{
        if(res.status == 200&&res.data){
          this.stations = res.data.map(item=>{return {doPoint:item.doPoint,name:item.name}})
          this.queryPoints()
          console.log(this.stations)
        }
      }).catch(err=>{this.$message.error(err)})
    },
    queryPoints() {
      this.axios
        .get(`point/all`)
        .then((res) => {
          if (res.status == 200 && res.data) {
            this.points = res.data.map(item=>{return {id:item.id,remark:item.remark}})
            this.makeAgvStates()
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    addRender(){
      let b = this.columns.find(e=>e.dataIndex=='commonAction')
      if(b == undefined){//避免重复mounted时重复push(一般在开发模式下发生）
        let col = { title: this.$tcache("common.edit"), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right',width:180, scopedSlots: { customRender: 'commonAction' } }
        this.columns.push(col)
      }
    },
    addFilterAndOrder(cols){
      //增加过滤器和排序： "scopedSlots":{ "customRender":"createTime"}
      return cols.map(col=>{
        if(col.dataIndex == 'power'){
          col['defaultSortOrder'] = 'descend'
          col['sortDirections'] = ['descend', 'ascend']
          col['sorter'] = (a,b)=>a.power - b.power
          //filter
          col['filters'] = this.power_scales
          col['onFilter'] = (value, record) => record.power < value
        }
        return col;
      })
    },
    recordEdit(index,record){
      console.log(index,record)
      this.record = record
      console.log(this.record)
      this.releasePoint(record.id)
    },
    change(index,record){
      console.log(index,record)
      let arr={}
      arr.nextStep=record.nextStep
      arr.group=record.group
      arr.id=record.id
      arr.hcAction=record.hcAction
      arr.hcLayer=record.hcLayer
      this.record= arr
      console.log(this.record)
      this.visible = true
    },
    handleOk(){
      let that = this
      this.$confirm({
        title:that.$tcache("common.prompt"),
        content:that.$tcache("monitor.saveConfig"),
        onOk(){
          that.save()
          that.visible=false
        },
      })
    },
    handleCancel(){
      this.visible = false
    },
    save(){
      this.axios.post(`cache/agvinfo/update`,this.record).then(()=>{
        this.queryData()
        this.$message.success(this.$tcache("common.saveSuccess"))
      }).catch(()=>{})
    },
    releasePoint(id){
      this.axios.put(`agv/releasePoint/${id}`)
      .then(res=>{
        console.log('releasePoint',res)
        this.queryData()
        this.$message.success(res.data.message)
      }).catch(err=>{this.$message.error(err)})
    },
    checkAllData(){
      let list = []
      let offline = 0, warnings = 0
      this.alldata.forEach(d=>{
        if(d.ts < Date.now()- 1000){
          offline += 1
          list.push({id: d.id, text: this.$tcache("common.offLine"), state:d.stateTitle, ts:d.ts})
        }else if([5,6,7,8].includes(d.state)){
          warnings += 1
        }
      })
      let summary = {
        list: list
      }
      if(list.length >0){
        summary.status = 'warning'
        summary.subTitle = this.$tcache("monitor.warningTips",{offline, warnings});
      }else{
        summary.status = 'success'
        summary.subTitle = this.$tcache("monitor.normalTips");
      }
      this.summary = summary
    },
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
.a-btn{
    border: 1px solid #d9d9d9;
    padding: 5px;
    border-radius: 4px;
}
::v-deep .ant-table-thead > tr > th,::v-deep  .ant-table-tbody > tr > td{
  text-align: center;
}
::v-deep .ant-table-thead > tr > th{
  background-color: $bgcolor !important;
  color: $color;
  font-weight: bold;
}
::v-deep .ant-table-thead > tr > th .anticon-filter, .ant-table-thead > tr > th .ant-table-filter-icon{
  color: $color;
}
.commonAction{
  display: flex;
  justify-content: space-around;
}
.flex{
  display: flex;
  // justify-content: space-around;
  flex-direction: row;
  flex-wrap: wrap;
}
::v-deep .ant-form-item{
  display: flex;
}
::v-deep .ant-form-item-label{
  width: 100px;
}
::v-deep .table-striped {
  background-color: #f0f0f078;
}
</style>
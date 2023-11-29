<template>
  <div>
    <a-row class="query-form">
      <!-- <a-button  v-if="isAdmin" @click="addStation" type="primary" icon="plus" style="float: left;">新增</a-button> -->
      <a-select v-model="form.step"  :placeholder="$tcache('admin.currentStep')">
        <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <a-input v-model="form.name" :placeholder="$tcache('admin.stationName')" />
      <a-input v-model="form.group" :placeholder="$tcache('admin.group')"/>
      <a-select v-model="form.enabled"  :placeholder="$tcache('admin.startOrNot01')">
        <a-select-option v-for="item in enableds" :key="item.name" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <a-button @click="clearForm"><span class="fontSty"></span>{{$tcache('common.clearCondition')}}</a-button>
      <div class="heardL">
          <a-select v-model="form.cacheStation" class="select"  :placeholder="$t('common.cacheStation')" :options="cacheStations" mode="multiple" :token-separators="[',']" :allow-clear="true"/>
          <a-button @click="generate" type="primary" icon="plus">{{$t('common.createCache')}}</a-button>
      </div>
    </a-row>
    
    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
        <div slot="enabled" slot-scope="text, record,index"  @click="()=>changeEnabled(index,record)" >
          <a-switch v-if="isAdmin||editable" :checked="record.enabled" >
            <a-icon slot="checkedChildren" type="check" />
            <a-icon slot="unCheckedChildren" type="close" />
          </a-switch>
          <span v-else>{{ text?$tcache('admin.enabling'):$tcache('admin.closing') }}</span>
        </div>
        <a-tag class="fontColor" slot="chargerLimits" slot-scope="text" :data-id="text" >{{text||text==0?text+'s':null}}</a-tag>
        <a-tag class="fontColor" slot="step" slot-scope="text" :data-id="text" @click="showStepInfo" >{{text|fmtStep}}</a-tag>
        <a-tag class="fontColor" slot="nextStep" slot-scope="text" :data-id="text" @click="showStepInfo" >{{text|fmtStep}}</a-tag>
        <a-tag class="fontColor" slot="group" slot-scope="text,record" v-show="record.stationType == 1" :data-id="text" >{{text}}</a-tag>
        <a-tag slot="parks" slot-scope="text" :data-ids="text"  class="fontColor" type="primary">{{text}}</a-tag>
        <a-popover  slot="nextStations" slot-scope="text" :data-ids="text"  :title="$tcache('admin.nextStep')">
          <template #content>
            <div style="width:200px;">{{nextStationsTitle}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showStationsInfo" type="primary">{{text}}</a-tag>
        </a-popover>
        <a-popover  slot="nextCacheStations" slot-scope="text,record" :data-ids="text"  :title="$tcache('admin.nextCache')">
          <template #content>
            <div style="width:200px;">{{NextCacheTitle}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showInfo(record.nextCacheStations,'nextCacheStations')" type="primary">{{text}}</a-tag>
        </a-popover>
        <a-popover  slot="nextOutBasketStation" slot-scope="text" :data-ids="text"  title="空车可前往的机台">
          <template #content>
            <div style="width:200px;">{{NOBS_title}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showStationsInfo" type="primary">{{text}}</a-tag>
        </a-popover>
        <span slot="commonAction" slot-scope="text, record,index">
          <a><a-icon type="edit" @click="() => recordEdit(index,record)"></a-icon> </a>
        </span>
      </a-table>
      <div style="margin-top:10px" class="flex">
        <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize"  :placeholder="$tcache('admin.rowsPerPage')"/></div>
        <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
      </div>
      
    </a-row>

    <!-- 修改记录弹窗 -->
    <a-modal
        :title="$tcache('admin.modalTile')"
        :visible="visible"
        :dialog-style="{ top: '20px' }"
        :width="800"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk('edit')"
        @cancel="handleCancel"
    >
      <station_detail :data="record" :typeName="'edit'" :processes="processes" :steps="steps" :parks="parks" :nextDecidePoints="nextDecidePoints"
       :nextCacheStations="nextCacheStations" :stations="stationsData" :nextStationsCN="nextStationsCN" :nextStationsCN2="nextStationsCN2" :alldata="alldata"/>
    </a-modal>
    <!-- 新增机台弹窗 -->
    <a-modal
        :title="$tcache('admin.modalTile')"
        :visible="visible_add"
        :dialog-style="{ top: '20px' }"
        :width="800"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk('add')"
        @cancel="visible_add=false"
    >
      <station_detail :data="newStationInfo" :typeName="'add'" :processes="processes" :steps="steps" :parks="parks"
       :nextCacheStations="nextCacheStations" :stations="alldata" :nextStationsCN="''" :nextStationsCN2="''" :alldata="[]"/>
    </a-modal>
  </div>
</template>

<script>
import {axiosget} from '../../utils'
import station_detail from "./station_detail"
let vueApp = null;
const tableHeader = require('../../data/columns_stationlist.json');
export default {
  components:{
    station_detail,
  },
  data(){
    return {
      nextStationsTitle:'',
      NextCacheTitle:'',
      PriorityTitle:'',
      NextDecidePointTitle:'',
      NOBS_title:'',
      total:0,//查询得到数据的条数
      pagination: {
        pageSize: Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):Number(this.$store.state.defaultPageSize),//每页中显示n条数据
        current: 1,
      },
      enableds:[//车辆动作选项内容
        {id:'true',name: this.$tcache('admin.enabling')},
        {id:'false',name: this.$tcache('admin.noEnabing')}
      ],
      checked:'',
      id:'',//机台id
      enabled:'',//机台开关

      form:{}, //查询条件

      processes:[],
      steps:[],

      data:[],//查询结果
      alldata:[],
      step_names:[],
      AllData:[],

      record:{}, //操作的行
      visible: false,

      points:[],
      // str:{1,2,3},
      nextStep:'',
      stationsData:[],
      parks:[],  //弹窗的临时停车位选项
      nextCacheStations:[],//弹窗的下一个缓存机选项
      titleArr:[],
      isSave:true,//判断是否保存
      saveId:'',//保存的id
      nextStationsCN:'',//弹窗里显示的下一个机台的中文名称
      nextStationsCN2:'',//弹窗里显示的下一个机台2的中文名称
      stepCN:'',
      nextStepCN:'',
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      newStationInfo:{},//储存添加机台的信息的对象
      visible_add:false,//新增机台的弹窗
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      stationType:[{type:1,name: this.$tcache('admin.stationType01')},{type:2,name: this.$tcache('admin.stationType02')}],
      nextDecidePoints:[],
      cacheStations:[]
    }
  },
  computed: {
    columns() {
      return this.$transformI18n(tableHeader);
    }
  
  },
  watch:{
    form:{
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        this.pagination.current=1
        // this.queryData()
        if(this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.filterData, 500)
      },
      deep: true
    },
    pagination:{
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        localStorage.setItem('pageSize', this.pagination.pageSize);
      },
      deep: true
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
  },
  beforeMount() {
    this.querySteps()
    if(this.editable||this.isAdmin)this.addRender()
    vueApp=this
  },
  mounted() {
    this.queryParks()
    this.queryDecidePoints()
    this.queryProcess()
    this.queryData()
  },
  methods:{
    filterData(){
      let result = this.alldata_cacheStations
      if(this.form.step){
        result = result.filter(d=>this.form.step==d.step)
      }
      if(this.form.name){
        result = result.filter(d=>`${d.name}`.includes(`${this.form.name}`))
      }
      if(this.form.ip){
        result = result.filter(d=>`${d.ip}`.includes(`${this.form.ip}`))
      }
      if(this.form.group){
        result = result.filter(d=>d.group==this.form.group)
      }
      if(this.form.enabled){
        result = result.filter(d=>`${d.enabled}`==this.form.enabled)
      }
      this.data = result
      this.total=Number(this.data.length)
    },
    cancel (){
      this.$message.error(this.$tcache('admin.canceled'));
    },
    generate(){
      if(this.form.cacheStation?.length>0){
        this.axios.get(`voluntarily/voluntarilyStationBL/${this.form.cacheStation.join(',')}`).then((res)=>{
          if(res.data.success){
              this.$message.success(res.data.message);
          }else{
              this.$message.warning(res.data.message)
          }
        }).catch((err)=>{
            this.$message.error(err)
        })
      }else{
        this.$message.warning("请先选择缓存机")
      }
        
    },
    getNextStation(){
      this.axios.get(`station/bystep/${this.nextStep}`).then(res=>{
        if(res.status == 200&&res.data){
          this.stationsData=res.data
        }else{
          this.$message.warning(this.$tcache('admin.cacheListWarn'))
        }
      }).catch(()=>{this.$message.warning(this.$tcache('admin.cacheListWarn'))})
    },
    queryDecidePoints(){
      this.axios.get(`point/bytype/DECIDE`).then(data=>{
        this.nextDecidePoints =data.data
      })
    },
    ChangePage(pageNumber){
      this.pagination.current=pageNumber
    },
    changeEnabled(index,record){
      console.log(index,record)
      this.axios.put(`station/enabled/${record.id}/${!record.enabled}`).then(()=>{
        this.isSave=false
        this.saveId=record.id
        this.queryData()
      }).catch(()=>{})
    },
    clearForm(){
      this.form = {}
      this.data=this.alldata
      this.total=0
    },
    queryProcess(){
      axiosget(`dict/process`,{}, (data)=>{
        console.log('processes',data)
        this.processes = data
      })
    },
    querySteps(){
      this.axios.get(`step/all`).then((res)=>{
        console.log(res)
        if(Array.isArray(res.data)){this.steps=res.data}else{
          this.$message.error(this.$tcache('admin.cacheListErr01'))
        }
      }).catch(()=>{
        this.$message.error(this.$tcache('admin.cacheListErr01'))
      })
    },
    queryParks(){
      this.axios.get(`point/bytype/PARK`).then(data=>{
        this.parks =data.data
      })
    },
    queryNextCacheStations(){
      this.axios.get(`station/all`).then(res=>{
        this.nextCacheStations=res.data.filter(s=>s.stationType==2||s.stationType==3)
      })
    },
    queryData(){
      let that = this
      this.axios.post(`station/list`, {}).then(res=>{
        if(res.status == 200&&res.data){
          // if(Object.keys(this.form).length==0){this.AllData=res.data}
          this.cacheStations=res.data.filter(e=>e.stationType>1).map(d=>{
              return {value:d.doPoint,label:d.name}
          });
          this.alldata = res.data
          this.alldata_cacheStations=this.alldata.filter(item=>item.stationType==2||item.stationType==3)
          console.log(this.alldata_cacheStations)
          if(this.isSave){this.data=this.alldata_cacheStations}else{
            const index = this.data.findIndex(item=>item.id==this.saveId)
            let obj=this.alldata_cacheStations.filter(item=>item.id==this.saveId)
            this.data[index]=Object.assign(this.data[index], obj[0])
          }
          this.total=Number(this.data.length)
          let dt=[...this.data]
          this.data=dt
          console.log(dt)
        }else{
          that.$message.warning(this.$tcache('admin.cacheListErr02'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    addRender(){
      let b = this.columns.find(e=>e.dataIndex=='commonAction')
      if(b == undefined){//避免重复mounted时重复push(一般在开发模式下发生）
        let col = { title: this.$tcache('common.edit'), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right',width:60, scopedSlots: { customRender: 'commonAction' } }
        this.columns.push(col)
      }
    },
    recordEdit(index,record){
      console.log(index,record)
      this.nextStationsCN = ''
      this.nextStationsCN2 = ''
      let ids =record.nextStations
      if(typeof ids=='string'){
        if(ids.length!=0){
          if(ids.includes(';')){
            let arr1=ids.split(';')[0].split(',')
            record.nextStations=arr1
            let stations = arr1.map(id=>this.alldata.find(a=>a.doPoint==id))
            this.nextStationsCN = stations.map(s=>`${s?.name}`).join(',')
            let arr2=ids.split(';')[1].split(',')
            record.nextStations2=arr2
            let stations2 = arr2.map(id=>this.alldata.find(a=>a.doPoint==id))
            this.nextStationsCN2 = stations2.map(s=>`${s?.name}`).join(',')
          }else{
            let arr1 = ids.split(',')
            record.nextStations=arr1
            let stations = arr1.map(id=>this.alldata.find(a=>a.doPoint==id))
            this.nextStationsCN = stations.map(s=>`${s?.name}`).join(',')
            if((record.nextStations2??'')!==''&&record.nextStations2.length!==0){
              let arr2=record.nextStations2.split(',')
              let stations2 = arr2.map(id=>this.alldata.find(a=>a.doPoint==id))
              this.nextStationsCN2 = stations2.map(s=>`${s?.name}`).join(',')
            }
          }
        }
      }
      let nextCacheStations=record.nextCacheStations
      if((nextCacheStations??'')!=''&&typeof nextCacheStations!=='object'){
        record.nextCacheStations=nextCacheStations.split(',')
      }
      let parks=record.parks
      if((parks??'')!=''&&typeof parks!=='object'){
        record.parks=parks.split(',')
      }
      this.queryNextCacheStations()
      if(!record.parks){record.parks=''}
      this.nextStep=record.nextStep?record.nextStep:'';
      record.nextStations=record.nextStations?record.nextStations:undefined;
      record.parks=record.parks?record.parks:undefined;
      record.nextCacheStations=record.nextCacheStations?record.nextCacheStations:undefined;
      record.nextOutBasketStation=record.nextOutBasketStation?record.nextOutBasketStation.split(','):undefined;
      this.record=record
      console.log(this.record)
      this.visible= true
      this.getNextStation()
    },
    addStation(){
      this.newStationInfo={}
      this.visible_add=true
    },
    handleOk(e){
      let state=false
      let requierdstr=''
      let requierds=['line','name','process','step','nextStep','relPids','exitPoint','doPoint','ip','port','adsPort','udpHead']
      let obj=e=='edit'?this.record:this.newStationInfo
      requierds.forEach(r=>{
        if(((obj[r]??'')==''||obj[r]?.length==0)&&obj[r]!==0&&obj[r]!=='0'){
          requierdstr+='-'+r+'-'
          state=true
        }
      })
      if(state){
        this.$message.info(this.$tcache('admin.validateTips01',{requierdstr}))
        return
      }
      let that = this
      this.$confirm({
        title:this.$tcache('common.prompt'),
        content:this.$tcache('admin.saveConfig'),
        onOk(){
          if(e=='edit'){that.save();that.visible = false}else{that.newStationInfoSave();that.visible_add = false}
        },
      })
    },
    handleCancel(){
      this.saveId=this.record.id
      this.isSave=false
      this.record={}
      this.visible = false
      this.queryData()
    },
    dealt(value,type){
      if(Array.isArray(value)){
        if(value.length==0){
          value=null;
        }else{
          value=[...new Set(value.join(',').split(','))].join(',')
        }
        this.record[`${type}`]=value
      }
    },
    save(){
      this.dealt(this.record.nextStations,'nextStations')
      this.dealt(this.record.nextStations2,'nextStations2')
      this.dealt(this.record.parks,'parks')
      this.dealt(this.record.nextCacheStations,'nextCacheStations')
      this.dealt(this.record.nextOutBasketStation,'nextOutBasketStation')
      if((!this.record.parks)&&this.record.parks!='0')this.record.parks=null
      if((!this.record.nextCacheStations)&&this.record.nextCacheStations!='0')this.record.nextCacheStations=null
      if(!this.record.limits){this.record.limits=0}
      if(!this.record.group){this.record.group=0}
      if(!this.record.chargerLimits&&this.record.chargerLimits!=0)this.record.chargerLimits=null
      if((this.record.nextStations2??'')!==''){
        console.log(this.record.nextStations,this.record.nextStations2)
        if((this.record.nextStations??'')==''||this.record.nextStations.length==0){
          this.record.nextStations=this.record.nextStations2
        }else{this.record.nextStations+=';'+this.record.nextStations2}
      }
      let obj={...this.record}
      this.axios.post(`station/save`, obj).then(res=>{
        if(res.data.success){
          this.isSave=false
          this.saveId=this.record.id
          this.record.nextStations2=undefined
          this.$message.success(res.data.message)
          this.queryData()
        }else{
          this.$message.warning(res.data.message)
        }
      }).catch(err=>{this.$message.error(err)})
    },
    newStationInfoSave(){
      let arr=['nextStations','nextStations2','parks','nextCacheStations']
      arr.forEach(item=>{
        let value=this.newStationInfo[`${item}`]
        if(Array.isArray(value)){
          if(value.length==0){value=null}else{value=value.join(',')}
          this.newStationInfo[`${item}`]
        }
      })
      if((this.newStationInfo.nextStations2??'')!==''){
        console.log(this.newStationInfo.nextStations,this.newStationInfo.nextStations2)
        if((this.newStationInfo.nextStations??'')==''||this.newStationInfo.nextStations.length==0){
          this.newStationInfo.nextStations=this.newStationInfo.nextStations2
        }else{this.newStationInfo.nextStations+=';'+this.newStationInfo.nextStations2}
      }
      if(!this.newStationInfo.enabled)this.newStationInfo.enabled=false
      this.axios.post(`station/save`, this.newStationInfo).then(res=>{
        if(res.data.success){
          this.isSave=true
          this.queryData()
          this.$message.success(res.data.message)
        }else{
          this.$message.warning(res.data.message)
        }
      }).catch(err=>{this.$message.error(err)})
    },
    showStepInfo(evt){
      let id = evt.target.dataset.id
      let step = this.steps.find(e=>e.id==id)
      if(step){
        let desc = JSON.stringify(step).slice(1,-1).split(',').join(', ')
        console.log(desc)
        this.$notification.info({message: this.$tcache('admin.configErrTips'), description:desc})
      }else{
        this.$notification.error({message: this.$tcache('admin.configErr'), description:this.$tcache('admin.configErrMsg',{id})})
      }
    },
    showStationsInfo(evt){
      let ids = evt.target.dataset.ids
      if(!ids){
        this.nextStationsTitle='';
        this.NOBS_title=''
        return;
      }
      if(ids.includes(';')){ids=ids.replace(';',',')}
      let arr = ids.split(',')
      let stations = arr.map(doPoint=>this.alldata.find(a=>a.doPoint==doPoint))
      let desc = stations.map(s=>`${s.doPoint}:${s.name}；`)
      let msg=desc.join(' ')
      this.nextStationsTitle=msg
      this.NOBS_title=msg
    },
    showInfo(item,keys){
      this.NextCacheTitle = null
      this.PriorityTitle=null;
      this.NextDecidePointTitle=null;
      let ids =item&&JSON.parse(JSON.stringify(item))
      console.log('ids',item)
      if(typeof ids=='string'){
        if(ids.length!=0){
          let arr = ids.split(',')
          let stations = arr.map(doPoint=>this.alldata.find(a=>a.doPoint==doPoint));console.log(keys)
          if(keys=='nextCacheStations'){this.NextCacheTitle = stations.map(s=>`${s.doPoint}:${s.name}`).join(', ')}
          if(keys=='nextDecidePoint'){this.NextDecidePointTitle = stations.map(s=>`${s.name}`).join(',')}
        }
      }
    },
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
::v-deep .ant-table-thead > tr > th,::v-deep .ant-table-tbody > tr > td{
  text-align: center;
}
.flex{
  display: flex;
  justify-content: center;
  align-items: center;
}
::v-deep .ant-table-pagination{
  display: none;
}
::v-deep .ant-table-thead > tr > th{
  background-color: $bgcolor !important;
  color: $color;
}
::v-deep .ant-tag{
  cursor: pointer;
}
::v-deep .table-striped {
  background-color: #f0f0f0;
}
::v-deep .ant-modal-content{
  max-height: 95vh;
  overflow: auto;
}
.heardL{
    display: flex;
    width: 100% !important;
    justify-content: center;
    button{
        margin-left: 10px;
    }
    .select{
        min-width: 150px;
        max-width: 300px;
    }
}
</style>
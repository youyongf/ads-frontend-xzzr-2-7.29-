<template>
  <div>
    <a-row class="query-form">
      <a-button  v-if="isAdmin" @click="addCacheLayer" type="primary" icon="plus" style="float: left;">{{$tcache('common.add')}}</a-button>
      <a-input v-model="form.cacheId"  :placeholder="$tcache('admin.cacheLayer01')"/>
      <a-input v-model="form.name"  :placeholder="$tcache('admin.cacheLayer02')"/>
      <a-select v-model="form.park" :options="parks" class="parkPoint" :placeholder="$tcache('admin.cacheLayer03')"></a-select>
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
    </a-row>

    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
        <a-tag slot="type" slot-scope="text" :data-ids="text"  >{{text|fmtType}}</a-tag>
        <div slot="materialType" slot-scope="text" :data-ids="text"  >{{text==0?$tcache('admin.emptyBasket'):text==1?$tcache('admin.basketful'):''}}</div>
        <div slot="transferLayer" slot-scope="text" :data-ids="text"  >{{text==1?$tcache('admin.cacheLayer04'):text==2?$tcache('admin.cacheLayer05'):''}}</div>
        <div slot="nextStep" slot-scope="text" :data-ids="text"  >{{text|fmtStep}}</div>
        <div slot="group" slot-scope="text" :data-ids="text"  >{{text|fmtGroup}}</div>
        <a-popover  slot="nextStations" slot-scope="text" :data-ids="text"  :title="$tcache('admin.cacheLayer06')">
          <template #content>
            <div style="width:200px;">{{nextStationsTitle}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showStationsInfo" type="primary">{{text}}</a-tag>
        </a-popover>
        <div slot="commonAction" slot-scope="text, record,index">
          <a class="icon1"><a-icon type="edit" @click="() => recordEdit(index,record)"></a-icon> </a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="$tcache('admin.cacheLayer07')"
            :ok-text="$tcache('common.confirm')"
            :cancel-text="$tcache('common.cancel')"
            @confirm="deleteAgv(record)"
            @cancel="cancel"
          >
            <a class="icon2"><a-icon type="delete"></a-icon> </a>
          </a-popconfirm>
        </div>
      </a-table>
      <div style="margin-top:10px" class="flex">
        <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize"  :placeholder="$tcache('admin.rowsPerPage')"/></div>
        <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
      </div>
    </a-row>
    <a-modal
        :title="type=='edit'? $tcache('admin.modalTile') : $tcache('admin.addTitle')"
        :visible="visible"
        :dialog-style="{ top: '20px' }"
        :width="800"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk"
        @cancel="handleCancel"
    >
      <!-- <public_detail :data="record" :remark="columns" :isNumArr="isNumArr" :showArr="showArr" :disabledStrArr="disabledStrArr" :requireds="requireds" :isCacheLayer="isCacheLayer" :parks="checkboxs"/> -->
      <public_detail :data="record"  :type="type"  :requireds="requireds" :columns="columns" :isNum="isNumArr" :checkbox="checkbox" :checkboxs="checkboxs" :radio="radio" :radios="radios" :disabled="disabled"/>
    </a-modal>
  </div>
</template>

<script>
// import public_detail from "./public_detail";
import public_detail from "@/components/public_detail";
// import {makeColumns} from "../../utils";
const agvtypes = require('../../data/agvtypes.json');
const tableHeader = require('../../data/columns_cacheLayer.json');
let vueApp=null;
export default {
  name: "agvlist",
  components:{
    public_detail
  },
  data(){
    return{
      total:0,//查询得到数据的条数
      pagination: {
        pageSize:Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):Number(this.$store.state.defaultPageSize),//每页中显示10条数据
        current: 1,
      },
      form:{}, //查询条件
      data:[],//查询结果
      alldata:[],
      // columns:[], //表头
      visible: false,
      record:{}, //操作的行
      isSave:true,
      saveId:'',
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      visible_add:false,
      type:'',
      showArr:[],
      isNumArr:[],
      // disabledStrArr:['id'],
      requireds:[],
      parks:[],
      stations:[],
      checkboxs:{},//根据特定缓存点查找到的对应待命点
      isCacheLayer:true,
      checkbox:['parks','nextStations'],
      radio:['nextStep','materialType','transferLayer','group'],
      radios:{},
      disabled:{},
      nextStationsTitle:'',
      groups:[]
    }
  },
  computed: {
    types() {
      return this.$transformI18n(agvtypes, "text");
    },
    columns() {
      return this.$transformI18n(tableHeader);
    }
  },
  watch:{
    form:{
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        this.pagination.current=1
        if(this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.filterData, 500)
      },
      deep: true
    },
    pagination:{
      handler(newVal, oldVal) {
        console.log('pagination', newVal, oldVal)
        localStorage.setItem('pageSize', this.pagination.pageSize);
      },
      deep: true
    },
  },
  filters:{
    fmtType(val){
      let ptype = agvtypes.find(p=>p.value == val)
      if(ptype){
        return this.$tcache(ptype.text);
      }
      return val
    },
    fmtStep:val=>{
      let steps = [...vueApp.radios['nextStep']]
      let step = steps.find(e=>e.value == val)
      if(step){
        return step.label
      }
      return val
    },
  },
  beforeMount() {
    vueApp=this
    if(this.editable||this.isAdmin)this.addRender()
  },
  mounted() {
    this.radios['materialType']=[{value:0,label: this.$tcache('admin.emptyBasket')},{value:1,label: this.$tcache('admin.basketful')}]
    this.radios['transferLayer']=[{value:1,label:this.$tcache('admin.cacheLayer04')},{value:2,label:this.$tcache('admin.cacheLayer05')}]
    this.queryStep()
    this.queryGroup()
    this.queryStations()
  },
  methods:{
    filterData(){
      let result = this.alldata
      console.log(result)
      if(this.form.cacheId){
        result = result.filter(d=>d.cacheId==this.form.cacheId)
      }
      if(this.form.name){
        result = result.filter(d=>`${d.name}`.includes(`${this.form.name}`))
      }
      if(this.form.park){
        result = result.filter(d=>d.parks?.includes(`${this.form.park}`))
      }
      this.data = result
      this.total=Number(this.data.length)
    },
    ChangePage(pageNumber){
      this.pagination.current=pageNumber
    },
    clearForm(){
      this.form = {}
      this.total=0
      this.data=this.alldata
    },
    queryStep(){
      this.axios.get(`step/all`).then(data=>{
        // let obj={}
        this.radios['nextStep']=data.data.map(item=>{
          return {value:item.id,label:item.name}
        })
        // this.radios=obj
        console.log(this.radios)
      })
    },
    queryParks(){
      this.axios.get(`point/bytype/PARK`).then(data=>{
        // let obj={}
        this.parks=data.data.map(item=>{
          return {value:item.id,label:item.remark}
        })
        this.checkboxs['parks']=this.parks
        // this.checkboxs=obj
      })
    },
    queryGroup(){
      this.axios.get(`stationGroup/list`).then(res=>{
        if(res.status == 200&&res.data){
          this.radios['group'] = res.data.map(item=>{return {value:item.group,label:item.remark}})
        }
      }).catch(err=>{this.$message.error(err)})
    },
    queryStations(){
      this.axios.get(`station/all`).then(res=>{
        this.stations=res.data
        // let dt=[...this.data]
        // dt.forEach((d,i)=>{
        //   let s=this.stations.find(st=>st.doPoint==d.cacheId)
        //   if(s){
        //     dt[i]['nextStep']=s.nextStep
        //   }
        // })
        // this.alldata.forEach((d,i)=>{
        //   let s=this.stations.find(st=>st.doPoint==d.cacheId)
        //   if(s){
        //     this.alldata[i]['nextStep']=s.nextStep
        //   }
        // })
        // this.data=dt
        // let radio=['nextStep']
        // this.radio=Object.keys(this.data[0]).filter(k=>radio.includes(k))
        this.queryData()
      })
    },
    queryData(){
      let that = this
      this.axios.get(`stationBufferLayer/all`).then(res=>{
        if(res.status == 200&&res.data){
          let data=res.data
          // data.forEach((d,i)=>{
          //   let s=this.stations.find(st=>st.doPoint==d.cacheId)
          //   if(s){
          //     data[i]['nextStep']=s.nextStep
          //   }
          // })
          this.alldata=data
          // let checkbox=['parks','nextStations']
          // this.checkbox=Object.keys(data[0]).filter(k=>checkbox.includes(k))
          let editable=['name','group','materialType','nextStations','transferLayer','parks','nextStep','maxBasket']
          this.disabled['edit']=Object.keys(data[0]).filter(k=>!editable.includes(k))
          if(this.isSave){
            this.data=data
          }else{
            const index = this.data.findIndex(item=>item.id==this.saveId)
            let obj=this.alldata.filter(item=>item.id==this.saveId)
            this.data[index]=Object.assign(this.data[index], obj[0])
          }
          let noNum=[...this.radio,...this.checkbox,...['name']]
          // this.showArr=Object.keys(this.alldata[0]).filter(k=>k!='parks')
          this.requireds=Object.keys(this.alldata[0]).filter(k=>k!='nextStations'&&k!='parks')
          this.isNumArr=Object.keys(this.alldata[0]).filter(k=>!noNum.includes(k))
          this.total=Number(this.data.length)
          // this.queryStations()
          // this.queryStep()
          this.queryParks()
        }else{
          that.$message.warning(this.$tcache('common.queryFailure'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    addRender(){
      //列中添加类似： "scopedSlots":{ "customRender":"createTime"}
      let b = this.columns.find(e=>e.dataIndex=='commonAction')
      if(b == undefined){//避免重复mounted时重复push(一般在开发模式下发生）
        let col = { title: this.$tcache('common.operation'), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right',width:100, scopedSlots: { customRender: 'commonAction' } }
        this.columns.push(col)
      }
    },
    queryNextStation(nextStep){
      this.$delete(this.checkboxs,'nextStations')
      this.axios.get(`station/bystep/${nextStep}`).then(res=>{
        if(Array.isArray(res.data)&&res.data?.length>0){
          let nextStations=res.data.map(item=>{
            return {value:item.doPoint,label:item.name}
          })
          this.$set(this.checkboxs,'nextStations',nextStations);
        }else{
          this.$message.warning(this.$tcache('admin.cacheListWarn'))
        }
        console.log(this.checkboxs['nextStations'])
      }).catch((err)=>{this.$message.warning(err+'')})
    },
    recordEdit(index,record){
      console.log(index,record)
      this.queryNextStation(record.nextStep)
      this.record = {}
      this.type='edit'
      record.parks=record.parks?record.parks.split(','):undefined
      record.nextStations=record.nextStations?record.nextStations.split(','):undefined
      // this.disabledStrArr=['id']
      // let station=this.stations.find(s=>s.doPoint==record.cacheId)
      // if(station){
      //   this.queryParks(station.nextStep)
      // }else{
      //   this.$message.error('该机台对接点的对应机台为空')
      // }
      // this.queryParks(record.nextStep)
      this.record = record;
      this.visible = true
    },
    deleteAgv(record){
      this.axios.delete(`stationBufferLayer/${record.id}`).then((res)=>{
        if(res.data.success){
          let ii=this.data.findIndex(t=>t.id==record.id)
          this.data.splice(ii,1)
          let i=this.alldata.findIndex(t=>t.id==record.id)
          this.alldata.splice(i,1)
          this.total=Number(this.data.length)
          this.$message.success(res.data.message)
        }else{
          this.$message.warning(res.data.message)
        }
      }).catch((err)=>{console.log(err+'')})
    },
    cancel() {
      this.$message.warning(this.$tcache('admin.canceled'));
    },
    addCacheLayer(){
      this.type='add'
      let record={}
      let keys=Object.keys(this.alldata[0])
      keys.forEach(k=>{
        record[k]=''
        if(k=='parks'){
          record['parks']=undefined
        }else if(k=='nextStations'){
          record['nextStations']=undefined
        }
      })
      this.record=record
      // this.disabledStrArr=[]
      this.visible = true
    },
    handleOk(){
      let that = this
      let state=false
      let requierdstr=''
      Object.keys(this.record).forEach(k=>{
        if((this.record[k]??'')==''&&this.requireds.includes(k)&&this.record[k]!==0){
          requierdstr+='-'+k+'-'
          state=true
        }
      })
      if(state){
        this.$message.info(this.$tcache('admin.validateTips01',{requierdstr}))
        return
      }
      this.$confirm({
        title:this.$tcache('common.prompt'),
        content:this.$tcache('admin.saveConfig'),
        onOk(){
          that.save()
          that.visible = false
        },
      })
    },
    handleCancel(){
      if(this.type=='edit'){
        this.saveId=this.record.id
        this.isSave=false
        this.queryData()
      }
      this.record={}
      this.visible = false;
    },
    dealt(value,num){
      if(Array.isArray(value)){
        if(value.length==0){
          value=null;
          if(num==1){this.record.parks=value;}
          if(num==2){this.record.nextStations=value;}
        }else{
          value=[...new Set(value.join(',').split(','))].join(',')
          if(num==1){this.record.parks=value;}
          if(num==2){this.record.nextStations=value;}
        }
      }
    },
    save(){
      this.dealt(this.record.parks,1)
      this.dealt(this.record.nextStations,2)
      Object.keys(this.record).forEach(k=>{
        if(this.isNumArr.includes(k)){
          this.record[k]=Number(this.record[k])
        }
        // if(k=='parks'&&Array.isArray(this.record['parks'])){
        //   this.record['parks']=this.record['parks'].join(',')
        // }
        if(k=='basketSize'&&this.record[k]==0){
          this.record['basketSize']=null
        }
      })
      this.axios.post(`stationBufferLayer/save`,this.record).then(()=>{
        if(this.type=='edit'){
          this.isSave=false
          this.saveId=this.record.id
        }else{this.isSave=true}
        this.$message.success(this.$tcache('common.saveSuccess'))
        this.queryData()
      }).catch(()=>{})
    },
    showStationsInfo(evt){
      let ids = evt.target.dataset.ids
      if(!ids){
        this.nextStationsTitle='';
        return;
      }
      let arr = ids.split(',')
      let stations = arr.map(doPoint=>this.stations.find(a=>a.doPoint==doPoint))
      let desc = stations.map(s=>`${s.doPoint}:${s.name}；`)
      let msg=desc.join(' ')
      this.nextStationsTitle=msg
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
  // font-weight: bold;
}
::v-deep .table-striped {
  background-color: #f0f0f0;
}
.icon2{
  color: red;
}
.icon1,.icon2{
  font-size: 16px;
  display: inline-block;
  padding: 2px;
}
.parkPoint{
  min-width: fit-content !important;
}
</style>

<template>
  <div>
    <a-row class="query-form">
      <a-button  v-if="isAdmin" @click="addStep" type="primary" icon="plus" style="float: left;">{{$tcache('common.add')}}</a-button>
      <a-input v-model="form.id"  placeholder="id"/>
      <a-input v-model="form.name"  :placeholder="$tcache('admin.name')"/>
      <a-input v-model="form.decidePoints"  :placeholder="$tcache('admin.stepDet01')"/>
      <a-input v-model="form.cachePoints" :placeholder="$tcache('admin.stationType02')" />
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
    </a-row>

    <a-row>
      <a-table  :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
        <div slot="type" slot-scope="text" :data-ids="text"  >{{text|fmtType}}</div>
        <div slot="basketType" slot-scope="text" :data-ids="text"  class="fontColor" type="primary">{{text==1? $tcache('admin.steplist01'):''}}{{text==2? $tcache('admin.steplist02'):''}}{{text==3? $tcache('admin.steplist03'):''}}</div>
        <div slot="inWhat" slot-scope="text" :data-ids="text"  class="fontColor" type="primary">{{text==1? $tcache('admin.steplist04'):''}}{{text==2?$tcache('admin.emptyBasket'):''}}{{text==3? $tcache('admin.steplist05'):''}}</div>
        <div slot="outWhat" slot-scope="text" :data-ids="text"  class="fontColor" type="primary">{{text==1? $tcache('admin.steplist04'):''}}{{text==2?$tcache('admin.emptyBasket'):''}}{{text==3? $tcache('admin.steplist05'):''}}</div>
        <div class="fontColor" slot="nextStep" slot-scope="text" :data-id="text">{{text|fmtStep}}</div>
        <div class="fontColor" slot="previousStep" slot-scope="text" :data-id="text">{{text|fmtStep}}</div>
        <!-- <span slot="commonAction" slot-scope="text, record,index">
          <a><a-icon type="edit" @click="() => recordEdit(index,record)"></a-icon> </a>
        </span> -->
        <span class="commonAction" slot="commonAction" slot-scope="text, record,index">
          <a-button style="margin-right: 5px;" @click="() => recordEdit(index,record)"><a-icon type="edit"></a-icon></a-button>
          <a-button @click="() => updateCacheStations(record)">{{$tcache('admin.steplist06')}}</a-button>
        </span>

        <!-- <a-popover  slot="parks" slot-scope="text,record" :data-ids="text"  title="待命点">
          <template #content>
            <div style="width:200px;">{{ParksTitle}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showInfo(record.parks,'parks')" type="primary">{{text}}</a-tag>
        </a-popover> -->
        <a-popover  slot="cachePoints" slot-scope="text,record" :data-ids="text"  :title="$tcache('admin.stationType02')">
          <template #content>
            <div style="width:200px;">{{CachePointsTitle}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showInfo(record.cachePoints,'cachePoints')" type="primary">{{text}}</a-tag>
        </a-popover>
        <a-popover  slot="decidePoints" slot-scope="text,record" :data-ids="text"  :title="$tcache('admin.stepDet01')">
          <template #content>
            <div style="width:200px;">{{DecidePointTitle}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showInfo(record.decidePoints,'decidePoints',record.id)" type="primary">{{text}}</a-tag>
        </a-popover>
      </a-table>
      <div style="margin-top:10px" class="flex">
        <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize"  :placeholder="$tcache('admin.rowsPerPage')"/></div>
        <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
      </div>
    </a-row>
    <a-modal
        :title="type=='edit'?$tcache('common.modify'): $tcache('admin.addTitle')"
        :visible="visible"
        :dialog-style="{ top: '20px' }"
        :width="800"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk(type)"
        @cancel="handleCancel(record)"
    >
      <step_detail v-if="type!='add'" :data="record" :decidePoints="decidePoints" :parks="parks" :chargePoints="chargePoints" />
      <!-- <public_detail v-else :data="record" :remark="columns" :isNumArr="isNumArr" :requireds="requireds" /> -->
      <publicDetail v-else :data="record"  :type="type" :columns="columns" :isNum="isNumArr" :requireds="requireds"/>
    </a-modal>
    <!-- 缓存机更新弹窗 -->
    <a-modal
        :title="$tcache('common.modify')"
        :visible="visible_cacheStations"
        :dialog-style="{ top: '20px' }"
        :width="800"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk('cacheStations')"
        @cancel="handleCancel(record_cacheStations)"
    >
      <div style="margin-bottom: 5px;"><a-tag>{{ CachePointsTitle }}</a-tag></div>
      <div>
        <span>{{$tcache('admin.stationType02')}}：</span>
        <a-select v-model="cacheStations_selected"  class="changeWidth" mode="multiple" :token-separators="[',']">
          <a-select-option v-for="item in cachePoints" :key="item.id" :value="item.doPoint">{{item.name}}</a-select-option>
        </a-select>
      </div>
    </a-modal>
  </div>
</template>

<script>
// import public_detail from "./public_detail";
import axios from "axios";
import step_detail from "./step_detail";
import publicDetail from "@/components/public_detail";
const agvtypes = require('../../data/agvtypes.json');
const tableHeader = require('../../data/columns_steplist.json');
let vueApp=null;
export default {
  name: "steplist",
  components:{
    step_detail,
    publicDetail
  },
  data(){
    return{
      total:0,//查询得到数据的条数
      pagination: {
        pageSize: Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):Number(this.$store.state.defaultPageSize),//每页中显示10条数据
        current: 1,
      },
      form:{}, //查询条件

      data:[],//查询结果
      alldata:[],
      visible: false,
      record:{}, //操作的行
      decidePoints:[],
      parks:[],
      cachePoints:[],
      ParksTitle:'',
      CachePointsTitle:'',
      DecidePointTitle:'',
      titleArr:[],
      isSave:true,
      saveId:'',
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      record_cacheStations:null,
      visible_cacheStations:false,
      cacheStations_selected:null,
      type:'',
      showArr:[],
      isNumArr:[],
      disabledStrArr:['id'],
      requireds:[],
      chargePoints:[],
      disabled:{add:['name','id']}
    }
  },
   computed: {
    types() {
      return this.$transformI18n(agvtypes,"text");
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
    fmtType(val){
      let ptype = agvtypes.find(p=>p.value == val)
      if(ptype){
        return this.$tcache(ptype.text)
      }
      return val
    },
    fmtStep:val=>{
      let steps = [...vueApp.alldata]
      let step = steps.find(e=>e.id == val)
      if(step){
        return step.name
      }
      return val
    },
  },
  beforeMount() {
    vueApp=this
    if(this.editable||this.isAdmin)this.addRender()
  },
  mounted() {
    this.queryData()
    this.queryPoint()
    this.queryStationData()
  },
  methods:{
    filterData(){
      let result = this.alldata
      if(this.form.id){
        result = result.filter(d=>d.id==this.form.id)
      }
      if(this.form.name){
        result = result.filter(d=>`${d.name}`.includes(`${this.form.name}`))
      }
      if(this.form.decidePoints){
        result = result.filter(d=>`${d.decidePoints}`.includes(`${this.form.decidePoints}`))
      }
      if(this.form.cachePoints){
        result = result.filter(d=>`${d.cachePoints}`.includes(`${this.form.cachePoints}`))
      }
      this.data = result
      this.total=Number(this.data.length)
    },
    DealtInfo(key,titles){
      this.titleArr=[]
      let title=titles
      let keyArr=key.split(',')
      for(let i=0;i<keyArr.length;i++){this.titleArr[i]=`${keyArr[i]}:${title[i]}`}
    },
    showInfo(item,keys,stepid){
      this.CachePointsTitle=null;
      this.DecidePointTitle=null;
      let ids =item
      console.log('stepid',stepid)
      if(typeof ids=='string'){
        if(ids.length!=0){
          let arr = ids.split(',')
          console.log('ids',ids)
          let stations=arr.map(doPoint=>this.stations.find(a=>a.doPoint==doPoint))
          console.log('stations',stations)
          if(keys=='cachePoints'){this.CachePointsTitle = stations.map(s=>`${s.doPoint}:${s.name}`).join(', ')}
          if(keys=='decidePoints'){
            this.axios.get(`point/type/DECIDE/step/${stepid}`).then(res=>{
              let decidePoints =arr.map(d=>res.data.find(a=>a.id==d))
              console.log(decidePoints)
              if(decidePoints[0])this.DecidePointTitle = decidePoints.map(s=>`${s.id}:${s.remark}`).join(',')
            })
          }
        }
      }
    },
    ChangePage(pageNumber){
      this.pagination.current=pageNumber
    },
    clearForm(){
      this.form = {}
      // this.queryData()
      this.data=this.alldata
    },
    queryDecidePoints(id){
      this.axios.get(`point/type/DECIDE/step/${id}`).then(data=>{
        this.decidePoints =data.data
      })
    },
    queryParks(step){
      this.axios.get(`point/type/PARK/step/${step}`).then(data=>{
        this.parks =data.data
        // this.axios.get(`point/type/PARK/step/${nextStep}`).then(res=>{
        //   this.parks=[...this.parks,...res.data]
        // })
      })
    },

    queryData(){
      let that = this
      this.axios.post(`step/list`, {}).then(res=>{
        if(res.status == 200&&res.data){
          this.alldata = res.data
          if(this.isSave){this.data=res.data}else{
            const index = this.data.findIndex(item=>item.id==this.saveId)
            let obj=this.alldata.filter(item=>item.id==this.saveId)
            this.$set(this.data,index,obj[0])
          }
          this.requireds=['id','name','controlState','basketType','inWhat','outWhat','inByte','outByte','inBasketL','inBasketR','outBasketL','outBasketR','inReceive','outReceive']
          // this.requireds=Object.keys(this.alldata[0]).filter(k=>req.includes(k))
          let unNum=['name','decidePoints','cachePoints','chargePoints','parks','inWhat','outWhat']
          this.isNumArr=Object.keys(this.alldata[0]).filter(k=>!unNum.includes(k))
          this.total=Number(this.data.length)
        }else{
          that.$message.warning(this.$tcache('admin.queryFail'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    queryPoint() {
      this.axios
        .get(`point/bytype/CHARGE`)
        .then((res) => {
          if (res.status == 200 && res.data) {
            this.chargePoints=res.data
            console.log(this.chargePoints)
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    queryStationData(){
      let that = this
      this.axios.post(`station/list`, {}).then(res=>{
        if(res.status == 200&&res.data){
          this.stations = res.data
        }else{
          that.$message.warning(this.$tcache('admin.steplist07'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    getCommonActionCfg(){
      return { title: this.$tcache('common.edit'), dataIndex: '', key: 'commonAction', fixed: 'right',width:60, scopedSlots: { customRender: 'commonAction' } }
    },
    addRender(){
      //列中添加类似： "scopedSlots":{ "customRender":"createTime"}
      let b = this.columns.find(e=>e.dataIndex=='commonAction')
      if(b == undefined){//避免重复mounted时重复push(一般在开发模式下发生）
        let col = { title: this.$tcache('common.edit'), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right',width:60, scopedSlots: { customRender: 'commonAction' } }
        this.columns.push(col)
      }
    },
    recordEdit(index,record){
      console.log(index,record)
      // this.queryPoint(record.id)
      this.type='edit'
      this.queryDecidePoints(record.id)
      this.queryParks(record.id)
      // this.queryCachePoints()
      let decidePoints=record.decidePoints
      if((decidePoints??'')!=''&&typeof decidePoints!=='object'){
        record.decidePoints=decidePoints.split(',')
      }
      let parks=record.parks
      if((parks??'')!=''&&typeof parks!=='object'){
        record.parks=parks.split(',')
      }
      record.decidePoints=record.decidePoints?record.decidePoints:undefined;
      record.chargePoints=record.chargePoints?record.chargePoints.split(','):undefined;
      // record.cachePoints=record.cachePoints?record.cachePoints:undefined;
      record.parks=record.parks?record.parks:undefined;
      this.record = record;
      this.visible = true
    },
    addStep(){
      this.type='add'
      let record={}
      let keys=Object.keys(this.alldata[0])
      keys.forEach(k=>{
        record[k]=null
      })
      this.record=record
      this.visible = true
    },
    queryCachePoints(){
      this.axios.get(`station/all`).then(res=>{
        this.cachePoints=res.data.filter(s=>s.stationType==2||s.stationType==3)
      })
    },
    updateCacheStations(record){
      console.log(record)
      this.CachePointsTitle = ''
      let ids =record.cachePoints
      if(ids){
        let stations = ids.split(',').map(id=>this.stations.find(a=>a.doPoint==id))
        this.CachePointsTitle = stations.map(s=>`${s?.name}`).join(',')
      }
      this.queryCachePoints();
      let cachePoints=record.cachePoints
      if((cachePoints??'')!=''&&typeof cachePoints!=='object'){
        record.cachePoints=cachePoints.split(',')
      }
      record.cachePoints=record.cachePoints?record.cachePoints:undefined;
      this.record_cacheStations = record;
      this.cacheStations_selected=record.cachePoints
      this.visible_cacheStations = true
    },
    cacheStationsSave(){
      this.dealt(this.cacheStations_selected,3)
      if((!this.cacheStations_selected)&&this.cacheStations_selected!='0')this.cacheStations_selected=null
      axios.put(`step/updatecachestations/${this.record_cacheStations.id}/${this.cacheStations_selected}`).then(res=>{
        console.log(res)
        if(res.data.success){
          this.isSave=false
          this.saveId=this.record_cacheStations.id
          this.queryData()
          this.$message.success(this.$tcache('common.saveSuccess'))
        }else{
          this.$message.error(this.$tcache('common.saveFail'))
        }
      })
    },
    handleOk(type){
      let that = this
      let state=false
      let requierdstr=''
      Object.keys(this.record).forEach(k=>{
        if((this.record[k]??'')==''&&this.requireds.includes(k)&&this.record[k]!==0){
          requierdstr+='-'+k+'-'
          state=true
        }
      })
      if(state&&type=='add'){
        this.$message.info(this.$tcache('admin.validateTips01',{requierdstr}))
        return
      }
      this.$confirm({
        title:this.$tcache('common.prompt'),
        content:this.$tcache('admin.saveConfig'),
        onOk(){
          if(type=='edit'||type=='add'){
            that.save()
            that.visible = false;
          }else{
            that.cacheStationsSave()
            that.visible_cacheStations = false;
          }
        },
      })
    },
    handleCancel(record){
      console.log(record)
      this.visible = false
      this.visible_cacheStations=false
      if(record){
        this.isSave=false
        this.saveId=record.id
        this.queryData()
      }
    },
    dealt(value,num){
      if(Array.isArray(value)){
        if(value.length==0){
          value=null;
          if(num==1){this.record.decidePoints=value;}
          if(num==2){this.record.parks=value;}
          if(num==3){this.cacheStations_selected=value;}
          if(num==4){this.record.chargePoints=value;}
        }else{
          value=[...new Set(value.join(',').split(','))].join(',')
          if(num==1){this.record.decidePoints=value;}
          if(num==2){this.record.parks=value;}
          if(num==3){this.cacheStations_selected=value;}
          if(num==4){this.record.chargePoints=value;}
        }
      }
    },
    save(){
      this.dealt(this.record.decidePoints,1)
      this.dealt(this.record.parks,2)
      // this.dealt(this.record.cachePoints,3)
      this.dealt(this.record.chargePoints,4)
      console.log(this.record)
      if((!this.record.decidePoints)&&this.record.decidePoints!='0')this.record.decidePoints=null
      // if((!this.record.cachePoints)&&this.record.cachePoints!='0')this.record.cachePoints=null
      if((!this.record.chargePoints)&&this.record.chargePoints!='0')this.record.chargePoints=null
      // this.$delete(this.record,'cachePoints')//缓存机单独修改保存
      Object.keys(this.record).forEach(k=>{
        if(this.isNumArr.includes(k)&&this.record[k]){
          this.record[k]=Number(this.record[k])
        }
      })
      this.axios.post(`step/save`,this.record).then((res)=>{
        console.log(res.data.success)
        if(res.data.success){
          if(this.type=='edit'){
            this.isSave=false
            this.saveId=this.record.id
          }else{
            this.isSave=true
          }
          this.queryData()
          this.$message.success(this.$tcache('common.saveSuccess'))
        }else{
          this.$message.error(this.$tcache('common.saveFail'))
        }
      }).catch(()=>{})
    }
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
::v-deep .ant-tag{
  // color: #3aadbd !important;
  // font-weight: 600;
  cursor: pointer;
}
::v-deep .table-striped {
  background-color: #f0f0f0;
}
.commonAction{
  display: flex;
  justify-content: space-around;
}
.changeWidth{
  width: 200px;
}
::v-deep .ant-modal-body{
  text-align: center;
}
</style>
<template>
  <div>
    <a-row class="query-form">
      <a-button  v-if="isAdmin" @click="addPointPark" type="primary" icon="plus" style="float: left;">{{$tcache('common.add')}}</a-button>
      <a-input v-model="form.pointId"  :placeholder="$tcache('common.point')+'Id'"/>
      <a-select v-model="form.enabled" :placeholder="$tcache('admin.pointDecideDet05')">
        <a-select-option v-for="item in enableds" :key="item.name" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <!-- <a-input v-model="form.ip"  :placeholder="ip"/>
      <a-select v-model="form.type"  :placeholder="车辆类型">
        <a-select-option v-for="item in types" :key="item.value" :value="item.value">{{item.text}}</a-select-option>
      </a-select> -->
      <!-- <a-input v-model="form.remark" :placeholder="备注" /> -->
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
      <a-button @click="getAllParkPoint" class="btn"><span class="fontSty">{{$tcache('pointPark.getAllParkPoint')}}</span></a-button>
    </a-row>

    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination" :dataSource="data" :columns="columns" rowKey="pointId" size="small" :scroll="{ x: true}">
        <!-- <a-tag slot="enabled" slot-scope="text" :data-ids="text" :style="{backgroundColor:text?'#5c934d':'#e77c7c',color:'white'}" >{{text?'已开启':'已关闭'}}</a-tag> -->
        <span slot="enabled" slot-scope="text,record">
          <a-tag v-if="!(editable||isAdmin)" :data-ids="text" :style="{backgroundColor:text?'#5c934d':'#e77c7c',color:'white'}" >{{text?$tcache('admin.cachePosition01'):$tcache('admin.cachePosition02')}}</a-tag>
          <div v-else >
            <a-popconfirm
              :title="record.enabled? $tcache('admin.pointDecide01') :$tcache('admin.pointDecide02')"
              :ok-text="$tcache('common.confirm')"
              :cancel-text="$tcache('common.cancel')"
              @confirm="enabledSwitch(record)"
              @cancel="()=>{}"
            >
              <a-switch :checked="record.enabled" />
            </a-popconfirm>
          </div>
        </span>
        <span slot="commonAction" slot-scope="text, record,index" class="flex">
          <a class="icon1"><a-icon type="edit" @click="() => recordEdit(index,record)"></a-icon> </a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="$tcache('admin.cacheLayer07')+'?'"
            :ok-text="$tcache('common.confirm')"
            :cancel-text="$tcache('common.cancel')"
            @confirm="deleteAgv(index,record)"
            @cancel="cancel"
          >
            <a class="icon2"><a-icon type="delete"></a-icon> </a>
          </a-popconfirm>
        </span>
      </a-table>
      <div style="margin-top:10px" class="flex">
        <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize"  :placeholder="$tcache('admin.rowsPerPage')"/></div>
        <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
      </div>
    </a-row>
    <a-modal
        :title="type=='add'?$tcache('common.add'):$tcache('common.modify')"
        :visible="visible"
        :dialog-style="{ top: '20px' }"
        :width="800"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk"
        @cancel="handleCancel"
    >
      <publicDetail :data="record" :columns="columns" :type="type" :isNum="isNum" :checkbox="checkbox" :checkboxs="checkboxs" :bol="bol"/>
    </a-modal>
  </div>
</template>

<script>
import publicDetail from "@/components/public_detail";
// import {makeColumns} from "../../utils";
const agvtypes = require('../../data/agvtypes.json');
const tableHeader = require('../../data/columns_pointPark.json');

export default {
  name: "agvlist",
  components:{
    publicDetail
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
      visible: false,
      record:{}, //操作的行
      isSave:true,
      saveId:'',
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      visible_add:false,
      type:'',
      enableds:[
        {id:'true',name: this.$tcache('admin.cachePosition01')},
        {id:'false',name: this.$tcache('admin.cachePosition02')}
      ],
      bol:['enabled'],
      checkboxs:{},
      checkbox:['buffers','nextOutBasketStation'],
      isNum:['pointId','area']
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
        return this.$tcache(ptype.text)
      }
      return val
    },
  },
  beforeMount() {
    if(this.editable||this.isAdmin)this.addRender()
  },
  mounted() {
    this.queryStations()
    this.queryData()
  },
  methods:{
    filterData(){
      let result = this.alldata
      if(this.form.pointId){
        console.log(`${this.form.pointId}`)
        result = result.filter(d=>d.pointId==this.form.pointId)
      }
      // if(this.form.ip){
      //   result = result.filter(d=>`${d.ip}`.includes(`${this.form.ip}`))
      // }
      // if(this.form.type){
      //   result = result.filter(d=>d.type==this.form.type)
      // }
      // if(this.form.remark){
      //   result = result.filter(d=>`${d.remark}`.includes(`${this.form.remark}`))
      // }
      if(this.form.enabled){
        result = result.filter(d=>`${d.enabled}`==this.form.enabled)
      }
      this.data = result
      this.total=Number(this.data.length)
    },
    ChangePage(pageNumber){
      this.pagination.current=pageNumber
    },
    clearForm(){
      this.form = {}
      // this.data=[]
      // this.columns=[]
      this.total=0
      // this.queryData()
      this.data=this.alldata
    },
    getAllParkPoint(){
      this.axios.get(`voluntarily/parkAllInstall`).then(res=>{
        if(res.data.success){
          this.isSave=true
          this.queryData()
          this.$message.success(res.data.message)
        }else{
          this.$message.warning(res.data.message)
        }
      }).catch(err=>{this.$message.error(err)})
    },
    queryStations(){
      this.axios.get(`station/all`).then(res=>{
        this.checkboxs['buffers']=res.data.filter(s=>s.stationType==2||s.stationType==3).map(s=>{
          return {value:s.doPoint,label:s.name}
        })
        this.checkboxs['nextOutBasketStation']=res.data.map(s=>{
          return {value:s.doPoint,label:s.name}
        })
      })
    },
    queryData(){
      let that = this
      this.axios.get(`pointPark/all`).then(res=>{
        if(res.status == 200&&res.data){
          this.alldata=[...res.data]
          if(this.isSave){
            this.data=res.data
          }else{
            const index = this.data.findIndex(item=>item.pointId==this.saveId)
            let obj=this.alldata.filter(item=>item.pointId==this.saveId)
            this.data[index]=Object.assign(this.data[index], obj[0])
          }
          this.total=Number(this.data.length)
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
    enabledSwitch(record){
      record.enabled=!record.enabled;
      this.record=record
      this.type='edit'
      this.save()
    },
    recordEdit(index,record){
      console.log(index,record)
      this.type='edit'
      record.buffers=record.buffers?record.buffers.split(','):undefined
      record.nextOutBasketStation=record.nextOutBasketStation?record.nextOutBasketStation.split(','):undefined
      this.record = record;
      this.visible = true
    },
    deleteAgv(index,record){
      this.axios.delete(`pointPark/${record.pointId}`).then(()=>{
        this.data.splice(index,1)
        let i=this.alldata.findIndex(t=>t.pointId==record.pointId)
        this.alldata.splice(i,1)
        this.total=Number(this.data.length)
      }).catch((err)=>{console.log(err+'')})
    },
    addPointPark(){
      this.type='add'
      let record = {};
      let keys=Object.keys(this.alldata[0])
      keys.forEach(k=>{
        if(this.checkbox.includes(k)){
          record[k]=undefined
        }else{
          record[k]=null
        }
      })
      this.record=record
      this.visible = true
    },
    cancel() {
      this.$message.warning(this.$tcache('admin.canceled'));
    },
    handleOk(){
      let that = this
      let state=false
      let key=[]
      Object.keys(this.record).forEach(k=>{
        if((k=='pointId'||k=='area')&&!this.record[k]&&this.record[k]!==0){
          key.push(k)
          state=true
        }
      })
      if(state){
        this.$message.info(this.$tcache('admin.pointPark01',{key}))
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
        this.saveId=this.record.pointId
        this.isSave=false
        this.queryData()
      }
      this.visible = false;
      this.record={}
    },
    dealt(value,type){
      if(Array.isArray(value)){
        if(value.length==0){
          value=null;
          this.record[`${type}`]=value;
        }else{
          value=[...new Set(value.join(',').split(','))].join(',')
          this.record[`${type}`]=value;
        }
      }
    },
    save(){
      this.dealt(this.record.buffers,"buffers")
      this.dealt(this.record.nextOutBasketStation,"nextOutBasketStation")
      if(this.record.enabled==null){
        this.record.enabled=false
      }
      this.axios.post(`pointPark/save`,this.record).then(()=>{
        if(this.type=='edit'){
          this.isSave=false
          this.saveId=this.record.pointId
        }else{
          this.isSave=true
        }
        this.$message.success(this.$tcache('common.saveSuccess'))
        this.queryData()
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
.btn{
  margin: 0 10px;
}
</style>

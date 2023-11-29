<template>
  <div>
    <a-row class="query-form">
      <a-button  v-if="isAdmin||editable" @click="addAgv" type="primary" icon="plus" style="float: left;">{{$tcache('common.add')}}</a-button>
      <a-input v-model="form.id"  placeholder="id"/>
      <a-input v-model="form.ip"  placeholder="ip"/>
      <a-select v-model="form.type"  :placeholder="$tcache('admin.carType')">
        <a-select-option v-for="item in types" :key="item.value" :value="item.value">{{item.text}}</a-select-option>
      </a-select>
      <a-input v-model="form.remark" :placeholder="$tcache('admin.remarks')" />
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
    </a-row>

    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
        <a-tag slot="type" slot-scope="text" :data-ids="text"  >{{text|fmtType}}</a-tag>
        <span slot="commonAction" slot-scope="text, record,index" class="flex">
          <a class="icon1"><a-icon type="edit" @click="() => recordEdit(index,record)"></a-icon> </a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="$tcache('admin.deleteConfirm') + '?'"
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
        :ok-text="$tcache('common.save')"
        :cancel-text="$tcache('common.cancel')"
        @ok="handleOk"
        @cancel="handleCancel"
    >
      <agv_detail :data="record" :types="types" :type="type" :stepRegions="stepRegions"/>
    </a-modal>
  </div>
</template>

<script>
import agv_detail from "./agv_detail";
// import {makeColumns} from "../../utils";
const agvtypes = require('../../data/agvtypes.json')
const tableHeader = require('../../data/columns_agvlist.json');
export default {
  name: "agvlist",
  components:{
    agv_detail
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
      stepRegions:[]
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
        return this.$tcache(ptype.text)
      }
      return val
    },
  },
  beforeMount() {
    if(this.editable||this.isAdmin)this.addRender()
  },
  mounted() {
    this.queryData()
    this.querySteps()
  },
  methods:{
    filterData(){
      let result = this.alldata
      if(this.form.id){
        console.log(`${this.form.id}`)
        result = result.filter(d=>d.id==this.form.id)
      }
      if(this.form.ip){
        result = result.filter(d=>`${d.ip}`.includes(`${this.form.ip}`))
      }
      if(this.form.type){
        result = result.filter(d=>d.type==this.form.type)
      }
      if(this.form.remark){
        result = result.filter(d=>`${d.remark}`.includes(`${this.form.remark}`))
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
    queryData(){
      let that = this
      this.axios.get(`agv/all`).then(res=>{
        if(res.status == 200&&res.data){
          this.alldata=[...res.data]
          if(this.isSave){
            this.data=res.data
          }else{
            const index = this.data.findIndex(item=>item.id==this.saveId)
            let obj=this.alldata.filter(item=>item.id==this.saveId)
            this.data[index]=Object.assign(this.data[index], obj[0])
          }
          this.total=Number(this.data.length)
        }else{
          that.$message.warning(this.$tcache('admin.queryFail'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    querySteps(){
      this.axios.post(`step/list`, {}).then(res=>{
        if(res.status == 200&&res.data){
          let s = res.data.map(s=>s.region)
          this.stepRegions = [...new Set(s)].map(s=>{
            return {value:s,label:s}
          })
          console.log(this.stepRegions)
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
    recordEdit(index,record){
      console.log(index,record)
      this.type='edit'
      this.record = record;
      this.visible = true
    },
    deleteAgv(index,record){
      this.axios.delete(`agv/${record.id}`).then((res)=>{
        if(res.data.success){
          this.data.splice(index,1)
          this.total=Number(this.data.length)
          this.$message.success(res.data.message)
        }else{
          this.$message.error(res.data.message)
        }
      }).catch((err)=>{console.log(err+'')})
    },
    addAgv(){
      this.type='add'
      let record = {};
      let keys=Object.keys(this.alldata[0])
      keys.forEach(k=>{
        record[k]=null
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
      Object.keys(this.record).forEach(k=>{
        if((this.record[k]??'')==''&&this.record[k]!==0){
          state=true
        }
      })
      if(state){
        this.$message.info(this.$tcache('admin.notEmpty'))
        return
      }
      this.$confirm({
        title: this.$tcache('common.prompt'),
        content: this.$tcache('admin.saveConfig'),
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
      this.visible = false;
      this.record={}
    },
    save(){
      // Object.keys(this.record).forEach(k=>{
      //   if(this.Number)
      // })
      this.axios.post(`agv/save`,this.record).then((res)=>{
        console.log(res.data.success)
        if(res.data.success){
          if(this.type=='edit'){
            this.isSave=false
            this.saveId=this.record.id
          }else{
            this.isSave=true
          }
          this.queryData()
          this.$message.success(res.data.message)
        }else{
          this.$message.error(res.data.message)
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
</style>

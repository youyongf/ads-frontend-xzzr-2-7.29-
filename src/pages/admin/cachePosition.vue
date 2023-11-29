<template>
  <div>
    <a-row class="query-form">
      <a-button  v-if="isAdmin" @click="addAgv" type="primary" icon="plus" style="float: left;">{{$t('common.add')}}</a-button>
      <a-input v-model="form.id"  placeholder="id"/>
      <a-input v-model="form.name" :placeholder="$tcache('admin.name')" />
      <!-- <a-input v-model="form.ip"  placeholder="ip"/>
      <a-select v-model="form.type"  placeholder="车辆类型">
        <a-select-option v-for="item in types" :key="item.value" :value="item.value">{{item.text}}</a-select-option>
      </a-select>
      <a-input v-model="form.remark" placeholder="备注" /> -->
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
    </a-row>

    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
        <a-tag slot="enabled" slot-scope="text" :data-ids="text" :style="{backgroundColor:text?'#5c934d':'#e77c7c',color:'white'}" >{{text? $tcache('admin.cachePosition01'):$tcache('admin.cachePosition02')}}</a-tag>
        <span slot="commonAction" slot-scope="text, record,index" class="flex">
          <a class="icon1"><a-icon type="edit" @click="() => recordEdit(index,record)"></a-icon> </a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="$tcache('admin.cacheLayer07')"
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
        <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize"  :placeholder="$t('common.lines')"/></div>
        <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
      </div>
    </a-row>
    <a-modal
        :title="type=='add'? $tcache('common.add'):$tcache('common.modify')"
        :visible="visible"
        :dialog-style="{ top: '20px' }"
        :width="800"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk"
        @cancel="handleCancel"
    >
      <cadetail :data="record" :type="type"/>
    </a-modal>
  </div>
</template>

<script>
import cadetail from "./cachePosition_detail";
// import {makeColumns} from "../../utils";
const agvtypes = require('../../data/agvtypes.json');
const tableHeader = require('../../data/columns_cachePosition.json');

export default {
  name: "agvlist",
  components:{
    cadetail
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
      type:''
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
  },
  beforeMount() {
    if(this.editable||this.isAdmin)this.addRender()
  },
  mounted() {
    this.queryData()
  },
  methods:{
    filterData(){
      let result = this.alldata
      if(this.form.id){
        console.log(`${this.form.id}`)
        result = result.filter(d=>d.id==this.form.id)
      }
      // if(this.form.ip){
      //   result = result.filter(d=>`${d.ip}`.includes(`${this.form.ip}`))
      // }
      // if(this.form.type){
      //   result = result.filter(d=>d.type==this.form.type)
      // }
      if(this.form.name){
        result = result.filter(d=>`${d.name}`.includes(`${this.form.name}`))
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
      this.axios.get(`stationBufferPosition/all`).then(res=>{
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
    recordEdit(index,record){
      console.log(index,record)
      this.type='edit'
      this.record = record;
      this.visible = true
    },
    deleteAgv(index,record){
      this.axios.delete(`stationBufferPosition/${record.id}`).then(()=>{
        this.data.splice(index,1)
        let i=this.alldata.findIndex(t=>t.id==record.id)
        this.alldata.splice(i,1)
        this.total=Number(this.data.length)
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
        console.log(this.record[k]??'')
        if((this.record[k]??'')==''&&k!='enabled'&&this.record[k]!==0){
          state=true
        }
      })
      if(state){
        this.$message.info(this.$tcache('admin.notEmpty'))
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
      this.visible = false;
      this.record={}
    },
    save(){
      if(this.record.enabled==null){
        this.record.enabled=false
      }
      this.axios.post(`stationBufferPosition/save`,this.record).then(()=>{
        if(this.type=='edit'){
          this.isSave=false
          this.saveId=this.record.id
        }else{
          this.isSave=true
        }
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
</style>

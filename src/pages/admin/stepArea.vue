<template>
  <div>
    <a-row class="query-form">
      <a-button  v-if="isAdmin||editable" @click="addAgv" type="primary" icon="plus" style="float: left;">{{$tcache('common.add')}}</a-button>
      <a-input v-model="form.id"  placeholder="id"/>
      <!-- <a-input v-model="form.ip"  placeholder="ip"/> -->
      <!-- <a-select v-model="form.type"  placeholder="车辆类型">
        <a-select-option v-for="item in types" :key="item.value" :value="item.value">{{item.text}}</a-select-option>
      </a-select> -->
      <a-input v-model="form.name" :placeholder="$tcache('admin.name')" />
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
    </a-row>

    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
        <div slot="stepId" slot-scope="text" :data-ids="text"  >{{text|fmtStep}}</div>
        <span slot="commonAction" slot-scope="text, record,index" class="flex">
          <a class="icon1"><a-icon type="edit" @click="() => recordEdit(index,record)"></a-icon> </a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="$tcache('admin.cacheLayer07') + '?'"
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
      <stepAreaDetail :data="record"  :type="type" :columns="columns" :isNum="isNum" :radio="radio" :radios="radios"/>
    </a-modal>
  </div>
</template>

<script>
import stepAreaDetail from "@/components/public_detail";
// import {makeColumns} from "../../utils";
// const agvtypes = require('../../data/agvtypes.json')
const tableHeader = require('../../data/columns_stepArea.json');
let vueApp=null;
export default {
  name: "agvlist",
  components:{
    stepAreaDetail
  },
  data(){
    return{
      total:0,//查询得到数据的条数
      pagination: {
        pageSize:Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):Number(this.$store.state.defaultPageSize),//每页中显示10条数据
        current: 1,
      },
      form:{}, //查询条件
      // types: agvtypes,
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
      isNum:[],
      radio:[],
      radios:{}
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
    fmtStep(val){
      let steps=[...vueApp.radios['stepId']]
      let step=steps.find(c=>c.value==val)
      if(step){
        return step.label
      }
      return val
    }
  },
  beforeMount() {
    vueApp=this
    if(this.editable||this.isAdmin)this.addRender()
  },
  mounted() {
    this.querySteps()
    // this.queryData()
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
    querySteps(){
      this.axios.get(`step/all`).then((res)=>{
        if(Array.isArray(res.data)){
          this.radios['stepId']=res.data.map(s=>{
            return {value:s.id,label:s.name}
          })
          this.queryData()
        }
      }).catch(()=>{
        this.$message.error(this.$tcache('admin.cacheListErr01'))
      })
    },
    queryData(){
      let that = this
      this.axios.get(`stepArea/list`).then(res=>{
        if(res.data?.length>0){
          let noNum=['stepId','name','id']
          this.isNum=Object.keys(res.data[0]).filter(k=>!noNum.includes(k))
          let isRadio=['stepId']
          this.radio=Object.keys(res.data[0]).filter(k=>isRadio.includes(k))
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
          that.$message.warning(this.$tcache('common.infoFailed'))
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
      this.axios.delete(`stepArea/${record.id}`).then(()=>{
        this.data.splice(index,1)
        this.total=Number(this.data.length)
        this.$message.success(this.$tcache('admin.delete'))
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
      let state=[]
      Object.keys(this.record).forEach(k=>{
        console.log(this.record[k]??'')
        if((this.record[k]??'')==''&&this.record[k]!==0&&k!='id'&&k!='decidePoint'){
          state.push('-'+k+'-')
        }
      })
      if(state.length!==0){
        this.$message.info(this.$tcache('admin.pointPark01',{key:state.join('')}))
        return
      }
      this.$confirm({
        title:this.$tcache('common.operation'),
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
      let record={...this.record}
      if(this.type=='add'){
        this.$delete(record,'id')
      }
      this.axios.post(`stepArea/save`,record).then(()=>{
        if(this.type=='edit'){
          this.isSave=false
          this.saveId=this.record.id
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
</style>

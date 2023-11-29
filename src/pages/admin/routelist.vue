<template>
  <div>
    <a-spin :spinning="spinning">
      <a-row class="query-form">
        <a-input v-model="form.id"  placeholder="id"/>
        <a-input v-model="form.startingPoint"  :placeholder="$tcache('common.startingPoint')"/>
        <a-input v-model="form.finishingPoint"  :placeholder="$tcache('common.finishingPoint')"/>
        <a-select v-model="form.qrcodeMode"  :placeholder="$tcache('admin.routelist01')">
          <a-select-option v-for="item in qrcodeMode" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
        </a-select>
        <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
        <a-button  v-if="isAdmin||editable" style="margin-left: 10px;" @click="()=>$router.push('/admin_routefiles')"><span class="fontSty">{{$tcache('admin.routelist02')}}</span></a-button>
        <a-button  v-if="isAdmin||editable" style="margin-left: 10px;" @click="()=>$router.push('/admin_routeUpload')"><span class="fontSty">{{$tcache('admin.routelist03')}}</span></a-button>
        <a-button  v-if="isAdmin||editable" style="margin-left: 10px;" @click="()=>$router.push('/admin_routeUpload_new')"><span class="fontSty">{{$tcache('admin.routelist04')}}</span></a-button>
      </a-row>
      
      <a-row>
        <a-table  :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
          <span slot="commonAction" slot-scope="text, record,index">
            <a><a-icon type="edit" @click="() => recordEdit(index,record)"></a-icon> </a>
            <!--      <a-divider type="vertical" />-->
          </span>
        </a-table>
        <div style="margin-top:10px" class="flex">
          <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize"  :placeholder="$tcache('admin.rowsPerPage')"/></div>
          <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
        </div>
      </a-row>
    </a-spin>
    <a-modal
        :title="$tcache('common.modify')"
        :visible="visible"
        :dialog-style="{ top: '20px' }"
        :width="800"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk"
        @cancel="handleCancel"
    >
      <public_detail :data="record" :remark="columns" :disabledStrArr="disabledStrArr" :showArr="showArr" />
    </a-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue';
import {getCurrentDate} from '../../utils/date.js'
import public_detail from "./public_detail";
const tableHeader = require('../../data/columns_routelist.json');
// import {makeColumns} from '../../utils'
export default {
  name: "routelist",
  components:{
    public_detail
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
      qrcodeMode:[//车辆动作选项内容
        {id:'0',name: this.$tcache('admin.routelist05')},
        {id:'1',name: this.$tcache('admin.routelist06')}
      ],
      isSave:true,
      saveId:'',
      intersectBtnDisabled:false,//生成相交点按钮的禁用
      routeBtnDisabled:false,//获取路径按钮的禁用
      routePointBtnDisabled:false,//获取线路沿途所有的点
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      spinning:false,
      //文件上传携带参数
      fileData: {
        // companyCode: "1",  
        files: "",
        // serviceType: "finacie",  
        // tenantCode: "1", 
      },
      import_success:false,
      importedData:[],//上传后返回的数据
      disabledStrArr:['id','points','ts','qrcodeModeName'],
      showArr:['id','points','ts','qrcodeModeName'],
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
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
        result = result.filter(d=>d.id==this.form.id)
      }
      if(this.form.startingPoint || this.form.finishingPoint){
        let bol=true;
        result = result.filter(d=>{
          if(d.points){
            let points=d.points.split('-');
            if(this.form.startingPoint&&this.form.finishingPoint){
              bol=points[0]===this.form.startingPoint&&points[points.length-1]===this.form.finishingPoint;
            }else if(this.form.startingPoint){
              bol=points[0]===this.form.startingPoint;
            }else if(this.form.finishingPoint){
              bol=points[points.length-1]===this.form.finishingPoint;
            }
          }else{
            bol=false;
          }
          return bol;
        })
      }
      if(this.form.qrcodeMode){
        result = result.filter(d=>d.qrcodeMode== this.form.qrcodeMode)
      }
      this.data = result
      this.total=Number(this.data.length)
    },
    cancel (){
      message.error(this.$tcache('admin.canceled'));
    },
    ChangePage(pageNumber){
      this.pagination.current=pageNumber
    },
    clearForm(){
      this.form = {}
      this.total=0
      this.data=this.alldata
    },
    queryRoutePoint(){
      this.spinning=true
      this.routePointBtnDisabled=true
      this.axios.get(`route/getRoutePoint`).then(res=>{
        if(res.status == 200&&res.data){
          this.$message.success(this.$tcache('admin.routelist07'));
          this.routePointBtnDisabled=false
          this.spinning=false
        }
      }).catch(err=>{this.$message.error(err);this.routePointBtnDisabled=false;this.spinning=false})
    },
    queryIntersect(){
      this.spinning=true
      this.intersectBtnDisabled=true
      this.axios.get(`route/getRouteControlAreaIntersect`).then(res=>{
        if(res.status == 200&&res.data){
          this.$message.success(this.$tcache('admin.routelist08'));
          this.intersectBtnDisabled=false
          this.spinning=false
        }
      }).catch(err=>{this.$message.error(err);this.intersectBtnDisabled=false;this.spinning=false})
    },
    queryRoute(){
      this.spinning=true
      this.routeBtnDisabled=true
      this.axios.get(`route/getControlAreaInout`).then(res=>{
        if(res.status == 200&&res.data){
          this.$message.success(this.$tcache('admin.routelist09'));
          this.routeBtnDisabled=false
          this.spinning=false
        }
      }).catch(err=>{this.$message.error(err);this.routeBtnDisabled=false;this.spinning=false})
    },
    queryData(){
      let that = this
      this.axios.get(`route/all`).then(res=>{
        if(res.status == 200&&res.data){
          this.alldata = res.data
          if(this.isSave){this.data=res.data}else{
            const index = this.data.findIndex(item=>item.id==this.saveId)
            let obj=this.alldata.filter(item=>item.id==this.saveId)
            this.data[index]=Object.assign(this.data[index], obj[0])
          }
          this.total=Number(this.data.length)
          for(let i=0;i<that.data.length;i++){
            if(that.data[i].ts){
              let tm=new Date(that.data[i].ts).getTime()
              that.data[i].tsCN=getCurrentDate(tm)
            }
            if(that.data[i].qrcodeMode==0){that.data[i].qrcodeModeName=this.$tcache('admin.routelist05')}
            if(that.data[i].qrcodeMode==1){that.data[i].qrcodeModeName=this.$tcache('admin.routelist06')}
          }
        }else{
          that.$message.warning(this.$tcache('common.queryFailure'))
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
      this.record = record;
      this.visible = true
    },
    handleOk(){
      let that = this
      this.$confirm({
        title:this.$tcache('common.prompt'),
        content:this.$tcache('admin.saveConfig'),
        onOk(){
          that.save()
          that.visible = false;
        },
      })
    },
    handleCancel(){
      this.visible = false
    },
    save(){
      console.log(this.record)
      // this.record.qrcodeMode=this.record.qrcodeMode=='开启'?1:0;
      let obj={...this.record}
      this.$delete(obj,"tsCN")
      this.axios.post(`route/save`,obj).then(()=>{
        this.isSave=false
        this.saveId=this.record.id
        this.queryData()
      }).catch(()=>{})
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
.check_btn{
  margin: 10px;
}
::v-deep .ant-table-thead > tr > th{
  background-color: $bgcolor !important;
  color: $color;
  // font-weight: bold;
}
::v-deep .table-striped {
  background-color: #f0f0f0;
}

::v-deep .ant-modal-body{
  text-align: center;
}
::v-deep .ant-progress-line{
  width: 65%;
}
</style>
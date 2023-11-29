<template>
  <div>
    <a-row class=" query-form">
      <a-input v-model.number="form.id" placeholder="id" />
      <a-input type="number" v-model.number="form.x" placeholder="x" />
      <a-input type="number" v-model.number="form.y" placeholder="y" />
      <a-select v-model="form.type" :placeholder="$tcache('admin.type')">
        <a-select-option
          v-for="item in ptypes"
          :key="item.value"
          :value="item.value"
          >{{ item.title }}</a-select-option
        >
      </a-select>
      <a-select  v-model="form.step" :placeholder="$tcache('admin.configErrTips')">
        <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
      </a-select>
      <a-input v-model="form.remark" :placeholder="$tcache('admin.pointMap04')" />
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
      <div class="upload" v-if="isAdmin||editable">
        <Upload
          style="display: inline-block;margin-right: 5px;"
          :show-upload-list="false"
          action="api/point/upload"
          :data="{ isAll: pointIsAll==1?true:false }"
          :before-upload="handleUpload"
          :on-success="handleSuccess"
          :on-error="handleError"
          multiple>
          <Button icon="ios-cloud-upload-outline"><span class="fontSty">{{$tcache('admin.pointlist01')}}</span></Button>
        </Upload>
        <a-radio-group v-model="pointIsAll">
          <a-radio :value="1">{{$tcache('admin.pointlist02')}}</a-radio>
          <a-radio :value="0">{{$tcache('admin.pointlist03')}}</a-radio>
        </a-radio-group>
        <a-icon style="color: #faad14;" type="warning"></a-icon>
        <span>{{$tcache('admin.pointlist04')}}(csv)。</span>
        <a-progress v-if="showProgress" :percent="percent" size="small" :status="uploadStatus" />
      </div>
    </a-row>
    <!-- <div class="flex fontSty">每页行数:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize" placeholder="每页行数" /> -->
      
    <!-- </div> -->

    <a-row>
      <a-table
        :pagination="pagination"
        :dataSource="data"
        :columns="columns"
        rowKey="id"
        size="small"
        :scroll="{ x: true }"
        :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)" 
      >
        <div slot="type" slot-scope="text" :data-ids="text">{{text|fmtPType}}</div>
        <a-tag  slot="step"  slot-scope="text"  :data-id="text"  @click="showStepInfo">
          {{text|fmtStep}}
        </a-tag>
        <span slot="commonAction" slot-scope="text, record, index">
          <a><a-icon type="edit" @click="() => recordEdit(index, record)"></a-icon></a>
        </span>
        <div class="fontColor" slot="ts" slot-scope="text" :data-id="text" >{{text|fmtTime}}</div>
      </a-table>
      <div style="margin-top:10px" class="flex">
        <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize" :placeholder="$tcache('admin.rowsPerPage')"/></div>
        <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
      </div>
    </a-row>
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
      <public_detail :data="record" :remark="columns" :disabledStrArr="disabledStrArr" :showArr="showArr" :pointType="ptypes" :steps="steps" :isPoint="true" :isNumArr="isNumArr" :areas="areas" :cacheStations="cacheStations" />
    </a-modal>
  </div>
</template>

<script>
// import Qs from 'qs'
import { getCurrentDate } from "../../utils/date.js";
import public_detail from "./public_detail";
import { axiosget } from "../../utils";
const ptypes = require("../../data/ptypes.json");
const tableHeader = require('../../data/columns_pointlist.json');
let vueApp=null
export default {
  name: "pointlist",
  components: {
    public_detail,
  },
  data() {
    return {
      //文件上传携带参数
      fileData: {
        // companyCode: "1",
        file: "",
        // serviceType: "finacie",
        // tenantCode: "1",
      },
      total: 0, //查询得到数据的条数
      pagination: {
        pageSize:  Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):Number(this.$store.state.defaultPageSize), //每页中显示10条数据
        current: 1,
      },
      form: {}, //查询条件
      steps: [],
      data: [], //查询结果
      alldata:[],
      visible: false,
      record: {}, //操作的行
      isSave:true,
      saveId:'',
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      // disabledStrArr:['id','x','y','pairId','remark','type','step','ts','area'],
      disabledStrArr:['id','ts'],
      showArr:['id','x','y','pairId','remark','ts','agvsLimit'],
      // pointType:ptypes,
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      pointIsAll:1,
      percent:0,//进度条进度
      showProgress:false,
      uploadStatus:'',
      isNumArr:['id','x','y','pairId','agvsLimit'],
      areas:[],
      cacheStations:[],
      ptypesCache:[]
    };
  },
  computed: {
    ptypes() {
      return this.$transformI18n(ptypes);
    },
    columns() {
      return this.$transformI18n(tableHeader);
    },
  },
  watch: {
    form: {
      handler(newVal, oldVal) {
        console.log("form", newVal, oldVal);
        this.pagination.current = 1;
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(this.filterData, 500);
      },
      deep: true,
    },
    pagination:{
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        localStorage.setItem('pageSize', this.pagination.pageSize);
      },
      deep: true
    },
    ptypes:{
      handler(newVal, oldVal) {
        console.log('ptypes', newVal, oldVal)
        this.ptypesCache=newVal;
      },
      deep: true,
      immediate:true
    },
  },
  filters: {
    fmtPType(val) {
      let ptype = vueApp.ptypesCache.find((p) => p.value == val);
      if (ptype) {
        return ptype.title;
      }
      return val;
    },
    fmtTime(val){
      let ts = getCurrentDate(val)
      if(ts){
        return ts
      }
      return val
    },
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
    if(this.editable||this.isAdmin)this.addRender()
    vueApp=this
  },
  mounted() {
    this.querySteps();
    this.queryData();
    this.queryStation()
  },
  methods: {
    filterData(){
      let result = this.alldata
      if(this.form.id){
        result = result.filter(d=>d.id==this.form.id)
      }
      if(this.form.x){
        result = result.filter(d=>`${d.x}`.includes(`${this.form.x}`))
      }
      if(this.form.y){
        result = result.filter(d=>`${d.y}`.includes(`${this.form.y}`))
      }
      if(this.form.type){
        result = result.filter(d=>this.form.type==d.type)
      }
      if(this.form.step){
        result = result.filter(d=>this.form.step==d.step)
      }
      if(this.form.remark){
        result = result.filter(d=>`${d.remark}`.includes(`${this.form.remark}`))
      }
      this.data = result
      this.total=Number(this.data.length)
    },
    handleUpload(file) {
      console.log(file)
      this.showProgress=true
      this.uploadStatus='active'
      this.percent=60
      this.$message.info(this.$tcache('admin.pointlist05'))
      this.fileData.file = file.name;
    },
    handleSuccess(res, file) {
      console.log(res, file);
      this.$message.info(res.message);
      this.percent=90
      if(res.success){
        let data = res.data
        if(data)this.$notification.success({message: this.$tcache('admin.pointlist06'), description: `${this.$tcache('common.add')}：${data.add}, ${this.$tcache('common.modify')}：${data.update}, ${this.$tcache('common.del')}：${data.delete}`})
        this.percent=100
        this.uploadStatus='success'
        this.isSave=true
        this.queryData();
      }else{
        this.uploadStatus='exception'
      }
      setTimeout(()=>{this.showProgress=false},3000)
    },
    handleError(error, file){
      this.uploadStatus='exception'
      console.error(error,file)
      this.$message.error(error.message)
      setTimeout(()=>{this.showProgress=false},3000)
    },
    ChangePage(pageNumber) {
      this.pagination.current = pageNumber;
    },
    clearForm() {
      this.form = {};
      this.total = 0;
      this.data=this.alldata
    },
    querySteps() {
      axiosget(`step/all`, {}, (data) => {
        console.log(data);
        this.steps = data;
      });
    },
    queryData() {
      let that = this;
      this.axios
        .get(`point/all`)
        .then((res) => {
          if (res.status == 200 && res.data) {
            this.alldata = res.data
            this.areas=[...new Set(this.alldata.map(item=>item.area).filter(e=>e!=undefined))]
            console.log(this.areas)
            if(this.isSave){this.data=res.data}else{
              const index = this.data.findIndex(item=>item.id==this.saveId)
              let obj=this.alldata.filter(item=>item.id==this.saveId)
              this.data[index]=Object.assign(this.data[index], obj[0])
            }
            this.total=Number(this.data.length)
          } else {
            that.$message.warning(this.$tcache('common.queryFailure'));
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    queryStation(){
      this.axios.get(`station/all`).then(res=>{
        if(res.data){
          this.cacheStations=res.data.filter(s=>s.stationType==2||s.stationType==3)
        }
      }).catch(err=>{this.$message.error(err)})
    },
    addRender() {
      //列中添加类似： "scopedSlots":{ "customRender":"createTime"}
      let b = this.columns.find(e=>e.dataIndex=='commonAction')
      if(b == undefined){//避免重复mounted时重复push(一般在开发模式下发生）
        let col = { title: this.$tcache('common.edit'), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right',width:60, scopedSlots: { customRender: 'commonAction' } }
        this.columns.push(col)
      }
    },
    recordEdit(index, record) {
      console.log(index, record);
      if(!record.agvsLimit){record.agvsLimit=null}
      record.cacheStations=record.cacheStations?record.cacheStations:undefined;
      this.record = record;
      this.visible = true;
    },
    handleOk() {
      console.log(this.record)
      if(this.record.type&&!this.record.remark){this.$message.warning(this.$tcache('admin.pointlist07'));return}
      if(!this.record.x||!this.record.y){this.$message.warning(this.$tcache('admin.pointlist08'));return}
      let that = this;
      this.$confirm({
        title: this.$tcache('common.prompt'),
        content: this.$tcache('admin.saveConfig'),
        onOk() {
          that.save();
          that.visible = false;
        },
      });
    },
    handleCancel() {
      this.saveId=this.record.id
      this.isSave=false
      this.record={}
      this.queryData()
      this.visible = false;
    },
    dealt(value,num){
      if(Array.isArray(value)){
        if(value.length==0){
          value=null;
          if(num==1){this.record.cacheStations=value;}
        }else{
          value=[...new Set(value.join(',').split(','))].join(',')
          if(num==1){this.record.cacheStations=value;}
        }
      }
    },
    changeEnabled(index,record){
      console.log(index,record)
      this.axios.put(`point/enabled/${record.id}/${!record.enabled}`).then(()=>{
        this.isSave=false
        this.saveId=record.id
        this.queryData()
      }).catch(()=>{})
    },
    save() {
      this.dealt(this.record.cacheStations,1)
      this.record.ts=''
      if(!this.record.type){
        this.record.type=null
      }
      this.axios
        .post(`point/save`, this.record)
        .then((res) => {
          if(res.data.success){
            this.isSave=false
            this.saveId=this.record.id
            this.queryData();
            this.$message.success(res.data.message)
          }else{this.$message.error(res.data.message)}
        })
        .catch(() => {this.$message.error(this.$tcache('common.saveFail'))});
    },
    showStepInfo(evt) {
      console.log(evt)
      let id = evt.target.dataset.id;
      let step = this.steps.find((e) => e.id == id);
      if (step) {
        let desc = JSON.stringify(step).slice(1,-1).split(',').join(', ');
        this.$notification.info({ message: this.$tcache('admin.configErrTips'), description: desc });
      } else {
        this.$notification.error({
          message: this.$tcache('admin.configErr'),
          description: this.$tcache('admin.configErrMsg',{id}),
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "~@/assets/scss/style.scss";
::v-deep .ant-table-thead > tr > th,
::v-deep .ant-table-tbody > tr > td {
  text-align: center;
}
.flex {
  display: flex;
  justify-content: center;
  align-items: center;
}
::v-deep .ant-table-pagination {
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
.upload{
  width: 100% !important;
}
::v-deep .ant-progress-line{
  width: 65%;
}
</style>
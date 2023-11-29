<template>
    <div>
      <a-row class="query-form">
        <a-input type="number" v-model="form.id"  placeholder="id"/>
        <a-input v-model="form.name"  :placeholder="$tcache('admin.name')"/>
        <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
      </a-row>
  
      <a-row>
        <a-table :columns="columns" :data-source="data" bordered  rowKey="id" :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination">
          <template 
            v-for="col in ['targetOutputA', 'targetOutputB']"
            :slot="col"
            slot-scope="text, record">
              <div :key="col">
                <a-input
                  v-if="record.editable"
                  class="exit-input"
                  :value="text"
                  @change="e => handleChange(e.target.value, record.id, col)"
                />
                <template v-else>
                  {{ text }}
                </template>
              </div>
          </template>
          
          <template v-if="isAdmin||editable" slot="operation" slot-scope="text, record">
            <div class="editable-row-operations">
              <span v-if="record.editable">
                <a-button style="margin-right: 10px;" @click="() => save(record.id)">{{$tcache('common.save')}}</a-button>
                <a-popconfirm :title="$tcache('admin.group02')+'?'" @confirm="() => cancel(record.id)">
                  <a-button>{{$tcache('common.cancel')}}</a-button>
                </a-popconfirm>
              </span>
              <span v-else>
                <a :disabled="editingKey !== ''" @click="() => edit(record.id)"><a-icon type="edit"></a-icon></a>
              </span>
            </div>
          </template>
        </a-table>
        <div style="margin-top:10px" class="flex">
          <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize"  :placeholder="$tcache('admin.rowsPerPage')"/></div>
          <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
        </div>
      </a-row>
    </div>
</template>
  
  <script>
  const agvtypes = require('../../data/agvtypes.json')
  const tableHeader =  require('../../data/columns_stepTargetOutput.json');
  export default {
    name: "steplist",
    data(){
      return{
        total:0,//查询得到数据的条数
        pagination: {
          pageSize: Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):10,//每页中显示10条数据
          defaultPageSize:10,
          current: 1,
        },
        form:{}, //查询条件
  
        data:[],//查询结果
        alldata:[],
        record:{}, //操作的行
        ParksTitle:'',
        CachePointsTitle:'',
        DecidePointTitle:'',
        titleArr:[],
        isSave:true,
        saveId:'',
        isAdmin:this.$store.state.isAdmin,//判断是否为管理员
        disabledStrArr:['id','name'],
        showArr:['id','name','targetOutputA','targetOutputB'],
        editingKey: '',
        cacheData:[],
        editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
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
    },
    mounted() {
      this.queryData()
    },
    methods:{
      handleChange(value, id, column) {
        const newData = [...this.data];
        const target = newData.find(item => id === item.id);
        if (target) {
          target[column] = value;
          this.data = newData;
        }
      },
      edit(id) {
        const newData = [...this.data];
        const target = newData.find(item => id === item.id);
        console.log(target)
        this.editingKey = id;
        if (target) {
          target.editable = true;
          this.data = newData;
        }
      },
      save(id) {
        const index=this.data.findIndex(item=>item.id===id)
        const newData = [...this.data];
        const newCacheData = [...this.cacheData];
        const target = newData.find(item => id === item.id);
        const targetCache = newCacheData.find(item => id === item.id);
        if (target && targetCache) {
          delete target.editable;
          this.axios.put(`step/targetoutput/${id}/${target.targetOutputA}/${target.targetOutputB}`).then(()=>{
            this.isSave=false
            this.saveId=id
            this.queryData()
            this.$set(this.data,index,target)
            Object.assign(targetCache, target);
            this.cacheData = newCacheData;
            this.$message.success(this.$tcache('common.saveSuccess'))
          }).catch(()=>{this.$message.error(this.$tcache('common.saveFail'));this.$set(this.data,index,targetCache)})
        }
        this.editingKey = '';
      },
      cancel(id) {
        const index=this.data.findIndex(item=>item.id===id)
        const newData = [...this.data];
        const target = newData.find(item => id === item.id);
        this.editingKey = '';
        if (target) {
          Object.assign(target, this.cacheData.find(item => id === item.id));
          delete target.editable;
          this.$set(this.data,index,target)
        }
      },
      
      filterData(){
        let result = this.alldata
        if(this.form.id){
          result = result.filter(d=>d.id==this.form.id)
        }
        if(this.form.name){
          result = result.filter(d=>`${d.name}`.includes(`${this.form.name}`))
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
      ChangePage(pageNumber){
        this.pagination.current=pageNumber
      },
      clearForm(){
        this.form = {}
        // this.queryData()
        this.data=this.alldata
      },
      queryData(){
        let that = this
        this.axios.post(`step/list`, {}).then(res=>{
          if(res.status == 200&&res.data){
            this.alldata = res.data
            if(this.isSave){this.data=res.data}else{
              const index = this.data.findIndex(item=>item.id==this.saveId)
              let obj=this.alldata.filter(item=>item.id==this.saveId)
              this.data[index]=Object.assign(this.data[index], obj[0])
            }
            this.total=Number(this.data.length)
            this.cacheData = this.data.map(item => ({ ...item }))
          }else{
            that.$message.warning(this.$tcache('common.queryFailure'))
          }
        }).catch(err=>{this.$message.error(err)})
      }
    }
  }
  </script>
  
  <style scoped lang="scss">
  @import '../../assets/scss/style.scss';
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
  .tag:hover{
    border: 1px solid #40a9ff;
    color: #40a9ff;
  }
  .exit-input{
    width: 100px !important;
    margin: 0 !important;
  }
  </style>
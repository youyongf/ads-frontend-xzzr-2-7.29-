<template>
    <div>
      <a-row class="query-form">
        <a-button  v-if="isAdmin||editable" @click="addGroup" type="primary" icon="plus" style="float: left;">{{$tcache('common.add')}}</a-button>
        <a-button class="back" @click="()=>$router.push('/admin_stationgroup')" icon="rollback">{{$tcache('common.back')}}</a-button>
        <!-- <a-input type="number" v-model="form.id"  placeholder="id"/>
        <a-input v-model="form.name"  placeholder="名称"/>
        <a-button @click="clearForm"><span class="fontSty">清除条件</span></a-button> -->
      </a-row>
  
      <a-row>
        <a-table :columns="columns" :data-source="data" bordered  rowKey="id" :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination">
          <template 
            v-for="col in ['remark','group','basketSize']"
            :slot="col"
            slot-scope="text, record">
              <div :key="col">
                <a-input
                  v-if="record.editable"
                  class="exit-input"
                  :value="text"
                  :type="col=='group'?'number':''"
                  @change="e => handleChange(e.target.value, record.id, col)"
                />
                <template v-else>
                  {{ text }}
                </template>
              </div>
          </template>
          <!-- <a-switch slot="buttDetectionEnable" slot-scope="text, record" v-model="record.buttDetectionEnable" /> -->
          <a-popconfirm
            v-if="isAdmin||editable"
            :title="$tcache('admin.group01')"
            :ok-text="$tcache('common.confirm')"
            :cancel-text="$tcache('common.cancel')"
            @confirm="save(record.id)"
            @cancel="()=> cancel(record.id)"
            slot="buttDetectionEnable" slot-scope="text, record"
          >
            <!-- <a-switch v-model="record.buttDetectionEnable" /> -->
            <a-switch v-if="isAdmin||editable" :checked="record.buttDetectionEnable" >
              <a-icon slot="checkedChildren" type="check" />
              <a-icon slot="unCheckedChildren" type="close" />
            </a-switch>
          </a-popconfirm>
          <div v-else slot="buttDetectionEnable" slot-scope="text">{{ text?$tcache('admin.cachePosition01'):$tcache('admin.cachePosition02') }}</div>
          <!-- <div slot="enabled" slot-scope="text, record,index"  @click="()=>changeEnabled(index,record)" >
            <a-switch v-if="isAdmin||editable" :checked="record.enabled" >
              <a-icon slot="checkedChildren" type="check" />
              <a-icon slot="unCheckedChildren" type="close" />
            </a-switch>
            <span v-else>{{ text?'启用中':'关闭中' }}</span>
          </div> -->
          
          
          <template slot="operation" slot-scope="text, record,index">
            <div class="operation">
              <div class="editable-row-operations">
                <span v-if="record.editable">
                  <a-button style="margin-right: 10px;" @click="() => save(record.id)">{{$tcache('common.save')}}</a-button>
                  <a-popconfirm :title="$tcache('admin.group02')" @confirm="() => cancel(record.id)">
                    <a-button>{{$tcache('common.cancel')}}</a-button>
                  </a-popconfirm>
                </span>
                <span v-else>
                  <a :disabled="editingKey !== ''" @click="() => edit(record.id)"><a-icon type="edit"></a-icon></a>
                </span>
              </div>
              <a-divider type="vertical" />
              <a-popconfirm
                :title="selectedGroups.includes(record.id)?$tcache('admin.group03'):$tcache('admin.deleteConfirm')"
                :ok-text="selectedGroups.includes(record.id)?$tcache('admin.group08'):$tcache('common.confirm')"
                :cancel-text="$tcache('common.cancel')"
                @confirm="deleteGroup(index,record)"
                @cancel="()=>{}"
              >
                <a class="deleteIcon"><a-icon type="delete"></a-icon> </a>
              </a-popconfirm>
            </div>
          </template>
        </a-table>
        <div style="margin-top:10px" class="flex">
          <div class="flex fontSty">{{$tcache('common.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize"  :placeholder="$tcache('common.rowsPerPage')"/></div>
          <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
        </div>
      </a-row>
      <a-modal
          :title="$tcache('common.add')"
          :visible="visible"
          :dialog-style="{ top: '20px' }"
          :width="800"
          :okText="$tcache('common.save')"
          :cancelText="$tcache('common.cancel')"
          @ok="handleOk"
          @cancel="()=>visible = false"
      >
        <div class="add">
          <a-row>
            <a-col :span="12">
              <a-input type="number" v-model.number="addGroupInfo.id"  placeholder="id"/>
            </a-col>
            <a-col :span="12">
              <a-input type="number"  v-model.number="addGroupInfo.group"  :placeholder="$tcache('admin.group')"/>
            </a-col>
            <a-col :span="12">
              <a-input v-model="addGroupInfo.remark"  :placeholder="$tcache('admin.name')"/>
            </a-col>
            <a-col :span="12">
              <a-input v-model="addGroupInfo.basketSize"  :placeholder="$tcache('admin.group04')"/>
            </a-col>
            <a-col :span="24">
              {{$tcache('admin.group05')}}：
              <a-select v-model="addGroupInfo.buttDetectionEnable" style="width:100px;">
                <a-select-option v-for="item in enabledSelect" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
              </a-select>
            </a-col>
          </a-row>
        </div>
      </a-modal>
    </div>
</template>
  
  <script>
  const agvtypes = require('../../data/agvtypes.json')
  const tableHeader = require('../../data/columns_group.json');
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
        // columns:[], //表头
        record:{}, //操作的行
        ParksTitle:'',
        CachePointsTitle:'',
        DecidePointTitle:'',
        titleArr:[],
        isSave:true,
        saveId:'',
        isAdmin:this.$store.state.isAdmin,//判断是否为管理员
        editingKey: '',
        cacheData:[],
        editable:localStorage.getItem('RoleMenu').includes('admin_stationgroup_editable'),//验证当前页面是否可编辑
        type:'',
        visible:false,
        addGroupInfo:{},
        enabledSelect:[
          {id:1,name: this.$tcache('admin.group06')},
          {id:0,name: this.$tcache('admin.group07')}
        ],
        selectedGroups:[]
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
    created(){
      this.selectedGroups=this.$route.query.groups.split(',').map(g=>Number(g))
    },
    mounted() {
      this.queryData()
      if(!(this.isAdmin||this.editable)){
        this.columns.splice(this.columns.length-1,1)
      }
    },
    methods:{
      queryData(){
        this.axios.get(`stationGroup/list`).then(res=>{
          if(res.status == 200&&res.data){
            this.alldata = res.data
            if(this.isSave){this.data=res.data}else{
              const index = this.data.findIndex(item=>item.id==this.saveId)
              let obj=this.alldata.filter(item=>item.id==this.saveId)
              this.data[index]=Object.assign(this.data[index], obj[0])
            }
            this.total=Number(this.data.length)
            this.cacheData = this.data.map(item => ({ ...item }))
          }
        }).catch(err=>{this.$message.error(err)})
      },
      handleChange(value, id, column) {
        const newData = [...this.data];
        const target = newData.find(item => id === item.id);
        if (target) {
          target[column] = value;
          this.data = newData;
        }
      },
      edit(id) {
        this.type='edit'
        const newData = [...this.data];
        const target = newData.find(item => id === item.id);
        console.log(target)
        this.editingKey = id;
        if (target) {
          target.editable = true;
          this.data = newData;
        }
      },
      addGroup(){
        let record = {};
        let keys=Object.keys(this.alldata[0])
        keys.forEach(k=>{
          record[k]=null
        })
        this.addGroupInfo=record
        this.visible = true
      },
      handleOk(){
        let that = this
        let state=false
        Object.keys(this.addGroupInfo).forEach(k=>{
          console.log(this.addGroupInfo[k])
          if((this.addGroupInfo[k]??'')==''&&k!='id'&&this.addGroupInfo[k]!==0){
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
            that.add()
            that.visible = false
          },
        })
      },
      save(id) {
        const index=this.data.findIndex(item=>item.id===id)
        const newData = [...this.data];
        const newCacheData = [...this.cacheData];
        const target = newData.find(item => id === item.id);
        const targetCache = newCacheData.find(item => id === item.id);
        target.buttDetectionEnable=!target.buttDetectionEnable
        if (target && targetCache) {
          delete target.editable;
          this.axios.post(`stationGroup/save`,target).then(()=>{
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
      add() {
        this.axios.post(`stationGroup/save`,this.addGroupInfo).then(()=>{
            this.isSave=true
            this.queryData()
            this.$message.success(this.$tcache('common.operateSuccess'))
          }).catch(()=>{this.$message.error(this.$tcache('common.operateFail'))})
      },
      deleteGroup(index,record){
        if(this.selectedGroups.includes(record.id)){
          console.log(`该组别已被使用，不可删除`)
        }else{
          this.axios.delete(`stationGroup/${record.id}`).then(()=>{
            this.data.splice(index,1)
            this.total=Number(this.data.length)
            this.$message.success(this.$tcache('common.operateSuccess'))
          }).catch((err)=>{console.log(err+'')})
        }
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
  .operation{
    display: flex;
    justify-content: center;
  }
  .deleteIcon{
    color:red;
  }
  .back{
    float: right;
    margin: 5px;
  }
  ::v-deep .ant-modal-body{
    text-align: center;
  }
  </style>
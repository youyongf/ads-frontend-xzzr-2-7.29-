<template>
    <div>
        <a-row class="query-form">
            <a-input v-model="form.name"  :placeholder="$tcache('admin.name')"/>
            <a-select v-model="form.step"  :placeholder="$tcache('admin.nextStations01')">
              <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
            </a-select>
            <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
        </a-row>
        <a-row>
            <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
                :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small"
                :scroll="{ x: true }">
                <a-tag class="fontColor" slot="stepId" slot-scope="text" :data-id="text" >{{text|fmtStep}}</a-tag>
                <div class="edit" slot="commonAction" slot-scope="text, record,index">
                    <!-- <a @click="() => recordEdit(index, record)">
                        <a-icon type="edit"></a-icon>修改
                    </a> -->
                    <a @click="() => recordEdit(index, record)" class="icon1"><a-icon type="edit"/></a>
                    <a-divider type="vertical" />
                    <!-- <a-button @click="() => Delete(record)" class="delete"><a-icon type="delete"/></a-button> -->
                    <a-popconfirm
                      :title="$tcache('admin.cacheLayer07')"
                      :ok-text="$tcache('common.confirm')"
                      :cancel-text="$tcache('common.cancel')"
                      @confirm="Delete(index,record)"
                      @cancel="cancel"
                    >
                      <a class="icon2"><a-icon type="delete"></a-icon> </a>
                    </a-popconfirm>
                </div>
            </a-table>
            <a-modal :title="$tcache('common.modify')" :visible="visible" :dialog-style="{ top: '20px' }" :width="800" :okText="$tcache('common.save')"
                :cancelText="$tcache('common.cancel')" @ok="handleOk" @cancel="handleCancel">
                <onlineqtime :data="record" :steps="steps" />
            </a-modal>
            <div style="margin-top:10px" class="flex">
                <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:
                    <a-input class="fontSty" type="number" v-model.number="pagination.pageSize" :placeholder="$tcache('admin.rowsPerPage')" />
                </div>
                <a-pagination :page-size="pagination.pageSize" v-model="pagination.current" show-quick-jumper
                    :total="total" @change="ChangePage" />
            </div>
        </a-row>
    </div>
</template>
  
<script>
import onlineqtime from "./on_line_qtime_detail";
const tableHeader = require('../../data/online_qtime.json');
let vueApp = null
export default {
    name: "config",
    components: {
        onlineqtime,
    },
    data() {
        return {
            total: 0,//查询得到数据的条数
            pagination: {
                pageSize: Number(localStorage.getItem('pageSize')) ? Number(localStorage.getItem('pageSize')) : Number(this.$store.state.defaultPageSize),//每页中显示10条数据
                current: 1,
            },
            data: [],//查询结果
            alldata: [],
            isAdmin: this.$store.state.isAdmin,//判断是否为管理员
            visible: false,
            record: {},
            disabledStrArr:['id','key'],
            showArr:[],
            editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
            steps:[],
            form:{}
        }
    },
     computed: {
      columns() {
        return this.$transformI18n(tableHeader);
      }
    },
    watch: {
        pagination: {
            handler(newVal, oldVal) {
                console.log('pagination', newVal, oldVal)
                localStorage.setItem('pageSize', this.pagination.pageSize);
            },
            deep: true
        },
        form:{
            handler(newVal, oldVal) {
                console.log('form', newVal, oldVal)
                this.pagination.current=1
                if(this.timeout) clearTimeout(this.timeout)
                this.timeout = setTimeout(this.filterData, 0)
            },
            deep: true
        },
    },
    filters:{
      fmtStep:val=>{
        let steps = [...vueApp.steps]
        let step = steps.find(e=>e.id == val)
        if(step){
          return step?.name
        }
        return val
      },
    },
    beforeMount() {
        vueApp=this
        if(this.editable||this.isAdmin)this.addRender()
    },
    mounted() {
        this.querySteps()
        
    },
    methods: {
        filterData(){
            let result = this.alldata
            if(this.form.name){
              result = result.filter(d=>`${d.name}`.includes(`${this.form.name}`))
            }
            if(this.form.step){
              result = result.filter(d=>d.stepId==this.form.step)
            }
            this.data = result
            this.total=Number(this.data.length)
        },
        ChangePage(pageNumber) {
            this.pagination.current = pageNumber
        },
        clearForm() {
            this.form = {}
            this.data=this.alldata
            this.total=0
        },
        querySteps(){
          this.axios.get(`step/all`).then((res)=>{
            console.log(res)
            if(Array.isArray(res.data)){
               this.steps=res.data
               this.queryData()
            }
          }).catch(()=>{
            this.$message.error(this.$tcache('admin.cacheListErr01'))
          })
        },
        queryData() {
            let that = this
            this.axios.get(`analyse/list`).then(res => {
                if (res.status == 200 && res.data) {
                    let arr = res.data
                    this.alldata = arr
                    this.data = arr
                    this.total = Number(this.data.length)
                } else {
                    that.$message.warning(this.$tcache('common.queryFailure'))
                }
            }).catch(err => { this.$message.error(err) })
        },
        addRender() {
            //列中添加类似： "scopedSlots":{ "customRender":"createTime"}
            let b = this.columns.find(e => e.dataIndex == 'commonAction')
            if (b == undefined) {//避免重复mounted时重复push(一般在开发模式下发生）
                let col = { title: this.$tcache('common.edit'), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right', width: 200, scopedSlots: { customRender: 'commonAction' } }
                this.columns.push(col)
            }
        },
        handleOk() {
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
            this.visible = false;
        },
        recordEdit(index, record) {
            console.log(index, record);
            this.record = record;
            this.visible = true;
        },
        save() {
            this.axios.post(`analyse/save`,this.record).then(() => {
                this.queryData()
            }).catch(() => { })
        },
        Delete(index,record) {
            this.axios.delete(`deleteAnalyse/${record.id}`).then(() => {
                this.data.splice(index,1)
                this.total=Number(this.data.length)
            }).catch((err) => { this.$message.error(err+'')})
        },
        cancel(){
            this.$message.warning(this.$tcache('admin.canceled'))
        }
    }
}
</script>
  
<style scoped lang="scss">
@import '~@/assets/scss/style.scss';

::v-deep .ant-table-thead>tr>th,
::v-deep .ant-table-tbody>tr>td {
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

::v-deep .ant-table-thead>tr>th {
    background-color: $bgcolor !important;
    color: $color;
    // font-weight: bold;
}

::v-deep .table-striped {
    background-color: #f0f0f0;
}
.edit{
    // display: flex;
}
.icon2{
    // font-weight: bold;
    color: #eb1111;
}
.icon1,.icon2{
    padding: 2px;
}
</style>
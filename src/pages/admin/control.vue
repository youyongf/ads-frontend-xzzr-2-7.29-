<template>
    <div>
        <a-row>
            <a-input v-model="form.id"  placeholder="id"/>
            <a-input v-model="form.name"  :placeholder="$tcache('admin.name')"/>
            <a-input v-model="form.type"  :placeholder="$tcache('admin.type')"/>
            <a-button v-if="isAdmin||editable" @click="getRouteControlAreaIntersect('all')" :title="$tcache('admin.control01')" :loading="intersect"><span class="fontSty">{{intersect? $tcache('admin.control02'):$tcache('admin.control03')}}</span></a-button>
            <a-button v-if="isAdmin||editable" style="margin-left:10px;" @click="getControlAreaInout('all')" :disabled="inOut_disabled" :title="$tcache('admin.control04')" :loading="inOut"><span class="fontSty">{{inOut? $tcache('admin.control05'):$tcache('admin.control06')}}</span></a-button>
        </a-row>
        <div style="float: right;font-size: 15px !important;"><span style="color: red;">*</span>{{$tcache('admin.control07')}}</div>
        <a-row>
            <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
                :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small"
                :scroll="{ x: true }">
                <span v-if="isAdmin||editable" slot="operate" slot-scope="text, record">
                    <a-button :data-id="record.id" @click="getRouteControlAreaIntersect(record.id)" :loading="record.id==intersectId">{{record.id==intersectId?$tcache('admin.control02'):$tcache('admin.control08')}}</a-button>
                    <a-divider type="vertical" />
                    <a-button @click="getControlAreaInout(record.id)" :type="!inOutOpen.includes(record.id)?'':'primary'"
                        :style="{background:!inOutOpen.includes(record.id)?'':'#57a3f3',color: !inOutOpen.includes(record.id)?'':'white'}"
                        :disabled="!inOutOpen.includes(record.id)" :loading="record.id==inOutId"
                        >{{record.id==inOutId?$tcache('admin.control05'):$tcache('admin.control09')}}
                    </a-button>
                </span>
            </a-table>
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
const tableHeader = require('../../data/columns_control.json');
export default {
    name: "config",
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
            disabledStrArr: ['id', 'key'],
            showArr: [],
            intersect:false,//相交点loading加载状态
            inOut:false,//相交点loading加载状态
            intersectId:'',//点击生成相交点的id
            inOutId:',',//点击生成进出点的id
            inOutOpen:[],//储存解除禁用的进出点id
            inOut_disabled:true,//生成全部进出点的按钮禁用状态
            form:{},//搜索框内容
            editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
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
            // this.queryData()
            if(this.timeout) clearTimeout(this.timeout)
            this.timeout = setTimeout(this.filterData, 500)
          },
          deep: true
        },
    },
    mounted() {
        this.queryData()
    },
    methods: {
        filterData(){
          let result = this.alldata
          if(this.form.id){
            result = result.filter(d=>d.id==this.form.id)
          }
          if(this.form.name){
            result = result.filter(d=>`${d.name}`.includes(`${this.form.name}`))
          }
          if(this.form.type){
            result = result.filter(d=>d.type== this.form.type)
          }
          this.data = result
          this.total=Number(this.data.length)
        },
        ChangePage(pageNumber) {
            this.pagination.current = pageNumber
        },
        queryData() {
            this.axios.get(`ca/all`).then(res => {
                console.log(res.data)
                if (res.status == 200 && res.data) {
                    let arr = res.data
                    this.alldata = arr
                    this.data = arr
                    this.total = Number(this.data.length)
                } else {
                    this.$message.warning(this.$tcache('common.queryFailure'))
                }
            }).catch(err => { this.$message.error(err) })
        },
        getRouteControlAreaIntersect(e) {
            this.intersectId=e
            if(e=='all')this.intersect=true
            this.axios.get(`route/getRouteControlAreaIntersect/id/${e}`).then(res => {
                console.log(res.data)
                if (res.status == 200 && res.data) {
                    console.log(res.data)
                    this.intersectId=''
                    this.inOutOpen.push(e)
                    if(e=='all'){
                        this.intersect=false
                        this.inOut_disabled=false
                    }
                    this.$message.success(this.$tcache('admin.control10'))
                } else {
                    this.$message.warning(this.$tcache('admin.control11'))
                }
            }).catch(err => { 
                this.$message.error(err+'');
                this.intersectId=''
                if(e=='all')this.intersect=false 
            })
        },
        getControlAreaInout(e) {
            this.inOutId=e
            if(e=='all')this.inOut=true
            this.axios.get(`route/getControlAreaInout/id/${e}`).then(res => {
                console.log(res.data)
                if (res.status == 200 && res.data) {
                    console.log(res.data)
                    if(e=='all')this.inOut=false
                    this.inOutId=''
                    this.$message.success(this.$tcache('admin.control12'))
                } else {
                    this.$message.warning(this.$tcache('admin.control13'))
                }
            }).catch(err => { 
                this.$message.error(err) 
                this.inOutId=''
                if(e=='all')this.inOut=false
            })
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
::v-deep .ant-divider{
    background: #c5c3c3;
}
</style>
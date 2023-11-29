<template>
    <div>
        <a-row>
            <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
                :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small"
                :scroll="{ x: true }">
                <span slot="commonAction" slot-scope="text, record,index">
                    <a>
                        <a-icon type="edit" @click="() => recordEdit(index, record)"></a-icon>
                    </a>
                </span>
            </a-table>
            <a-modal :title="$tcache('common.modify')" :visible="visible" :dialog-style="{ top: '20px' }" :width="800" :okText="$tcache('common.save')"
                :cancelText="$tcache('common.cancel')" @ok="handleOk" @cancel="handleCancel">
                <public_detail :data="record" :remark="columns" :disabledStrArr="disabledStrArr" :showArr="showArr" />
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
import public_detail from "./public_detail";
const tableHeader = require('../../data/columns_config.json');

export default {
    name: "config",
    components: {
        public_detail,
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
            isSave:true,
            saveId:''
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
    },
    beforeMount() {
        if(this.editable||this.isAdmin)this.addRender()
    },
    mounted() {
        this.queryData()
    },
    methods: {
        ChangePage(pageNumber) {
            this.pagination.current = pageNumber
        },
        clearForm() {
            this.total = 0
            this.data = this.alldata
        },
        queryData() {
            let that = this
            this.axios.get(`config/list`).then(res => {
                if (res.status == 200 && res.data) {
                    let arr = res.data
                    this.alldata = arr
                    if(this.isSave){this.data=res.data}else{
                      const index = this.data.findIndex(item=>item.id==this.saveId)
                      let obj=this.alldata.filter(item=>item.id==this.saveId)
                      this.data[index]=Object.assign(this.data[index], obj[0])
                    }
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
                let col = { title: this.$tcache('common.edit'), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right', width: 60, scopedSlots: { customRender: 'commonAction' } }
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
            this.saveId=this.record.id
            this.isSave=false
            this.record={}
            this.queryData()
            this.visible = false;
        },
        recordEdit(index, record) {
            console.log(index, record);
            this.record = record;
            this.visible = true;
        },
        save() {
            this.axios.post(`config/save`,this.record).then(() => {
                this.isSave=false
                this.saveId=this.record.id
                this.queryData();
                this.$message.success(this.$tcache('common.saveSuccess'))
            }).catch(() => { })
        },
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
</style>
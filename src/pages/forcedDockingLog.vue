<template>
    <div>
        <div>
            <a-input class="form" type="number" v-model.number="form.agvid" :placeholder="'对接的agv编号'"/>
            <a-input class="form" v-model="form.station" :placeholder="'人工干预对接的机台'"/>
            <a-select class="form" v-model="form.step"  :placeholder="$tcache('admin.currentStep')" :options="steps" :allowClear="true" />
            <div class="rangePicker">
                插入时间：<a-range-picker show-time format="YYYY/MM/DD HH:mm:ss" @ok="jobCreateTs" :allowClear="false" />
                <a-button style="margin-left:10px;" @click="queryData"><span class="fontSty">{{$tcache('check.query')}}</span></a-button>
            </div>
        </div>
        <a-table :loading="loading" :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
            :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small"
            :scroll="{ x: true }" bordered>
            <div slot="ts" slot-scope="text" :data-id="text">{{text|fmtDateTime}}</div>
        </a-table>
        <div style="margin-top:10px" class="flex">
            <div class="flex fontSty">{{$tcache('common.rowsPerPage')}}:
                <a-input class="fontSty" type="number" v-model.number="pagination.pageSize" :placeholder="$tcache('common.rowsPerPage')" />
            </div>
            <a-pagination :page-size="pagination.pageSize" v-model="pagination.current" show-quick-jumper
                :total="total" @change="ChangePage" />
        </div>
    </div>
</template>
  
<script>
import moment from 'moment'; // TODO
const tableData = require('@/data/columns_forcedDockingLog.json');
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
            loading:false,
            form: {},
            steps: [],
            dataFormat:"YYYY-MM-DD HH:mm:ss"
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
    computed: {
        columns() {
            return this.$transformI18n(tableData, "title");
        },
    },
    mounted() {
        // this.queryData();
        this.querySteps();
    },
    methods: {
        ChangePage(pageNumber) {
            this.pagination.current = pageNumber
        },
        jobCreateTs(Moment) {
            this.form.finishTimeBegin = moment(Moment[0]._d).format(this.dataFormat);
            this.form.finishTimeEnd = moment(Moment[1]._d).format(this.dataFormat);
        },
        queryData() {
            this.loading = true;
            this.data = [];
            Object.keys(this.form).forEach(key => {
                if (this.form[key] === '') {
                    delete this.form[key];
                }
            })
            this.axios.post(`manualInterventionRecords/findRecords/list`,this.form).then(res => {
                if (Array.isArray(res.data)) {
                    this.data = res.data;
                    this.total = Number(this.data.length);
                    this.loading = false;
                }else{
                    this.$message.warning('数据有误：'+res.data);
                }
             }).catch(err => {
               this.loading = false;
               this.$message.error(err+'') 
            })
        },
        querySteps(){
          this.axios.get(`step/all`).then((res)=>{
                if(Array.isArray(res.data)){
                    this.steps=res.data.map(d=>{
                        return {value:d.id,label:d.name}
                    })
                }else{
                    this.$message.error(this.$tcache('admin.cacheListErr01'))
                }
            }).catch((err)=>{
                this.$message.error(err+'')
            })
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
    white-space: nowrap;
    // font-weight: bold;
}

::v-deep .table-striped {
    background-color: #f0f0f0;
}
::v-deep .ant-table-tbody > tr > td{
    white-space: nowrap;
}
.nfc{
    max-width: 200px;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: pointer;
    font-size: 14px;
}
.form{
    width: 150px;
}
</style>
<template>
    <div>
        <a-row class="query-form">
            <a-date-picker :allowClear="false" v-model="form.beginDateMoment" :placeholder="$tcache('check.startDate')"  @change="beginDate" />
            <a-time-picker :allowClear="false" v-model="form.beginTimeMoment" :placeholder="$tcache('check.startTimePeriod')" @change="beginTime" />
            <a-date-picker :allowClear="false" v-model="form.endDateMoment" :placeholder="$tcache('check.endDate')" @change="endDate" />
            <a-time-picker :allowClear="false" v-model="form.endTimeMoment" :placeholder="$tcache('check.endTimePeriod')" @change="endTime" />
            <a-select v-model="form.step" :placeholder="$tcache('check.currentStep')">
              <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
            </a-select>
            <a-input v-model="form.message" :placeholder="$tcache('common.abnormalInformation')" />
            <a-input v-model="form.agvId" :placeholder="$tcache('check.wagonNumber')" />
            <a-input v-model="form.stationName" :placeholder="$tcache('check.machineName')" />
            <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearedCondition')}}</span></a-button>
            <download-excel
                class="export-excel"
                :data="json_data"
                :name="$tcache('check.agvAnomalyStatistics')"
                :fields="json_fields"
                :before-generate="beforeDownload"
                :before-finish="beforeFinish"
                >
                <a-button :loading="loading_excel" class="button-export">
                    <span v-if="!loading_excel">{{$tcache('common.downloadTable')}}</span>
                    (<span style="color: #107c41;font-weight: bold;">Excel</span>)
                    <span v-if="loading_excel">下载中...</span>
                </a-button>
            </download-excel>
            <a-button :loading="loading_successRate" @click="agvAnomalySuccessRate"><span class="fontSty">对接成功率<span style="color:green;" v-if="SuccessRate">({{SuccessRate}})</span></span></a-button>
        </a-row>

        <a-row>
            <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
                :pagination="pagination" :dataSource="data" :columns="columns" rowKey="id" size="small"
                :scroll="{ x: true }">
                <div class="fontColor" slot="ts" slot-scope="text" :data-id="text" >{{text|fmtTime}}</div>
                <div slot="step" slot-scope="text" :data-id="text" >{{text|fmtStep}}</div>
            </a-table>
            <div style="margin-top:10px" class="flex">
                <div class="flex fontSty">{{$tcache('common.rowsPerPage')}}:<a-input class="fontSty" type="number"
                        v-model.number="pagination.pageSize" :placeholder="$tcache('common.rowsPerPage')" /></div>
                <a-pagination :page-size="pagination.pageSize" v-model="pagination.current" show-quick-jumper
                    :total="total" @change="ChangePage" />
            </div>
        </a-row>
    </div>
</template>

<script>
import { getCurrentDate } from "../../utils/date.js";
let vueApp=null;
const tableData = require('../../data/columns_agvAnomaly.json');
export default {
    name: "agvlist",
    data() {
        return {
            total: 0,//查询得到数据的条数
            pagination: {
                pageSize: Number(localStorage.getItem('pageSize')) ? Number(localStorage.getItem('pageSize')) : Number(this.$store.state.defaultPageSize),//每页中显示10条数据
                current: 1,
            },
            form: {}, //查询条件
            data: [],//查询结果
            alldata: [],
            // columns:[], //表头
            visible: false,
            record: {}, //操作的行
            isSave: true,
            saveId: '',
            isAdmin: this.$store.state.isAdmin,//判断是否为管理员
            beginDateCache:'',
            endDateCache:'',
            json_fields: {  //导出Excel表格的表头设置
               [this.$tcache('check.wagonNumber')]:'agvId',
               [this.$tcache('check.currentPointPosition')]:'pointId',
               [this.$tcache('check.machineName')]:'stationName',
               [this.$tcache('check.routeID')]:'routeId',
               [this.$tcache('check.productionProcesses')]:'step',
               [this.$tcache('common.abnormalInformation')]:'message',
               [this.$tcache('common.time')]:'ts',
            },
            json_data:[],//需导出的数据
            steps:[],
            SuccessRate:null,
            loading_excel:false,
            loading_successRate:false
        }
    },
    watch: {
        form: {
            handler(newVal, oldVal) {
                console.log('form', newVal, oldVal)
                this.pagination.current = 1
                if (this.timeout) clearTimeout(this.timeout)
                this.timeout = setTimeout(this.filterData, 500)
            },
            deep: true
        },
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
    beforeMount(){
        vueApp=this
        tableData.unshift({title:"data.i18nKey45",dataIndex:"agvId",key:"agvId",sorter: (a, b) => a.agvId - b.agvId,defaultSortOrder: "ascend"})
        tableData.push({title:"data.i18nKey51",dataIndex:"ts",key:"ts",sorter: (a, b) => {
            let ats=new Date(a.ts).getTime()
            let bts=new Date(b.ts).getTime()
            return ats - bts;
        },defaultSortOrder: "ascend",scopedSlots: { customRender: "ts" }})
    },
    mounted() {
        this.querySteps()
        this.queryData()
    },
    filters: {
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
    methods: {
        beforeDownload(){
            if(this.data?.length==0){
                this.$message.info(this.$tcache('common.exportDataIsEmpty'))
                return
            }
            this.loading_excel=true
        },
        beforeFinish(){
            this.$message.success('下载完成')
            this.loading_excel=false
        },
        filterData() {
            console.log(this.form.finishTimeBegin,this.form.finishTimeEnd)
            let result = this.alldata
            if (this.form.agvId) {
                console.log(`${this.form.agvId}`)
                result = result.filter(d => d.agvId == this.form.agvId)
            }
            if (this.form.stationName) {
                result = result.filter(d => `${d.stationName}`.includes(`${this.form.stationName}`))
            }
            if (this.form.message) {
                result = result.filter(d => `${d.message}`.includes(`${this.form.message}`))
            }
            if(this.form.step){
              result = result.filter(d=>this.form.step==d.step)
            }
            if (this.form.finishTimeBegin&&this.form.finishTimeEnd) {
                // let ts=new Date(d.ts)
                result = result.filter(d => {
                    let ts=(new Date(d.ts)).getTime()
                    console.log(ts>this.form.finishTimeBegin,ts<this.form.finishTimeEnd)
                    return ts>this.form.finishTimeBegin&&ts<this.form.finishTimeEnd
                })
            }
            this.data = result
            console.log(this.data)
            this.total = Number(this.data.length)
            this.json_data=JSON.parse(JSON.stringify(result));
            this.json_data.forEach(item=>{
                item.ts=getCurrentDate(item.ts)
            })
        },
        ChangePage(pageNumber) {
            this.pagination.current = pageNumber
        },
        clearForm() {
            this.form = {}
            this.total = 0
            this.data = this.alldata
        },
        querySteps(){
            this.axios.get(`step/all`).then((res)=>{
              console.log(res)
              if(Array.isArray(res.data)){this.steps=res.data}
            }).catch(()=>{
              this.$message.error(this.$tcache('check.stepInformationGetFailed'))
            })
        },
        queryData() {
            let that = this
            this.axios.get(`AgvAnomaly`).then(res => {
                if (res.status == 200 && res.data) {
                    let ad=0,bd=0
                    res.data=res.data.sort((a,b)=>{
                        ad=new Date(a.ts)
                        bd=new Date(b.ts)
                        return bd-ad
                    })
                    this.alldata = res.data
                    this.data = res.data
                    this.total = Number(this.data.length)
                    this.json_data=JSON.parse(JSON.stringify(res.data));
                    this.json_data.forEach(item=>{
                        item.ts=getCurrentDate(item.ts)
                    })
                } else {
                    that.$message.warning(this.$tcache('check.informationQueryFailed'))
                }
            }).catch(err => { this.$message.error(err) })
        },
        beginDate(date, dateString) {
            console.log('finishTimeBegin',date, dateString);
            this.form.finishTimeBegin=new Date(dateString).getTime()-8*3600*1000
            this.beginDateCache=this.form.finishTimeBegin
            console.log('this.form.beginDate：',this.form.finishTimeBegin)
        },
        beginTime(date, dateString) {
            console.log('beginTime',date, dateString);
            let h=dateString.split(':')[0]*3600*1000
            let m=dateString.split(':')[1]*60*1000
            let s=dateString.split(':')[2]*1000
            let sum=h+m+s
            console.log(sum)
            if(this.form.finishTimeBegin){
                this.form.finishTimeBegin=this.beginDateCache+sum
                console.log(this.form.finishTimeBegin)
            }else{
                this.form.beginTimeMoment=''
                this.$message.error('this.$tcache("check.startDate")')
            }
        },
        endDate(date, dateString) {
            console.log('finishTimeEnd',date, dateString);
            if(!this.form.finishTimeBegin){
                this.$message.warning(this.$tcache("check.startTime"))
                this.form.endDateMoment=''
                return
            }
            this.form.finishTimeEnd=new Date(dateString).getTime()-8*3600*1000
            this.endDateCache=this.form.finishTimeEnd
            console.log('this.form.finishTimeEnd',this.form.finishTimeEnd)
        },
        endTime(date, dateString) {
            let h=dateString.split(':')[0]*3600*1000
            let m=dateString.split(':')[1]*60*1000
            let s=dateString.split(':')[2]*1000
            console.log(h+m+s)
            console.log('endTime',date, dateString);
            let sum=h+m+s
            if(this.form.finishTimeEnd){
                this.form.finishTimeEnd=this.endDateCache+sum
            }else{
                this.form.endTimeMoment=''
                this.$message.error(this.$tcache("check.endDate"))
            }
        },
        agvAnomalySuccessRate(){
            let require=['step','finishTimeBegin','finishTimeEnd']
            let requireTip=[]
            console.log(this.form)
            let form={}
            require.forEach(k=>{
                if(!this.form[k]){
                    let n=this.columns.find(c=>c.key==k)
                    if(n){
                        requireTip.push(`<${n.title}>`)
                    }else{
                        requireTip.push(`<${k}>`)
                    }
                }
                if(k!=='agvId'||k!=='stationName'){
                    form[k]=this.form[k]
                    if(k=='finishTimeBegin'||k=='finishTimeEnd'){
                        form[k]=getCurrentDate(form[k])
                        console.log(form[k])
                    }
                }
            })
            if(this.form['message']){
                form['message']=this.form['message']
            }
            console.log(form)
            if(requireTip.length>0){
                this.$message.warning(`必填项${requireTip.join(',')}不可为空`)
                return
            }
            this.loading_successRate=true
            this.axios.get(`agvAnomalySuccessRate`,{params:form}).then((res)=>{
              console.log(res)
              if(res.data){
                this.SuccessRate=res.data.SuccessRate
                this.$message.success(`成功率：${this.SuccessRate}`)
              }
              this.loading_successRate=false
            }).catch((err)=>{
              this.$message.error(err)
              this.loading_successRate=false
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
.export-excel{
  display: inline;
}
</style>
<template>
    <div>
        <a-row class="query-form">
            <a-date-picker v-model="keyValue" :placeholder="$tcache('common.selectDate')" @change="finishTime_onChange" />
            <a-button class="check_btn" @click="getRetTStep"><span class="fontSty">{{$tcache('common.query')}}</span></a-button>
            <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
        </a-row>
        <a-table rowKey="id" :columns="columns" :data-source="data" :bordered="true" size="middle"
            :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)">
            <template slot="title">
                <div>{{$tcache('report.capPeriodStatistTable')}}</div>
            </template>
            <div class="inp" slot="daytimeTarget" slot-scope="text">{{text?text:0}}</div>
            <div class="inp" slot="nightTarget" slot-scope="text">{{text?text:0}}</div>
        </a-table>
        <div class="flex" style="padding:20px">
            <div class="flex fontSty">{{$tcache('report.totalDayShifts')}}: <button class="btn">{{ dayNum }}</button></div>
            <div class="flex fontSty"  style="margin:0 100px">{{$tcache('report.totalEveningShift')}}: <button class="btn">{{ nightNum }}</button></div>
            <div class="flex fontSty">
                {{$tcache('report.TotalPerDay')}}: <button class="btn">{{ dayNum + nightNum }}</button>
            </div>
        </div>
    </div>
</template>

<script>
// import {getCurrentDate} from '../../utils/date.js'
// import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import moment from 'moment';
// import 'moment/locale/zh-cn';
// moment.locale('zh-cn')
var vueApp = null;
const columns = [
    {
        title: this.$tcache('common.productionProcesses'),
        dataIndex: 'stepName',
        key: 'id',
        width: 150,
        fixed: 'left',
    },
    {
        title: this.$tcache('common.dayShift'),
        children: [
        ],
    },
    {
        title: this.$tcache('common.nightShift'),
        children: [
        ],
    },
];

export default {
    name: "car",
    components: {
    },
    data() {
        return {
            keyValue: '',
            // locale,//日期选择器中文文件
            form: {},//查询条件
            data: [],//查询结果
            columns,
            dateStr: '',
            steps: [],

            data_RT: [],//实时搬运率查询结果
            columns_RT: [], //表头
            visible_RT: false,
            visible: false,
            record_RT: {}, //操作的行
            obj_RT: {},

            data_pc: [],//工序车俩查询结果
            columns_pc: [], //表头_后段二循环
            columns_pc3: [], //表头_后段三循环
            visible_pc: false,
            stepName: [],
            agvId: [],
            docKingAgvId: [],
            emptyAgvId: [],
            list: [],
            obj: {},
            nightNum: 0,
            dayNum: 0,
            emptyCounts: 0,
            emptyCounts2: 0,//二循环空车数量
            emptyCounts3: 0,//三循环空车数量
            emptyAgvIds: [''],
            emptyAgvIds2: [''],//二循环空车数据(弹窗数据)
            emptyAgvIds3: [''],//三循环空车数据(弹窗数据)
            // emptyAndUndistributedAgvIds:[]
            sName: '',//工序类型名称
            agvQuantity1: 0,
            undistributedCount1: 0,
            agvQuantity2: 0,
            undistributedCount2: 0,
            agvId1: [],
            undistributedAgvId1: [],
            agvId2: [],
            undistributedAgvId2: [],
            cyclic: [2, 3],//二三循环
            cyclicJudge: 0,//2为二循环，3为三循环
            region_id: localStorage.getItem('region_id')//区分前后段
        }
    },
    watch: {
    },
    beforeMount(){
        vueApp=this
        let date=new Date()
        let day=date.getDate()-1
        if(day==0){
          date.setDate(0)
        }
        let year=date.getFullYear()<10?'0'+date.getFullYear():date.getFullYear()
        let month=date.getMonth()<9?'0'+(date.getMonth()+1):date.getMonth()+1
        day=date.getDate()<10?'0'+(date.getDate()-1):date.getDate()-1
        this.keyValue=moment(`${year}-${month}-${day}`)
        this.form.workday = `${year}-${month}-${day}`
    },
    filters: {
        fmtStep(val) {
            console.log(val)
            let steps = vueApp.stepName
            let step = steps.find(e => e.id == val)
            if (step) {
                return step.name
            }
            return val
        },
    },
    mounted() {
        this.getStepName()
        //查询历史数据应该放在查step数据之后
        // this.getRetTStep()
    },
    destroyed() {
        clearInterval(this.timer);
        this.timer = null;
        clearInterval(this.timer2);
        this.timer2 = null;
    },
    methods: {
        change(e) {
            this.agvId = e.agvId
            this.docKingAgvId = e.docKingAgvId
            this.agvId = this.agvId.filter(item => this.docKingAgvId.indexOf(item) == -1);
            this.visible_pc = true
        },
        daytime_count(index, record) {
            console.log(index, record)
            if (this.data[index].daytimeTarget) {
                this.data[index].daytimeDifference = this.data[index].daytimeTarget - this.data[index].chipsAmountA
                this.data[index].daytimeCarry = Math.floor((this.data[index].chipsAmountA / this.data[index].daytimeTarget) * 100) + '%'
            } else {
                this.data[index].daytimeDifference = 0
                this.data[index].daytimeCarry = 0
            }
        },
        night_count(index, record) {
            if (this.data[index].nightTarget) {
                this.data[index].nightDifference = this.data[index].nightTarget - record.chipsAmountB
                this.data[index].nightCarry = Math.floor((record.chipsAmountB / this.data[index].nightTarget) * 100) + '%'
            } else {
                this.data[index].nightDifference = 0
                this.data[index].nightCarry = 0
            }
        },
        clearForm() {
            this.dayNum = 0
            this.nightNum = 0
            this.form = {}
            this.data = []
            this.keyValue = ''
        },
        dealtInfo(data) {
            if (data.length && this.columns[1].children.length == 0) {
                let d0 = {}
                d0.chipsAmountA = data[0].chipsAmountA
                d0.daytimeTarget = 0
                d0.daytimeDifference = 0
                d0.daytimeCarry = 0
                let cols = this.makeColumns(d0)
                this.addRender(cols)
                this.columns[1].children = cols
                for (let i = 0; i < this.columns[1].children.length; i++) {
                    if (this.columns[1].children[i].title == "chipsAmountA") { this.columns[1].children[i].title = this.$tcache("check.cumulativePro") }
                    if (this.columns[1].children[i].title == "daytimeTarget") { this.columns[1].children[i].title = this.$tcache("check.accumulatedGoals") }
                    if (this.columns[1].children[i].title == "daytimeDifference") { this.columns[1].children[i].title = this.$tcache("check.accumulatedDiff") }
                    if (this.columns[1].children[i].title == "daytimeCarry") { this.columns[1].children[i].title = this.$tcache("check.handlRate") }
                }
            }
            if (data.length && this.columns[2].children.length == 0) {
                let d0 = {}
                d0.chipsAmountB = data[0].chipsAmountB
                d0.nightTarget = 0
                d0.nightDifference = 0
                d0.nightCarry = 0
                let cols = this.makeColumns(d0)
                this.addRender(cols)
                this.columns[2].children = cols
                for (let i = 0; i < this.columns[2].children.length; i++) {
                    if (this.columns[2].children[i].title == "chipsAmountB") { this.columns[2].children[i].title = this.$tcache("check.cumulativePro") }
                    if (this.columns[2].children[i].title == "nightTarget") { this.columns[2].children[i].title = this.$tcache("check.accumulatedGoals") }
                    if (this.columns[2].children[i].title == "nightDifference") { this.columns[2].children[i].title = this.$tcache("check.accumulatedDiff") }
                    if (this.columns[2].children[i].title == "nightCarry") { this.columns[2].children[i].title = this.$tcache("check.handlRate") }
                }

            }
        },

        getRetTStep() {
            this.columns[1].title = this.$tcache('common.dayShift') + '(' + this.dateStr + ')'
            this.columns[2].title = this.$tcache('common.nightShift') + '(' + this.dateStr + ')'
            this.dayNum = 0
            this.nightNum = 0
            this.axios.get(`rpt/transfer/stepoutput/${this.form.workday}`).then((res) => {
                if(res.data?.length==0){this.$message.info(res.data.message?res.data.message:this.$tcache('report.proEmptyDataIncorrect'));return}
                this.data = [...res.data]
                this.data.forEach((item, i) => {
                    for (let j = i + 1; j < this.data.length; j++) {
                        if (this.data[i].step == this.data[j].step) {
                            this.data.splice(j, 1)
                        }
                    }
                });
                for (let i = 0; i < this.data.length; i++) {
                    this.stepName.forEach(item=>{
                      if(item.id==this.data[i].step){
                        this.data[i].stepName=item.name
                      }
                    })
                }

                let d=[]
                this.data.forEach((item)=>{
                    //删除this.data数据的step不等于step/list表id的数据
                    if(item.stepName){
                        this.dayNum += item.chipsAmountA
                        this.nightNum += item.chipsAmountB;
                        item.daytimeTarget = item.targetOutputA ? item.targetOutputA : ''
                        item.daytimeDifference = item.daytimeTarget - item.chipsAmountA
                        item.daytimeCarry = 0
                        if (item.daytimeTarget) item.daytimeCarry = Math.floor((item.chipsAmountA / item.daytimeTarget) * 100) + '%'
                        item.nightTarget = item.targetOutputB ? item.targetOutputB : ''
                        item.nightDifference = item.nightTarget - item.chipsAmountB
                        item.nightCarry = 0
                        if (item.nightTarget) item.nightCarry = Math.floor((item.chipsAmountA / item.nightTarget) * 100) + '%'
                        this.dealtInfo(this.data)
                        d.push(item)
                    }
                })
                this.data=d
                // this.dealtInfo(res)
            }).catch(() => { })
        },

        finishTime_onChange(date, dateString) {
            console.log('finishTime', date, dateString);
            this.dateStr = dateString
            this.form.workday = dateString
        },
        addRender(cols) {
            //列中添加类似： "scopedSlots":{ "customRender":"createTime"}
            return cols.map(col => {
                if (col.dataIndex == 'daytimeTarget' || col.dataIndex == 'daytimeDifference'
                    || col.dataIndex == 'daytimeCarry' || col.dataIndex == 'nightTarget'
                    || col.dataIndex == 'nightDifference' || col.dataIndex == 'nightCarry'
                ) {
                    if (col.scopedSlots == undefined) {
                        col['scopedSlots'] = { "customRender": col.dataIndex }
                    }
                }
                return col;
            })
        },
        getStepName() {
            this.axios.post(`step/list`, {}).then(res => {
                if (res.status == 200 && res.data) {
                    this.stepName = res.data
                    console.log(this.stepName)
                  // steps查询完后，可以直接默认显示昨天的数据
                  this.getRetTStep()
                } else {
                    this.$message.warning(this.$tcache('common.infoFailed'))
                }
            }).catch(() => { this.$message.warning(this.$tcache('common.infoFailed')) })
        },

        //根据一行json数据生成ATable列定义
        makeColumns(row, lefts, excludes) {
            console.log('row,lefts,excludes', Object.keys(row), row, lefts, excludes)
            lefts = Array.isArray(lefts) ? lefts : [];
            excludes = Array.isArray(excludes) ? excludes : [];
            //从每第一行数据生成字段定义
            var columns = [], columns2 = [];
            //把重要的lefts列放在左侧
            let keys = Object.keys(row);
            keys = keys.filter(key => !excludes.includes(key));
            keys.forEach((key) => {
                if (lefts.includes(key)) {
                    columns.push({ title: key, dataIndex: key, key: key })
                } else {
                    columns2.push({ title: key, dataIndex: key, key: key })
                }
            })

            columns = columns.concat(columns2);
            return columns;
        }
    }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';

::v-deep .ant-table-title {
    background-color: $bgcolor;
    color: $color;
    font-weight: bold;
}

::v-deep .ant-table-thead>tr>th {
    background-color: $bgcolor !important;
    color: $color;
    // font-weight: bold;
}

::v-deep .ant-table-thead>tr>th,
::v-deep .ant-table-tbody>tr>td {
    text-align: center;
}

.check_btn {
    margin-right: 20px;
}

.inp input {
    width: 80px;
    border-radius: 3px;
    border: 1px solid #5cc5d3;
    font-weight: bold;
}

::v-deep .ant-table-tbody>tr>td {
    color: #5cc5d3;
    font-weight: bold;
}

.flex {
    display: flex;
    justify-content: center;
    align-items: center;
}

.btn {
    padding: 1px 10px;
    margin: 0 10px;
    border-radius: 5px;
    border: 0;
    font-size: 18px;
    color: #7df9ff;
    box-shadow: 1px 1px 8px;
    cursor: pointer;
    font-weight: bold;
    background-color: rgb(0 0 0 / 25%);
}

::v-deep .table-striped {
    background-color: #f0f0f0;
}
// ::v-deep .ant-table-fixed{
//     width: auto !important;
// }
</style>

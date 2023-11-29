<template>
    <div>
        <span style="color:#5099bc;font-weight:bold;font-size:15px">{{$tcache('report.autoRefreshTime')}}：</span><a-input style="width:100px;margin-bottom:5px;" type="number" v-model.number="refreshTime" placeholder="x" />
        <a-row>
            <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)" :dataSource="data"
                :columns="columns" rowKey="id" size="small" :scroll="{ x: true }">
            </a-table>
        </a-row>
        <h2 v-show="color_show">{{$tcache('report.qtimeDistrMap')}}</h2>
        <div v-show="color_show" class="colors">
            <div class="lis" v-for="item in colors" :key="item.color">
                <div :style="{ background: item.color }"></div>{{ item.text }}
            </div>
        </div>
        <div v-show="color_show" id="main"></div>
    </div>
</template>
<script>
const tableData = require('../../data/columns_qtime.json');
export default {
    data() {
        return {
            data: [],
            chartData: {
                in30: [],
                in60: [],
                in90: [],
                in120: [],
                out120: [],
                xAxis: []
            },
            colors: [
                { text: this.$tcache("report.withinThirtyMin"), color: '#9ecf8e' },
                { text: this.$tcache("report.thirtySixTyMin"), color: '#f2cc76' },
                { text: this.$tcache("report.sixTyNinetyMin"), color: '#f7b438' },
                { text: this.$tcache("report.ninetyHundredTwentyMin"), color: '#ff8585' },
                { text: this.$tcache("report.overHundredTwenty"), color: '#d15a68' }
            ],
            color_show:false,
            theobj:{},
            myChart:null,
            refreshTime:30,
        }
    },
    computed: {
        columns() {
            return this.$transformI18n(tableData, "title");
        },
    },
    mounted() {
        this.queryData()
    },
    beforeDestroy(){
        if(this.timer)clearTimeout(this.timer)
        window.removeEventListener('resize',this.resizefun)
    },
    methods: {
        queryData() {
            this.data = []
            this.chartData={in30: [],in60: [],in90: [],in120: [],out120: [],xAxis: []}
            this.theobj={}
            this.color_show=true
            // setTimeout(() => {
            //             this.chart()
            //         }, 0)
            this.axios.get(`onLineQtime`).then(res => {
                if (res.status == 200 && res.data?.length !== 0) {
                    this.data = res.data
                    this.data.forEach((item) => {
                        if(this.theobj[item.process]){
                            this.theobj[item.process].c30_within+=item.c30_within
                            this.theobj[item.process].c60_within+=item.c60_within
                            this.theobj[item.process].c90_within+=item.c90_within
                            this.theobj[item.process].c120_within+=item.c120_within
                            this.theobj[item.process].c120_outside+=item.c120_outside
                        }else{
                            this.theobj[item.process]={}
                            this.theobj[item.process]=item
                        }
                    })
                    Object.keys(this.theobj).forEach((t)=>{
                        if(Object.keys(this.theobj[t]).length!==0){
                            let item=this.theobj[t]
                            this.chartData.in30.push(item.c30_within)
                            this.chartData.in60.push(item.c60_within)
                            this.chartData.in90.push(item.c90_within)
                            this.chartData.in120.push(item.c120_within)
                            this.chartData.out120.push(item.c120_outside)
                            this.chartData.xAxis.push(item.process)
                        }
                    })
                    setTimeout(() => {
                        this.chart()
                    }, 0)
                    this.color_show=true
                } else {
                    this.$message.warning(this.$tcache("report.infoCheckIsEmpty"))
                }
            }).catch(err => { this.$message.error(err) })
            if(this.timer)clearTimeout(this.timer)
            this.timer=setTimeout(()=>{this.queryData()},this.refreshTime*1000)
        },
        //柱状图
        chart() {
            if((this.myChart??'')!==''){
                this.myChart.dispose(); //销毁
            }
            const _this = this;
            var chartDom = document.getElementById('main');
            this.myChart = this.$echarts.init(chartDom);
            var option;

            option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        // Use axis to trigger tooltip
                        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                    }
                },
                // legend: {},
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                yAxis: {
                    type: 'value',
                    name:  this.$tcache("report.numberCars"),
                    // interval: 3,
                    axisLabel: {
                      formatter: '{value} '+this.$tcache("report.cars")
                    }
                },
                xAxis: {
                    type: 'category',
                    data: this.chartData.xAxis?this.chartData.xAxis:[]
                    // data:['q','w','r','y','u']
                },
                series: [
                    {
                        name: this.$tcache("report.withinThirtyMin"),
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        tooltip: {
                          valueFormatter: function (value) {
                            return value + ' '+_this.$tcache("report.cars");
                          }
                        },
                        itemStyle: { color: '#9ecf8e' },
                        data: this.chartData.in30?this.chartData.in30:[]
                        // data:[5,10,35,50,70]
                    },
                    {
                        name: this.$tcache("report.thirtySixTyMin"),
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        tooltip: {
                          valueFormatter: function (value) {
                            return value + ' '+_this.$tcache("report.cars");
                          }
                        },
                        itemStyle: { color: '#f2cc76' },
                        data: this.chartData.in60?this.chartData.in60:[]
                        // data:[5,10,35,50,70]
                    },
                    {
                        name: this.$tcache("report.sixTyNinetyMin"),
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        tooltip: {
                          valueFormatter: function (value) {
                            return value + ' '+_this.$tcache("report.cars");
                          }
                        },
                        itemStyle: { color: '#f7b438' },
                        data: this.chartData.in90?this.chartData.in90:[]
                        // data:[5,10,35,50,70]
                    },
                    {
                        name: this.$tcache("report.ninetyHundredTwentyMin"),
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        tooltip: {
                          valueFormatter: function (value) {
                            return value + ' '+_this.$tcache("report.cars");
                          }
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        itemStyle: { color: '#ff8585' },
                        data: this.chartData.in120?this.chartData.in120:[]
                        // data:[5,10,35,50,70]
                    },
                    {
                        name: this.$tcache("report.overHundredTwenty"),
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        tooltip: {
                          valueFormatter: function (value) {
                            return value + ' '+_this.$tcache("report.cars");
                          }
                        },
                        itemStyle: { color: '#d15a68' },
                        data: this.chartData.out120?this.chartData.out120:[]
                        // data:[5,10,35,50,70]
                    }
                ]
            };
            this.myChart.setOption(option);
            // 根据页面大小自动响应图表大小
            window.addEventListener("resize", this.resizefun);
        },
        resizefun(){
            this.myChart.resize()
        }
    }
}
</script>
<style lang="scss" scoped>
::v-deep .table-striped {
    background-color: #f0f0f0;
}

.mr {
    margin-right: 10px;
}

#main {
    max-height: 500px;
    // max-height: 400px;
    height: 500px;
}

.colors {
    display: flex;
    padding: 10px 0;

    .lis {
        display: flex;
        align-items: center;
        margin-right: 10px;

        div {
            width: 40px;
            height: 20px;
            border-radius: 5px;
            margin-right: 5px;
        }
    }
}
</style>

<template>
    <div>
        <div class="colors">
            <div class="lis" v-for="item in colors_qtime" :key="item.color">
                <div :style="{ background: item.color }"></div>{{ item.text }}
            </div>
        </div>
        <h2>{{$tcache('report.qtimeDistrMap')}}</h2>
        <div id="main_qtime"></div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            chartData_qtime: {},
            colors_qtime: [
                { text: this.$tcache("report.withinThirtyMin"), color: '#9ecf8e' },
                { text: this.$tcache("report.thirtySixTyMin"), color: '#f2cc76' },
                { text: this.$tcache("report.sixTyNinetyMin"), color: '#f7b438' },
                { text: this.$tcache("report.ninetyHundredTwentyMin"), color: '#ff8585' },
                { text: this.$tcache("report.overHundredTwenty"), color: '#d15a68' }
            ],
            theobj_qtime:{},
            myChart_qtime:null,
        }
    },
    mounted() {
        this.queryData_qtime()
    },
    beforeDestroy(){
        window.removeEventListener('resize',this.resizefun_qtime)
    },
    methods: {
        queryData_qtime() {
            this.chartData_qtime={in30: [],in60: [],in90: [],in120: [],out120: [],xAxis: []}
            this.axios.get(`onLineQtime`).then(res => {
                if (res.status == 200 && res.data?.length !== 0) {
                    res.data.forEach((item) => {
                        if(this.theobj_qtime[item.process]){
                            this.theobj_qtime[item.process].c30_within+=item.c30_within
                            this.theobj_qtime[item.process].c60_within+=item.c60_within
                            this.theobj_qtime[item.process].c90_within+=item.c90_within
                            this.theobj_qtime[item.process].c120_within+=item.c120_within
                            this.theobj_qtime[item.process].c120_outside+=item.c120_outside
                        }else{
                            this.theobj_qtime[item.process]={}
                            this.theobj_qtime[item.process]=item
                        }
                    })
                    Object.keys(this.theobj_qtime).forEach((t)=>{
                        if(Object.keys(this.theobj_qtime[t]).length!==0){
                            let item=this.theobj_qtime[t]
                            this.chartData_qtime.in30.push(item.c30_within)
                            this.chartData_qtime.in60.push(item.c60_within)
                            this.chartData_qtime.in90.push(item.c90_within)
                            this.chartData_qtime.in120.push(item.c120_within)
                            this.chartData_qtime.out120.push(item.c120_outside)
                            this.chartData_qtime.xAxis.push(item.process)
                        }
                    })
                    setTimeout(() => {
                        this.chart_qtime()
                    }, 0)
                } else {
                    this.$message.warning(this.$tcache("report.infoCheckIsEmpty"))
                }
            }).catch(err => { this.$message.error(err) })
        },
        //柱状图
        chart_qtime() {
            if((this.myChart_qtime??'')!==''){
                this.myChart_qtime.dispose(); //销毁
            }
            const _this = this;
            var chartDom = document.getElementById('main_qtime');
            this.myChart_qtime = this.$echarts.init(chartDom);
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
                    name: this.$tcache("report.numberCars"),
                    // interval: 3,
                    axisLabel: {
                      formatter: '{value} '+this.$tcache("report.cars"),
                    }
                },
                xAxis: {
                    type: 'category',
                    data: this.chartData_qtime.xAxis?this.chartData_qtime.xAxis:[]
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
                        data: this.chartData_qtime.in30?this.chartData_qtime.in30:[]
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
                        data: this.chartData_qtime.in60?this.chartData_qtime.in60:[]
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
                        data: this.chartData_qtime.in90?this.chartData_qtime.in90:[]
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
                        data: this.chartData_qtime.in120?this.chartData_qtime.in120:[]
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
                        data: this.chartData_qtime.out120?this.chartData_qtime.out120:[]
                        // data:[5,10,35,50,70]
                    }
                ]
            };
            this.myChart_qtime.setOption(option);
            // 根据页面大小自动响应图表大小
            window.addEventListener("resize", this.resizefun_qtime);
        },
        resizefun_qtime(){
            this.myChart_qtime.resize()
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

#main_qtime {
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

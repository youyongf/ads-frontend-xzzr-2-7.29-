<template>
    <div>
        <div class="colors">
            <div class="flex">
                <div style="width:30px;border:1px solid #1a67b3;height:1px;"></div><span>:车数</span>
            </div>
            <div class="lis" v-for="item in colors_onLineQtime" :key="item.color">
                <div :style="{ background: item.color }"></div>{{ item.text }}
            </div>
            <div class="carnum"><span>{{$tcache('home.carLine')}}：</span><a-switch v-model="checked_onLineQtime" checked_onLineQtime-children="显示" un-checked_onLineQtime-children="隐藏" @click="changeColor" /></div>
        </div>
        <h2 >{{$tcache('home.realTimeMap')}}</h2>
        <div  id="main_onLineQtime"></div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            chartData_onLineQtime: {},
            colors_onLineQtime: [
                { text: this.$tcache("home.cacheSystem"), color: '#f5ce87' },
                { text: this.$tcache("home.machineTrans"), color: '#30931e' },
                { text: this.$tcache("home.runCondtion"), color: '#05d716' },
                { text: this.$tcache("home.standbyPoint"), color: '#81d591' },
                { text: this.$tcache("home.emptyCars"), color: '#45b145' }
            ],
            theobj_onLineQtime:{},
            checked_onLineQtime:true,
            foldLineColor:'#5c7bd9',
            myChart_onLineQtime:null,
        }
    },
    mounted() {
        this.queryData_onLineQtime()
    },
    beforeDestroy(){
        if(this.timer_onLineQtime)clearTimeout(this.timer_onLineQtime)
        window.removeEventListener('resize',this.resizefun_onLineQtime)
    },
    methods: {
        queryData_onLineQtime() {
            setTimeout(() => {
                        this.chart_onLineQtime()
                    }, 0)
            // this.data = []
            this.axios.get(`onLineQtimeBaskVol`).then(res => {
                console.log('在制信息(onLineQtimeBaskVol)->',res)
                if (res.status == 200 && res.data?.length !== 0) {
                    res.data.forEach((item) => {
                        console.log(item.item)
                        this.theobj_onLineQtime[item.item]=item
                    })
                    this.chartData_onLineQtime={agv_qty: [],cache_amount: [],agv_transfer_amount: [],agv_steer_amount: [],agv_park_amount: [],empty_qty: [],xAxis: []}
                    Object.keys(this.theobj_onLineQtime).forEach((t)=>{
                        if(this.theobj_onLineQtime[t]){
                            let item=this.theobj_onLineQtime[t]
                            this.chartData_onLineQtime.agv_qty.push({agv_qty:item.agv_qty,stepid:item.item})
                            this.chartData_onLineQtime.cache_amount.push({cache_amount:item.cache_amount,stepid:item.item})
                            this.chartData_onLineQtime.agv_transfer_amount.push({agv_transfer_amount:item.agv_transfer_amount,stepid:item.item})
                            this.chartData_onLineQtime.agv_steer_amount.push({agv_steer_amount:item.agv_steer_amount,stepid:item.item})
                            this.chartData_onLineQtime.agv_park_amount.push({agv_park_amount:item.agv_park_amount,stepid:item.item})
                            this.chartData_onLineQtime.empty_qty.push({empty_qty:item.empty_qty,stepid:item.item})
                            this.chartData_onLineQtime.xAxis.push({process:item.process,stepid:item.item})
                        }
                    })
                    this.chartData_onLineQtime.agv_qty=this.chartData_onLineQtime.agv_qty.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_qty})
                    this.chartData_onLineQtime.cache_amount=this.chartData_onLineQtime.cache_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.cache_amount})
                    this.chartData_onLineQtime.agv_transfer_amount=this.chartData_onLineQtime.agv_transfer_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_transfer_amount})
                    this.chartData_onLineQtime.agv_steer_amount=this.chartData_onLineQtime.agv_steer_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_steer_amount})
                    this.chartData_onLineQtime.agv_park_amount=this.chartData_onLineQtime.agv_park_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_park_amount})
                    this.chartData_onLineQtime.empty_qty=this.chartData_onLineQtime.empty_qty.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.empty_qty})
                    this.chartData_onLineQtime.xAxis=this.chartData_onLineQtime.xAxis.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.process})
                    setTimeout(() => {
                        this.chart_onLineQtime()
                    }, 0)
                } else {
                    this.$message.warning(this.$tcache("home.queryEmpty"))
                }
            }).catch(err => { this.$message.error(err+'') })
            if(this.timer_onLineQtime)clearTimeout(this.timer_onLineQtime)
            this.timer_onLineQtime=setTimeout(()=>{this.queryData_onLineQtime()},this.refreshTime*1000)
        },
        changeColor(){
            if(this.checked_onLineQtime){
                this.foldLineColor='#5c7bd9'
            }else{
                this.foldLineColor='#fff0'
            }
                this.chart_onLineQtime()
        },
        //柱状图
        chart_onLineQtime() {
            if((this.myChart_onLineQtime??'')!==''){
                this.myChart_onLineQtime.dispose(); //销毁
            }
            const _this = this;
            var chartDom = document.getElementById('main_onLineQtime');
            this.myChart_onLineQtime = this.$echarts.init(chartDom);
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
                yAxis:[
                    {
                      type: 'value',
                      name: this.$tcache("home.inProcess"),
                      interval: 10000,
                      axisLabel: {
                        formatter: '{value} '+this.$tcache("report.piece")
                      }
                    },
                    {
                      type: 'value',
                      name: this.$tcache("home.cars"),
                      interval: 3,
                      axisLabel: {
                        formatter: '{value} '+this.$tcache("report.cars")
                      }
                    }
                ],
                xAxis: {
                    type: 'category',
                    data: this.chartData_onLineQtime.xAxis?this.chartData_onLineQtime.xAxis:[]
                },
                series: [
                    {
                      name: this.$tcache("home.cars"),
                      type: 'line',
                      smooth: true,
                      yAxisIndex: 1,
                      tooltip: {
                        valueFormatter: function (value) {
                          return value + ' '+_this.$tcache("report.cars");
                        }
                      },
                      itemStyle: { color: this.foldLineColor },
                    //   data: this.chartData_onLineQtime.agv_qty?this.chartData_onLineQtime.agv_qty:[]
                      data:[5,10,35,50]
                    },
                    {
                        name: this.$tcache("home.machineTrans"),
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
                            return value + ' '+_this.$tcache("report.piece");
                          }
                        },
                        itemStyle: { color: '#30931e' },
                        // data: this.chartData_onLineQtime.agv_transfer_amount?this.chartData_onLineQtime.agv_transfer_amount:[]
                        data:[10000,50000,30000,70000]
                    },
                    {
                        name: this.$tcache("home.runCondtion"),
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
                            return value + ' '+_this.$tcache("report.piece");
                          }
                        },
                        itemStyle: { color: '#05d716' },
                        // data: this.chartData_onLineQtime.agv_steer_amount?this.chartData_onLineQtime.agv_steer_amount:[]
                        data:[10000,50000,30000,70000]
                    },
                    {
                        name: this.$tcache("home.standbyPoint"),
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
                            return value + ' '+_this.$tcache("report.piece");
                          }
                        },
                        itemStyle: { color: '#81d591' },
                        // data: this.chartData_onLineQtime.agv_park_amount?this.chartData_onLineQtime.agv_park_amount:[]
                        data:[10000,50000,30000,70000]
                    },
                    {
                        name: this.$tcache("home.emptyCars"),
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
                        itemStyle: { color: '#45b145' },
                        // data: this.chartData_onLineQtime.empty_qty?this.chartData_onLineQtime.empty_qty:[]
                        data:[10000,50000,30000,70000]
                    },
                    {
                        name: this.$tcache("home.cacheSystem"),
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
                            return value + ' '+_this.$tcache("report.piece");
                          }
                        },
                        itemStyle: { color: '#f5ce87' },
                        // data: this.chartData_onLineQtime.cache_amount?this.chartData_onLineQtime.cache_amount:[]
                        data:[10000,50000,30000,70000]
                    }
                ]
            };
            this.myChart_onLineQtime.setOption(option);
            // 根据页面大小自动响应图表大小
            window.addEventListener("resize",this.resizefun_onLineQtime);
        },
        resizefun_onLineQtime(){
            this.myChart_onLineQtime.resize();
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

#main_onLineQtime {
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
.flex{
    display: flex;
    align-items: center;
    margin-right: 10px;
}
.carnum{
    margin-left: 20px;
}
</style>
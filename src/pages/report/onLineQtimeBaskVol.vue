<template>
    <div>
        <span style="color:#5099bc;font-weight:bold;font-size:15px">{{$tcache('report.autoRefreshTime')}}：</span><a-input style="width:100px;margin-bottom:5px;" type="number" v-model.number="refreshTime" placeholder="x" />
        <a-row>
            <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)" :dataSource="data"
                :columns="columns" rowKey="item" size="small">
            </a-table>
        </a-row>
        <h2>{{$tcache('report.realTimeProMap')}}</h2>
        <div class="colors">
            <div class="flex">
                <div style="width:30px;border:1px solid #1a67b3;height:1px;"></div><span>:{{$tcache('report.numberCars')}}</span>
            </div>
            <div class="lis" v-for="item in colors" :key="item.color">
                <div :style="{ background: item.color }"></div>{{ item.text }}
            </div>
            <div class="carnum"><span>{{$tcache('report.numberCarsBrokenLine')}}：</span><a-switch v-model="checked" :checked-children="$tcache('common.display')" :un-checked-children="$tcache('common.hide')" @click="changeColor" /></div>
        </div>
        <div  id="main"></div>
    </div>
</template>
<script>
const tableData = require('../../data/columns_onLineQitemBaskVol.json');
export default {
    data() {
        return {
            data: [],
            chartData: {},
            colors: [
                { text: this.$tcache("report.cachingProgress"), color: '#f5ce87' },
                { text: this.$tcache("report.machTransProgress"), color: '#30931e' },
                { text: this.$tcache("report.driveStatusControl"), color: '#93e673' },
                { text: this.$tcache("report.standbyPointControl"), color: '#569f8f' },
                { text: this.$tcache("report.numberEmptyCars"), color: '#88b13e' }
            ],
            color_show:false,
            splitNumber: 5,
            piecesMaxValue: 420000,
            vehiclesMaxValue: 12000,
            theobj:{},
            refreshTime:30,
            checked:true,
            foldLineColor:'#5c7bd9',
            myChart:null,
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
            // setTimeout(() => {
            //     window.requestAnimationFrame(this.chart);
            // }, 0)
            // this.data = []
            this.color_show=false
            this.axios.get(`onLineQtimeBaskVol`).then(res => {
                console.log('在制信息(onLineQtimeBaskVol)->',res)
                if (res.status == 200 && res.data?.length !== 0) {
                    this.data = res.data
                    this.data.forEach((d) => {
                        console.log(d.item)
                        this.theobj[d.item]=d
                    })
                    this.chartData={agv_qty: [],cache_amount: [],agv_transfer_amount: [],agv_steer_amount: [],agv_park_amount: [],empty_qty: [],xAxis: [],allAgv:[]}
                    Object.keys(this.theobj).forEach((t)=>{
                        console.log(Number(t))
                        if(this.theobj[t]){
                            let item=this.theobj[t]
                            this.chartData.agv_qty.push({agv_qty:item.agv_qty,stepid:item.item})
                            this.chartData.cache_amount.push({cache_amount:item.cache_amount,stepid:item.item})
                            this.chartData.agv_transfer_amount.push({agv_transfer_amount:item.agv_transfer_amount,stepid:item.item})
                            this.chartData.agv_steer_amount.push({agv_steer_amount:item.agv_steer_amount,stepid:item.item})
                            this.chartData.agv_park_amount.push({agv_park_amount:item.agv_park_amount,stepid:item.item})
                            this.chartData.empty_qty.push({empty_qty:item.empty_qty,stepid:item.item})
                            this.chartData.allAgv.push({allAgv:item.allAgv,stepid:item.item})
                            this.chartData.xAxis.push({process:item.process,stepid:item.item})
                        }
                    })
                    this.chartData.agv_qty=this.chartData.agv_qty.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_qty})
                    this.chartData.cache_amount=this.chartData.cache_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.cache_amount})
                    this.chartData.agv_transfer_amount=this.chartData.agv_transfer_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_transfer_amount})
                    this.chartData.agv_steer_amount=this.chartData.agv_steer_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_steer_amount})
                    this.chartData.agv_park_amount=this.chartData.agv_park_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_park_amount})
                    this.chartData.empty_qty=this.chartData.empty_qty.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.empty_qty?x.empty_qty:0})
                    this.chartData.allAgv=this.chartData.allAgv.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.allAgv?x.allAgv:''})
                    this.chartData.xAxis=this.chartData.xAxis.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.process})
                    console.log('this.chartData==>',this.chartData)
                    this.setMaxValue();
                    setTimeout(() => {
                        window.requestAnimationFrame(this.chart);
                    }, 0)
                    this.color_show=true
                } else {
                    this.$message.warning(this.$tcache("report.infoCheckIsEmpty"))
                }
            }).catch(err => { this.$message.error(err+'') })
            if(this.timer)clearTimeout(this.timer)
            this.timer=setTimeout(()=>{this.queryData()},this.refreshTime*1000)
        },
        /**
         * 设置最大片数和车数值
         */
        setMaxValue() {
          const agv_transfer_amount = this.chartData.agv_transfer_amount || [];
          const agv_steer_amount = this.chartData.agv_steer_amount || [];
          const agv_park_amount = this.chartData.agv_park_amount || [];
          const empty_qty = this.chartData.empty_qty || [];
          const cache_amount = this.chartData.cache_amount || [];
          let countList = [];
          agv_transfer_amount.forEach((item, index) => {
            const count = item + agv_steer_amount[index] + agv_park_amount[index] + empty_qty[index] + cache_amount[index];
            countList.push(count);
          });
          const piecesMaxValue = Math.max(...countList);
          const vehiclesMaxValue = Math.max(...this.chartData.agv_qty);
          this.piecesMaxValue = this.getStandardMaxVal(piecesMaxValue, this.splitNumber);
          this.vehiclesMaxValue = this.getStandardMaxVal(vehiclesMaxValue, this.splitNumber);
        },
        /**
         * 获取标准最大值
         * @param { number } maxValue -原始最大值
         * @param { number } splitNumber -份数
         * @returns { number } 标准最大值 能被份数整除，并且大于原始最大值
         */
        getStandardMaxVal(maxValue, splitNumber) {
          const average = Math.ceil(maxValue / splitNumber);
          return (splitNumber + 1) * average;
        },
        changeColor(){
            if(this.checked){
                this.foldLineColor='#5c7bd9'
            }else{
                this.foldLineColor='#fff0'
            }
                window.requestAnimationFrame(this.chart);
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
                // yAxis: {
                //     type: 'value'
                // },
                yAxis:[
                    {
                      type: 'value',
                      name:  this.$tcache("report.inPro"),
                      // max: 420000,
                      max: this.piecesMaxValue,
                      // interval: 420000 / 5,
                      interval: this.piecesMaxValue / (this.splitNumber+1),
                      axisLabel: {
                        formatter: '{value} '+this.$tcache("report.piece")
                      }
                    },
                    {
                      type: 'value',
                      name: this.$tcache("report.numberCars"),
                      // max:12000,
                      max: this.vehiclesMaxValue,
                      // interval: 12000 / 5,
                      interval: this.vehiclesMaxValue / (this.splitNumber+1),
                      axisLabel: {
                        formatter: '{value} '+this.$tcache("report.cars")
                      }
                    }
                ],
                xAxis: {
                    type: 'category',
                    data: this.chartData.xAxis?this.chartData.   xAxis:[]
                    // data:['q','w','e','r','t',]                    
                },
                series: [
                    {
                      name: this.$tcache("report.numberCars"),
                      type: 'line',
                      smooth: true,
                      yAxisIndex: 1,
                      tooltip: {
                        valueFormatter: function (value) {
                          return value + ' '+ _this.$tcache("report.cars");
                        }
                      },
                      itemStyle: { color: this.foldLineColor },
                      data: this.chartData.agv_qty?this.chartData.agv_qty:[]
                    //   data:[5,10,35,50,10000]
                    },
                    {
                        name: this.$tcache("report.machTransProgress"),
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
                            return value + ' '+ _this.$tcache("report.piece");
                          }
                        },
                        itemStyle: { color: '#30931e' },
                        data: this.chartData.agv_transfer_amount?this.chartData.agv_transfer_amount:[]
                        // data:[10000,80000,30000,70000,10000]
                    },
                    {
                        name: this.$tcache("report.driveStatusControl"),
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
                            return value + ' '+ _this.$tcache("report.piece");
                          }
                        },
                        itemStyle: { color: '#93e673' },
                        data: this.chartData.agv_steer_amount?this.chartData.agv_steer_amount:[]
                        // data:[10000,50000,30000,70000,10000]
                    },
                    {
                        name: this.$tcache("report.standbyPointControl"),
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
                            return value + ' '+ _this.$tcache("report.piece");
                          }
                        },
                        itemStyle: { color: '#569f8f' },
                        data: this.chartData.agv_park_amount?this.chartData.agv_park_amount:[]
                        // data:[10000,50000,30000,70000,10000]
                    },
                    {
                        name: this.$tcache("report.numberEmptyCars"),
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
                            return value + ' '+ _this.$tcache("report.cars");
                          }
                        },
                        itemStyle: { color: '#88b13e' },
                        data: this.chartData.empty_qty?this.chartData.empty_qty:[]
                        // data:[10000,50000,30000,70000,10000]
                    },
                    {
                        name: this.$tcache("report.cachingProgress"),
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
                            return value + ' '+ _this.$tcache("report.piece");
                          }
                        },
                        itemStyle: { color: '#f5ce87' },
                        data: this.chartData.cache_amount?this.chartData.cache_amount:[]
                        // data:[10000,20000,30000,60000,10000]
                    },
                    {
                        name: '在制车辆号',
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
                            return value;
                          }
                        },
                        itemStyle: { color: '#fff0',opacity:0 },
                        data: this.chartData.allAgv?this.chartData.allAgv:[]
                        // data:[10000,20000,30000,60000,10000]
                    }
                ]
            };
            console.log(option);
            this.myChart.setOption(option);
            // 根据页面大小自动响应图表大小
            window.addEventListener("resize",this.resizefun);
        },
        resizefun(){
            this.myChart.resize();
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
.flex{
    display: flex;
    align-items: center;
    margin-right: 10px;
}
.carnum{
    margin-left: 20px;
}
::v-deep .ant-table-thead > tr > th, ::v-deep .ant-table-tbody > tr > td{
    text-align: center;
}

::v-deep .ant-table-body { 
    overflow: auto; 
    margin: 0 !important;
}
</style>
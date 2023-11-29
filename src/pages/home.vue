<template>
  <div>
    <!-- 统计卡片 -->
    <a-row id="show_data_wrap" type="flex" justify="space-around" align="bottom">
      <a-col :span="5" v-for="item in show_data" :key="item.type">
          <div :class="`${item.type}_card_content`">
            <div>
              <p class="count" :style="{fontSize:item.type=='anomaly'?'24px':'39px'}">{{item.type=='anomaly'?`AGV:${item.agvs} ${$tcache('home.mPlatform')}:${item.stations}`:item.online}}</p>
              <p class ="title">{{$tcache(item.text)}}</p>
              <p v-if="item.type!='qtime'">{{$tcache('home.total')}}：{{item.type=='anomaly'?item.agvs+item.stations:item.total}}</p>
              <!-- <p v-else-if="item.type=='qtime'" style="height:32px;">总片数：{{item.total}}</p> -->
              <p v-else style="height:32px;">{{$tcache('home.totalPieces')}}：{{item.total}}</p>
            </div>
            <!-- <p><a-icon :type="item.icon" :style="{fontSize:item.type=='anomaly'?'75px':'100px'}" /></p> -->
          </div>
          <p style="cursor: pointer;" :class="`${item.type}_card_foot`" @click="()=>$router.push(`${item.path}`)">
            <span>{{$tcache('home.details')}}</span><a-icon type="right-circle" />
          </p>
      </a-col>
    </a-row>
    <!-- 实时在制与Qtime柱状图 -->
    <a-row>
      <a-col class="qt" :span="12">
        <h2 >{{$tcache('home.realTimeMap')}}</h2>
        <div class="colors">
            <div class="flex">
                <div style="width:30px;border:1px solid #1a67b3;height:1px;"></div><span>{{$tcache("home.cars")}}</span>
            </div>
            <div class="lis" v-for="item in colors_onLineQtime" :key="item.color">
                <div :style="{ background: item.color }"></div>{{ $tcache(`${item.text}`) }}
            </div>
            <div class="carnum"><span>{{$tcache('home.carLine')}}：</span><a-switch v-model="checked_onLineQtime" checked_onLineQtime-children="显示" un-checked_onLineQtime-children="隐藏" @click="changeColor" /></div>
        </div>
        <div  id="main_onLineQtime"></div>
      </a-col>
      <a-col class="qt" :span="12">
        <h2>{{$tcache('home.qTimeMap')}}</h2>
        <div class="colors">
            <div class="lis" v-for="item in colors_qtime" :key="item.color">
                <div :style="{ background: item.color }"></div>{{ $tcache(`${item.text}`) }}
            </div>
        </div>
        <div id="main_qtime"></div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
      show_data:[
        {type:'agv',icon:'car',text: "home.agvOnline",online:undefined,offline:undefined,total:undefined,path:'/agvStatus'},
        {type:'station',icon:'tablet',text: "home.machineOnline",online:undefined,offline:undefined,total:undefined,path:'/onlineInfo'},
        {type:'anomaly',icon:'radar-chart',text:"home.Adevice",total:0,path:'/abnormalMachine',agvs:0,stations:0},
        {type:'qtime',icon:'pie-chart',text:"home.inProcessCar",online:0,offline:0,total:0,path:'/onLineQtimeBaskVol'},
      ],
      agv_offline: [],
      agv_online: [],
      station_offline: '',//机台在线数量
      station_online: '',//机台离线数量
      agv_data: [],
      station_data: [],
      agv_offline_child:{},
      agv_online_child:{},

      //实时在制
      chartData_onLineQtime: {},
      colors_onLineQtime: [
          { text: 'home.cacheSystem', color: '#f5ce87' },
          { text: 'home.machineTrans', color: '#30931e' },
          { text: 'home.runCondtion', color: '#05d716' },
          { text: 'home.standbyPoint', color: '#81d591' },
          { text: 'home.emptyCars', color: '#45b145' }
      ],
      theobj_onLineQtime:{},
      checked_onLineQtime:true,
      foldLineColor:'#5c7bd9',
      myChart_onLineQtime:null,
      refreshTime:30,
      splitNumber: 5,
      piecesMaxValue: 420000,
      vehiclesMaxValue: 12000,

      //Qtime
      chartData_qtime: {},
      colors_qtime: [
          { text: "home.minutes30", color: '#9ecf8e' },
          { text: "home.minutes3060", color: '#f2cc76' },
          { text: "home.minutes6090", color: '#f7b438' },
          { text: "home.minutes90120", color: '#ff8585' },
          { text: "home.minutes120", color: '#d15a68' }
      ],
      theobj_qtime:{},
      myChart_qtime:null,
      allAgvQty:0,//在制总车数
    }
  },
  created() {
    this.queryStation()
    this.queryAgv()
  },
  mounted() {
    this.queryData_onLineQtime()
    this.queryData_qtime()
  },
  beforeDestroy() {
    clearTimeout(this.timer_agvinfo)
    clearTimeout(this.timer_stationinfo)
    if(this.timer_onLineQtime)clearTimeout(this.timer_onLineQtime)
    if(this.timer_qtime)clearTimeout(this.timer_qtime)
    window.removeEventListener('resize',this.resizefun_onLineQtime)
    window.removeEventListener('resize',this.resizefun_qtime)
  },
  methods: {
    queryStation() {
      this.axios.get(`station/all`).then(res => {
        if (res.status == 200 && res.data) {
          res.data.forEach(item => {
            item['offline']=true
          })
          this.queryStationinfo(res.data.sort((a, b) => { return a.id - b.id }))
        } else {
          this.$message.warning(this.$tcache("home.MDIQFailed"))
        }
      }).catch(() => { this.$message.warning(this.$tcache("home.MDIQFailed")) })
    },
    queryStationinfo(alldata) {
      this.axios.get(`cache/stationinfo/list`).then(res => {
        if (res.status == 200 && res.data) {
          res.data.forEach(item => {
            let index =alldata.findIndex(e=>e.id==item.id)
            if(index>=0){
              if(item.id==41||item.id==71){
                console.log(item.ts,this.station_data[index]?.lastTs)
              }
              if(item.ts>this.station_data[index]?.lastTs){
                console.log(alldata[index])
                alldata[index].offline = false
              }
              alldata[index].lastTs=item.ts
              alldata[index].controlState=item.controlState
               if(item.id==76){console.log(alldata[index])}
            }
          })
          let offnum=alldata.filter(item => item.offline === true).length
          let onnum=alldata.filter(item => item.offline === false).length
          console.log(offnum,onnum)
          if(this.station_offline!=offnum||this.station_online!=onnum){
            this.station_offline = alldata.filter(item => item.offline == true)?.length
            // this.station_online = alldata.filter(item => item.offline == false).length
            this.station_online = alldata.length-this.station_offline
            // let obj={
            //   domId:'station_echart',
            //   text:'机台上线情况',
            //   name:'机台',
            //   offline:this.station_offline,
            //   online:this.station_online
            // }
              //栏目展示数据机台
            this.$set(this.show_data,1,{...this.show_data[1],...{'online':this.station_online,'offline':this.station_offline,'total':this.station_online+this.station_offline}})
            //机台绘制饼图
            // this.agvEchart(obj)
          }
          let stationerr=alldata.filter(item => item.controlState===2).length
          this.$set(this.show_data,2,{...this.show_data[2],...{'stations':stationerr}})
          this.station_data = alldata
          this.timer_stationinfo = setTimeout(() => { this.queryStation() }, 5000)
        }
      }).catch(() => { this.$message.warning(this.$tcache("home.MCQFailed")) })
    },
    queryAgv() {
      this.axios.get(`agv/all`).then(res => {
        if (res.status == 200 && res.data) {
          res.data.forEach(item => {
            item['offline']=true
          })
          this.queryAgvreply(res.data)
        }
      }).catch(() => { this.$message.warning(this.$tcache("home.ACQFailed")) })
    },
    queryAgvreply(agvdata) {
      this.axios.get(`cache/agvreply/list`).then(res => {
        if (res.status == 200 && res.data) {
          res.data.forEach(item => {
            let index = agvdata.findIndex(e => e.id == item.id)
            if(index&&index!==-1||index==0){
              if(item.ts>this.agv_data[index]?.lastTs){agvdata[index].offline=false}
              agvdata[index].lastTs=item.ts
              agvdata[index].stateTitle=item.stateTitle
            }
          })
          let offnum=agvdata.filter(item => item.offline == true).length
          let onnum=agvdata.filter(item => item.offline == false).length
          if(this.agv_offline.length!=offnum||this.agv_online.length!=onnum){
            this.agv_offline = agvdata.filter(item => item.offline == true)
            this.agv_online = agvdata.filter(item => item.offline == false)
            this.$set(this.show_data,0,{...this.show_data[0],...{'online':this.agv_online.length,'offline':this.agv_offline.length,'total':this.agv_online.length+this.agv_offline.length}})
          }
          let agverr=agvdata.filter(item => item.state === 9).length
          this.$set(this.show_data,2,{...this.show_data[2],...{'agvs':agverr}})
          let off={}
          this.agv_offline.forEach(item=>{
            if(off[item.remark]){
              off[item.remark].push(item)
            }else{
              off[item.remark]=[]
              off[item.remark].push(item)
            }
          })
          this.agv_offline_child=off
          let on={}
          this.agv_online.forEach(item=>{
            if(on[item.remark]){
              on[item.remark].push(item)
            }else{
              on[item.remark]=[]
              on[item.remark].push(item)
            }
          })
          this.agv_online_child=on
          this.agv_data = agvdata
          console.log(agvdata)
           //栏目展示数据AGV
          // let temp_station_online=this.noTitleKey_agv=='all'?this.agv_online.length:this.agv_online_child[this.noTitleKey_agv]?this.agv_online_child[this.noTitleKey_agv].length:0
          // let temp_station_offline=this.noTitleKey_agv=='all'?this.agv_offline.length:this.agv_offline_child[this.noTitleKey_agv]?this.agv_offline_child[this.noTitleKey_agv].length:0
          
          this.timer_agvinfo = setTimeout(() => { this.queryAgv() }, 5000)
        } else {
          this.$message.warning(this.$tcache("home.queryFailed"))
        }
      }).catch(() => { this.$message.warning(this.$tcache("home.queryFailed")) })
    },
    // 实时在制（有待优化）
    queryData_onLineQtime() {
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
                        this.chartData_onLineQtime.agv_qty.push({agv_qty:item.agv_qty,stepid:item.item,total_amount:item.total_amount})
                        this.chartData_onLineQtime.cache_amount.push({cache_amount:item.cache_amount,stepid:item.item})
                        this.chartData_onLineQtime.agv_transfer_amount.push({agv_transfer_amount:item.agv_transfer_amount,stepid:item.item})
                        this.chartData_onLineQtime.agv_steer_amount.push({agv_steer_amount:item.agv_steer_amount,stepid:item.item})
                        this.chartData_onLineQtime.agv_park_amount.push({agv_park_amount:item.agv_park_amount,stepid:item.item})
                        this.chartData_onLineQtime.empty_qty.push({empty_qty:item.empty_qty,stepid:item.item})
                        this.chartData_onLineQtime.xAxis.push({process:item.process,stepid:item.item})
                    }
                })
                let sd={online:0,total:0}
                this.chartData_onLineQtime.agv_qty.forEach(item=>{
                  if(item.agv_qty){sd.online+=item.agv_qty}
                  if(item.total_amount){sd.total+=item.total_amount}
                })
                this.$set(this.show_data,3,Object.assign(this.show_data[3],sd))
                console.log(this.chartData_onLineQtime.agv_qty)
                this.chartData_onLineQtime.agv_qty=this.chartData_onLineQtime.agv_qty.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_qty})
                this.chartData_onLineQtime.cache_amount=this.chartData_onLineQtime.cache_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.cache_amount})
                this.chartData_onLineQtime.agv_transfer_amount=this.chartData_onLineQtime.agv_transfer_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_transfer_amount})
                this.chartData_onLineQtime.agv_steer_amount=this.chartData_onLineQtime.agv_steer_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_steer_amount})
                this.chartData_onLineQtime.agv_park_amount=this.chartData_onLineQtime.agv_park_amount.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.agv_park_amount})
                this.chartData_onLineQtime.empty_qty=this.chartData_onLineQtime.empty_qty.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.empty_qty?x.empty_qty:0})
                this.chartData_onLineQtime.xAxis=this.chartData_onLineQtime.xAxis.sort((a,b)=>{return a.stepid-b.stepid}).map(x=>{return x.process})
                this.setMaxValue();
                setTimeout(() => {
                    this.chart_onLineQtime()
                }, 0)
            } else {
                this.$message.warning(this.$tcache("home.queryEmpty"))
            }
        }).catch(err => { this.$message.error(err) })
        if(this.timer_onLineQtime)clearTimeout(this.timer_onLineQtime)
        this.timer_onLineQtime=setTimeout(()=>{this.queryData_onLineQtime()},this.refreshTime*1000)
    },
    /**
     * 设置最大片数和车数值
     */
    setMaxValue() {
      const agv_transfer_amount = this.chartData_onLineQtime.agv_transfer_amount || [];
      const agv_steer_amount = this.chartData_onLineQtime.agv_steer_amount || [];
      const agv_park_amount = this.chartData_onLineQtime.agv_park_amount || [];
      const empty_qty = this.chartData_onLineQtime.empty_qty || [];
      const cache_amount = this.chartData_onLineQtime.cache_amount || [];
      let countList = [];
      agv_transfer_amount.forEach((item, index) => {
        const count = item + agv_steer_amount[index] + agv_park_amount[index] + empty_qty[index] + cache_amount[index];
        countList.push(count);
      });
      const piecesMaxValue = Math.max(...countList);
      const vehiclesMaxValue = Math.max(...this.chartData_onLineQtime.agv_qty);
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
        if(this.checked_onLineQtime){
            this.foldLineColor='#5c7bd9'
        }else{
            this.foldLineColor='#fff0'
        }
        setTimeout(() => {
            this.chart_onLineQtime()
        }, 0)
    },
    //柱状图
    chart_onLineQtime() {
        const _this = this;
        if((this.myChart_onLineQtime??'')!==''){
            this.myChart_onLineQtime.dispose(); //销毁
        }
        var chartDom = document.getElementById('main_onLineQtime');
        this.myChart_onLineQtime = this.$echarts.init(chartDom);
        var option 
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
                  max: this.piecesMaxValue,
                  interval: this.piecesMaxValue / (this.splitNumber+1),
                  axisLabel: {
                    formatter: '{value} 片'
                  }
                },
                {
                  type: 'value',
                  name: this.$tcache("home.cars"),
                  max: this.vehiclesMaxValue,
                  interval: this.vehiclesMaxValue / (this.splitNumber+1),
                  axisLabel: {
                    formatter: '{value} ' + _this.$tcache("home.car")
                  }
                }
            ],
            xAxis: {
                type: 'category',
                data: this.chartData_onLineQtime.xAxis?this.chartData_onLineQtime.xAxis:[]
                // data:['q','w','r','y']
            },
            series: [
                {
                  name: this.$tcache("home.cars"),
                  type: 'line',
                  smooth: true,
                  yAxisIndex: 1,
                  tooltip: {
                    valueFormatter: function (value) {
                      return value + ' ' + _this.$tcache("home.car");
                    }
                  },
                  itemStyle: { color: this.foldLineColor },
                  data: this.chartData_onLineQtime.agv_qty?this.chartData_onLineQtime.agv_qty:[]
                  // data:[5,10,35,50]
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
                        return value + ' ' + _this.$tcache("home.slice");
                      }
                    },
                    itemStyle: { color: '#30931e' },
                    data: this.chartData_onLineQtime.agv_transfer_amount?this.chartData_onLineQtime.agv_transfer_amount:[]
                    // data:[10000,50000,30000,70000]
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
                        return value + ' ' + _this.$tcache("home.slice");
                      }
                    },
                    itemStyle: { color: '#05d716' },
                    data: this.chartData_onLineQtime.agv_steer_amount?this.chartData_onLineQtime.agv_steer_amount:[]
                    // data:[10000,50000,30000,70000]
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
                        return value + ' ' + _this.$tcache("home.slice");
                      }
                    },
                    itemStyle: { color: '#81d591' },
                    data: this.chartData_onLineQtime.agv_park_amount?this.chartData_onLineQtime.agv_park_amount:[]
                    // data:[10000,50000,30000,70000]
                },
                {
                    name: this.$tcache('home.emptyCars'),
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
                        return value + ' '+_this.$tcache("home.car");
                      }
                    },
                    itemStyle: { color: '#45b145' },
                    data: this.chartData_onLineQtime.empty_qty?this.chartData_onLineQtime.empty_qty:[]
                    // data:[10000,50000,30000,70000]
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
                        return value + ' ' + _this.$tcache("home.slice");
                      }
                    },
                    itemStyle: { color: '#f5ce87' },
                    data: this.chartData_onLineQtime.cache_amount?this.chartData_onLineQtime.cache_amount:[]
                    // data:[10000,50000,30000,70000]
                }
            ]
        };
        this.myChart_onLineQtime.setOption(option);
        // 根据页面大小自动响应图表大小
        window.addEventListener("resize",this.resizefun_onLineQtime);
    },
    resizefun_onLineQtime(){
        this.myChart_onLineQtime.resize();
    },

    //Qtime(有待优化)
    queryData_qtime() {
        this.chartData_qtime={in30: [],in60: [],in90: [],in120: [],out120: [],xAxis: []}
        this.theobj_qtime={}
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
                this.$message.warning(this.$tcache("home.queryEmpty"))
            }
        }).catch(err => { this.$message.error(err) })
        if(this.timer_qtime)clearTimeout(this.timer_qtime)
        this.timer_qtime=setTimeout(()=>{this.queryData_qtime()},this.refreshTime*1000)
    },
    //柱状图
    chart_qtime() {
        const _this = this;
        if((this.myChart_qtime??'')!==''){
            this.myChart_qtime.dispose(); //销毁
        }
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
                name: this.$tcache("home.cars"),
                // interval: 3,
                axisLabel: {
                  formatter: '{value} ' + this.$tcache("home.car")
                }
            },
            xAxis: {
                type: 'category',
                data: this.chartData_qtime.xAxis?this.chartData_qtime.xAxis:[]
                // data:['q','w','r','y','u']
            },
            series: [
                {
                    name: this.$tcache("home.minutes30"),
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
                        return value + ' ' + _this.$tcache("home.car");
                      }
                    },
                    itemStyle: { color: '#9ecf8e' },
                    data: this.chartData_qtime.in30?this.chartData_qtime.in30:[]
                    // data:[5,10,35,50,70]
                },
                {
                    name: this.$tcache("home.minutes3060"),
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
                        return value + ' '+_this.$tcache("home.car") ;
                      }
                    },
                    itemStyle: { color: '#f2cc76' },
                    data: this.chartData_qtime.in60?this.chartData_qtime.in60:[]
                    // data:[5,10,35,50,70]
                },
                {
                    name: this.$tcache("home.minutes6090"),
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
                        return value + ' '+_this.$tcache("home.car");
                      }
                    },
                    itemStyle: { color: '#f7b438' },
                    data: this.chartData_qtime.in90?this.chartData_qtime.in90:[]
                    // data:[5,10,35,50,70]
                },
                {
                    name: this.$tcache("home.minutes90120"),
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    tooltip: {
                      valueFormatter: function (value) {
                        return value + ' ' + _this.$tcache("home.car");
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
                    name: this.$tcache("home.minutes120"),
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
                        return value + ' '+_this.$tcache("home.car");
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
@import '~@/assets/scss/style.scss';
::v-deep .table-striped {
  background-color: #f0f0f0;
}
::v-deep .ant-table-thead>tr>th {
  background-color: $bgcolor !important;
  color: $color;
}
::v-deep .ant-table-title {
  background: #fafafa;
}
::v-deep .ant-card-grid {
  margin: 1px;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}
::v-deep .ant-tabs-nav .ant-tabs-tab {
  margin: 0;
}
::v-deep .ant-tabs .ant-tabs-large-bar .ant-tabs-tab {
  padding: 10px;
}

#agv_echart,#station_echart {
  width: 50%;
  height: 400px;
}
#show_data_wrap {
  padding-bottom: 26px;
  color:#fff;
  .ant-col{
    background:#00acd7;
    border-radius: 5px;
    div{
      border-radius: 5px 5px 0 0;
      overflow: hidden;
      .count{
        font-size:39px;
        padding: 0 10px 0px;
        height: 59px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .title{font-size:15px;padding: 13px;padding-bottom: 0;}
      // p{background:#00c0ef;}
      p i{color:#00a3cb;font-size:100px;text-align: right; }
    }
    p{
      font-size: 12px;padding:7px;border-radius:0 0 5px 5px;
      i{padding-left:6px;}
    }
    .agv_card_content{background:#00c0ef}
    .station_card_content{
      background:#00a65a;
      i{color:#009551}
    }
    .station_card_foot{background:#009551}
    .anomaly_card_content{
      background: #f39c12;
      i{color:#da8c10}
    }
    .anomaly_card_foot{background:#da8c10}
    .qtime_card_content{
      background: #f56954;
      i{color:#dc5e4b}
    }
    .qtime_card_foot{background:#dc5e4b}
  }
}

#main_onLineQtime,#main_qtime {
    max-height: 500px;
    height: 500px;
}
.colors {
    display: flex;
    padding-top:10px;
    justify-content: center;
    flex-wrap: wrap;
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
.qt{
  border: 1px dashed rgb(232, 232, 232);
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
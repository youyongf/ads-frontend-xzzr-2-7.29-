<template>
  <div>
    <div class="header">
      <!-- <a-date-picker :allowClear="false" v-model="keyValue_begin" placeholder="请选择开始日期" :locale="locale" @change="stateTimeBegin_onChange" />
      <a-date-picker :allowClear="false" v-model="keyValue_end" placeholder="请选择结束日期" :locale="locale" @change="stateTimeEnd_onChange" /> -->
      <span>{{$tcache('monitor.offlineDays')}}：</span><a-input style="width:100px;margin-right:5px;" v-model="offlineDay"/>
      <a-button class="check_btn" @click="check"><span class="fontSty">{{$tcache('common.query')}}</span></a-button>
    </div>
    
    <div class="fixed">
      <div style="z-index:5;text-align: right;" :title="$tcache('monitor.offlineTable')">
        <a-button type="primary" :hidden="visible_tool" @click="visible_tool=true"><a-icon type="border-left" /></a-button>
        <a-button type="primary" :hidden="!visible_tool" @click="visible_tool=false"><a-icon type="border-right" /></a-button>
      </div>
      <a-table v-show="visible_tool" :columns="columns1" :data-source="offlinePoints" rowKey="id" style="background: rgba(255,255,255,.8);padding: 10px;border-radius: 10px;" :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)">
        <div slot="status" slot-scope="text">{{text=='offline'?$tcache('common.offLine'):$tcache('common.onLine')}}</div>
        <div slot="ts" slot-scope="text">{{text | fmtDateTime}}</div>
        <div slot="agvId" slot-scope="text">
          <a-tooltip style="max-width:200px;overflow:hidden;">
            <template slot="title">
              <span class="fontSty">{{ text.join(',') }}</span>
            </template>
            <a-button><span class="fontSty">{{ text.join(',') }}</span></a-button>
          </a-tooltip>
        </div>
      </a-table>
    </div>
    <div class="mask">
      <svg xmlns="http://www.w3.org/2000/svg" :width="map.width" :height="map.height" id="map" ref="map" class="svgbg">
        <g v-for="r in offlinePoints" :key="'rp'+r.id" >
          <circle :cx="r.ax" :cy="r.ay" r="25" style="fill: #ffa50030;">
            <title>{{r.agvId}}</title>
          </circle>
          <!-- <text v-if="r.agvIds" :dx="r.ax-20" :dy="r.ay-10" style="fill: blue;">
            {{r.agvId}}
          </text> -->
        </g>
        <circle r="6" :cx="originDot.ax" :cy="originDot.ay" class="origin" ><title>{{$tcache('monitor.origin')}}</title></circle>
        <circle style="fill: #9a9a9a;" v-for="p in offlinePoints" :key="'p'+p.id" r="5" :cx="p.ax" :cy="p.ay" :class="'dot '+ p.cls" :id="'dot'+p.id" :data-id="p.id" :title="p.remark" @mouseover="dotHover" >
          <title>{{p.agvId}} ({{p.x}},{{p.y}})</title>
        </circle>

        <circle r="4" :cx="originDot.ax" :cy="originDot.ay" class="origin" ><title>{{$tcache('monitor.origin')}}</title></circle>
        <circle v-for="p in points" :key="'p'+p.id" r="3" :cx="p.ax" :cy="p.ay" :class="'dot '+ p.cls" :id="'dot'+p.id" :data-id="p.id" :title="p.remark" @mouseover="dotHover">
          <title>{{p.id}} ({{p.x}},{{p.y}}) {{p.remark}}</title>
        </circle>
        


        <g class="station" v-for="r in rects" :key="'r'+r.id" @click="showDrawer" @mouseover="showStationInfo">
          <rect :data-id="r.id" :x="r.x" :y="r.y" :width="r.width" :height="r.height" :class="r.cls">
            <title>{{r.title}}</title>
          </rect>
          <text v-if="!(workName.includes('宿迁阿特斯前段')&&(r.title.includes('RCA')||r.title.includes('BSG')))" :x="r.x" :y="r.y" :dx="r.dx" :dy="r.dy" :writing-mode="r.writingMode">
            {{r.title}}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import {axiosget} from "../../utils";
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
const tableData = require('../../data/columns_offline_point.json');
export default {
  name: "station_map",
  data(){
    return{
      map:{width:900, height:800},
      route:{},
      routes:[],
      points:[],
      stations:[],
      //矩形（机台）
      rects:[],
      rect_width: 30, //矩形宽（面对车辆的边）

      //svg相关
      margin: {x: 150, y:150}, //预留边界
      zoomScale: 40, //绽放比率(实际坐标与屏幕坐标比值)
      originDot: {ax: 0, ay: 0}, //原点的屏幕坐标

      //对接位操作面板相关
      visibleDrawer: false,
      placement: 'right',
      currStation: {},//当前点击或mouseover的station
      stations_checked:[],

      //输入框及焦点
      focused:'', //焦点输入域ID
      parks:null,
      rel_pids:null,
      area:null,

      steps:[],//步骤名称
      areas:[
        {code: 1, name: this.$tcache('monitor.oneSpan')},
        {code: 2, name: this.$tcache('monitor.twoSpan')}
      ],
      downStations:[],//下游机台选项内容
      downCacheStations:[],//下游缓存机选项内容
      ids:'',
      nextCacheStations:'',
      nextStations:'',
      offlineDay:7,//点位离线天数
      offlinePoints:[],//离线点位集合数组
      form:{}, //查询条件
      keyValue_begin:'',//开始时间选择器的值
      keyValue_end:'',//结束时间选择器的值
      locale,//时间选择器中文文件

      data1: [],
      visible_tool:false,
      // TODO
      workName:localStorage.getItem('workName')
    }
  },
  computed: {
    columns1() {
      return this.$transformI18n(tableData)
    }
  },
  beforeMount() {
    this.querySteps()
  },
  mounted() {
    this.init()
  },
  methods:{
    querySteps(){
      axiosget(`step/all`,{}, (data)=>{
        if(data){this.steps=data}
      })
    },
    onClose(){
      this.visibleDrawer=false
    },
    init(){
      this.axios.all([this.queryPoints(), this.queryStations()])
          .then(this.axios.spread((res1,res2)=>{
          if(res1.status == 200){
            res1.data=res1.data.filter(d=>d.x!==999999)
            this.points = this.makePointsData(res1.data)
            if(this.points.length == 0){
              this.$notification.warn({message:this.$tcache('common.prompt'), description: this.$tcache('monitor.tips01')})
            }
          }
          if(res2.status == 200){
            this.stations = res2.data
            if(this.stations.length == 0){
              this.$notification.warn({message:this.$tcache('common.prompt'), description: this.$tcache('monitor.tips02')})
            }
          }
          this.makeSvgData(this.points, res2.data)
        })).catch(err=>{
          this.$message.error(err)
        })

    },
    //查询对接点、退出点
    queryPoints(){
      return this.axios.get(`point/all`)
    },
    //查询所有机台（与点位相关的数据）
    queryStations(){
      let columns = `id,name,process,step,next_step,next_stations,next_cache_stations,parks,rel_pids,area,do_point,exit_point,station_type`
      return this.axios.get(`station/queryLimitColumns/${columns}`)
    },
    //遍历所有点位，根据比率确定屏幕坐标，计算偏移量将点位移到屏幕区[暂不处理旋转]
    //增加p.ax, p.ay
    makePointsData(points){
      //1. y -> -y and zoom in
      let minx=0,miny=0,maxx=0,maxy=0
      points.forEach(p=>{
        p['ax'] = p.x / this.zoomScale
        p['ay'] = -p.y / this.zoomScale
        if(p.ax<minx) minx = p.ax
        if(p.ay<miny) miny = p.ay
        if(p.ax>maxx) maxx = p.ax
        if(p.ay>maxy) maxy = p.ay
      })
      //2. 计算svg大小
      this.map.width = maxx-minx + this.margin.x * 2
      this.map.height = maxy-miny + this.margin.y * 2
      //2. compute offset
      let offset = {ax: -minx + this.margin.x, ay: -miny + this.margin.y}
      this.originDot = offset
      console.log(`offset:`, offset)
      //3. offset to screen
      points.forEach(p=>{
        p.ax = p.ax + offset.ax
        p.ay = p.ay + offset.ay
        //设置样式cls
        p.cls = this.makePointStyle(p.type)
      })
      this.queryOfflinePoints()
      return points
    },
    makePointStyle(pointType){
      if(pointType){
        if(pointType == 'DECIDE'){
          return 'ptype_red'
        }else if(pointType == 'TRANS'||pointType == 'TRANS_EXIT'){
          return 'ptype_green'
        }else if(pointType == 'CHARGE'||pointType == 'CHARGE_EXIT'){
          return 'ptype_orange'
        }else if(pointType == 'PARK'){
          return 'ptype_blue'
        }else{
          return ''
        }
      }
      return ''
    },

    //绘制矩形（机台）
    makeSvgData(points, stations){
      //printList(`stations`, stations)
      let rects = []
      for (let i = 0; i < stations.length; i++) {
        let st = stations[i]
        if(!st.doPoint||!st.exitPoint){
          console.log(`机台配置：`, st.id, st.name, st.doPoint, st.exitPoint, st.stationType)
          this.$notification.error({message: this.$tcache('monitor.makeSvgErrTips01', {id: st.id}), description: this.$tcache('monitor.makeSvgErrTips01', {doPoint: st.doPoint, exitPoint: st.exitPoint})})
          continue
        }

        let p0 = points.find(p=>p.id==st.doPoint)
        let p1 = points.find(p=>p.id==st.exitPoint)
        if(!p0 || !p1){
          console.log(`机台${st.id}对接点配置错误，不存在的点位号：${st.doPoint},${st.exitPoint}`)
          this.$notification.error({message:this.$tcache('monitor.makeSvgErrTips01', {id: st.id}), description:this.$tcache('monitor.makeSvgErrTips02', {doPoint: st.doPoint, exitPoint: st.exitPoint})})
          continue
        }
        //console.log(p0.ax,p0.ay, p1.ax,p1.ay)
        //计算矩形坐标、尺寸
        let size = 3
        if(st.stationType==2||st.stationType==3||st.name.includes('SE')){//一些长度特殊的机台
          size = 4
        }else if((st.name.includes('RCA')||st.name.includes('BSG'))&&this.workName.includes('宿迁阿特斯前段')){//宿迁阿特斯前段
          size=2.5
        }else{
          size = 7
        }

        let rect = this.makeRect(p0.ax,p0.ay, p1.ax,p1.ay, size, (st.id+'-'+st.name).length)
        rect['id'] = st.id
        rect['title'] = `${st.id}-${st.name}`
        rect['cls'] = ''
        rects.push(rect)
      }
      this.rects = rects
    },

    /**
     * 在对接工位点（ax,ay）一侧画矩形. 暂不考虑倾斜的情况，即实际相对位置一般为上下或左右
     * @param ax 对接点x
     * @param ay 对接点y
     * @param ax2 退出点y(比较点x)
     * @param ay2 退出点y(比较点y)
     * @param size 机台尺寸（对接口宽度的倍数）
     * @returns {{x: number, width: number, y: number, height: number}} 长方形 宽*2=长
     */
    makeRect(ax, ay, ax2, ay2, size, textnum) {
      //let wid = distance(ax,ay,ax2,ay2) * 0.75 //对接口宽度≈车宽≈两点间距3/4
      let wid = this.rect_width //对接口宽度
      size = wid * size //对接口宽度倍数，用来控制机台长度
      // let angle = Math.atan2(ay-ay2, ax-ax2)
      let angle = Math.atan2(ay-ay2, ax-ax2)*(180/Math.PI)
      let rect = {}
      // if(angle>-0.1 && angle<0.1){ //对接位在退出点右侧
      if((angle>-20&&angle<20)){ //对接位在退出点右侧
        rect = {x: ax+5, y: ay-wid/2, width:size, height:wid,}
        //文字方向、位置
        // rect.dy = rect.width
        rect.dx = 10
        rect.dy = 20
        rect.writingMode = 'lr'
      // }else if(angle>Math.PI/2 -0.1 && angle< Math.PI/2 +0.1){ //对接位在退出点下侧
      }else if(angle>70 && angle< 110){ //对接位在退出点下侧
        rect = {x: ax-wid/2, y: ay+5, width:wid, height:size}//相对于对接点，向下偏移5
        // rect.dx = rect.width/2 //文字居中坚向显示
        rect.dx = 10
        rect.dy = 5
        rect.writingMode = 'tb'
      // }else if(angle>Math.PI -0.1 && angle<Math.PI +0.1){ //对接位在退出点左侧
      }else if(angle>160 ||(angle>-180&&angle<-160)){ //对接位在退出点左侧
        rect = {x: ax-5-size, y: ay-wid/2, width:size, height:wid} //相对于对接点，向左偏移5
        rect.dx = rect.width - 12*textnum //矩形长度-文字长度[即文字靠右显示]
        // rect.dy = rect.width
        // rect.dx = 10
        rect.dy = 20
        rect.writingMode = 'lr'
      }else{ //对接位在退出点上侧
        rect = {x: ax-wid/2, y: ay-5-size, width:wid, height:size} ////相对于对接点，向上偏移5
        // rect.dx = rect.width/2
        rect.dy = rect.height - 12*textnum //矩形长度-文字长度[即文字靠下显示]
        rect.dx = 10
        // rect.dy = 5
        rect.writingMode = 'tb'
      }
      return rect
    },
    dotHover(evt){
      console.log(evt.target.dataset.id)
    },
    clearPointStatus(excludeId){
      this.dotOut()
      this.points.forEach(p=>{
        if(p.cls && p.cls.includes('focus')){
          if(!excludeId || excludeId != p.id){
            p.cls = p.cls.replace('focus', '');
          }
        }
      })
    },

    rectClick(evt){
      let id = evt.target.dataset.id
      let rect = this.rects.find(e=>e.id == id)
      if(rect.cls.includes('checked')){
        rect.cls = rect.cls.replace(' checked', '')
        //删除选择机台
        let idx = this.stations_checked.findIndex(e=>e.id == id)
        this.stations_checked.splice(idx, 1)
      }else{
        rect.cls = rect.cls + ' checked'
        //添加选择机台
        let station = this.stations.find(s=>s.id==id)
        this.stations_checked.push(station)
        console.log(station, this.stations_checked)
      }
      let idsarr=[]
      this.stations_checked.forEach(item=>idsarr.push(item.id))
      this.ids=idsarr.join(',')
    },
    showStationInfo(evt){
      //console.log(evt.target.tagName)
      if(evt.target.tagName == 'rect'){
        let id = evt.target.dataset.id
        let station = this.stations.find(s=>s.id==id)
        this.currStation = station
      }
    },
    //对接位操作面板相关
    showDrawer(){
      this.visibleDrawer=true
    },
    focusInput(evt){
      this.focused = evt.target.id
      console.log(`focused:${evt.target.id}`, this[this.focused])
    },
    check(){
      // if(!this.form.stateTimeBegin||!this.form.stateTimeEnd){
      //   this.$message.info('请选择开始时间与结束时间')
      //   return;
      // }
      // let tim=this.form.stateTimeEnd-this.form.stateTimeBegin
      // let data=tim/(1000*60*60*24)
      // this.offlineDay=data
      this.queryOfflinePoints()
    },
    //查询离线点位
    queryOfflinePoints(){
      this.axios.get(`offlinelog/off/latest/${this.offlineDay}`).then(res=>{
        if(res.status == 200){
          // this.offlinePoints=res.data
          let pdata=[]
          if(res.data){
            // let minx=0,miny=0,maxx=0,maxy=0
            pdata=[...res.data]
            pdata.forEach(p=>{
              p.x=p.x*10
              p.y=p.y*10
              p['ax'] = p.x / this.zoomScale
              p['ay'] = -p.y / this.zoomScale
            })
            let map=new Map()
            pdata.forEach(p=>{
              let xyid=map.get(`${p.x},${p.y}`)
              if(map.has(`${p.x},${p.y}`)&&!xyid?.includes(p.agvId)){
                xyid.push(p.agvId)
                p.agvId=xyid
                p.agvIds=p.agvId.length?p.agvId.length:0
              }else{
                p.agvId=[p.agvId]
              }
              p.ax = p.ax + this.originDot.ax
              p.ay = p.ay + this.originDot.ay
              map.set(`${p.x},${p.y}`,p.agvId)
            })
          }
          this.offlinePoints=pdata
          this.$message.success(this.$tcache('common.querySuccess'))
          console.log('离线点位',this.offlinePoints)
        }else{
          this.$message.warning(this.$tcache('monitor.pointGetfail'))
        } 
      }).catch(err=>{this.$message.error(err)})
    },
    stateTimeBegin_onChange(date, dateString) {
      console.log('stateTimeBegin',date, dateString);
      this.form.stateTimeBegin= new Date(dateString.replace(/-/g,'/')).getTime()
    },
    stateTimeEnd_onChange(date, dateString) {
      console.log('stateTimeEnd',date, dateString);
      this.form.stateTimeEnd=new Date(dateString.replace(/-/g,'/')).getTime()
    },
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss/map_bright";

.svgbg{
  background-color: #eeeeee;
}
.blockinfo{
  background-color: #ededed;
}
.changeWidth{
  width: 100px;
}
::v-deep .ant-col{
  margin-bottom: 5px;
}
::v-deep .ant-drawer-title{
  text-align: center;
}
::v-deep .ant-drawer-body{
  padding:5px 24px;
}
.val{
  color: #1890ff;
}
.mask{
  margin: 10px auto;
  overflow: auto;
  height: 70vh;
}
.header{
  // height: 30vh;
}
::v-deep .table-striped {
  background-color: #f0f0f078;
}
.fixed{
  position: fixed;
  right: 0;
}
</style>
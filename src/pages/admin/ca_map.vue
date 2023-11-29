<template>
  <div>
    <a-affix :style="{ position: 'absolute', top: 50, left: 50, width:'500px'}">
      <a-row :gutter="[16,16]">
        <a-col :span="6">
          <a-tag>{{$tcache('admin.screenCoordinate')}}({{ax}}, {{ay}})</a-tag>
        </a-col>
        <a-col :span="6">
          <a-tag>{{$tcache('admin.slamCoordinates')}}({{x}}, {{y}})</a-tag>
        </a-col>
      </a-row>
    </a-affix>

    <div>

    <svg xmlns="http://www.w3.org/2000/svg" :width="map.width" :height="map.height" id="map" ref="map" class="svgbg" @click="clickSVG"  @mousemove="mouseoverSVG">
      <!-- 交管区：放在最低层，避免覆盖其它 -->
      <polygon v-for="(item,i) in ctrlareas" :key="'ca'+item.id" :data-idx="i" :points="item.points" :class="item.cls" @click="caClick">
        <!-- <title>提示：双击在多边形内部生成点位</title> -->
      </polygon>

<!--      <polyline v-if="route.pointstr" :points="route.pointstr" :style="route.style" />-->
      <!-- <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" 
        refX="3" refY="3" orient="auto" markerUnits="strokewidth">
          <path d="M0,0 L0,6 L9,3 Z" fill="#6565fd" />
        </marker>
      </defs> -->
      <g v-show="switch2">
         <!-- marker-start="url(#arrowhead)" marker-mid="url(#arrowhead)" marker-end="url(#arrowhead)" -->
        <polyline v-for="r in routes" :key="'r'+r.id" :points="r.pointstr" :style="r.style" :data-id="r.id" @click="highlightRoute" >
          <title>{{r.id}}[{{r.points}}]</title>
          <animate v-if="r.cls=='focus'" attributeName='stroke-width' dur='1s' values="1;6;1" repeatCount="indefinite"/>
        </polyline>
      </g>
      <circle r="4" :cx="originDot.ax" :cy="originDot.ay" class="origin" ><title>{{$tcache('admin.origin')}}</title></circle>
      <circle v-for="p in points" :key="'p'+p.id" r="3" :cx="p.ax" :cy="p.ay" :class="'dot '+ p.cls" :id="'dot'+p.id" :data-id="p.id" :title="p.remark" @mouseover="dotHover" @click="dotClick">
        <title>{{p.id}} ({{p.x}},{{p.y}}) {{p.remark}}</title>
      </circle>
      <g class="station" v-for="r in rects" :key="'r'+r.id" >
        <rect :data-id="r.id" :x="r.x" :y="r.y" :width="r.width" :height="r.height" :class="r.cls" >
          <title>{{r.title}}</title>
        </rect>
        <text v-if="!(map.name.includes('宿迁阿特斯前段')&&(r.title.includes('RCA')||r.title.includes('BSG')))" :x="r.x" :y="r.y" :dx="r.dx" :dy="r.dy" :writing-mode="r.writingMode">
          {{r.title}}
        </text>
      </g>
      <g v-for="(p,i) in ca.axys" :key="'vt'+i">
          <!-- 当前交管区顶点（放在最顶层） -->
        <circle r="5" :cx="p[0]" :cy="p[1]" :class="tagIndex==i?'dot focus':'dot'" :data-idx="i" @click="vertexClick">
          <title>{{i}}({{ca.bxys[i][0]}}, {{ca.bxys[i][1]}}){{$tcache('admin.changeCoordinates')}}</title>
        </circle>
        <text :x="p[0]+5" :y="p[1]+5">{{i}}</text>
      </g>

    </svg>

    </div>

    
    <div @click="visibleDrawer = true" class="icon" :title="$tcache('admin.drawerTitle')"><Icon type="ios-cog-outline" /></div>
    <a-drawer :title="$tcache('admin.drawerTitle01')"
             :placement="placement"
             :closable="true" @close="visibleDrawer=false"
             :visible="visibleDrawer" :mask="false"
             >
      <a-row>
        <a-col :span="24">{{$tcache('admin.showRoutes')}}：</a-col>
        <a-col :span="24">
          <a-radio-group v-model="routefilter" button-style="solid" @change="changeRouteFilter">
          <!-- <a-radio-button value="all">{{$tcache('admin.all')}}</a-radio-button> -->
          <a-radio-button value="start">{{$tcache('admin.startPoint')}}</a-radio-button>
          <!-- <a-radio-button value="middle">{{$tcache('admin.midpoint')}}</a-radio-button> -->
          <a-radio-button value="end">{{$tcache('admin.endPont')}}</a-radio-button>
        </a-radio-group>
        </a-col>
      </a-row>
      <!-- todo 改为Form-item组件，增加rules校验 -->
      <a-row type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="bgcolor">
        
        <a-col :span="24">{{$tcache('common.point')}}：
          <a-button v-if="selectedPoint==''">{{$tcache('admin.noChecked')}}</a-button>
          <a-button v-if="selectedPoint!=''" @click="selectedPoint=''">{{$tcache('admin.cancelChecked')}}</a-button>
        </a-col>
        <a-col :span="24">{{$tcache('admin.drawRegion')}}：<i-switch v-model="switch1"  /></a-col>
        <a-col :span="24">{{$tcache('common.route')}}：
          <i-switch size="large" v-model="switch2">
            <span slot="open">{{$tcache('admin.show')}}</span>
            <span slot="close">{{$tcache('admin.hidden')}}</span>
          </i-switch>
        </a-col>
        <a-col :span="24">{{$tcache('admin.caMap01')}}：{{ca.id}}<a-input v-model="ca.name" :placeholder="$tcache('admin.placeholder01')" /></a-col>
      </a-row>
      <a-row type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="bgcolor" :title="$tcache('admin.title01')">
        <a-col :span="24" >
          <a-tag v-for="(p,i) in ca.bxys" :key="'tag'+i" :data-idx="i" :color="i|getColor" @click="clickTag"><a-icon v-if="i==tagIndex" type="caret-right" theme="filled" />{{i}}:{{p[0]}},{{p[1]}}</a-tag>
        </a-col>
        <a-col :span="24">
          <a-button :type="tagIndex<=0?'':'primary'" :disabled="tagIndex<=0?true:false" @click="handleMove(-1)"> <a-icon type="left" />{{$tcache('admin.mForward')}} </a-button>
          <a-button :type="tagIndex<0 || tagIndex>=ca.bxys.length-1?'':'primary'" :disabled="tagIndex<0||tagIndex>=ca.bxys.length-1?true:false" @click="handleMove(1)"> {{$tcache('admin.mBack')}}<a-icon type="right" /> </a-button>
        </a-col>
      </a-row>
      <a-row type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="bgcolor">
        <a-col :span="24">
          {{$tcache('admin.type')}}：<a-select v-model="ca.type" :options="[{value:1,label:$tcache('admin.type01')},{value:2,label:$tcache('admin.type02')},{value:3,label:$tcache('admin.type03')},{value:4,label:$tcache('admin.type04')}]" style="width: 200px;"></a-select>
        </a-col>
        <a-col v-if="isAdmin" class="flex-cen" :span="24" style="border: 1px dashed #cbc7c7;">
          <a-col :span="24">{{$tcache('admin.release')}}：<a-switch  v-model="obstacleAvoidanceMode" checked-children="0" un-checked-children="1" /></a-col>
          <a-button type="primary" size="small" @click="clearCtrlArea">{{$tcache('admin.newBuilt')}}</a-button>
          <a-button :disabled="saveState" type="primary" size="small" @click="saveCtrlArea">{{$tcache('common.save')}}</a-button>
          <a-button size="small" @click="resetCtrlArea">{{$tcache('common.reset')}}</a-button>
          <a-button type="danger" size="small" @click="showModal">{{$tcache('admin.deleteRegion')}}</a-button>
        </a-col>
      </a-row>
      <a-modal v-model="deleteArea" :title="$tcache('admin.title02')" @ok="handleOk">
        <p>{{$tcache('admin.confirmDel')}}</p>
      </a-modal>

      <p style="text-align:center;">{{$tcache('admin.asRoute')}}</p>
      <a-row style="margin-bottom:10px;" type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="bgcolor">
        <a-col :span="22" :offset="2"  style="max-height:200px;overflow:auto;">
          <div :title="item.points" class="select-route" :class="item.cls?'skyblue':''" v-for="(item,index) in routes" :key="index" @click="highlightRoute2(item)">
            {{$tcache('common.route')}}<span style="background: whitesmoke;padding:5px;">{{item.id?item.id:''}}：{{item.points?item.points:''}}</span>
          </div>
        </a-col>
      </a-row>
    </a-drawer>
  </div>
</template>

<script>/**
 * 交管区位置图(同时显示机台、点位、路线）
 * 前置条件：station表的doPoint,exitPoint均已经设置好。
 * 1. point表中设置类型的点位
 * 2. 机台与点位设置相关的数据
 * 3. 根据station表中对接位（doPoint,exitPoint）,确定机台的方位，生成矩形绘制机台（矩形、坐标、文字、事件）
 * 4. 鼠标点击采集坐标，并转换为车辆激光坐标，创建交管区域，并保存
 */
import {axiosget} from "../../utils";
var POINT_SEP = process.env.VUE_APP_POINT_SEP||'-'; //路线中的点的分隔符，默认减号
const COLORS = ['red','orange','green','cyan','blue','purple','brown','coral','chocolate','#f50','#2db7f5','#87d068','#108ee9']
export default {
  name: "ca_map",
  data(){
    return{
      map:{width:900, height:800},
      route:{},
      routes:[],
      points:[],
      stations:[],
      ctrlareas:[], //交管区
      //矩形（机台）
      rects:[],
      rect_width: 30, //矩形宽（面对车辆的边）
      xy_range:{minx:0,miny:0,maxx:0,maxy:0},//点位坐标极值范围

      //svg相关
      margin: {x: 150, y:150}, //预留边界
      zoomScale: 50, //绽放比率(实际坐标与屏幕坐标比值)
      originDot: {ax: 0, ay: 0}, //原点的屏幕坐标
      //当前鼠标点位信息
      ax:null,ay:null,x:null,y:null,

      //当前交管区：axes(数据库保存值),axys:屏幕坐标，bxys:SLAM坐标
      ca: {name:'',axes:'',axys:[],bxys:[],cls:'ca'},
      caIndex: -1, //当前选择交管区index

      //操作面板相关
      visibleDrawer: false,
      placement: 'right',
      //调整坐标次序
      tagIndex: -1,
      switch1: false,//绘制交管区开关
      switch2: true,//绘制交管区开关
      selectedPoint:'',
      saveState:false,//保存状态(防止多次保存一个交管区)
      deleteArea:false,//交管区删除弹窗
      obstacleAvoidanceMode:true,//是否具备避障释放(1:不具备避障释放,0:具备避障释放)
      saveSuccess:false,
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      bgSize:'',//背景图缩放比例
      bgX:0,//背景图X轴偏移量
      bgY:0,//背景图Y轴偏移量
      // enabled:localStorage.getItem('bgimageEnabled')?localStorage.getItem('bgimageEnabled')=='true'?true:false:false,//背景图显示或隐藏状态
      enabled:true,
      imgUrl:require(`../../../public/img/map.svg`),

      routefilter:'', // {all,start,middle,end}, //过滤路线的匹配点
      point:{},
    }
  },
  filters:{
    fmtPoints(val){
      return val.join(' ')
    },
    getColor(val){
      // let r = val + 33
      // return `rgb(${r},${r},${r})`
      return COLORS[val % COLORS.length]
    },
  },
  mounted() {
    this.init2()
    // this.init()
    //延时检查交管区点位是否超出范围
    setTimeout(()=>{
      this.verifyCaAxes()
    }, 2000)
    // this.queryBgInfo()
  },
  methods:{
    init(){
      this.axios.all([this.queryPoints(), this.queryStations(), this.queryCtrlAreas()])
          .then(this.axios.spread((res1,res2,res3)=>{
          if(res1.status == 200){
            res1.data=res1.data.filter(p=>p.x!==999999)
            this.points = this.makePointsData(res1.data)
          }
          if(res2.status == 200){
            this.stations = res2.data
          }
          if(res3.status == 200){
            this.makeCaMapData(res3.data)
          }
          this.makeSvgData(this.points, res2.data)
        })).catch(err=>{
          this.$message.error(`${this.$tcache('admin.error01')}: ${err}`)
        })

    },
    init2(){
      this.axios.get(`config/list`)
      .then(res=>{
        if(res.status == 200){
          if(res.data.length){
              //map.width,map.height,map.offsetX,map.offsetY,map.zoomScale,map.rotate
              let w=0,h=0
              for (let i = 0; i < res.data.length; i++) {
                let row = res.data[i]
                if(row.key == 'map.width'){
                  // this.map.width = Number.parseInt(row.value)
                  w=Number.parseInt(row.value)
                  // this.map.width = 500
                }else if(row.key == 'map.height'){
                  // this.map.height = Number.parseInt(row.value)
                  h=Number.parseInt(row.value)
                  // this.map.height = 300
                }else if(row.key == 'map.offsetX'){
                  this.map.offsetX = Number.parseInt(row.value)
                  // this.map.offsetX =  195
                }else if(row.key == 'map.offsetY'){
                  this.map.offsetY = Number.parseInt(row.value)
                  // this.map.offsetY = 200
                }else if(row.key == 'map.zoomScale'){
                  this.map.zoomScale = Number.parseInt(row.value)
                  // this.map.zoomScale = 50
                }else if(row.key == 'map.rotate'){
                  this.map.rotate = Number.parseInt(row.value)
                  if(this.map.rotate==270)this.map.rotate=-90
                  // this.map.rotate = 90
                }else if(row.key == 'workshop.name'){
                  this.map.name = row.value
                }
              }
              this.bgSize=`${w}px ${h}px`
              if(Object.keys(this.map).length < 6){
                this.$message.error(this.$tcache('admin.error02'))
              }
              this.init()
            }
          }
      }).catch(err=>{
        console.error(err)
        this.$message.error(this.$tcache('admin.error03'))
      })
    },

    changeRouteFilter(){
      if(this.routefilter && this.point.id){
        this.queryRouteByPass(this.point.id)
      }
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
    queryCtrlAreas() {
      return this.axios.get(`ca/all`)
    },
    changeEnabled(){
      this.enabled=!this.enabled
      localStorage.setItem('bgimageEnabled',this.enabled)
    },
    //遍历所有点位，根据比率确定屏幕坐标，计算偏移量将点位移到屏幕区[暂不处理旋转]
    //增加p.ax, p.ay
    makePointsData(points){
      //1. y -> -y and zoom in
      let minx=0,miny=0,maxx=0,maxy=0
      points.forEach(p=>{
        let xy=this.makeScreenPoint(p.x,p.y)
        p['ax'] = xy[0] / this.map.zoomScale
        p['ay'] = xy[1] / this.map.zoomScale
        if(p.ax<minx) minx = p.ax
        if(p.ay<miny) miny = p.ay
        if(p.ax>maxx) maxx = p.ax
        if(p.ay>maxy) maxy = p.ay
      })
      this.xy_range = {minx:minx,miny:miny,maxx:maxx,maxy:maxy}

      //2. 计算svg大小
      this.map.width = maxx-minx + this.margin.x * 2
      this.map.height = maxy-miny + this.margin.y * 2
      //2. compute offset
      let offset = {ax: -minx + this.margin.x, ay: -miny + this.margin.y}
      this.originDot = offset
      //3. offset to screen
      points.forEach(p=>{
        p.ax = p.ax + offset.ax
        p.ay = p.ay + offset.ay
        //设置样式cls
        p.cls = this.makePointStyle(p.type)
      })
      return points
    },


    //转换为屏幕坐标
    makeScreenPoint(x, y){
      console.log(this.map.rotate)
      //根据map.rotate(deg)基于原点修正角度
      let rad = this.map.rotate * Math.PI / 180 //转换为弧度
      // let rad = -90 * Math.PI / 180 //转换为弧度
      // console.log(rad)
      let x1 = x * Math.cos(rad) - y * Math.sin(rad);
      let y1 = y * Math.cos(rad) + x * Math.sin(rad);
      let ax = x1 
      let ay = -y1
      return [ax, ay]
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
      let rects = []
      for (let i = 0; i < stations.length; i++) {
        let st = stations[i]
        if (!st.doPoint || !st.exitPoint) {
          console.log(`机台配置：`, st.id, st.name, st.doPoint, st.exitPoint, st.stationType)
          this.$notification.error({
            message: this.$tcache('admin.stationGroup07',{id: st.id}),
            description: this.$tcache('admin.errorTips01',{doPoint: st.doPoint, exitPoint: st.exitPoint})
          })
          continue
        }

        let p0 = points.find(p=>p.id==st.doPoint)
        let p1 = points.find(p=>p.id==st.exitPoint)
        if(!p0 || !p1){
          console.log(`机台${st.id}对接点配置错误，不存在的点位号：${st.doPoint},${st.exitPoint}`)
          this.$notification.error({
            message:this.$tcache('admin.errorTips02',{id: st.id}), 
            description:this.$tcache('admin.errorTips02',{doPoint: st.doPoint, exitPoint: st.exitPoint}) 
          });
          continue
        }
        //console.log(p0.ax,p0.ay, p1.ax,p1.ay)
        //计算矩形坐标、尺寸
        let size = 3
        if(st.stationType==2||st.stationType==3){
          size = 4
        }else if(st.name.includes('SE')||st.name.includes('缓存')||st.name.includes('返空')){//一些长度特殊的机台
          size = 4
        }else if((st.name.includes('RCA')||st.name.includes('BSG'))&&this.map.name.includes('宿迁阿特斯前段')){//宿迁阿特斯前段
          size=2
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

    //生成交管区多边形
    makeCaMapData(data){
      data.forEach(d=>{
        //编辑内容
        d.bxys = this.toSlamPointArray(d.axes)
        d.axys = this.transToScreenXYArray(d.bxys)
        //svg数据
        d.points = this.makePolygonPoints(d.axys)
        d.cls = 'ca'
      })
      this.ctrlareas = data
      if(this.saveSuccess){
        this.ca=this.ctrlareas[this.ctrlareas.length-1]
      }
    },

    makePolygonPoints(xys){
      if(xys.length && xys.length > 2){
        return xys.map(xy=>{
          return `${xy[0]},${xy[1]}`
        }).join(' ')
      }
      return ''
    },
    toSlamPointArray(axes){
      let arr = axes.split(' ')
      return arr.map(s=>{
        let xy = s.split(',')
        //todo control_area.axes保存的的坐标单位是厘米，因此此此恢复为毫米
        return [Number.parseInt(xy[0]) * 10, Number.parseInt(xy[1]) * 10]
      })
    },
    transToScreenXYArray(bxys){
      return bxys.map(e=>this.toScreenXY(e[0] ,e[1]))
    },

    toScreenXY(x,y){
      // let rotate=`${this.map.rotate}`.includes('-')?-90:90
      let rad = this.map.rotate * Math.PI / 180 //转换为弧度
      // console.log(rad)
      let x1 = x * Math.cos(rad) - y * Math.sin(rad);
      let y1 = y * Math.cos(rad) + x * Math.sin(rad);
      let ax = x1 / this.map.zoomScale + this.originDot.ax
      let ay = -y1 / this.map.zoomScale + this.originDot.ay
      return [ax,ay]
    },
    verifyCaAxes(){
      //检查交管区Axes点位是否超过范围
      if(this.xy_range.minx!=0){
        let arr =[]
        this.ctrlareas.forEach(e=>{
          e.bxys.forEach(xy=>{
            if(xy[0]<this.minx - 1000 || xy[0] > this.maxx +1000
            ||xy[1]<this.miny - 1000 || xy[1] > this.maxy +1000){
              arr.push({id:e.id, xy})
            }
          })
        })
        if(arr.length){
          this.$notification.warning({message: this.$tcache('admin.inspect'), description: JSON.stringify(arr)})
        }
      }
    },

    dotHover(evt){
      console.log(evt.target.dataset.id)
    },
    dotClick(evt){
      let pid = evt.target.dataset.id
      let point = this.points.filter(p=>p.id == pid)[0]
      this.point = point
      // if(['TRANS_EXIT','DECIDE','CHARGE_EXIT','PARK'].includes(point.type)){
        this.queryRouteByPass(point.id)
      // }
    },

    queryRouteByStartOrMid(id){
      axiosget(`route/bystartormidpoint/${id}`,{},data=>{
        if(data.length){
          data.forEach(r=>this.makeRouteData(r))
          this.routes = data
        }
      })
    },
    queryRouteByPass(pid){
      //todo 查询点相关的路线,并生成pointstr,cls，样式采用随机色，以区别不同线
      // let url = `/route/bypoint/${pid}`
      let url = ``
      console.log('this.routefilter',this.routefilter)
      if(this.routefilter == 'start'){
        url = `/route/bystartpoint/${pid}`
      }
      // else if(this.routefilter == 'middle'){
      //   url = `/route/bymiddlepoint/${pid}`
      // }
      else if(this.routefilter == 'end'){
        url = `/route/byendpoint/${pid}`
      }else{
        return
      }
      this.axios.get(url)
      .then(res=>{
        if(res.status==200){
          if(res.data.length){
            res.data.forEach(r=>this.makeRouteData(r))
            this.routes = res.data
          }else{
            this.$message.warning(this.$tcache('admin.emptyData'))
            this.routes = []
          }
        }
      }).catch(err=>console.error(err+''))

      // axiosget(`route/bypoint/${id}`,{},data=>{
      //   if(data.length){
      //     data.forEach(r=>this.makeRouteData(r))
      //     this.routes = data
      //   }
      // })
    },
    makeRouteData(route){
      //console.log(route)
      //生成pointstr，cls,statePoint,endPoint
      let pids = route.points.split(POINT_SEP)
      if(pids.length>1){
        // route.startPoint = pids[0]
        // route.endPoint = pids[pids.length-1]
        route.style = this.makeRandomRouteStyle()
        route.pointstr = this.makePolylinePoints(route)
      }
      return route
    },
    makeRandomRouteStyle(){
      return {"stroke":`rgb(${this.randomColor()}, ${this.randomColor()}, ${this.randomColor()})`, "stroke-width":`${Math.random()*5}px`}
    },
    randomColor(){
      return (Math.random() * 1000 % 255).toFixed()
    },
    //生成路线点的折线点坐标数据
    makePolylinePoints(route){
      let pids = route.points.split(POINT_SEP)
      // let points = pids.map(pid=>this.points.filter(p=>p.id+''==pid)[0]) // 旧版数据中大量无效点,导致出出
      let points = []
      let notexits = [] //不存在的点
      pids.forEach(pid=>{
        let arr = this.points.filter(p=>p.id+''==pid)
        if(arr.length){
          points.push(arr[0])
        }else{
          notexits.push(pid)
        }
      })
      if(notexits.length){
        this.$notification.error({message:this.$tcache('admin.error06', {id: route.id}), description: notexits.join(',')})
      }
      return points.map(p=>`${p.ax}, ${p.ay}`).join(' ')
    },
    highlightRoute(evt){
      let id = evt.target.dataset.id
      let routes = this.routes
      routes.forEach(r=>{
        if(r.id == id){
          r['cls'] = 'focus'
          console.log(r)
          //高亮线上的节点：
          this.clearPointStatus()
          let pids = r.points.split('-')
          this.highlightPoints(pids)
        }else{
          delete(r['cls'])
        }
      })
      this.routes = routes
    },
    highlightPoints(pids){
      this.points.forEach(p=>{
        if(pids.includes(p.id+"") || pids.includes(p.id)){
          p['cls'] = 'focus'
        }
      })
    },
    highlightRoute2(route){
      let id = route.id
      let routes = this.routes
      routes.forEach(r=>{
        r.style['stroke-width']='2'
        if(r.id == id){
          r['cls'] = 'focus'
          console.log(r)
          this.selectRoute={...r}
          // this.$delete(this.selectRoute,'cls')
          // this.$delete(this.selectRoute,'style')
          //高亮线上的节点：
          this.clearPointStatus()
          let pids = r.points.split('-')
          this.highlightPoints(pids)
        }else{
          delete(r['cls'])
        }
      })
      console.log(routes)
      this.routes = routes
    },
    clearPointStatus(excludeId){
      this.points.forEach(p=>{
        if(p.cls && p.cls.includes('focus')){
          if(!excludeId || excludeId != p.id){
            p.cls = p.cls.replace('focus', '');
          }
        }
      })
    },
    //交管区点击事件
    caClick(evt){
      if(this.switch1){return;}
      evt.stopPropagation()
      let idx = Number.parseInt(evt.target.dataset.idx)
      console.log(idx)
      if(idx == this.caIndex){
        return
      }
      let ca = this.ctrlareas[idx]
      if(idx != this.caIndex){
        //todo 判断当前数据是否被修改

        //清除上个交管区样式
        if(idx != -1){
          this.ca.cls = 'ca'
        }
      }
      ca.cls = 'ca ca-used'
      this.ca = ca
      this.obstacleAvoidanceMode=this.ca.obstacleAvoidanceMode!=1
      console.log(this.ca)
      //恢复标签索引(未选定状态)
      this.tagIndex == -1
      this.caIndex = idx
      this.visibleDrawer = true
    },
    focusInput(evt){
      this.focused = evt.target.id
      console.log(`focused:${evt.target.id}`, this[this.focused])
    },

    //交管区绘制
    mouseoverSVG(evt){
      this.ax = evt.offsetX
      this.ay = evt.offsetY
      let xy = this.makeScreenPoint(this.ax - this.originDot.ax, this.ay - this.originDot.ay);
      // console.log(
      //   'X==>',
      //   Math.floor(xy[0] * this.map.zoomScale),
      //   'Y==>',
      //   Math.floor(xy[1] * this.map.zoomScale),
      // );
      this.x = Math.floor(xy[0] * this.map.zoomScale);
      this.y = Math.floor(xy[1] * this.map.zoomScale);
    },
    clickSVG(evt){
      if(!this.switch1){return;}
      if(!this.ca.id){
        this.ca = {id:99999, name:'', axys:[], bxys:[],cls:'ca'}
        this.ctrlareas.push(this.ca)
      }
      if(this.selectedPoint!=''){
        this.ca.axys[this.selectedPoint]=[evt.offsetX, evt.offsetY]
        this.ca.bxys[this.selectedPoint]=[this.x, this.y]
        this.ca.points = this.toPolygonPoints(this.ca.axys)
        return;
      }
      this.ca.axys.push([evt.offsetX, evt.offsetY])
      this.ca.bxys.push([this.x, this.y])
      //生成polygon.points
      this.ca.points = this.toPolygonPoints(this.ca.axys)
      // this.visibleDrawer = true
      console.log('this.ca==>',this.ca)
    },
    // toSlamX(ax){
    //   return ((ax - this.originDot.ax) * this.map.zoomScale).toFixed(0)
    // },
    // toSlamY(ay){
    //   return - ((ay - this.originDot.ay) * this.map.zoomScale).toFixed(0)
    // },
    toPolygonPoints(axys){
      let arr = axys.map(e=>{
        return e[0] + ',' +e[1]
      })
      return arr.join(' ')
    },
    //顶点点击：删除操作
    vertexClick(evt){
      evt.stopPropagation()
      this.selectedPoint=evt.target.dataset.idx
      this.$message.info(this.$tcache('admin.tipsInfo', {selectedPoint: this.selectedPoint}))
      this.switch1=true
      // let idx = evt.target.dataset.idx
      // console.log(idx)
      // let ca = this.ca
      // ca.axys.splice(idx,1)
      // ca.bxys.splice(idx, 1)
      // ca.points = this.toPolygonPoints(ca.axys)
      // this.ca = ca
    },
    clearCtrlArea(){
      if(this.ca.id == 99999){
        this.ctrlareas.pop()
        this.ca = {}
        this.caIndex == -1
        this.tagIndex == -1
      }else{
        console.log(this.ca)
        this.ca = {name:'',axes: '',axys: [],bxys: [], type:null}
        this.caIndex == -1
        this.tagIndex == -1
        console.log(this.ca)
      }
    },
    resetCtrlArea(){
      if(this.ca.id == 99999){
        this.ctrlareas.pop()
        this.ca = {}
      }else{
        //由axes重新生成屏幕坐标及激光坐标数组
        this.ca = this.ctrlareas[this.caIndex]
        this.ca.bxys = this.toSlamPointArray(this.ca.axes)
        this.ca.axys = this.transToScreenXYArray(this.ca.bxys)
        this.ca.points = this.toPolygonPoints(this.ca.axys)
      }
    },
    saveCtrlArea(){
      this.saveState=true
      if(this.ca.bxys.length < 3){
        this.$message.error(this.$tcache('admin.error07'))
        this.saveState=false
        return
      }
      if(!this.ca.name){
        this.$message.error(this.$tcache('admin.error08'))
        this.saveState=false
        return
      }
      if(!this.ca.type){
        this.$message.error(this.$tcache('admin.error09'))
        this.saveState=false
        return
      }

      let ca = {}
      if(this.ca.id != 99999){
        ca.id = this.ca.id
      }
      console.log(this.ca.id)
      ca.name = this.ca.name
      //todo 由于龙恒交管区坐标单位为厘米，因此做转换
      ca.axes = this.ca.bxys.map(e=>{
        return `${Math.floor(e[0]/10)},${Math.floor(e[1]/10)}`
      }).join(' ')
      ca.type = this.ca.type
      ca.obstacleAvoidanceMode=this.obstacleAvoidanceMode?0:1
      console.log(ca)
      this.axios.post(`ca/`, ca)
      .then(res=>{
        if(res.status == 200){
          if(res.data.success){
            this.$message.success(res.data.message)
            this.init() //重新查询
            this.saveState=false
            this.saveSuccess=true
            this.selectedPoint=''
          }else{
            this.$message.warning(res.data.message)
          }
        }else{
          this.$message.error(this.$tcache('common.saveFail'))
          this.saveState=false
        }
      })
    },

    //处理顶点顺序相关
    clickTag(evt){
      this.tagIndex = Number.parseInt(evt.target.dataset.idx)
      console.log(this.tagIndex)
    },
    handleMove(val){
      if(this.tagIndex == -1){
        return
      }
      //todo 改变this.ca的axys,bxys, axes 次序，并同步改计算ca.points
      let toindex = this.tagIndex + val
      let {axys,bxys} = this.ca
      console.log(axys,bxys)
      if(val == 1){//向后移
        axys.splice(toindex+1, 0, axys[this.tagIndex]) //在toindex+1位置插入当前位置元素
        axys.splice(this.tagIndex, 1) //删除当前位置元素
        bxys.splice(toindex+1, 0, bxys[this.tagIndex])
        bxys.splice(this.tagIndex, 1)
      }else if(val==-1){//向前移
        axys.splice(toindex, 0, axys[this.tagIndex]) //在toindex增加当前元素，len+1
        axys.splice(this.tagIndex+1, 1) //当前位置后移，因此+1处删除
        bxys.splice(toindex, 0, bxys[this.tagIndex])
        bxys.splice(this.tagIndex+1, 1)
      }
      this.ca = Object.assign(this.ca, {axys, bxys})
      this.tagIndex = toindex

      //更新ca.points重绘
      this.ca.points = this.makePolygonPoints(axys)
    },
    showModal(){
      this.deleteArea = true;
    },

    handleOk(e){
      console.log(e);
      this.delCtrlArea()
    },
    delCtrlArea(){
      let ca = this.ca
      this.clearCtrlArea() //清除当前数据
      if(ca.id && ca.id < 99999){
        this.axios.delete(`ca/${ca.id}`)
        .then(res=>{
          console.log(res)
          if(res.status == 200){
            this.$message.success(res.data.message)
            if(res.data.success){
              this.ctrlareas.splice(this.caIndex, 1) //删除当前行
            }
            this.deleteArea=false
          }else{
            this.$message.warning(this.$tcache('common.operateFail'))
          }
        }).catch(err=>{
          this.$message.error(`${this.$tcache('common.operateFail')}：${err}`)
        })
      }
    },
    // dblClickSVG(evt){
      //穿透多边形: 解决点位生成与选择多边形的事件
      // this.clickSVG(evt)
    // },
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss/map_bright";

.svgbg{
  background-color: #eeeeee;
  // background-image: url('../../../public/img/ca_map.png');
  background-repeat: no-repeat;
  // background-size: 120%;
  // background-position: -285px -520px;
}
.bgcolor{
  background-color: #ededed;
}
.icon{
  position: absolute;
  z-index: 10;
  top: 40px;
  right: 20px;
}
::v-deep .ivu-icon{
  font-size: 50px;
  cursor: pointer;
}
.select-route{
  width:100%;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
}
.skyblue{
  color: #00b5ff;
}
.flex-cen{
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  button{
    margin: 5px;
  }
}
::v-deep .ant-radio-button-wrapper{
  padding: 0 10px;
}
</style>
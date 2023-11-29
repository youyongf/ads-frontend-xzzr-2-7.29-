<template>
  <div>
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" :width="map.width" :height="map.height" id="map" ref="map" class="svgbg">
        <!--      <polyline v-if="route.pointstr" :points="route.pointstr" :style="route.style" />-->
        <polyline v-for="r in routes" :key="'r' + r.id" :points="r.pointstr" :style="r.style" :data-id="r.id"
          @click="highlightRoute">
          <title>{{ r.id }}[{{ r.points }}]</title>
          <animate v-if="r.cls == 'focus'" attributeName='stroke-width' dur='1s' values="1;6;1"
            repeatCount="indefinite" />
        </polyline>
        <circle r="6" :cx="originDot.ax" :cy="originDot.ay" class="origin">
          <title>{{$tcache('admin.origin')}}</title>
        </circle>
        <g v-for="p in points" :key="'p' + p.id">
          <circle r="5" :cx="p.ax" :cy="p.ay" :class="'dot ' + p.cls" :id="'dot' + p.id" :data-id="p.id" :title="p.remark"
            @mouseover="dotHover" @mouseout="dotOut" @click="dotClick">
            <title>{{ p.id }} ({{ p.x }},{{ p.y }}) {{ p.remark }}</title>
          </circle>
          <text :dx="p.ax - 10" :dy="p.ay - 5">{{ p.id }}</text>
        </g>
        <g class="station" v-for="r in rects" :key="'r' + r.id" @click="showDrawer" @dblclick="showStationInfo">
          <rect :data-id="r.id" :x="r.x" :y="r.y" :width="r.width" :height="r.height" :class="r.cls" @click="rectClick">
            <title>{{ r.title }}</title>
          </rect>
          <text v-if="!(workName?.includes('宿迁阿特斯前段')&&(r.title?.includes('RCA')||r.title?.includes('BSG')))" :x="r.x" :y="r.y" :dx="r.dx" :dy="r.dy" :writing-mode="r.writingMode" :text-anchor="r.textAnchor">
            {{ r.title }}
          </text>
        </g>
      </svg>
    </div>

    <div @click="()=>{visibleDrawer=true;visibleDrawer_point=false}" class="icon" :title="$tcache('admin.stationMap01')"><Icon class="fz" type="ios-cog-outline" /></div>
    <a-drawer :title="$tcache('admin.stationMap01')" :placement="placement" :visible="visibleDrawer" :mask="false" @close="onClose">
      <h3 style="text-align:center;">{{$tcache('admin.stationMap02')}}</h3>
      <div>
        <a-radio-group button-style="solid" size="small" v-model="option" @change="handleOptionChange">
          <a-radio-button value="parks">{{$tcache('admin.cacheLayer03')}}</a-radio-button>
          <a-radio-button value="relPids">{{$tcache('admin.stationMap03')}}</a-radio-button>
          <a-radio-button value="area">{{$tcache('common.region')}}</a-radio-button>
          <a-radio-button value="nextStations">{{$tcache('admin.stationMap04')}}</a-radio-button>
          <a-radio-button value="nextCacheStations">{{$tcache('admin.stationMap05')}}</a-radio-button>
        </a-radio-group>
      </div>
      <a-row style="margin-bottom:10px;" type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }"
        class="blockinfo">
      </a-row>

      <h3 style="text-align:center;">{{$tcache('admin.stationMap06')}}</h3>
      <a-row style="margin-bottom:10px;" type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }"
        class="blockinfo">
        <a-col :span="22" :offset="2">
          <ul>
            <li v-for="item in stations_checked" :key="'sc' + item.id" :title="item.name">{{ item.id }}-{{ item.name }}</li>
          </ul>
        </a-col>
      </a-row>

      <h3 style="text-align:center;">{{$tcache('admin.pointMap06')}}</h3>
      <div style="color:red;text-align:center;">{{$tcache('admin.stationMap07')}}</div>
      <a-row type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="blockinfo">
        <a-col v-if="option == 'parks'" :title="'parks：'+ $tcache('admin.stationMap08')">
          <span style="width:60px;display:inline-block;">{{$tcache('admin.cacheLayer03')}}：</span>
          <a-input v-model="parks" style="width: 100px;margin-right:2px;" id="parks" @focus="focusInput" />
          <a-button @click="updateParks" type="primary">
            <a-icon type="save" />
          </a-button>
        </a-col>
        <a-col v-if="option == 'relPids'" :itle="`${$tcache('admin.stationMap09')}rel_pids：${$tcache('admin.stationMap10')}doPoint`">
          <span style="width:60px;display:inline-block;">{{$tcache('admin.stationMap03')}}：</span>
          <a-input v-model="rel_pids" style="width: 100px;margin-right:2px;" id="rel_pids" @focus="focusInput" />
          <a-button @click="updateRelPids" type="primary">
            <a-icon type="save" />
          </a-button>
        </a-col>
        <a-col v-if="option == 'area'" :title="'area：' + $tcache('admin.stationMap11')">
          <span style="width:60px;display:inline-block;">{{$tcache('common.region')}}：</span>
          <a-select :allowClear='true' v-model="area" class="changeWidth" style="margin-right:2px;">
            <a-select-option v-for="item in areas" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
          </a-select>
          <a-button @click="updateArea" type="primary">
            <a-icon type="save" />
          </a-button>
        </a-col>
        <a-col v-if="option == 'nextStations'" title="next_stations">
          {{$tcache('admin.stationMap04')}}：
          <a-select @mouseenter="filterStationByNextStep" :allowClear='true' v-model="nextStations" style="margin-right:2px;width:160px;">
            <a-icon slot="suffixIcon" type="reload" @click="filterStationByNextStep" />
            <a-select-option v-for="item in optionalStations" :key="item.code" :value="item.code">{{ item.name }}</a-select-option>
          </a-select>
          <a-button @click="updateNextStations" type="primary">
            <a-icon type="save" />
          </a-button>
        </a-col>
        <a-col v-if="option == 'nextCacheStations'" title="next_cache_stations">
           {{$tcache('admin.stationMap12')}}：
          <a-select @mouseenter="filterCacheStation" :allowClear='true' v-model="nextCacheStations" style="margin-right:2px;width:160px;">
            <a-icon slot="suffixIcon" type="reload" @click="filterCacheStation" />
            <a-select-option v-for="item in optionalCacheStations" :key="item.code" :value="item.code">{{ item.name }}
            </a-select-option>
          </a-select>
          <a-button @click="updateNextCacheStations" type="primary">
            <a-icon type="save" />
          </a-button>
        </a-col>

      </a-row>

    </a-drawer>

    <a-drawer :title="$tcache('admin.drawerTitle01')"
             :placement="placement"
             :visible="visibleDrawer_point" :mask="false"
             @close="onClose"
             >
      <Collapse v-model="value1">
        <Panel name="1">
          {{$tcache('common.point')}}
          
          <div slot="content" style="text-align:center;">
            <p>{{$tcache('common.point')}}ID：<a-input v-model="pointid" style="width: 25%;height:10%;margin: 5px;"></a-input><a-button style="height: 2.6vh;border:1px solid #40a9ff;" @click="queryPoint">{{$tcache('common.query')}}</a-button></p>
            {{$tcache('admin.pointMap08')}}
          </div>
          <a-row slot="content" style="margin-bottom:10px;" type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="blockinfo">
            <a-form>
              <!--todo 采用form-item组件 -->
            <a-col :span="24"><span class="val" v-if="currPoint.id">{{currPoint.id}}（{{currPoint.x}}，{{currPoint.y}}）</span></a-col>
            <a-col :span="24"><span class="block"> {{$tcache('admin.type')}}：  </span><a-select class="changeWidth" v-model="currPoint.type" :options="ptypes"/></a-col>
            <a-col :span="24"><span class="block"> {{$tcache('admin.pointMap01')}}：</span><a-input class="changeWidth" v-model.number="currPoint.pairId" /></a-col>
            <a-col :span="24"><span class="block"> {{$tcache('admin.nextStations01')}}：  </span><a-select class="changeWidth" v-model="currPoint.step" :options="steps"/></a-col>
            <a-col :span="24"><span class="block"> {{$tcache('common.region')}}：  </span><a-select class="changeWidth" v-model="currPoint.area" :options="areas"/></a-col>
            <a-col :span="24"><span class="block"> {{$tcache('admin.pointMap03')}}：  </span><a-input class="changeWidth" v-model="currPoint.tag" /></a-col>
            <a-col :span="24"><span class="block"> {{$tcache('admin.pointMap04')}}：  </span><a-input class="changeWidth" v-model="currPoint.remark" /></a-col>
            <a-col :span="24"><span class="block"> {{$tcache('admin.pointMap05')}}：</span><span class="val">{{currPoint.ts|fmtTime}}</span></a-col>
            <a-col :span="24" style="text-align:center;"><a-button @click="pointSave">{{$tcache('common.save')}}</a-button></a-col>
            </a-form>
          </a-row>
          <p slot="content" style="text-align:center;">{{$tcache('admin.pointMap06')}}</p>
          <a-row slot="content" type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="blockinfo">
            <a-col style="width: 100%;">
              <span>{{$tcache('admin.pointMap07')}}：</span>
              <ul style="max-height:100px;overflow:auto;">
                <li style="margin-right:10px;" v-for="item in points_checked" :key="'sc' + item.id" :title="item.remark">{{item.id}}{{item.remark?'-'+item.remark:''}}</li>
              </ul>
            </a-col>
            <a-col :title="$tcache('admin.pointMap02')">
              <span class="block">{{$tcache('common.region')}}：</span>
              <a-select class="changeWidth" v-model="pointForm.area" :options="areas"/>
            </a-col>
            <a-col :title="$tcache('admin.pointMap09')">
              <span class="block">{{$tcache('admin.type')}}：</span>
              <a-select class="changeWidth" v-model="pointForm.type" :options="ptypes"/>
            </a-col>
            <a-col :title="$tcache('admin.pointMap10')">
              <span class="block">{{$tcache('admin.nextStations01')}}：</span>
              <a-select class="changeWidth" v-model="pointForm.step" :options="steps"/>
            </a-col>
            <a-col :span="24" style="text-align:center;"><a-button @click="updatePointConfig">{{$tcache('common.save')}}</a-button></a-col>
          </a-row>  
        </Panel>
      </Collapse>
    </a-drawer>
  </div>
</template>

<script>/**
 * 机台对接工位位置图: 直观方式批量设置机台点位相关属性
 * 前置条件：station表的doPoint,exitPoint均已经设置好。
 * 1. point表中设置类型的点位
 * 2. 机台与点位设置相关的数据
 * 3. 根据station表中对接位（doPoint,exitPoint）,确定机台的方位，生成矩形绘制机台（矩形、坐标、文字、事件）
 * 4. 标签多选功能，批量设置点位相关属性
 */
import { axiosget } from "../../utils";
var POINT_SEP = process.env.VUE_APP_POINT_SEP || '-'; //路线中的点的分隔符，默认减号
let vueApp = null
export default {
  name: "station_map",
  data() {
    return {
      map: { width: 900, height: 800 },
      route: {},
      routes: [],
      points: [],
      stations: [],
      //矩形（机台）
      rects: [],
      rect_width: 30, //矩形宽（面对车辆的边）

      //svg相关
      margin: { x: 150, y: 150 }, //预留边界
      zoomScale: 40, //绽放比率(实际坐标与屏幕坐标比值)
      originDot: { ax: 0, ay: 0 }, //原点的屏幕坐标

      //对接位操作面板相关
      option: null, //操作选项
      visibleDrawer: false,
      placement: 'right',
      currStation: {},//当前点击或mouseover的station
      stations_checked: [],

      //输入框及焦点
      focused: '', //焦点输入域ID
      parks: null,
      rel_pids: null,
      area: null,

      steps: [],//步骤名称
      areas: [
        { value: 1, label: this.$tcache('admin.pointMap17')},
        { value: 2, label: this.$tcache('admin.pointMap18')}
      ],
      optionalStations: [],//下游机台选项内容
      optionalCacheStations: [],//下游缓存机选项内容
      ids: '',
      nextCacheStations: '',
      nextStations: '',
      selectedRectStep:null,//选择的机台的step
      workName:localStorage.getItem('workName'),
      lastPoint:null,
      
      visibleDrawer_point:false,
      pointid: null,
      currPoint: {},//当前点击或mouseover的point
      points_checked:[],
      pointForm:{},
      value1:'1',//默认展开层
      ptypes:[], //点位类型
    }
  },
  beforeMount() {
    this.querySteps()
    vueApp = this
  },
  mounted() {
    this.init()
  },
  filters: {
    fmtStep: val => {
      let steps = [...vueApp.steps]
      let step = steps.find(e => e.value == val)
      if (step) {
        return step.label
      }
      return val
    },
  },
  methods: {
    queryPoint(){
      let dom=document.getElementById(`dot${this.pointid}`)
      if(!dom){this.$message.info(this.$tcache('admin.pointMap18',{pointid: this.pointid}));return}
      dom.scrollIntoView({behavior: "smooth",block:'center',inline:'center'})
      dom.classList.add('point-checked')
      console.log(dom.classList)
      setTimeout(()=>{dom.classList.remove('point-checked')},10000)
      let index=this.points.findIndex(item=>item.id==this.pointid)
      let thepoint=this.points[index]
      this.$set(this.points,index,thepoint)
      this.$message.success(this.$tcache('admin.pointMap18',{pointid: this.pointid}))
    },
    pointSave(){
      this.axios.post(`point/save`,this.currPoint).then(res=>{
        if(res.status == 200){
          console.log(res)
        }else{
          this.$message.warning(this.$tcache('admin.pointMap22'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    //更新点配置
    updatePointConfig(){
      if(Object.keys(this.pointForm).length==1&&this.pointForm.ids){this.$message.error(this.$tcache('admin.pointMap24'));return;}else if(!this.pointForm.ids){
        this.$message.error(this.$tcache('admin.pointMap25'));return;
      }
      this.axios.post(`point/multiupdate`,this.pointForm).then(res=>{
        if(res.status == 200){
          this.init()
        }else{
          this.$message.warning(this.$tcache('admin.pointMap26'))
        } 
      }).catch(err=>{this.$message.error(err)})
    },
    //获取点位类型选项数据
    queryPointType() {
      return this.axios.get(`dict/ptype`)
    },

    querySteps() {
      axiosget(`step/all`, {}, (data) => {
        if (data) { 
          this.steps = data.map(e=>{
            return {value:e.id,label:e.name}
          }) 
        }
      })
    },
    onClose() {
      this.visibleDrawer = false
      this.visibleDrawer_point = false
    },
    init() {
      this.axios.all([this.queryPoints(), this.queryStations(),this.queryPointType()])
        .then(this.axios.spread((res1, res2, res3) => {
          if (res1.status == 200) {
            this.points = this.makePointsData(res1.data)
            if (this.points.length == 0) {
              this.$notification.warn({ message: this.$tcache('common.prompt'), description: this.$tcache('admin.pointMap23') })
            }
          }
          if (res2.status == 200) {
            this.stations = res2.data
            if (this.stations.length == 0) {
              this.$notification.warn({ message: this.$tcache('common.prompt'), description: this.$tcache('admin.stationMap13') })
            }
          }
          this.makeSvgData(this.points, this.stations)
          if (res3.status == 200) {
            this.ptypes=res3.data.map(e=>{
              return {value:e.value, label:e.label}
            })
          }
        })).catch(err => {
          this.$message.error(err+'')
        })

    },
    //查询对接点、退出点
    queryPoints() {
      return this.axios.get(`point/all`)
    },
    //更新待命点
    updateParks() {
      if (!this.parks) { this.$message.error(this.$tcache('admin.stationMap14')); return; }
      this.axios.post(`station/updateparks?ids=${this.ids}&parks=${this.parks}`).then(res => {
        if (res.status == 200) {
          console.log(res)
        } else {
          this.$message.warning(this.$tcache('admin.stationMap15'))
        }
      }).catch(err => { this.$message.error(err) })
    },
    //更新干扰点
    updateRelPids() {
      if (!this.rel_pids) { this.$message.error(this.$tcache('admin.stationMap14')); return; }
      this.axios.post(`station/update_relpids?ids=${this.ids}&relids=${this.rel_pids}`).then(res => {
        if (res.status == 200) {
          console.log(res)
        } else {
          this.$message.warning(this.$tcache('admin.stationMap16'))
        }
      }).catch(err => { this.$message.error(err) })
    },
    //更新区域
    updateArea() {
      if (!this.area) { this.$message.error(this.$tcache('admin.pointMap24')); return; }
      this.axios.post(`station/updatearea?idstr=${this.ids}&area=${this.area}`).then(res => {
        if (res.status == 200) {
          console.log(res)
        } else {
          this.$message.warning(this.$tcache('admin.stationMap17'))
        }
      }).catch(err => { this.$message.error(err) })
    },
    //更新下游机台
    updateNextStations() {
      if (!this.nextStations || this.nextStations.length == 0) { this.$message.error(this.$tcache('admin.pointMap24')); return; }
      this.axios.post(`station/update_next_stations?ids=${this.ids}&nextIds=${this.nextStations}`).then(res => {
        if (res.status == 200) {
          console.log(res)
        } else {
          this.$message.warning(this.$tcache('admin.stationMap18'))
        }
      }).catch(err => { this.$message.error(err) })
    },
    //更新下游缓存机
    updateNextCacheStations() {
      if (!this.nextCacheStations || this.nextCacheStations.length == 0) { this.$message.error(this.$tcache('admin.pointMap24')); return; }
      this.axios.post(`station/update_next_cache_stations?ids=${this.ids}&nextIds=${this.nextCacheStations}`).then(res => {
        if (res.status == 200) {
          console.log(res)
        } else {
          this.$message.warning(this.$tcache('admin.stationMap19'))
        }
      }).catch(err => { this.$message.error(err) })
    },
    //查询所有机台（与点位相关的数据）
    queryStations() {
      let columns = `id,name,process,step,next_step,next_stations,next_cache_stations,parks,rel_pids,area,do_point,exit_point,station_type`
      return this.axios.get(`station/queryLimitColumns/${columns}`)
    },
    //遍历所有点位，根据比率确定屏幕坐标，计算偏移量将点位移到屏幕区[暂不处理旋转]
    //增加p.ax, p.ay
    makePointsData(points) {
      //1. y -> -y and zoom in
      let minx = 0, miny = 0, maxx = 0, maxy = 0
      points.forEach(p => {
        p['ax'] = p.x / this.zoomScale
        p['ay'] = -p.y / this.zoomScale
        if (p.ax < minx) minx = p.ax
        if (p.ay < miny) miny = p.ay
        if (p.ax > maxx) maxx = p.ax
        if (p.ay > maxy) maxy = p.ay
      })
      //2. 计算svg大小
      this.map.width = maxx - minx + this.margin.x * 2
      this.map.height = maxy - miny + this.margin.y * 2
      console.log(this.map)
      //2. compute offset
      let offset = { ax: -minx + this.margin.x, ay: -miny + this.margin.y }
      this.originDot = offset
      console.log(`offset:`, offset)
      //3. offset to screen
      points.forEach(p => {
        p.ax = p.ax + offset.ax
        p.ay = p.ay + offset.ay
        //设置样式cls
        p.cls = this.makePointStyle(p.type)
      })
      return points
    },
    makePointStyle(pointType) {
      if (pointType) {
        if (pointType == 'DECIDE') {
          return 'ptype_red'
        } else if (pointType == 'TRANS' || pointType == 'TRANS_EXIT') {
          return 'ptype_green'
        } else if (pointType == 'CHARGE' || pointType == 'CHARGE_EXIT') {
          return 'ptype_orange'
        } else if (pointType == 'PARK') {
          return 'ptype_blue'
        } else {
          return ''
        }
      }
      return ''
    },

    //绘制矩形（机台）
    makeSvgData(points, stations) {
      //printList(`stations`, stations)
      let rects = []
      for (let i = 0; i < stations.length; i++) {
        let st = stations[i]
        if (!st.doPoint || !st.exitPoint) {
          console.log(`机台配置：`, st.id, st.name, st.doPoint, st.exitPoint, st.stationType)
          this.$notification.error({ message: this.$tcache('admin.error05',{id:st.id}), description: this.$tcache('admin.errorTips01',{doPoint: st.doPoint, exitPoint: st.exitPoint}) })
          continue
        }

        let p0 = points.find(p => p.id == st.doPoint)
        let p1 = points.find(p => p.id == st.exitPoint)
        if (!p0 || !p1) {
          console.log(`机台${st.id}对接点配置错误，不存在的点位号：${st.doPoint},${st.exitPoint}`)
          this.$notification.error({ message:this.$tcache('admin.error05',{id:st.id}), description: this.$tcache('admin.errorTips02',{doPoint: st.doPoint, exitPoint: st.exitPoint}) })
          continue
        }
        //console.log(p0.ax,p0.ay, p1.ax,p1.ay)
        //计算矩形坐标、尺寸
        let size = 3
        if (st.stationType==2||st.stationType==3) {
          size = 4
        } else if (st.name?.includes('SE')) {//一些长度特殊的机台
          size = 4
        } else if ((st.name?.includes('RCA')||st.name?.includes('BSG'))&&this.workName?.includes('宿迁阿特斯前段')){//宿迁阿特斯前段
          size=2.5
        } else {
          size = 10
        }

        // let rect = this.makeRect(p0.ax,p0.ay, p1.ax,p1.ay, size, (st.id+'-'+st.name).length)
        let rect = this.makeRect(p0.ax, p0.ay, p1.ax, p1.ay, size,(st.id+'-'+st.name).length)
        rect['id'] = st.id
        rect['title'] = `${st.id}-${st.name}`
        rect['cls'] = ''
        rect['step'] = st.step
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

    dotHover(evt) {
      console.log(evt.target.dataset.id)
    },
    dotOut() {

    },
    dotClick(evt) {
      console.log(evt)
      console.log(evt.target.dataset.id)
      let pid = evt.target.dataset.id
      if(this.lastPoint){
        let dom=document.getElementById(`dot${this.lastPoint}`)
        dom.classList.remove('point-checked')
      }
      //点位点击高亮，10秒后高亮消失
      let dom=document.getElementById(`dot${pid}`)
      console.log(dom)
      dom.classList.add('point-checked')
      let point = this.points.filter(p => p.id == pid)[0]
      // console.log(pid, point)
      // this.queryRouteByPass(point.id)

      // //操作面板的数据
      this.changeFocusedInput(point)
      //添加选择点位
      let thepoint = this.points.find(s=>s.id==pid)
      console.log('点击的点位对象：',thepoint)
      this.currPoint=thepoint
      for(let i=0;i<this.points_checked.length;i++){
        if(this.points_checked[i].id==thepoint.id){return;}
      }
      this.points_checked.push(thepoint)
      let idsarr=[]
      this.points_checked.forEach(item=>idsarr.push(item.id))
      this.pointForm.ids=idsarr.join(',')
      this.visibleDrawer_point=true
      this.visibleDrawer = false

      this.lastPoint = pid
    },
    changeFocusedInput(point) {
      if (this.focused) {
        //检查点位类型，不符合的取消设置
        switch (this.focused) {
          case "parks":
            if (point.type != 'PARK') return;
            break;
          case "rel_pids":
            if (point.type != 'TRANS') return;
            break;
        }
        let pid = point.id
        let value = this[this.focused]
        if (value) {
          let arr = value + ''.split(',')
          if (!arr?.includes(pid + '')) {
            this[this.focused] = value + ',' + pid
          }
        } else {
          this[this.focused] = pid
        }
      }
    },
    queryRouteByStartOrMid(id) {
      axiosget(`route/bystartormidpoint/${id}`, {}, data => {
        if (data.length) {
          data.forEach(r => this.makeRouteData(r))
          this.routes = data
        }
      })
    },
    queryRouteByPass(id) {
      axiosget(`route/bypoint/${id}`, {}, data => {
        if (data.length) {
          data.forEach(r => this.makeRouteData(r))
          this.routes = data
        }
      })
    },
    makeRouteData(route) {
      //console.log(route)
      //生成pointstr，cls,statePoint,endPoint
      let pids = route.points.split(POINT_SEP)
      if (pids.length > 1) {
        // route.startPoint = pids[0]
        // route.endPoint = pids[pids.length-1]
        route.style = this.makeRandomRouteStyle()
        route.pointstr = this.makePolylinePoints(route)
      }
      return route
    },
    makeRandomRouteStyle() {
      return { "stroke": `rgb(${this.randomColor()}, ${this.randomColor()}, ${this.randomColor()})`, "stroke-width": `${Math.random() * 5}px` }
    },
    randomColor() {
      return (Math.random() * 1000 % 255).toFixed()
    },
    //生成路线点的折线点坐标数据
    makePolylinePoints(route) {
      let pids = route.points.split(POINT_SEP)
      // let points = pids.map(pid=>this.points.filter(p=>p.id+''==pid)[0]) // 旧版数据中大量无效点,导致出出
      let points = []
      let notexits = [] //不存在的点
      pids.forEach(pid => {
        let arr = this.points.filter(p => p.id + '' == pid)
        if (arr.length) {
          points.push(arr[0])
        } else {
          notexits.push(pid)
        }
      })
      if (notexits.length) {
        this.$notification.error({ message: this.$tcache('admin.error06',{id:route.id}), description: notexits.join(',') })
      }
      return points.map(p => `${p.ax}, ${p.ay}`).join(' ')
    },
    highlightRoute(evt) {
      let id = evt.target.dataset.id
      let routes = this.routes
      routes.forEach(r => {
        if (r.id == id) {
          r['cls'] = 'focus'
          console.log(r)
          //高亮线上的节点：
          this.clearPointStatus()
          let pids = r.points.split('-')
          this.highlightPoints(pids)
        } else {
          delete (r['cls'])
        }
      })
      this.routes = routes
    },
    highlightPoints(pids) {
      this.points.forEach(p => {
        if (pids?.includes(p.id + "") || pids?.includes(p.id)) {
          p['cls'] = 'focus'
        }
      })
    },
    clearPointStatus(excludeId) {
      this.dotOut()
      this.points.forEach(p => {
        if (p.cls && p.cls?.includes('focus')) {
          if (!excludeId || excludeId != p.id) {
            p.cls = p.cls.replace('focus', '');
          }
        }
      })
    },

    rectClick(evt) {
      let cls_checked=false//验证选择的机台数量是否为0，false为0，true则不为0
      this.rects.forEach(item=>{
        if(item.cls==' checked')cls_checked=true
      })
      let id = evt.target.dataset.id
      let rect = this.rects.find(e => e.id == id)
      console.log(rect.step,this.selectedRectStep,this.option)
      if(this.selectedRectStep&&rect.step!==this.selectedRectStep&&(this.option=='parks'||this.option=='nextStations'||this.option=='nextCacheStations')&&cls_checked){
        this.$message.info(this.$tcache('admin.stationMap21'))
        return
      }
      this.selectedRectStep=rect.step
      if (rect.cls?.includes('checked')) {
        rect.cls = rect.cls.replace(' checked', '')
        //删除选择机台
        let idx = this.stations_checked.findIndex(e => e.id == id)
        this.stations_checked.splice(idx, 1)
      } else {
        rect.cls = rect.cls + ' checked'
        //添加选择机台
        let station = this.stations.find(s => s.id == id)
        this.stations_checked.push(station)
        console.log(station, this.stations_checked)
      }
      let idsarr = []
      this.stations_checked.forEach(item => idsarr.push(item.id))
      this.ids = idsarr.join(',')
    },
    showStationInfo(evt) {
      //console.log(evt.target.tagName)
      if (evt.target.tagName == 'rect') {
        let id = evt.target.dataset.id
        let station = this.stations.find(s => s.id == id)
        this.currStation = station
        this.openNotification()
      }
    },
    openNotification() {
      let that = this
      this.$notification.open({
        message:this.$tcache('admin.stationMap22'),
        description: h => {
          return h(
            'ul',
            { class: 'ul-info' },
            that.listCurrentStationInfo(h)
          )
        },
        style: {
          width: '250px',
        },
        placement: 'bottomLeft',
        onClose: close,
        duration: 6,
      });
    },
    listCurrentStationInfo(h) {
      const arr = []
      // for (const key in this.currStation) {
      //   if(this.currStation[key]){
      //     arr.push(h('li', null, `${key}: ${this.currStation[key]}`))
      //   }
      // }
      arr.push(h('li', null, `${this.$tcache('admin.stationMap23')}: ${this.currStation['name']}`))
      arr.push(h('li', null, `${this.$tcache('admin.nextStations01')}: ${this.getStepName(this.currStation['step'])}`))
      arr.push(h('li', null, `${this.$tcache('admin.nextStep01')}: ${vueApp.getStepName(this.currStation['nextStep'])}`))
      arr.push(h('li', null, `${this.$tcache('admin.stationMap24')}: ${this.currStation['nextCacheStation']}`))
      arr.push(h('li', null, `${this.$tcache('admin.stationMap25')}: ${this.currStation['parks']}`))
      arr.push(h('li', null, `${this.$tcache('admin.stationMap26')}: ${this.currStation['relPids']}`))
      arr.push(h('li', null, `${this.$tcache('admin.stationDet09')}: ${this.currStation['doPoint']}`))
      arr.push(h('li', null, `${this.$tcache('admin.stationDet13')}: ${this.currStation['exitPoint']}`))
      arr.push(h('li', null, `${this.$tcache('admin.stationDet21')}: ${this.currStation['stationType'] == 1 ? this.$tcache('admin.stationMap27') : this.$tcache('admin.stationType02')}`))
      arr.push(h('li', null, `${this.$tcache('common.region')}: ${this.currStation['area']}`))
      return arr
    },
    getStepName(id) {
      let step = this.steps.find(e => e.id == id)
      return `${step.id}-${step.name}`
    },
    //对接位操作面板相关
    showDrawer() {
      this.visibleDrawer = true
      this.visibleDrawer_point = false
    },
    focusInput(evt) {
      this.focused = evt.target.id
      console.log(`focused:${evt.target.id}`, this[this.focused])
    },
    //根据选择的机台的next_step过滤机台，生成下一机台可选机台。在“下游机台”focus时触发
    filterStationByNextStep() {
      if (this.stations_checked.length == 0) {
        this.$message.warning(this.$tcache('admin.stationGroup14'))
        return
      }
      if (!this.stations_checked[0].step || !this.stations_checked[0].nextStep) {
        this.$message.error(this.$tcache('admin.stationMap28',{name: this.stations_checked[0].name}) + `(step)`)
        return;
      }
      let nextStep = this.stations_checked[0].nextStep;
      console.log(this.stations)
      this.optionalStations = this.stations.filter(e => e.step == nextStep && e.stationType == 1)
    },
    //过滤缓存机
    filterCacheStation() {
      if (this.stations_checked.length == 0) {
        this.$message.warning(this.$tcache('admin.stationGroup14'))
        return
      }
      console.log(this.stations_checked[0])
      if (!this.stations_checked[0].step || !this.stations_checked[0].nextStep) {
        this.$message.error(this.$tcache('admin.stationMap28',{name: this.stations_checked[0].name}) + `(step,next_step)`)
        return;
      }
      this.optionalCacheStations = this.stations.filter(e => e.stationType==2||e.stationType==3)
    },
    handleOptionChange() {
      console.log(this.option)
      this.selectedRectStep=null
      this.stations_checked=[]
      this.rects.map((item)=>{
        if(item.cls?.includes('checked'))item.cls = item.cls.replace(' checked', '')  
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss/map_bright";

.svgbg {
  background-color: #eeeeee;
}

.blockinfo {
  background-color: #ededed;
}

.changeWidth {
  width: 100px;
}

::v-deep .ant-col {
  margin-bottom: 5px;
}

::v-deep .ant-drawer-title {
  text-align: center;
}

::v-deep .ant-drawer-body {
  padding: 5px 24px;
}

.val {
  color: #1890ff;
}

::v-deep .ant-radio-group {
  text-align: center;
}
.icon{
  position: absolute;
  z-index: 10;
  top: 40px;
  right: 20px;
  .fz{
    font-size: 50px;
    cursor: pointer;
  }
}
.point-checked{
  stroke: red !important;
  stroke-width: 6px !important;
}
</style>

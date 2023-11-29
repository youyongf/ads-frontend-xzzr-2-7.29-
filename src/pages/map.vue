<template>
  <a-layout :style="{margin:0, backgroundColor: bgColor}" style="height: 100vh;user-select:none;overflow:hidden;">
    <a-layout-sider ref="instruction_panel" style="background: #4b4b4bc2;" v-model="collapsed" :trigger="null" collapsible :collapsedWidth="60" :width="sliderWidth" :style="{position: 'fixed', zIndex: 1, width: '100%'}">
      <a-row style="padding-top:4px">
        <a-space :direction="collapsed?'vertical':'horizontal'">
          <a-icon
              class="trigger" :style="{fontSize:'1.8em'}"
              :type="collapsed ? 'menu-unfold' : 'menu-fold'"
              @click="handleTrigger"
          />
          <!-- <router-link to="/home" class="icon">
            <a-icon type="home" title="{{$tcache('map.homePage')}}" style="font-size: 1.8em;"/>
            <span>{{$tcache('map.homePage')}}</span>
          </router-link>
          <router-link to="/login" class="icon">
            <a-icon type="login" title="登录" style="font-size: 1.8em;"/>
            <span>登录</span>
          </router-link> -->
          <router-link :to="(!authorities||authorities.length==0)?'/login':'/home'">
            <a-icon type="home" :title="$tcache('map.homePage')" style="font-size: 1.8em;"/>
            <span v-if="!collapsed">{{$tcache('map.homePage')}}</span>
          </router-link>
        </a-space>
      </a-row>

      <a-row :hidden="collapsed">
        <a-space direction="vertical">
          <a-switch :checked-children="$tcache('map.deepColour')" :un-checked-children="$tcache('map.lightColour')" v-model="colmd"  @change="onChangeBg"/>
          <span>{{$tcache('map.point')}}：<a-switch  :checked="pointSwitch" :checked-children="$tcache('map.display')" :un-checked-children="$tcache('map.hide')" @change="changePointSwitch"/></span>
          <span>{{$tcache('map.realTimeAGV')}}：<a-switch v-model="showagv" :checked-children="$tcache('map.open')" :un-checked-children="$tcache('map.close')" @change="onChangeShowAgv"/></span>
          <span>{{$tcache('map.offlineCar')}}：<a-switch v-model="offlineCar" :checked-children="$tcache('map.display')" :un-checked-children="$tcache('map.hide')" @change="changeOfflineAgv"/></span>
          <span>{{$tcache('map.trafficArea')}}：<a-switch :checked-children="$tcache('map.open')" :un-checked-children="$tcache('map.close')" @change="onChangeShowCa"/></span>
          <span>{{$tcache('map.carEndpoint')}}：<a-switch :checked-children="$tcache('map.display')" :un-checked-children="$tcache('map.hide')" @change="onChangeAgvtar"/></span>
          <span>{{$tcache('map.reminderCacheCar')}}：<a-switch v-model="caAgv" :checked-children="$tcache('map.display')" :un-checked-children="$tcache('map.hide')" @change="checkAgvLocked()"/></span>
          <span>{{$tcache('map.machineStatus')}}1：<a-switch  :checked="showStationState" :checked-children="$tcache('map.display')" :un-checked-children="$tcache('map.hide')" @change="onChangeShowStations"/></span>
          <div class="colormsg">(<div class="c-1"></div>：{{$tcache('map.onLine')}}<div class="c-2"></div>：{{$tcache('map.offline')}}<div class="c-3"></div>：{{$tcache('map.abnormal')}})</div>
          <span>{{$tcache('map.machineStatus')}}2：<a-switch  :checked="showStationState2" :checked-children="$tcache('map.display')" :un-checked-children="$tcache('map.hide')" @change="onChangeShowStations2"/></span>
          <div class="colormsg">(<div class="c-4"></div>：{{$tcache('map.timeout')}}<div class="c-5"></div>：{{$tcache('map.refueling')}})</div>
          <div>{{$tcache('map.pointID')}}：<a-input ref="position_point" v-model="pointid" style="width: 25%;height:10%" @focus="translatey()"></a-input><a-button :disabled="queryPointBtn" style="height: 27px;border:1px solid #40a9ff;" @click="queryPoint">{{$tcache('common.query')}}</a-button></div>
          <div>{{$tcache('map.routeID')}}：<a-input v-model="routeid" style="width: 25%;height:10%" @focus="translatey()"></a-input><a-button style="height: 27px;border:1px solid #40a9ff;" @click="queryRoute">{{$tcache('common.query')}}</a-button></div>
          <div>{{$tcache('map.carID')}}：<a-input v-model="Agv_ID" style="width: 25%;height:10%" @focus="translatey()"></a-input><a-button :disabled="queryAgvBtn" style="height: 27px;border:1px solid #40a9ff;" @click="queryAgv">{{$tcache('common.query')}}</a-button></div>
        </a-space>
      </a-row>

      <a-row :hidden="collapsed">
        <a-radio-group v-model="routefilter" button-style="solid" @change="changeRouteFilter">
          <a-radio-button value="all">{{$tcache('map.whole')}}</a-radio-button>
          <a-radio-button value="start">{{$tcache('map.startPoint')}}</a-radio-button>
          <a-radio-button value="middle">{{$tcache('map.midpoint')}}</a-radio-button>
          <a-radio-button value="end">{{$tcache('map.end')}}</a-radio-button>
        </a-radio-group>
      </a-row>
      <div class="routes">
        <a-row :hidden="collapsed" v-for="r in routes" :key="'route' + r.id" >
          <a-tag style="margin:2px;cursor:pointer;" :color="r.style.stroke" :title="r.points" @click="highlightRoute" :data-id="r.id">{{r.id}} [{{r.points}}] {{r.remark}}</a-tag>
        </a-row>
      </div>
    </a-layout-sider>
    
    <div class="map-wrapper" :class="{'map-wrapper-mobile': clientType !== 'pc'}" :style="{marginTop: '64px'}">
      <div class="map-content" :style="{width: map.width + 'px', height: map.height + 'px'}">
        <svg xmlns="http://www.w3.org/2000/svg" :width="map.width" :height="map.height" id="map" ref="map" style="background:url(img/map.svg) no-repeat">
          <g class="station" v-for="r in rects" :key="'rects'+r.id">
            <rect v-if="showStationState" :width="r.width" :height="r.height" :data-id="r.id" :x="r.x" :y="r.y" :class="r.cls" 
              :style="{fill: (r.offline==true||!r.enabled)?'#6a6a6a':r.controlState!=1?'red':'#d1d12b'}">
              <title>{{r.title}}</title>
            </rect>
            <!-- &&!(map.name.includes('宿迁阿特斯')&&(r.name.includes('RCA')||r.name.includes('BSG'))) -->
            <text v-if="showStationState&&!(map.name.includes('宿迁阿特斯')&&(r.name.includes('RCA')||r.name.includes('BSG')))" :x="r.x+r.width/4" :y="r.y+20" :dx="r.dx" :dy="r.dy" :writing-mode="r.writingMode" :style="{stroke:'white'}">{{r.title}}</text>  
          </g>
          <g class="station" v-for="r in rects" :key="'rectss'+r.id">
            <rect v-if="showStationState2" :width="r.width" :height="r.height" :data-id="r.id" :x="r.x" :y="r.y" :class="r.cls" 
              :style="{fill: r.timeOut==1?'#00cbff':r.timeOut==2?'#00ff8e':'#fff0'}">
            </rect>
            <text v-if="showStationState2" :x="r.x+r.width/2.5" :y="r.y+20" :dx="r.dx" :dy="r.dy" :writing-mode="r.writingMode" :style="{stroke: r.timeOut==1?'red':'white'}">{{r.timeOut==1?$tcache('map.timeout'):r.timeOut==2?$tcache('map.refueling'):''}}</text>
          </g>
          <polygon v-for="ca in ctrlareas" :key="'ca'+ca.id" :points="ca.points" :class="ca.css"><title>{{$tcache('map.trafficArea')}}id：{{ ca.id }}</title></polygon>
          <polyline v-if="route.pointstr" :points="route.pointstr" :style="route.style" />
          <polyline v-for="r in routes" :key="'r'+r.id"  :points="r.pointstr" :style="r.style" >
            <animate v-if="r.cls=='focus'" attributeName='stroke-width' dur='1s' values="1;6;1" repeatCount="indefinite"/>
          </polyline>
          <circle v-show="pointSwitch" :class="'dot '+ p.cls" v-for="p in points" :key="p.id" r="3" :cx="p.ax" :cy="p.ay" :id="'dot'+p.id" :data-id="p.id" @mouseover="dotHover" @mouseout="dotOut" @click="dotClick">
            <title>{{p.id}}-{{p.remark}}</title>
          </circle>
          <defs>
            <filter id="f1" x="0" y="0">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>
          <g v-show="showagv&&item.state!=(offlineCar?999:0)" v-for="(item,k) in agvmap" :key="'agv' + k" :data-id="k" :id="'agv'+k" @click="agvClick" :class="item.cls">
            <rect  class="car-image" :style="{'fill':item.highlightAGV?'#ff9a00':(item.power<50)?'red':'none'}" :x="item.ax-10" :y="item.ay-10" filter="url(#f1)"  width="30" height="30"></rect>
            <image  class="car-image" :x="item.ax-10" :y="item.ay-10" width="25" height="25" :href="item.href" />
            <!-- <text :x="item.ax-40" :y="item.ay-10" class="agv-title car-image" :style="{fill:(colmd?'white':'black'),transform:`translate(${item.tx}px,${item.ty}px)`}">{{item.to&&agvtarget?$tcache('map.end')+':'+item.to:''}}[{{item.state}}{{item.stateTitle}}]</text> -->
            <text :x="item.ax-40" :y="item.ay-10" class="agv-title car-image" :style="{fill:(colmd?'white':'black')}">{{item.to&&agvtarget?$tcache('map.end')+':'+item.to:''}}[{{item.state}}{{item.stateTitle}}]</text>
            <!-- <g>
              <text :x="item.tx-40" :y="item.ty-10" :style="{fill:(colmd?'white':'black')}">{{item.to&&agvtarget?$tcache('map.end')+':'+item.to:''}}[{{item.state}}{{item.stateTitle}}]</text>
              <animate attributeName="x" :from="item.tx-40" :to="item.ax-40" dur="3s" fill="freeze" />
              <animate attributeName="y" :from="item.ty-10" :to="item.ay-10" dur="3s" fill="freeze" />
            </g> -->
            <text v-if="caAgv" :x="item.ax-40" :y="item.ay-25" class="agv-title" :style="{fill:'#ffd800'}">{{item.highlightAGV?$tcache('map.goingTo')+`${item.stationName}`:''}}</text>
            <text :x="item.id<9?item.ax-5:item.ax-10" :y="item.ay+5" class="agv-text" :style="{stroke: item.href.includes('gray') ? 'black' : 'white'}" >{{item.id}}</text>
          </g>
        </svg>
      </div>
    </div>
    <div id="tooltiptext" class="tooltip" style="position: absolute; display:none;background-color: #cccccc;border-radius:5px;padding: 5px;">
      <div class="popover-title">{{tip.title}}</div>
      <div class="popover-content">
        {{tip.content}}
      </div>
    </div>
    <!-- 侧边栏 -->
    <a-drawer
        :title="agvinfo.title"
        :visible="visible_drawer"
        placement="bottom"
        :mask="false"
        @close="handleCancel"
        :body-style="{ paddingBottom: '20px' }"
    >
      <agvInfoDetail :agv="agvinfo" :agv2="agvinfo2" />
    </a-drawer>
    <div class="fixed">
      <div>
        <div class="content" :style="{maxWidth:wth,overflow:'hidden',float:'left',height: '50px'}">
          <div :title="$tcache('map.agvStatus')">
            <a-button type="primary" :hidden="visible_tool" @click="visible_tool=true"><a-icon class="a-icon" type="radius-bottomright" /></a-button>
            <a-button type="primary" :hidden="!visible_tool" @click="visible_tool=false"><a-icon class="a-icon" type="radius-bottomleft" /></a-button>
          </div>
          <div :title="$tcache('map.trafficArea')">
            <a-button type="primary" :hidden="visible_controlArea" @click="visible_controlArea=true"><a-icon class="a-icon" type="caret-right" /></a-button>
            <a-button type="primary" :hidden="!visible_controlArea" @click="visible_controlArea=false"><a-icon class="a-icon" type="caret-left" /></a-button>
          </div>
          <div :title="$tcache('common.productionProcesses')">
            <a-button type="primary" :hidden="visible_agvStep" @click="visible_agvStep=true"><a-icon class="a-icon" type="align-left" /></a-button>
            <a-button type="primary" :hidden="!visible_agvStep" @click="visible_agvStep=false"><a-icon class="a-icon" type="align-right" /></a-button>
          </div>
          <div :title="$tcache('map.carElectricityMeter')">
            <a-button type="primary" :hidden="visible_agvmap" @click="visible_agvmap=true"><a-icon class="a-icon" type="thunderbolt" /></a-button>
            <a-button type="primary" :hidden="!visible_agvmap" @click="visible_agvmap=false"><a-icon class="a-icon" type="thunderbolt" /></a-button>
          </div>
        </div>
        <div class="lock" @click="switchs">
          <div :title="$tcache('map.expand')" v-show="!visible_btn"><a-icon class="a-icon" type="fullscreen" /></div>
          <div :title="$tcache('common.close')" v-show="visible_btn" ><a-icon class="a-icon" type="fullscreen-exit" /></div>
        </div>
      </div>
    </div>
    <div class="lis">
      <div  class="li">
        <div v-show="visible_tool" class="radius" style="max-height:33vh;overflow: auto;padding: 15px 30px;width: 50vw;">
          <h2>{{$t('map.agvStatus')}}</h2>
          <div class="tl" v-for="k in Object.keys(toolData)" :key="k"><span :style="{backgroundColor:statesColor[k],color:'white'}">{{k|fmtState}}</span>：{{toolData[k]?toolData[k].join(', '):''}}</div>
          <div class="tl flex"><span class="addWidth" style="background-color:red;display: inline-block;"></span>：{{$t('map.agvEle')}}</div>
        </div>
      </div>
  
      <div  class="li">
        <div class="radius" v-show="visible_controlArea">
          <a-row>
            <a-table style="overflow: auto;" :dataSource="controlAreaData" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
              <template slot="title">
                <h2>{{$tcache('map.trafficArea')}}</h2>
              </template>
              <span class="commonAction" slot="commonAction" slot-scope="text, record">
                <a-button v-if="isAdmin||editable"  @click="() => putAgvId(record.id)"><span class="fontSty">{{$tcache('map.release')}}</span></a-button>
                <!-- <a-button  @click="() => showTraffic(record.name)"><span class="fontSty">{{$tcache('map.display')}}/{{$tcache('map.hide')}}</span></a-button> -->
              </span>

              <!-- 创建一个用于筛选数据的下拉框和搜索按钮 -->
              <div
                slot="filterDropdown"
                slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                style="padding: 8px"
              >
                <a-input
                  v-ant-ref="c => (searchInput = c)"
                  :placeholder="`Search ${column.dataIndex}`"
                  :value="selectedKeys[0]"
                  style="width: 188px; margin-bottom: 8px; display: block;"
                  @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                  @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
                />
                <a-button
                  type="primary"
                  icon="search"
                  size="small"
                  style="width: 90px; margin-right: 8px;"
                  @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
                >
                  {{$tcache('common.query')}}
                </a-button>
                <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">
                  {{$tcache('common.reset')}}
                </a-button>
              </div>
              <a-icon
                slot="filterIcon"
                slot-scope="filtered"
                type="search"
                :style="{ color: filtered ? '#108ee9' : undefined }"
              />
              <!-- 渲染具有自定义样式的文本内容，根据搜索文本进行高亮显示 -->
              <template slot="customRender" slot-scope="text, record, index, column">
                <span v-if="searchText && searchedColumn === column.dataIndex">
                  <template
                    v-for="(fragment, i) in text
                      .toString()
                      .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
                  >
                    <mark
                      v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                      :key="i"
                      class="highlight"
                      >{{ fragment }}</mark
                    >
                    <template v-else>{{ fragment }}</template>
                  </template>
                </span>
                <template v-else>
                  {{ text }}
                </template>
              </template>


            </a-table>
          </a-row>
        </div>
      </div>
  
      <div  class="li">
        <div class="radius" v-show="visible_agvStep">
          <a-row>
            <a-table style="overflow: auto;" :dataSource="agvStepData" :columns="columns_agvStep" rowKey="stepId" size="small" :scroll="{ x: true}">
              <template slot="title">
                <h2>{{$tcache('common.productionProcesses')}}</h2>
              </template>
              <div class="fontColor" slot="stepId" slot-scope="text" :data-id="text" >{{text|fmtStep}}</div>
              <div class="fontColor" slot="agvId" slot-scope="text" :data-id="text" >{{text|fmtString}}</div>
            </a-table>
          </a-row>
        </div>
      </div>

      <div  class="li">
        <div class="radius" v-show="visible_agvmap">
          <!-- <div style="font-weight: bold;padding: 5px;">{{$tcache('map.offline')$tcache('map.carBattery')}}：<a-switch v-model="offlineCar_electricity" :checked-children="{{$tcache('map.display')}}"  :un-checked-children="{{$tcache('map.hide')}}" @change="onChangeElectricity"/></div> -->
          <a-row>
            <h2>-{{$tcache('map.carElectricityMeter')}}-</h2>
            <a-tabs default-active-key="all" @change="select_status">
              <a-tab-pane v-for="t in tabs" :key="t.key" :tab="t.tab"></a-tab-pane>
            </a-tabs>
            <a-table style="overflow: auto;" :dataSource="Object.values(agvElectric)" :columns="columns_agvmap" rowKey="id" size="small" :scroll="{ x: true}">
              <template slot="title">
                <h4>{{$tcache('map.averageElectricity')}}({{$tcache('map.onLine')}})：{{averagePower}}</h4>
              </template>
              <div slot="state" slot-scope="text" >{{text|fmtState}}</div>
            </a-table>
          </a-row>
        </div>
      </div>

    </div>
    <a-back-top />
  </a-layout>
</template>

<script>
import {mapState} from 'vuex'
import { axiosget } from '../utils/index';
import agvInfoDetail from "@/components/agvInfoDetail";
const agvStatesData = require('../data/agv_state.json');
const tableHeader = require('../data/columns_map.json');
const tableHeader01 = require('../data/columns_map_agvStepDate.json');

let zoomData = {
  scale: 1
};
let translationData = {
  startPosX: 0,
  startPosY: 0,
  startPointX: 0,
  startPointY: 0,
  movePointX:0,
  movePointY:0,
  isDown: false,
}
var POINT_SEP = process.env.VUE_APP_POINT_SEP||'-'; //路线中的点的分隔符，默认减号
const zoomScale = 66.7 //激光坐标值(cm)与原始背景图的比率
const offset = {ax: 1110, ay: 545}
var vueApp=null
// const columns_agvmap=[
//   {"title":"id","dataIndex":"id","key":"id"},
//   {"title":"电量","dataIndex":"power","key":"power",sorter: (a, b) => a.power - b.power,defaultSortOrder: 'ascend',},
//   {
//     "title":"状态",
//     "dataIndex":"state",
//     "key":"state",
//     "scopedSlots": { "customRender": "state" },
//     filters: [
//       {
//         text: '离线',
//         value: 0,
//       },
//       {
//         text: '在线',
//         value: 1,
//       },
//     ],
//     onFilter: (value, record) => {
//       if(record.state==0&&value==0){
//         return true
//       }else if(record.state>=value&&value==1){
//         return true
//       }
//     }},
// ]
export default {
  name: 'Map',
  props: {
    mapid: Number
  },
  components:{
    agvInfoDetail,
  },
  data(){
    return{
      clientType: 'pc',
      bgColor: localStorage.getItem('svgBgColor')?localStorage.getItem('svgBgColor'):'#05105c',
      regionId: localStorage.getItem('region_id'), //工序段ID，区域ID
      map:{width:1920,height: 1080,bgimgCls:'bgimg1'},
      originDot: offset,
      zoomX: zoomScale,
      zoomY: zoomScale,

      collapsed: true,
      hide_form: true,
      //查询点、查询线
      pointid: null,
      routeid: null,
      //点
      points:[],
      point:{},
      routes:[], //与当前点相关的路线
      routefilter:'start', // {all,start,middle,end}, //过滤路线的匹配点
      //点导入窗口
      visibleImport: false,
      //路线
      route:{},
      routetext:'',
      //路线文件内容对话框
      visibleModal:false,


      //简单文本tip
      tip: {title:'',content:''},
      //侧边抽屉
      visible_drawer:false,
      confirmLoading: false,


      //实时AGV
      showagv:false,
      agvmap: {},
      agvinfo: {},
      agvinfo2:{},
      //交管区
      ctrlareas:[],
      capolygons:[],
      visible_controlArea:false,//
      controlAreaData:[],//交管区数据
      // columns: require('../data/columns_map.json'),
      controAreaTitle: this.$tcache('map.map01'),
      agvStepTitle:this.$tcache('map.map02'),
      visible_agvStep:false,
      agvStepData:[],//工序车辆数据
      steps:[],
      //弹出面板：交管区
      visible_tool:false,
      bgSwitch:false,//背景开关
      pointSwitch:true,//点位显示隐藏开关
      // toolData:{xs:[],dd:[],cs:[],jg:[],tz:[],qt:[],lx:[]},//工具栏数据
      // toolData:{1:[],2:[],3:[],5:[],6:[],100:[],0:[]},//工具栏数据
      toolData:{0:[],1:[],2:[],3:[],5:[],6:[],7:[],8:[],9:[]},
      toolDataCache:{0:[],1:[],2:[],3:[],5:[],6:[],7:[],8:[],9:[]},//工具栏数据
      //弹出面板数据
      stepAgvsList : [],  //根据step分类显示agv
      caAgvsList : [], //根据交管区分类显示Agv
      stateAgvs : [], //根据状态分类显示agv
      controlState:{},//stationinfo里的机台状态
      timeLag:-1,//timeLag为现在的时间减去websocket第一辆小车反馈时间
      colmd:localStorage.getItem('svgBgColor')=='#efefef'?false:true,//背景模式：false为深色，true为浅色
      // columns_agvmap:require('../data/columns_agvmap.json'),
      columns_agvmap:[
        {"title":"id","dataIndex":"id","key":"id"},
        {"title":this.$tcache('components.agvInfoDetail_C01'),"dataIndex":"power","key":"power",sorter: (a, b) => a.power - b.power,defaultSortOrder: 'ascend'},
        {
          "title":this.$tcache('common.state'),
          "dataIndex":"state",
          "key":"state",
          "scopedSlots": { "customRender": "state" },
          filters: [
            {
              text: this.$tcache('map.offline'),
              value: 0,
            },
            {
              text:  this.$tcache('map.onLine'),
              value: 1,
            },
          ],
          onFilter: (value, record) => {
            if(record.state==0&&value==0){
              return true
            }else if(record.state>=value&&value==1){
              return true
            }
          }},
      ],
      visible_agvmap:false,
      authorities:localStorage.getItem('authorities'),
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      offlineCar:false,//this.$tcache('offline')小车是否显示
      agvState:localStorage.getItem('agvState'),//小车状态
      offlineCar_electricity:true,//this.$tcache('offline')小车电量显示或隐藏
      stationinfoId:[],//保存socket传过来的数据的id，防止重复弹出机台异常报错

      stations:[],
      rects:[],
      rect_width: 30, //矩形宽（面对车辆的边）
      // stationinfoTs:[],//储存stationinfo返回的每条数据的对应的时间
      // agvTs:{},//储存小车时间ts
      showStationState:false,//是否显示机台状态
      showStationState2:false,//是否显示机台状态
      agvreply_count:0,//记录socket推送的agvreply信息次数
      agvmapCache:{},//保存socket推送的agvreply信息
      rectsCache:{},
      controlAreaDataCache:[],
      Agv_ID:'',
      queryAgvBtn:false,//查找小车按钮
      queryPointBtn:false,//查找小车按钮
      visible_btn:false,//
      wth:'0px',
      caAgv:false,
      highlightAGVMap:{},
      agvtarget:false,
      tabs:[],
      agvElectric:{},
      selectedTab:'all',
      averagePower:0,
      states:[],
      statesColor:{0:'#dcdcdc',1:'#1dd200',2:'#0944dc',3:'#0944dc',4:'#dc5000',5:'#dcd812',6:'#dcd812',7:'#a51c00',8:'#a51c00',9:'#a51c00'},
      searchText: '',
    }
  },
  computed:{
    ...mapState(["language"]),
    sliderWidth() {
      const widthInfo = {
        th: '320',
        en: '360',
        ch: '250'
      }
      return widthInfo[this.language]
    },
    columns() {
      return this.$transformI18n(tableHeader);
    },
    columns_agvStep() {
       return this.$transformI18n(tableHeader01);
    },
    agvstates() {
      return this.$transformI18n(agvStatesData);
    }
  },
  beforeMount() {
    tableHeader.unshift({
      title: 'data.i18nKey110',
      dataIndex: 'name',
      key: 'name',
      scopedSlots: {
        filterDropdown: 'filterDropdown',
        filterIcon: 'filterIcon',
        customRender: 'customRender',
      },
      onFilter: (value, record) =>
        record.name
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => {
            this.searchInput.focus();
          }, 0);
        }
      },
    },)
    tableHeader.unshift({title:"id",dataIndex:"id",key:"id",sorter: (a, b) => a.id - b.id,defaultSortOrder: "ascend"})
    this.querySteps()
    // this.addRender()
    vueApp=this
  },
  // watch: {
  //   agvmap: {
  //     deep: true,
  //     handler() {
  //       this.$nextTick(() => {
  //         // 所有数据都已经更新完成
  //         console.log('agvmap is ok')
  //       });
  //     },
  //   },
  // },

  mounted() {
    this.states = this.agvstates.map(k=>{return {value:k.key, text:k.title}})
    this.clientType = this.getClientType()
    // this.map.bgimgCls = `bgimg${regionId}`||'bgimg1'
    this.init(()=>{
      this.pageInited();
      document.querySelectorAll(".map-content")[0].style.visibility = "visible";
    })
    //页面加载完成后执行
    // this.queryPoints()
    this.controlArea()
    this.queryAgvStepData()
    if(localStorage.getItem('showOfflineAgv')!=null)this.offlineCar=localStorage.getItem('showOfflineAgv')=='false'?false:true
  },
  filters:{
    shortStr(val){
      return val.length > 10? val.substr(0,10):val
    },
    fmtStep:val=>{
      let steps = [...vueApp.steps]
      let step = steps.find(e=>e.id == val)
      if(step){
        return step.name
      }
      return val
    },
    fmtString:val=>{
      if(val?.includes(',')){
        return val.join(',')
      }
      return val
    },
    fmtState:val=>{
      let states = [...vueApp.states]
      let state = states.find(e=>e.value == val)
      if(state){
        return state.text
      }
      return val
    },
  },
  beforeDestroy(){
    clearInterval(this.timer_stationinfo);
    this.timer_stationinfo = null;
    // clearInterval(this.timer_agvmap)
    // this.timer_agvmap = null;
    if(this.timer_agvmapCache)clearInterval(this.timer_agvmapCache);
    this.timer_agvmapCache = null;
    clearTimeout(this.timer_onSocketError);
    this.timer_onSocketError = null;
    if(this.socket)this.socket.close()
    clearTimeout(this.timer_agvlock);
    clearTimeout(this.timer_agvinfo);
    clearTimeout(this.timer_allAgvinfo)
  },
  methods:{
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },

    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },

    changeOfflineAgv(bol){
      localStorage.setItem('showOfflineAgv',bol)
    },
    //面板输入软键盘挡住在浏览器兼容
    translatey(){
      let self=this
      if (!(window.navigator.userAgent.indexOf("Windows") !== -1||window.navigator.userAgent.indexOf("Mac") !== -1)) {
        let originHeight = document.documentElement.clientHeight || document.body.clientHeight;
        window.addEventListener('resize', function() {
            let resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
            if (originHeight > resizeHeight) {
              self.$refs.instruction_panel.$el.style.top=`-${self.$refs.position_point.$el.offsetTop}px`
            } else {
              self.$refs.instruction_panel.$el.style.top=0
               
            }
            originHeight = resizeHeight;
        }, false)    
      } 
    },
    pageInited() {
      if(this.clientType !== "pc") {
        const viewportList = document.querySelectorAll("meta[name='viewport']");
        const head = document.getElementsByTagName("head")[0];
        for(let item of viewportList) {
          head.removeChild(item)
        }
        this.addMeta(
          'viewport',
          'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover',
        );
        const bodyDom = document.body;
        const mapWrapperDom = document.getElementsByClassName("map-wrapper")[0];
        const mapContentDom = document.getElementsByClassName("map-content")[0];
        const mapWrapperWidth = mapWrapperDom.offsetWidth;
        const mapWrapperHeight = mapWrapperDom.offsetHeight;
        translationData.startPosX = (mapWrapperWidth - this.map.width) / 2;
        translationData.startPosY = (mapWrapperHeight - this.map.height) / 2;
        mapContentDom.style.left =  translationData.startPosX + 'px';
        mapContentDom.style.top =  translationData.startPosY + 'px';
        this.addEventToSvg(bodyDom, mapWrapperDom, mapContentDom);
      }
    },
    addEventToSvg(bodyDom, mapWrapperDom, mapContentDom) {
      if(this.clientType !== 'pc') {
        mapWrapperDom.addEventListener('touchstart', this.touchStartSvgHandle);
        bodyDom.addEventListener('touchmove', (event)=>{this.touchMoveSvgHandle(event,mapContentDom)}, {passive: false});
        bodyDom.addEventListener('touchend', function () {
          zoomData.moveable = false;

          translationData.movePointX && (translationData.startPosX = translationData.movePointX);
          translationData.movePointY && (translationData.startPosY = translationData.movePointY);
          delete zoomData.pageX2;
          delete zoomData.pageY2;
        });
        bodyDom.addEventListener('touchcancel', function () {
            zoomData.moveable = false;
            delete zoomData.pageX2;
            delete zoomData.pageY2;
            translationData.movePointX && (translationData.startPosX = translationData.movePointX);
          translationData.movePointY && (translationData.startPosY = translationData.movePointY);
        });
      } else {
        // if(document.addEventListener){
        //   mapWrapperDom.addEventListener('mousewheel', (event)=>{this.mousewheelHandle(event, mapContentDom)}, {passive: false});
        // }else {
        //   mapWrapperDom.attachEvent("onmousewheel", this.mousewheelHandle);
        // }
        // // window.addEventListener("onmousewheel", this.mousewheelHandle)
        // mapWrapperDom.addEventListener('mousedown', this.mouseDownSvgHandle);
        // bodyDom.addEventListener('mousemove', (event)=>{this.mouseMoveSvgHandle(event,mapContentDom)}, {passive: false});
        // bodyDom.addEventListener('mouseup', function () {
        //   if(translationData.isDown) {
        //     translationData.startPosX = translationData.movePointX;
        //     translationData.startPosY = translationData.movePointY;
        //     translationData.isDown = false;
        //   }
        // });
        // bodyDom.addEventListener("mouseout", function() {
        //   if(translationData.isDown) {
        //     translationData.isDown = false;
        //     translationData.startPosX = translationData.movePointX;
        //     translationData.startPosY = translationData.movePointY;
        //   }
        // })
      }
    },
    mousewheelHandle(event, mapContentDom) {
      let isDown = true;
      isDown = event.wheelDelta ? event.wheelDelta < 0 : event.detail > 0;
      if(isDown) {
        zoomData.scale = Number.parseFloat((zoomData.scale + 0.04).toFixed(2));
      } else {
        zoomData.scale = Number.parseFloat((zoomData.scale - 0.04).toFixed(2));
      }
      mapContentDom.style.transform = 'scale('+ zoomData.scale +')';
    },
    mouseDownSvgHandle(event) {
      if(event.button == 0) {
        translationData.isDown = true;
        translationData.startPointX = event.pageX;
        translationData.startPointY = event.pageY;
      }
    },
    mouseMoveSvgHandle(events, mapContentDom) {
      if(translationData.isDown) {
        translationData.movePointX = translationData.startPosX + events.pageX - translationData.startPointX;
        translationData.movePointY =  translationData.startPosY + events.pageY - translationData.startPointY;
        // mapContentDom.style.transform = `translate3d(${translationData.movePointX}px,${ translationData.movePointY}px,0)`;
        mapContentDom.style.left = translationData.movePointX + 'px';
        mapContentDom.style.top = translationData.movePointY + 'px';
      }
    },
    touchStartSvgHandle(event) {
      let touches = event.touches;
      let events = touches[0];
      let events2 = touches[1];

      // event.preventDefault();

      // 第一个触摸点的坐标
      zoomData.pageX = events.pageX;
      zoomData.pageY = events.pageY;

      zoomData.moveable = true;

      if (events2) { // 缩放
        zoomData.pageX2 = events2.pageX;
        zoomData.pageY2 = events2.pageY;
      } else { // 移动
        translationData.startPointX = events.pageX;
        translationData.startPointY = events.pageY;
      }

      zoomData.originScale = zoomData.scale || 1;
    },
    touchMoveSvgHandle(event, mapContentDom) {
      if (!zoomData.moveable) {
            return;
        }

      event.preventDefault();

      var touches = event.touches;
      var events = touches[0];
      var events2 = touches[1];
      this.hideSimpleTip()
      // 双指移动
      if (events2) {
          // 第2个指头坐标在touchmove时候获取
        if (!zoomData.pageX2) {
            zoomData.pageX2 = events2.pageX;
        }
        if (!zoomData.pageY2) {
            zoomData.pageY2 = events2.pageY;
        }

        // 获取坐标之间的举例
        const getDistance = function (start, stop) {
            return Math.hypot(stop.x - start.x, stop.y - start.y);
        };
        // 双指缩放比例计算
        var zoom = getDistance({
            x: events.pageX,
            y: events.pageY
        }, {
            x: events2.pageX,
            y: events2.pageY
        }) /
        getDistance({
            x: zoomData.pageX,
            y: zoomData.pageY
        }, {
            x: zoomData.pageX2,
            y: zoomData.pageY2
        });
        // 应用在元素上的缩放比例
        let newScale = zoomData.originScale * zoom;
        // 最大缩放比例限制
        if (newScale > 3) {
            newScale = 3;
        }
        // if (newScale < 0.2) {
        //     newScale = 0.2;
        // }
        // 记住使用的缩放值
        zoomData.scale = newScale;
        mapContentDom.style.transform = 'scale('+ newScale +')';
      } else {
        translationData.movePointX = translationData.startPosX + events.pageX - translationData.startPointX;
        translationData.movePointY =  translationData.startPosY + events.pageY - translationData.startPointY;
        // mapContentDom.style.transform = `translate3d(${translationData.movePointX}px,${ translationData.movePointY}px,0)`;
        mapContentDom.style.left = translationData.movePointX + 'px';
        mapContentDom.style.top = translationData.movePointY + 'px';
      } 
    },
    addMeta(name, content) {
      const meta = document.createElement('meta');
      meta.content = content;
      meta.name = name;
      document.getElementsByTagName('head')[0].appendChild(meta);
    },
    select_status(key){
      this.selectedTab=key
      let ae={}
      if(key!=='all'){
        let powers=0,num=0
        Object.keys(this.agvmap).forEach(item=>{
          if(this.agvmap[item].remark==key){
            ae[item]={}
            ae[item]=this.agvmap[item]
            if(ae[item].state!=0){
              powers+=ae[item].power
              num++
            }
          }
        })
        this.agvElectric=ae
        this.averagePower=Math.floor(powers/(num==0?1:num))
      }else{
        this.agvElectric=this.agvmap
        let powers=0,num=0
        Object.keys(this.agvElectric).forEach(item=>{
          if(this.agvElectric[item].state!=0){
            powers+=this.agvElectric[item].power
            num++
          }
        })
        this.averagePower=Math.floor(powers/(num==0?1:num))
      }
    },
    onChangeAgvtar(bool){
      this.agvtarget=bool
    },
    queryAgv(){
      let dom=document.getElementById(`agv${this.Agv_ID}`)
      if(!dom){this.$message.info(this.$tcache("map.searchCarNotExist"));return}
      dom.scrollIntoView({behavior: "smooth",block:'center',inline:'center'})
      console.log(dom.children[0].style)
      let bg=[...dom.children[0].style.fill].join('')
      let timer=setInterval(()=>{
        if(dom.children[0].style.fill=='yellow'){
          dom.children[0].style.fill=bg
        }else{dom.children[0].style.fill='yellow';this.queryAgvBtn=true}
      },500)
      setTimeout(()=>{clearInterval(timer);dom.children[0].style.fill=bg;this.queryAgvBtn=false},5000)
    },
    //查询所有机台（与点位相关的数据）
    queryStations(){
      let columns = `id,name,process,step,next_step,next_stations,next_cache_stations,parks,rel_pids,area,do_point,exit_point,station_type,enabled`
      this.axios.get(`station/queryLimitColumns/${columns}`).then(res=>{
        if(res.status == 200){
          this.stations = res.data
          if(this.stations.length == 0){
            this.$notification.warn({message:this.$tcache("common.prompt"), description: this.$tcache("map.machineInfoNotConfig")})
          }
          this.makeSvgData(this.points, res.data)
        }
      }).catch(err=>{
        this.$message.error(err)
      })
    },
    //绘制矩形（机台）
    makeSvgData(points, stations){
      //printList(`stations`, stations)
      let rects = []
      for (let i = 0; i < stations.length; i++) {
        let st = stations[i]
        if(!st.doPoint||!st.exitPoint){
          console.log(`机台配置：`, st.id, st.name, st.doPoint, st.exitPoint, st.stationType)
          this.$notification.error({message:this.$tcache('map.machine')+`${st.id}`+this.$st('map.dockingConfigError'), description:this.$tcache('map.dockPointNotConfig')`，`+this.$st('map.dockPoint')+`：${st.doPoint},`+this.$tcache('map.exitPoint')+`：${st.exitPoint}`})
          continue
        }

        let p0 = points.find(p=>p.id==st.doPoint)
        let p1 = points.find(p=>p.id==st.exitPoint)
        if(!p0 || !p1){
          console.log(this.$tcache('map.machine')+`${st.id}`+this.$tcache('map.incorrectNexistentPointNum')+`：${st.doPoint},${st.exitPoint}`)
          this.$notification.error({message:this.$tcache('map.machine')+`${st.id}`+this.$tcache('map.dockingConfigError'), description:this.$tcache('map.pointNotExist')+`，`+this.$tcache('map.dockPoint')+`：${st.doPoint},`+this.$tcache('map.exitPoint')+`：${st.exitPoint}`})
          continue
        }
        //console.log(p0.ax,p0.ay, p1.ax,p1.ay)
        //计算矩形坐标、尺寸
        let size = 3
        if(st.stationType==2||st.stationType==3){
          size = 3
        }else if(st.name.includes('SE')||st.name.includes('丝网')||st.name.includes('上空')){//一些长度特殊的机台
          size = 2
        }else if((st.name.includes('RCA')||st.name.includes('BSG'))&&this.map.name.includes('宿迁阿特斯')){//宿迁阿特斯
          size=1.8
        }else{
          size = 8
        }

        let rect = this.makeRect(p0.ax,p0.ay, p1.ax,p1.ay,size)
        rect['id'] = st.id
        rect['title'] = `${st.id}-${st.name}`
        rect['cls'] = ''
        rect['enabled']=true
        rect['controlState']=1
        rect['relPids']=st.relPids
        rect['stationType']=st.stationType
        rect['name']=st.name
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
    makeRect(ax, ay, ax2, ay2,size) {
      //let wid = distance(ax,ay,ax2,ay2) * 0.75 //对接口宽度≈车宽≈两点间距3/4
      let wid = this.rect_width //对接口宽度
      size = wid * size //对接口宽度倍数，用来控制机台长度
      let angle = Math.atan2(ay-ay2, ax-ax2)*( 180 /Math.PI)
      // if(angle<0)angle=-angle
      // console.log(angle)
      let rect = {}
      if((angle>-20&&angle<20)){ //对接位在退出点右侧
        rect = {x: ax+15, y: ay-wid/2, width:size, height:wid}
        //文字方向、位置
        rect.dx = 10
        rect.dy = 0
        rect.writingMode = 'lr'
      }
      else if(angle>70 && angle< 110){ //对接位在退出点下侧
        rect = {x: ax-wid/2, y: ay+10, width:wid, height:size}//相对于对接点，向下偏移5
        rect.dx = 10
        rect.dy = 5
        rect.writingMode = 'tb'
      }
      else if(angle>160 ||(angle>-180&&angle<-160)){ //对接位在退出点左侧
        rect = {x: ax-15-size, y: ay-wid/2, width:size, height:wid} //相对于对接点，向左偏移5
        rect.dx = 10
        rect.dy = 0
        rect.writingMode = 'lr'
      }
      else{ //对接位在退出点上侧
        rect = {x: ax-wid/2, y: ay-15-size, width:wid, height:size} ////相对于对接点，向上偏移5
        rect.dx = 10
        rect.dy = 5
        rect.writingMode = 'tb'
      }
      rect.points=`${rect.x+','+rect.y} ${rect.x+25.5+','+(rect.y+15)} ${rect.x+','+(rect.y+30)}`
      return rect
    },



    changePointSwitch(){
      this.pointSwitch=!this.pointSwitch
    },

    querySteps(){
      axiosget(`step/all`,{}, (data)=>{
        if(data){this.steps=data}
      })
    },
    getStateClass(agvInfo){
      //"1":"行驶","2":"到达","3":"可传输","4":"充电","5":"交管","6":"停止","7":"避障","8":"急停",
      var state = agvInfo.state;
      // var tt = Date.now() - agvInfo.ts;
      // if(tt > 60000){//超过1分钟未更新，则说明this.$tcache('offline')（考虑各设备时间不统一问题，把时间设置的大一些）
        // return 'igv igv-offline';
      // }else{
        if(state == 1){
          return 'igv igv-running';
        }else if(state == 2 || state == 3) {
          return 'igv igv-ready';
        }else if(state == 4) {
          return 'igv igv-charge';
        }else if([5,6].includes(state)) {
          return 'igv igv-warning';
        }else if([7,8,9].includes(state)) {
          return 'igv igv-error';
        }else if(state >9 && state % 2 == 0){
          return 'igv igv-working';
        }else if(state == 0){
          return 'igv igv-offline';
        }
      // }
      return 'igv';
    },
    makeStyle(agv){
      // agv.state = Number.parseInt(agv.state||0)
      // let tim=Date.now() - agv.ts
      // if(tim/1000<60){console.log('延迟时间（秒）',tim/1000)}else{
        // console.warn('延迟时间（秒）',tim/1000) 
      // }  
      // if(this.timeLag==-2){
      //   this.timeLag=Date.now() - agv.ts
      // }
      // console.log('this.timeLag',this.timeLag)
      // if( (Date.now() - agv.ts) > (this.timeLag==-1?30000:(this.timeLag+3000)) ){ // 38为郑伟定义的离线
      // this.agvTs[agv.id]=Date.now()
      if(agv.state == 1){//run
        agv.href = 'icon/agv_lightblue.svg'
      }else if(agv.state == 2 || agv.state == 3) {//ready:stop
        agv.href = 'icon/agv_blue.svg'
      }else if(agv.state == 4) {//charge
        agv.href = 'icon/agv_orange.svg'
      }else if([5,6].includes(agv.state)) {//warning
        agv.href = 'icon/agv_yellow.svg'
      }else if([7,8,9].includes(agv.state)) {//error
        agv.href = 'icon/agv_deepred.svg'
      }else if(agv.state >9 && agv.state <=36 && agv.state % 2 == 0){//传输中：working
        agv.href = 'icon/agv_blue.svg'
      }else if(agv.state >9 && agv.state <=36 && agv.state % 2 == 1){//传输完成
        agv.href = 'icon/agv_green.svg'
      }else if(agv.state == 0 || agv.state == 1000){//offline
        agv.href = 'icon/agv_gray.svg'
      }else{
        agv.href = 'icon/agv_blue.svg' //其它自动定义状态
      }
    },
    queryAgvStepData(){
      this.axios.get(`cache/agvinfo/agvStepData`)
      .then(res=>{
        if(res.status == 200){
          this.agvStepData=res.data
        }else{
          this.$message.warning(this.$tcache('map.agvStepDataReqFail'))
        }
      }).catch(err =>{
        this.$message.error(this.$tcache('map.processVehicleFailed')+`：${err}`)
      })
    },
    init(cb){
      this.axios.get(`config/list`)
      .then(res=>{
        if(res.status == 200){
          if(res.data.length){
            //map.width,map.height,map.offsetX,map.offsetY,map.zoomScale,map.rotate
            for (let i = 0; i < res.data.length; i++) {
              let row = res.data[i]
              if(row.key == 'map.width'){
                this.map.width = Number.parseInt(row.value)
                // this.map.width = 500
              }else if(row.key == 'map.height'){
                this.map.height = Number.parseInt(row.value)
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
                // this.map.rotate = 90
              }else if(row.key == 'workshop.name'){
                this.map.name = row.value
                localStorage.setItem('workName',row.value)
              }
            }
            if(Object.keys(this.map).length < 6){
              this.$message.error(this.$tcache('map.mapConfigIncorrectMsg'))
            }
          }
          cb && cb();
          this.queryPoints()
        }else{
          this.$message.warning(this.$tcache('map.queryMapConfigFail'))
        }
      }).catch(err=>{
        console.error(err)
        this.$message.error(this.$tcache('map.reqMapConfigFail'))
      })
    },
    switchs(){
      this.visible_btn=!this.visible_btn
      this.visible_tool=false
      this.visible_controlArea=false
      this.visible_agvStep=false
      this.visible_agvmap=false
      if(this.visible_btn){
        this.wth='250px'
        // this.wth='fit-content'
      }else{
        this.wth='0px'
      }
    },
    //交管区表格内容
    controlArea(){
      this.axios.get(`cache/controlArea/list`)
      .then(res=>{
        if(res.status == 200){
          this.controlAreaData=res.data
          // this.controlAreaDataCache=res.data
        }else{
          this.$message.warning(this.$tcache('map.controlAreaReqFail'))
        }
      }).catch(err =>{
        this.$message.error(this.$tcache('map.transAreaGetFail')+`：${err}`)
      })
    },
    putAgvId(agvId){
      this.axios.put(`cache/controlArea/${agvId}`).then((res)=>{
        if(res.status==200){
          this.controlArea()
          this.$message.success(res.data.message)
        }
      }).catch(()=>{})
    },
    showTraffic(name){
      console.log(name)
    },
    //判断访问终端类型
    getClientType(){
      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { //判断iPhone|iPad|iPod|iOS
        return 'ios'
      } else if (/(Android)/i.test(navigator.userAgent)) {  //判断Android
        //window.location.href ="Android.html";
        return 'android'
      } else { //pc
        return 'pc'
      }
    },
    showRouteFile(){
      if(!this.route.id){
        this.$message.warning(this.$tcache('map.spCurrentRouteNotSaved'))
        return
      }
      this.visibleModal = true
      this.loadRouteFile(this.route.id)
    },
    loadRouteFile(rid){
      this.axios.get(`route/load/${rid}`)
      .then(res=>{
        if(res.status == 200){
          if(res.data){
            this.routetext = res.data.join('\r\n')
          }else{
            this.genRouteFileContent()
          }
        }else{
          this.$notification.warn({description: this.$tcache('map.loadRouteFileFail')})
        }
      }).catch(err=>{
        this.$notification.error({description:err})
      })
    },
    genRouteFileContent(){
      let route = this.route
      let arr = route.points.split(POINT_SEP)
      if(arr.length<2){
        this.$notification.warn({message:this.$tcache('common.prompt'),description:this.$tcache('map.lessThanTPoint')})
        return
      }
      //终点类型
      let point = this.points.find(p=>p.id+''==arr[arr.length-1])
      let text = `routeNum,fun,,\r\n`
      if(1==point.type||2==point.type){//机台入口，充电入口
        text += `${route.id},1,,\r\n`
      }else{
        text += `${route.id},0,,\r\n`
      }
      text += `start,end,dir,turn\r\n`
      for(var i=0;i<arr.length-1;i++){
        if(i<arr.length-2){
          text += `${arr[i]},${arr[i+1]},1,0\r\n`
        }else{//最后一行转弯采用直角
          text += `${arr[i]},${arr[i+1]},1,1\r\n`
        }
      }
      // this.routetext = text.replaceAll(',','\t')
      this.routetext = text
    },
    dotHover(evt){
      let point = this.points.filter(p=>p.id == evt.target.dataset.id)[0]
      this.tip.title = this.$tcache('map.point')+`：${point.id},`+this.$tcache('map.type')+`：${point.type} [${point.remark}]`
      this.tip.content = this.$tcache('map.laserCoordinates')+`: (${point.x}, ${point.y})`
      this.showSimpleTip(evt)
    },
    dotOut(){
      this.hideSimpleTip()
    },
    dotClick(evt){
      if(this.clientType == 'pc'){
        this.showSider()
      }
      let pid = evt.target.dataset.id
      //显示点详情
      this.point = this.points.filter(p=>p.id == pid)[0]
      if(this.point.cls=='focus'){
        this.point.cls = 'origin'
      }else{
        this.point.cls = 'focus'
      }
      //显示弹出提示层
      this.makeTip(this.point)
      this.showSimpleTip(evt)
      //显示此点相关的路线
      this.queryRelatedRoutes(this.point.id);

      // 添加到路线
      // let points = this.route.points
      // if(points){
      //   if(points.startsWith(`${pid}-`)){
      //     this.route.points = points.replace(`${pid}-`, ``)
      //   }else if(points.endsWith(`-${pid}`)){
      //     this.route.points = points.replace(`-${pid}`, ``)
      //   }else if(points.indexOf(pid) != -1){
      //     this.route.points = points.replace(`-${pid}-`, `-`)
      //   }else{
      //     this.route.points = `${points}-${pid}`
      //   }
      //   this.makeRouteData(this.route)
      // }else{
      //   this.route.points = pid;
      // }
    },
    makeTip(point){
      this.tip.title =this.$tcache('map.point')+ `：${point.id},`+this.$tcache('map.type')+`${point.type} [${point.remark}]`
      this.tip.content = this.$tcache('map.laserCoordinates')+`: (${point.x}, ${point.y})`
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
      let notexits = []
      pids.forEach(pid=>{
        let arr = this.points.filter(p=>p.id+''==pid)
        if(arr.length){
          points.push(arr[0])
        }else{
          notexits.push(pid)
        }
      })
      if(notexits.length){
        this.$notification.error({message:`${route.id}`+this.$tcache('map.pointsNotExistRoute'), description: notexits.join(',')})
      }
      return points.map(p=>`${p.ax}, ${p.ay}`).join(' ')
    },
    highlightRoute(evt){
      // let id = evt.target.dataset.id
      let id=0
      if(evt==this.routeid){id=this.routeid}else{id=evt.target.dataset.id}
      let routes = this.routes
      routes.forEach(r=>{
        r.style['stroke-width']='1'
        if(r.id == id){
          r['cls'] = 'focus'
          //高亮线上的节点：
          this.routes =[] //todo  为何加此句后，才切换路线高亮点才生效？？
          this.clearPointStatus()
          let pids = r.points.split('-')
          this.highlightPoints(pids)
        }else{
          delete(r['cls'])
          // r['cls']=
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

    showSimpleTip(evt){
      let tooltip = document.getElementById("tooltiptext");
      tooltip.style.display = "block";
      // console.log(evt.pageX, evt.clientX, evt.screenX)
      // console.log(window.innerWidth, window.outerWidth, window.pageXOffset)
      let pagex = (evt.pageX + 5 + 200)> window.innerWidth ? (evt.pageX - 160):(evt.pageX + 5);
      let pagey = (evt.pageY + 5 + 50)> window.innerHeight ? (evt.pageY - 60):(evt.pageY + 5);
      // console.log(pagex, pagey);
      tooltip.style.left = pagex + 'px';
      tooltip.style.top = pagey + 'px';
    },
    hideSimpleTip(){
      var tooltip = document.getElementById("tooltiptext");
      tooltip.style.display = "none";
    },

    queryPoints(){
      // var data = this.mockData();
      // this.points = data;
      this.axios.get(`point/all`)
      .then(res=>{
        if(res.status == 200){
          let data = res.data
          data.push({id:0, x:0, y:0, type:0, cls:'origin'})
          this.points = this.makeAllPointsData(data);
          // console.log('this.points',this.points)
          this.$message.success(this.$tcache('map.queryPointSucess'))
          this.onChangeShowAgv(true)

          this.queryStations()
        }else{
          this.$message.warning(this.$tcache('map.queryException'))
        }
      }).catch(e=>{
        if(e.request.status >= 500){
          this.$message.error(this.$tcache('map.reqAppSerStart'))
        }else{
          this.$message.error(e.message)
        }
      })
    },


    makeAllPointsData(data){
      return data.map(p=>{
        let xy = this.makeScreenPoint(p.x, p.y)
        p['ax'] = xy[0]
        p['ay'] = xy[1]
        return this.makePointStyle(p)
      })
    },
    //转换为屏幕坐标
    makeScreenPoint(x, y){
      //根据map.rotate(deg)基于原点修正角度
      let rad = this.map.rotate * Math.PI / 180 //转换为弧度
      // console.log(rad)
      let x1 = x * Math.cos(rad) - y * Math.sin(rad);
      let y1 = y * Math.cos(rad) + x * Math.sin(rad);
      let ax = x1 / this.map.zoomScale + this.map.offsetX
      let ay = -y1 / this.map.zoomScale + this.map.offsetY
      return [ax, ay]
    },
    makePointStyle(p){
      if(p.type){
        if(p.type == 'DECIDE'){
          p['cls'] = 'dot ptype_red'
        }else if(p.type == 'TRANS'||p.type == 'TRANS_EXIT'){
          p['cls'] = 'dot ptype_green'
        }else if(p.type == 'CHARGE'||p.type == 'CHARGE_EXIT'){
          p['cls'] = 'dot ptype_orange'
        }else if(p.type == 'PARK'){
          p['cls'] = 'dot ptype_blue'
        }else{
          p['cls'] = 'dot'
        }
      }
      return p
    },
    handleCancel(){
      this.visible_drawer = false
      this.agvinfo = {}
      this.agvinfo2 = {}
    },
    handleOk(){
      this.confirmLoading = true;
      setTimeout(() => {
        this.visible = false;
        this.confirmLoading = false;
      }, 2000);
    },
    handleTrigger(){
      this.collapsed = !this.collapsed;
      this.hide_form = !this.hide_form;
    },
    showSider(){
      this.collapsed = false;
      this.hide_form = false;
    },
    hideSider(){
      this.collapsed = true;
      this.hide_form = true;
    },
    pressEnterRouteId(e){
      console.log(e.target.value);
    },
    readFile(filePath) {
      // 创建一个新的xhr对象
      let xhr = null
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest()
      } else {
        // eslint-disable-next-line
        xhr = new ActiveXObject('Microsoft.XMLHTTP')
      }
      const okStatus = document.location.protocol === 'file' ? 0 : 200
      xhr.open('GET', filePath, false)
      xhr.overrideMimeType('text/html;charset=utf-8')
      xhr.send(null)
      return xhr.status === okStatus ? xhr.responseText : null
    },
    makePoints(text){
      let arr = text.split('\r\n')
      arr.splice(0,1) //第一行为列名id,x,y，去掉
      arr.splice(arr.length-1,1) //最后一行空行，去掉
      console.log(`共有点：`, arr.length)
      let points = arr.map(s=>{
        if(s.length==0) return null;
        let r = s.split(',')
        let ax = r[1]/25 + 0
        let ay = -r[2]/25
        // return {keys[0]:r[0], keys[1]:r[1],keys[2]:r[2], "ax":ax, "ay": ay}
        return {"id":r[0], "x":r[1],"y":r[2], "ax":ax, "ay": ay}
      })
      console.log('points',points)
      this.points = points;
    },

    queryRoute(){
      let routeid = this.routeid
      this.axios.get(`/route/byid/${routeid}`)
          .then(res=>{
            if(res.status==200){
              this.routes=[]
              this.makeRouteData(res.data)
              this.routes.push(res.data)
              this.highlightRoute(res.data.id)
              this.$message.success(this.$tcache('map.routeHighlighted'))
            }else{
              this.$message.warning(this.$tcache('map.queryException'))
            }
          }).catch(err=>console.error(err))
    },
    queryRelatedRoutes(pid){
      //todo 查询点相关的路线,并生成pointstr,cls，样式采用随机色，以区别不同线
      let url = `/route/bypoint/${pid}`
      console.log('this.routefilter',this.routefilter)
      if(this.routefilter == 'start'){
        url = `/route/bystartpoint/${pid}`
      }else if(this.routefilter == 'middle'){
        url = `/route/bymiddlepoint/${pid}`
      }else if(this.routefilter == 'end'){
        url = `/route/byendpoint/${pid}`
      }
      this.axios.get(url)
          .then(res=>{
            if(res.status==200){
              if(res.data.length){
                res.data.forEach(r=>this.makeRouteData(r))
                this.routes = res.data
              }else{
                this.$message.warning(this.$tcache('map.noDataFound'))
                this.routes = []
              }
            }else{
              this.$message.warning(this.$tcache('map.reqException'))
            }
          }).catch(err=>console.error(err))
    },
    changeRouteFilter(){
      if(this.routefilter && this.point.id){
        this.queryRelatedRoutes(this.point.id)
      }
    },

    initWebSocket(){
      //初始化websocket
      if(typeof(WebSocket) === "undefined"){
        this.$message.info(this.$tcache('map.browserNotSupportWebSocket'))
      }else{
        try {
          //方式一：走服务端的代理，即需要nginx配置/msg代理转发
          var url = new URL(document.location.href);
          var wsurl = `ws://${url.hostname}:${url.port||80}${process.env.VUE_APP_WS_PATH}/msg?map=1`
          if(process.env.VUE_APP_PROXY){
            //方式二：若指定了服务地址VUE_APP_PROXY，则采用VUE_APP_PROXY与后台建立连接，不通过nginx代理
            wsurl = 'ws://' + process.env.VUE_APP_PROXY + `/msg?map=1`
          }
          if(this.clientType === 'pc') {
            this.$message.info(this.$tcache('common.setupWs')+': ' +  wsurl);
          } else {
            this.$message.info(this.$tcache('common.pSetUpWs'));
          }
          this.socket = new WebSocket(wsurl);
          this.socket.onopen = this.onSocketOpen;
          this.socket.onerror = this.onSocketError;
          this.socket.onmessage = this.onSocketMessage;
          this.socket.onclose = ()=>{console.log('socket is closed')};
        }catch (e) {
          console.error(e);
        }
      }
    },
    onSocketOpen(){
      this.$message.success(this.$tcache('common.socketSuccess'))

      if(this.timer_stationinfo)clearInterval(this.timer_stationinfo);
      if(this.timer_agvmapCache)clearInterval(this.timer_agvmapCache);
      if(this.timer_agvlock)clearTimeout(this.timer_agvlock);
      if(this.timer_toolData)clearInterval(this.timer_toolData);
      if(this.timer_controlAreaData)clearTimeout(this.timer_controlAreaData);
      
      this.timer_stationinfo=setInterval(()=>{//页面些许卡顿原因
        if(this.rects.length!=0){
          this.rects.forEach((_,index)=>{
            this.rects[index].offline=true
          })
          if(Object.keys(this.rectsCache).length!=0){
            Object.keys(this.rectsCache).forEach(k=>{
              let obj=Object.assign({},this.rects[k],this.rectsCache[k])
              this.$set(this.rects,k,obj)
            })
          }
          this.$nextTick(()=>{
            console.log('rects is OK')
          })
        }
      },8000)
      this.timer_agvmapCache=setInterval(()=>{
        if(Object.keys(this.agvmapCache).length>0){
          Object.keys(this.agvmapCache).forEach(k=>{
            this.$set(this.agvmap,k,this.agvmapCache[k])
          })
        }
      },300)
      this.timer_toolData=setInterval(()=>{
        Object.values(this.agvmap).forEach(val=>{
          this.dataDeal(val)
        })
        Object.keys(this.toolDataCache).forEach(k=>{
          this.toolDataCache[k].sort((a,b)=>{return a-b})
        })
        Object.assign(this.toolData,this.toolDataCache)
      },5000)
      this.timer_controlAreaData=setInterval(()=>{
        if(this.controlAreaDataCache.length!=0){
          this.controlAreaDataCache.forEach((t,index)=>{
            let i=this.controlAreaData.findIndex(d=>d.id==t.id)
            // Object.assign(this.controlAreaData[i],this.controlAreaDataCache[index])
            this.$set(this.controlAreaData,i,this.controlAreaDataCache[index])
          })
        }
      },15000)
      // this.ws_timer = setTimeout(()=>{this.socket.close();this.$message.warning("socket已关闭，请刷新页面重新连接")},1000*60*10)
      this.checkAgvLocked()
    },
    onSocketError(){
      console.log(this.$tcache('common.socketFailed'))
      this.$message.error(this.$tcache('common.socketFailed'))
      this.timer_onSocketError=setTimeout(this.initWebSocket, 10000); //会在每一次Err后执行，
    },

    dataDeal(data){
      let d={...data}
      // console.log(d)
      if(d.state||d.state==0){
        if(d.state>9){
          d.state=3
        }
        let bol=true;
        Object.keys(this.toolDataCache).map(key=>{
          if((this.toolDataCache[key].includes(d.id)&&key==d.state)){
            bol=false
            return;
          }
          if(this.toolDataCache[key].includes(d.id)){
            let index=this.toolDataCache[key].findIndex(d=>d==d.id)
            this.toolDataCache[key].splice(index,1)
          }
        })
        if(bol){
          let state = d.state;
          this.toolDataCache[state].push(d.id)
        }
      }
    },

    onSocketMessage(evt){
      //{"power":100,"commandStatus":0,"currentX":-931,"currentY":-514,"dataStr":"A1010505015DFCFEFD006400","direction":1,"id":1,"ip":"127.0.0.1","loadings":0,"port":63597,"routeId":5,"state":5,"stateTitle":"TZ","ts":1618565978961}
      var data = evt.data;
      if(typeof(data) === 'string'&&data.startsWith('{')){
        data = eval('('+data+')');
      }
      if(data && data.objType && data.objType == 'agvreply'){//AGV反馈状态: id,state,currentX,currentY,loadingsTitle
          //更新AGV显示位置、样式；状态面板数据
          // let d = Object.assign({}, data, {cssblink: 'textblink', recvTs: Date.now()})
          data.cssblink='textblink'
          // data.recvTs=Date.now()
          let d=data
          d.offline=false
          let xy = this.makeScreenPoint(d.currentX * 10, d.currentY * 10)
          d['ax'] = xy[0]
          d['ay'] = xy[1]
          this.makeStyle(d)
          d['cls'] =this.getStateClass(d)   //根据state确定显示样式
          // this.agvmap[d.id] = d
          if(this.highlightAGVMap[d.id]?.highlightAGV)d.highlightAGV=this.highlightAGVMap[d.id].highlightAGV
          if(this.highlightAGVMap[d.id]?.stationName)d.stationName=this.highlightAGVMap[d.id].stationName
          if(this.agvmap[d.id]?.to)d.to=this.agvmap[d.id].to
          if(this.agvmap[d.id]?.ip)d.ip=this.agvmap[d.id].ip
          if(this.agvmap[d.id]?.remark)d.remark=this.agvmap[d.id].remark
          this.agvmapCache[d.id]=d
          console.log('this.agvmapCache==>',this.agvmapCache)
          // this.$set(this.agvmap,d.id,d)
      }else if(data && data.objType && data.objType == 'stationinfo'){//机台反馈信息：id,name,outNum,inNum,controlState机台状态，ts
          // this.stationinfoTs[data.id]=Date.now()
          let index = this.rects.findIndex(item=>item.id==data.id)
          data.offline=false
          this.rectsCache[index]=data
      }else if(data && data.objType && data.objType == 'ctrlareainfo'){//交管区状态：id,name,type,runAgvs{},waitAgvs{}
          //更新交管区面板 this.controlAreaData
          // console.log('ctrlareainfo',data)
          let index=  this.controlAreaData.findIndex(d=>d.id==data.id)
          this.controlAreaDataCache[index]=data
      }
    },

    checkAgvLocked(){
      if(!this.caAgv){return}
      //卡片模式下，存在前页数据时检查AGV锁状态
      this.axios.get(`cache/lockp`).then(res=> {
        if(res.status == 200){
          let data=res.data?res.data:[]
          this.makeLockData(data)
        }else{
          // this.$message.warning(this.$tcache('map.queryAgvCacheFail'))
          this.$message.warning('nonono')
        }
      }).catch(err=>{
        // this.$message.error(this.$tcache('map.queryAgvCacheFail')+`, ${err}`)
        this.$message.warning(err)
      })
    },
    //检查机台锁信息 agvinfo.targetPoint
    makeLockData(agvInfos){
      console.log(agvInfos)
      // let a={}
      let points = Object.keys(agvInfos)
      Object.keys(this.agvmap).forEach(agv=>{
        if(this.highlightAGVMap[agv]?.highlightAGV==true)this.highlightAGVMap[agv].highlightAGV=false
      })
      console.log(points)
      if(points.length>0){
        this.rects.forEach((d)=>{
          if(d.relPids?.includes(',')){
            let exitPoint=d.relPids.split(',')[0]
            let doPoint=d.relPids.split(',')[1]
            if(points.includes(doPoint)&&(d.stationType==2||d.stationType==3)){
              let agvId = agvInfos[doPoint]
              this.highlightAGVMap[agvId]={}
              this.highlightAGVMap[agvId].highlightAGV=true
              this.highlightAGVMap[agvId].stationName=d.name
            }else if(points.includes(exitPoint)&&(d.stationType==2||d.stationType==3)){
              let agvId = agvInfos[exitPoint]
              this.highlightAGVMap[agvId]={}
              this.highlightAGVMap[agvId].highlightAGV=true
              this.highlightAGVMap[agvId].stationName=d.name
            }
          }
        })
      }
      console.log(this.highlightAGVMap)
      if(this.timer_agvlock)clearTimeout(this.timer_agvlock)
      this.timer_agvlock=setTimeout(()=>{
        this.checkAgvLocked()
      },5000)
    },

    //agv runtime status
    onChangeShowAgv(value){
      this.showagv = value
      if(value){
        this.queryAgvReply()
        this.initWebSocket()
      }else{
        // this.agvmap = {}
        if(this.socket){
          this.socket.close()
          // clearInterval(this.timer_agvmap)
          // clearTimeout(this.ws_timer)
          if(this.timer_agvmapCache){clearInterval(this.timer_agvmapCache)}
          if(this.timer_agvinfo){clearTimeout(this.timer_agvinfo)}
          if(this.timer_agvlock){clearTimeout(this.timer_agvlock)}
          this.$message.info(this.$tcache('map.socketClose'))
        }
      }
    },
    onChangeShowCa(value){
      if(value){
        this.queryCtrlArea()
      }else{
        this.ctrlareas = []
      }
    },
    queryAgvinfo(){
      this.axios.get(`cache/agvinfo/list`).then(res=>{
        res.data.forEach((item)=>{
          if((this.agvmap[item.id]?.to!==item.to&&this.agvmap[item.id].to)||(!this.agvmap[item.id].to))this.agvmap[item.id].to=item.to
        })
      })
      if(this.timer_agvinfo)clearTimeout(this.timer_agvinfo)
      this.timer_agvinfo=setTimeout(()=>{
        this.queryAgvinfo()
      },3000)
    },
    queryAgvReply(){
      axiosget(`cache/agvreply/list`,{}, (data)=>{
        if(Array.isArray(data)){
          let agvmap = {}
          // let stepAgvs = {}  //根据step分类显示agv
          let stateAgvs = {} //根据状态分类显示agv
          // let caAgvs = {} //根据交管区分类显示Agv
          // let powers=0,num=0
          data.forEach(d=>{
            let xy = this.makeScreenPoint(d.currentX * 10, d.currentY * 10)
            d['ax'] = xy[0]
            d['ay'] = xy[1]
            // this.makeStyle(d)
            d['state']=0
            d['stateTitle']='离线'
            d['href']='icon/agv_gray.svg'
            d['cls'] =this.getStateClass(d)
            agvmap[d.id] = d
            if(stateAgvs[d.state]){
              stateAgvs[d.state].push(d.id)
            }else{
              stateAgvs[d.state] = [d.id]
            }
            //step
          })
          this.agvmap = agvmap
          this.agvElectric=this.agvmap
          // this.timer_agvmap=setInterval(()=>{
          //   Object.keys(this.agvmap).forEach((item)=>{
          //     if(Date.now()-this.agvTs[item]>5000&&this.agvmap[item].state!=0){
          //       this.agvmap[item]['state']=0
          //       this.agvmap[item]['stateTitle']='离线'
          //       this.agvmap[item]['href']='icon/agv_gray.svg'
          //     }
          //   })
          // },60000)
          this.queryAgvinfo()
          this.queryAllAgv()
        }
      })
    },
    queryAllAgv() {
      this.axios.get(`agv/all`).then(res => {
        if (res.status == 200 && res.data) {
          let arr=[]
          let obj={all:[]}
          // let powerObj={}
          let powers=0
          let now=Date.now()
          res.data.forEach(item => {
            if(this.agvmap[item.id]){
              item['offline']=true
              if(now-this.agvmap[item.id].ts<60000){
                item['offline']=false
                powers+=this.agvmap[item.id].power
              }
              this.agvmap[item.id].remark=item.remark
              this.agvmap[item.id].ip=item.ip
              this.agvmap[item.id].offline=true//每60秒赋予小车离线状态
              arr.push(JSON.stringify({ key: item.remark, tab: item.remark }))
              if(obj[item.remark]){
                obj[item.remark].push(item)
                // if(now-this.agvmap[item.id].ts<60000)powerObj[item.remark].power+=this.agvmap[item.id].power
              }else{
                obj[item.remark]=[]
                obj[item.remark].push(item)
                // powerObj[item.remark]={power:0}
                // if(now-this.agvmap[item.id].ts<60000)powerObj[item.remark].power=this.agvmap[item.id].power
              }
              obj['all'].push(item)
            }
          })
          // let p=0
          // Object.values(powerObj).forEach(item=>{
          //   if(item.power)p+=item.power
          // })
          // powerObj['all']={power:p}
          this.tabs=[{key: 'all',tab: this.$tcache('map.whole'),}]
          this.tabs=[...new Set([...this.tabs,...arr])]
          for(let i=0;i<this.tabs.length;i++){
            if(!this.tabs[i].key)this.tabs[i]=JSON.parse(this.tabs[i])
            if(this.tabs[i].key!='all'){
              this.tabs[i].tab+=`(${obj[this.tabs[i].key].length})`
              // let onlineLen=obj[this.tabs[i].key].filter(l=>l.offline==false).length
              // if(onlineLen==0){
              //   powerObj[this.tabs[i].key].power=0
              // }else{
              //   powerObj[this.tabs[i].key].power=Math.floor(powerObj[this.tabs[i].key].power/onlineLen)
              // }
            }else{
              this.tabs[i].tab+=`(${obj['all'].length})`
              let onlineLen=obj['all'].filter(l=>l.offline==false).length
              if(onlineLen==0){
                powers=0
              }else{
                powers=Math.floor(powers/onlineLen)
              }
            }
          }
          this.averagePower=powers
          // console.log(this.averagePower)
        }
      }).catch(() => { this.$message.warning(this.$tcache('map.queryAgvInfoCacheFail')) })
      if(this.timer_allAgvinfo)clearTimeout(this.timer_allAgvinfo)
      this.timer_allAgvinfo=setTimeout(()=>{this.queryAllAgv()},60000)
    },
    queryCtrlArea(){
      let that = this
      this.axios.get(`ca/all`).then((res)=>{
        if(Array.isArray(res.data)){
          res.data.forEach(d=>{
            let ss = d.axes.split(' ')
            let points = ss.map(s=>{
              let ab = s.split(',')
              let xy = that.makeScreenPoint(ab[0]*10, ab[1]*10)
              return xy.join(',')
            })
            d['points'] = points.join(' ')
          })
          that.ctrlareas = res.data
          //console.log('ca', this.ctrlareas)
        }
      })
    },
    agvClick(evt){
      var id = evt.currentTarget.dataset.id;
      // var agv = this.agvmap[id];
      var agv = {};

      // let agvreplyMsg={}
      this.axios.get(`cache/agvreply/${id}`).then(res=>{
        if(res.data?.length!=0){
          // agvreplyMsg=res.data
          // this.$notification.info({message:`小车(AGV-${id})信息`, description:JSON.stringify(agvreplyMsg).slice(1,-1).split(',').join(', ')})
          agv={...res.data}
          console.log(this.agvmap[agv.id])
          console.log(`agv${id}clicked`);
          agv['title'] = `AGV-${id} （${agv.currentX}，${agv.currentY}） ip: ${this.agvmap[agv.id].ip}`;
          this.agvinfo = agv;
          //显示侧栏
          this.visible_drawer = true;
        }
      })
      this.axios.get(`cache/agvinfo/${id}`).then(res=>{
        this.agvinfo2=res.data
      })
      
    },
    onChangeBg(val){
      this.colmd=val
      if(val){
        this.bgColor = '#05105c'
        localStorage.setItem('svgBgColor',this.bgColor)
      }else{
        this.bgColor = '#efefef'
        localStorage.setItem('svgBgColor',this.bgColor)
      }
    },
    // queryPoint(){
    //   let i=this.points.findIndex(p=>p.cls=='focus')
    //   if(i!==-1)this.points[i].cls=''
    //   let index=this.points.findIndex(item=>item.id==this.pointid)
    //   let thepoint=this.points[index]
    //   thepoint.cls='focus'
    //   this.$set(this.points,index,thepoint)
    //   this.$message.success(`${this.pointid}点已高亮`)
    // },
    queryPoint(){
      let dom=document.getElementById(`dot${this.pointid}`)
      console.log(dom)
      if(!dom){this.$message.info(`${this.$t('map.noPoint')}`);return}
      dom.scrollIntoView({behavior: "smooth",block:'center',inline:'center'})
      console.log(dom.children[0].style)
      // let bg=dom.children[0].style.fill
      let index=this.points.findIndex(item=>item.id==this.pointid)
      let thepoint=this.points[index]
      thepoint.cls='focus'
      this.$set(this.points,index,thepoint)
      this.$message.success(`${this.pointid}点已高亮`)
    },
    onChangeShowStations(value){
      this.showStationState=value
    },
    onChangeShowStations2(value){
      this.showStationState2=value
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "../assets/scss/map_bright.scss";
@import "../assets/scss/style.scss";


/*更改ant-asider中的文字颜色*/
.ant-row{
  color: white;
}
.ant-input-*{
  color: black;
}
/*输入框样式*/

/*修改左侧：浮动固定*/
.ant-layout-sider-children {
  float: left;
  display: block;
  position: fixed;
  left: 0px;
  top: 0px;
  background-color: black;
  width: inherit;
}
.subtitle{
  background-color:darkblue;margin: 5px 5px 0 0;
  margin: 5px 0;
  width: inherit;
}
.subtitle > div:first-child{
  font-size: 1.2em;
  font-weight: bold;
}
.subtitle input{
  background-color:beige;
}
/*图标*/
.flex-col{
  display: flex!important;
  flex-direction: column;
}

.dotblink{
  animation: blink 1s 3 steps(1);
}
@keyframes blink{
  50% {
    color: transparent;
  }
}
.lis{
  position: fixed;
  z-index: 1011;
  right: 0;
  top: 70px;
}
.map-content{
  transform-origin: center center; 
  position:absolute; 
  visibility: hidden;
  top: 0;
  left: 0;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
}
.map-wrapper{
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
  overflow: auto;
}
.map-wrapper-mobile{
  width: 100%;
  overflow: hidden;
  
}
.fixed{
  position: fixed;
  right: 0;
  z-index: 1012;
  background: #7c7c7c8c;
  padding: 10px;
  border-radius: 5px;
  button{
    margin-right: 5px;
    border-radius: 35%;
  }
  .content{
    transition: all .3s linear 0s;
    div{
      float: left;
      height: 100%;
    }
  }
  .lock{
    float:left;
    width: 50px;
    height: 50px;
    font-size: 18px;
    border-radius: 50%;
    background-color: #7fe3e1;
    cursor: pointer;
    div{
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &:active{
      background-color: #1890ff;
      width: 48px;
      height: 48px;
      margin-top: 2px;
      margin-right: 2px;
    }
  }
}
.btn{
  height: 200px;
  width: 35px;
  color: white;
  padding: 5px;
  font-size: 14px;
  display: flex;
  align-items: center;
  background: steelblue;
}
::v-deep .ant-table-thead > tr > th,::v-deep .ant-table-tbody > tr > td{
  font-weight: bold;
  text-align: center;
}
.commonAction{
  display: flex;
  // width: 100px;
  justify-content:space-around;
}

/**弹出面板样式*/
.panel-content{
  right: 0;
  width: 200px;
  background: #55555588;
}
.flex{
  display: flex;
  align-items: center;
}
.tl{
  text-align: left;
  margin: 10px;
  box-shadow: 1px 1px 5px;
  border-radius: 3px;
  padding: 5px;
  span{
    padding: 5px;
    border-radius: 3px;
    display: inline-block;
    width: 52px;
    text-align: center;
  }
}
.radius{
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  background-color: #fff9;
  overflow: hidden;
}
.routes{
  max-height: 500px;
  overflow: auto;
}
.addWidth{
  width: 52px;
  height: 30px;
  display: inline-block; 
}

.svgbg{
  background-color: #eeeeee;
}
.colormsg{
  max-width: 300px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  div{
    width: 20px;height: 20px;
  }
  .c-1{background-color: #d1d12b;}
  .c-2{background-color: #6a6a6a;}
  .c-3{background-color: red;}
  .c-4{background-color: #00cbff;}
  .c-5{background-color: #00ff8e;}
}
::v-deep .ant-btn-primary{
  // font-size: 18px;
  height: 100%;
}
::v-deep .ant-tabs-bar{
  margin: 0;
}
.stock_leftBtn{
  position: absolute;  
  left: 5px;
  top: 5px;
  z-index: 2;
}
::v-deep .ant-table-thead > tr > th .anticon-filter > svg, .ant-table-thead > tr > th .ant-table-filter-icon > svg{
  fill: #1890ff;
}
.icon{
  display: flex;
  align-items: center;
}
// .car-image{
  // transition: all .3s linear !important;
// }
</style>

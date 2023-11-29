<template>
  <div @dblclick="clearLine">
    <div>
    <svg xmlns="http://www.w3.org/2000/svg" :width="map.width" :height="map.height" id="map" ref="map" class="svgbg">
      <polyline v-for="r in routes" :key="'r'+r.id" :points="r.pointstr" :style="r.style" :data-id="r.id" @click="highlightRoute">
        <title>{{r.id}}[{{r.points}}]</title>
        <animate v-if="r.cls=='focus'" attributeName='stroke-width' dur='1s' values="1;6;1" repeatCount="indefinite"/>
      </polyline>
      <circle r="6" :cx="originDot.ax" :cy="originDot.ay" class="origin" ><title>{{$tcache('admin.origin')}}</title></circle>
      <circle v-for="p in points" :key="'p'+p.id" r="5" :cx="p.ax" :cy="p.ay" :class="'dot '+ p.cls" :id="'dot'+p.id" :data-id="p.id" :title="p.remark" @mouseover="dotHover" @click="dotClick">
        <title>{{p.id}} ({{p.x}},{{p.y}}) {{p.remark}}</title>
      </circle>
    </svg>
    </div>


    <div @click="()=>visibleDrawer=true" class="icon" :title="$tcache('admin.drawerTitle')"><Icon class="fz" type="ios-cog-outline" /></div>
    <a-drawer :title="$tcache('admin.drawerTitle01')"
             :placement="placement"
             :visible="visibleDrawer" :mask="false"
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
        <Panel name="2">
            {{$tcache('common.route')}}
            <div slot="content" style="text-align:center;">
              <div>{{$tcache('common.route')}}ID：<a-input v-model="routeid" style="width: 25%;height:10%;margin: 5px;"></a-input><a-button style="height: 2.6vh;border:1px solid #40a9ff;" @click="queryRoute">{{$tcache('common.query')}}</a-button></div>
              {{$tcache('admin.asRoute')}}
            </div>
            <a-row slot="content" style="margin-bottom:10px;" type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="blockinfo">
              <a-col :span="22" :offset="2"  style="max-height:200px;overflow:auto;">
                <div v-for="(item,index) in routes" :key="index" :title="item.points" class="select-route" :class="item.cls?'skyblue':''"  @click="highlightRoute2(item)">
                  {{$tcache('common.route')}}<span style="background: whitesmoke;padding:5px;">{{item.id?item.id:''}}：{{item.points?item.points:''}}</span>
                </div>
              </a-col>
            </a-row>
            <p slot="content" style="text-align:center;">{{$tcache('admin.pointMap11')}}</p>
            <a-row slot="content" type="flex" justify="start" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="blockinfo">
              <a-col :title="selectRoute.points" :span="22">
                <div class="select-route">{{$tcache('common.route')}}<span style="background: whitesmoke;padding:5px;">{{selectRoute.id?selectRoute.id:''}}：{{selectRoute.points?selectRoute.points:''}}</span></div>
              </a-col>
              <a-col :title="$tcache('admin.pointMap12')">
                <span style="width:60px;display:inline-block;">{{$tcache('admin.remarks')}}：</span>
                <a-input v-model="selectRoute.remark"  class="changeWidth" style="margin-right:2px;" />
              </a-col>
              <a-col :title="$tcache('admin.pointMap13')">
                <span style="width:60px;display:inline-block;">{{$tcache('admin.pointMap15')}}：</span>
                <a-input v-model="selectRoute.priority"  class="changeWidth" style="margin-right:2px;" />
              </a-col>
              <a-col :title="$tcache('admin.pointMap14')">
                <span style="width:60px;display:inline-block;">{{$tcache('admin.pointMap16')}}：</span>
                <a-input v-model="selectRoute.tag"  class="changeWidth" style="margin-right:2px;" />
              </a-col>
              <a-col :span="24" style="text-align:center;"><a-button @click="updateRouteConfig">{{$tcache('common.save')}}</a-button></a-col>
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
import {axiosget} from "../../utils";
import {getCurrentDate} from '../../utils/date.js'
var POINT_SEP = process.env.VUE_APP_POINT_SEP||'-'; //路线中的点的分隔符，默认减号
let vueApp = null
export default {
  name: "point_map",
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
      currPoint: {},//当前点击或mouseover的point
      points_checked:[],

      //输入框及焦点
      focused:'', //焦点输入域ID
      parks:null,
      rel_pids:null,

      ptypes:[], //点位类型
      steps:[],//步骤名称

      pointForm:{},
      downStations:[],//下游机台选项内容
      downCacheStations:[],//下游缓存机选项内容
      nextCacheStations:'',
      nextStations:'',
      selectRoute:{},//选择路线的信息
      areas:[
        {value:1,label:this.$tcache('admin.pointMap17')},
        {value:2,label:this.$tcache('admin.pointMap18')}
      ],
      value1:'1',//默认展开层
      //查询点、查询线
      pointid: null,
      routeid: null,
    }
  },
  beforeMount() {
    this.querySteps()
    vueApp=this
  },
  mounted() {
    this.init()
  },
  filters:{
    fmtStep:val=>{
      let steps = [...vueApp.steps]
      let step = steps.find(e=>e.value == val)
      if(step){
        return step.label
      }
      return val
    },
    fmtTime(val){
      let ts = getCurrentDate(val)
      if(ts){
        return ts
      }
      return val
    },
  },
  methods:{
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
    queryRoute(){
      let routeid = this.routeid
      this.axios.get(`/route/byid/${routeid}`)
          .then(res=>{
            if(res.status==200){
              this.routes=[]
              this.makeRouteData(res.data)
              this.routes.push(res.data)
              this.highlightRoute(res.data.id)
              this.$message.success(this.$tcache('admin.pointMap21'))
            }else{
              this.$message.warning(this.$tcache('common.queryFailure'))
            }
          }).catch(err=>console.error(err))
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
    highlightRoute2(route){
      let id = route.id
      let routes = this.routes
      routes.forEach(r=>{
        r.style['stroke-width']='1'
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
    clearLine(){
      this.routes=[]
      this.points.forEach(p=>{
        if(p['cls'] == 'focus'){
          p['cls'] = this.makePointStyle(p.type)
        }
      })
      this.points_checked=[]
      this.selectRoute={}
      this.pointForm.ids=''
    },
    querySteps(){
      axiosget(`step/all`,{}, (data)=>{
        if(data){this.steps=data.map(e=>{
          return {value:e.id,label:e.name}
        })}
      })
    },
    onClose(){
      this.visibleDrawer=false
    },
    init(){
      this.axios.all([this.queryPoints(),this.queryProcess()])
          .then(this.axios.spread((res1,res2)=>{
          if(res1.status == 200){
            res1.data=res1.data.filter(p=>p.x!==999999)
            this.points = this.makePointsData(res1.data)
            if(this.points.length == 0){
              this.$notification.warn({message:this.$tcache('common.prompt'), description: this.$tcache('admin.pointMap23')})
            }
          }
          if(res2.status == 200){
            this.ptypes=res2.data.map(e=>{
            return {value:e.value, label:e.label}
            })
          }
        })).catch(err=>{
          this.$message.error(err)
        })

    },
    //获取点位类型选项数据
    queryProcess() {
      return this.axios.get(`dict/ptype`)
    },
    //查询对接点、退出点
    queryPoints(){
      return this.axios.get(`point/all`)
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
    //更新路线配置
    updateRouteConfig(){
      console.log(this.selectRoute)
      if(Object.keys(this.selectRoute).length==1&&this.selectRoute.id){this.$message.error(this.$tcache('admin.pointMap24'));return;}else if(!this.selectRoute.id){
        this.$message.error(this.$tcache('admin.pointMap27'));return;
      }
      this.$delete(this.selectRoute,'cls')
      this.$delete(this.selectRoute,'style')
      this.axios.post(`route/save`,this.selectRoute).then(res=>{
        if(res.status == 200){
          console.log(res)
        }else{
          this.$message.warning(this.$tcache('admin.pointMap28'))
        }
      }).catch(err=>{this.$message.error(err)})
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
      console.log(this.map)
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
    dotClick(evt){
      console.log(evt.target.dataset.id)
      let pid = evt.target.dataset.id
      //点位点击高亮，10秒后高亮消失
      let dom=document.getElementById(`dot${pid}`)
      console.log(dom)
      dom.classList.add('point-checked')
      setTimeout(()=>{dom.classList.remove('point-checked')},10000)

      let point = this.points.filter(p=>p.id == pid)[0]
      // if(['TRANS_EXIT','DECIDE','CHARGE_EXIT','PARK'].includes(point.type)){
        this.queryRouteByPass(point.id)
      // }
      //操作面板的数据
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
      this.visibleDrawer=true
    },
    changeFocusedInput(point){
      if(this.focused){
        //检查点位类型，不符合的取消设置
        switch (this.focused) {
          case "parks":
            if(point.type != 'PARK') return;
            break;
          case "rel_pids":
            if(point.type != 'TRANS') return;
            break;
        }
        let pid = point.id
        let value = this[this.focused]
        if(value){
          let arr = value+''.split(',')
          if(! arr.includes(pid+'')){
            this[this.focused] = value + ',' + pid
          }
        }else{
          this[this.focused] = pid
        }
      }
    },
    queryRouteByStartOrMid(id){
      axiosget(`route/bystartormidpoint/${id}`,{},data=>{
        if(data.length){
          data.forEach(r=>this.makeRouteData(r))
          this.routes = data
          console.log('this.routes',this.routes)
        }
      })
    },
    queryRouteByPass(id){
      axiosget(`route/bypoint/${id}`,{},data=>{
        if(data.length){
          data.forEach(r=>this.makeRouteData(r))
          this.routes = data
          console.log('this.routes',this.routes)
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
        this.$notification.error({message:this.$tcache('admin.error06',{id: route.id}), description: notexits.join(',')})
      }
      return points.map(p=>`${p.ax}, ${p.ay}`).join(' ')
    },
    highlightRoute(evt){
      let id = ''
      if(typeof(evt)=="number"){
        id=evt
      }else{
        id = evt.target.dataset.id
      }
      let routes = this.routes
      routes.forEach(r=>{
        r.style['stroke-width']='1'
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
      this.routes = routes
      console.log('this.routes',this.routes)
    },
    highlightPoints(pids){
      this.points.forEach(p=>{
        if(pids.includes(p.id+"") || pids.includes(p.id)){
          p['cls'] = 'focus'
        }
      })
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

    // rectClick(evt){
    //   let id = evt.target.dataset.id
    //   let rect = this.rects.find(e=>e.id == id)
    //   if(rect.cls.includes('checked')){
    //     rect.cls = rect.cls.replace(' checked', '')
    //     //删除选择机台
    //     let idx = this.points_checked.findIndex(e=>e.id == id)
    //     this.points_checked.splice(idx, 1)
    //   }else{
    //     rect.cls = rect.cls + ' checked'
    //     //添加选择机台
    //     let station = this.stations.find(s=>s.id==id)
    //     this.points_checked.push(station)
    //     console.log(station, this.points_checked)
    //   }
    //   let idsarr=[]
    //   this.points_checked.forEach(item=>idsarr.push(item.id))
    //   this.pointForm.ids=idsarr.join(',')
    // },
    dotHover(evt){
      console.log(evt.target.dataset.id)
      // if(evt.target.tagName == 'circle'){
      //   let id = evt.target.dataset.id
      //   let point = this.points.find(s=>s.id==id)
      //   console.log(point)
        // this.currPoint = point
      // }
    },
    //对接位操作面板相关
    showDrawer(){
      this.visibleDrawer=true
    },
    focusInput(evt){
      this.focused = evt.target.id
      console.log(`focused:${evt.target.id}`, this[this.focused])
    }
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
  width: 125px;
}
::v-deep .ant-col{
  margin-bottom: 5px;
}
::v-deep .ant-drawer-title{
  text-align: center;
}
::v-deep .ant-drawer-body{
  // padding:5px 24px;
}
.val{
  color: #1890ff;
}
.select-route{
  width:100%;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
}
.block{
  width:60px;display:inline-block;
}
::v-deep .ant-drawer-body{
  padding: 0;
}
::v-deep .ivu-collapse-content{
  padding: 0 22px;
}
.skyblue{
  color: #00b5ff;
}
.icon{
  position: fixed;
  z-index: 10;
  top: 40px;
  right: 20px;
  .fz{
    font-size: 50px;
    cursor: pointer;
  }
}
.dot575{
  // sto
}
.point-checked{
  stroke: red !important;
  stroke-width: 6px !important;
}
</style>
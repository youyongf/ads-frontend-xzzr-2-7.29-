<template>
  <a-form-model  layout="inline" :form="data">
    <div class="flex">
      <a-form-model-item class="flex_item Width_350" :label="$tcache('admin.nextMachine')+'1'" style="display:none;">
        <div class="nextStationsCN">{{nextStationsCN}}</div>
        <a-select v-model="data.nextStations"  class="changeWidth" mode="multiple" :token-separators="[',']" :allow-clear="true" >
          <a-select-option v-for="item in stations" :key="item.id" :value="item.doPoint">{{item.group|fmtGroup}}-{{item.name}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item class="flex_item Width_350" :label="$tcache('admin.nextMachine')+'2'" style="display:none;">
        <div class="nextStationsCN">{{nextStationsCN2}}</div>
        <a-select :disabled="data.nextStations==undefined||data.nextStations.length==0" v-model="nextStations2"  class="changeWidth" mode="multiple" :token-separators="[',']" :allow-clear="true" >
          <a-select-option v-for="item in stations" :key="item.id" :value="item.doPoint">{{item.group|fmtGroup}}-{{item.name}}</a-select-option>
        </a-select>
      </a-form-model-item>

      <!-- <a-form-model-item class="flex_item Width_350" :label="下一个单下料机台">
        <a-select v-model="data.nextOutBasketStation"  class="changeWidth" mode="multiple" :token-separators="[',']" :allow-clear="true" >
          <a-select-option v-for="item in alldata" :key="item.id" :value="item.doPoint">{{item.name}}</a-select-option>
        </a-select>
      </a-form-model-item> -->

      <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.group')">
        <!-- <a-input  class="changeWidth" type="number" v-model.number="data.group" :placeholder="$tcache('admin.group')" /> -->
        <a-select v-model="data.group"  class="changeWidth" :allow-clear="true">
          <a-select-option class="" v-for="item in groups" :key="item.value" :value="item.value">{{item.label}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$t('admin.stationDet24')">
        <a-switch v-model="data.enabled" >
          <a-icon slot="checkedChildren" type="check" />
          <a-icon slot="unCheckedChildren" type="close" />
        </a-switch>
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stationDet03')">
        <a-select :allow-clear='true' v-model="data.limits"  class="changeWidth" >
          <a-select-option  v-for="item in chargerLimits" :key="item.value" :value="item.value">{{item.value}}</a-select-option>
        </a-select>
        <!-- <a-input class="changeWidth" type="number" v-model.number="data.limits" /> -->
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.stationDet04')}}:</span>
        <a-input  class="changeWidth" type="number" v-model.number="data.line" :placeholder="$tcache('admin.stationDet04')" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stationDet05')">
        <a-select v-model="data.nextCacheStations"  class="changeWidth" mode="multiple" :token-separators="[',']" :allow-clear="true">
          <a-select-option v-for="item in nextCacheStations" :key="item.id" :value="item.doPoint">{{item.name}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$tcache('common.region')">
        <a-select v-if="typeName=='edit'" :allow-clear='true' v-model="data.area" class="changeWidth" :options="areas">
        </a-select>
        <a-input v-else class="changeWidth" type="number" v-model.number="data.area" :placeholder="$tcache('common.region')" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="'(秒)'+$tcache('admin.stationDet06')">
        <!-- <a-select :allow-clear='true' v-model="data.chargerLimits"  class="changeWidth" >
          <a-select-option  v-for="item in chargerLimits" :key="item.second" :value="item.second*60">{{item.second}}{{item.units}}</a-select-option>
        </a-select> -->
        <a-input class="changeWidth" type="number" v-model.number="data.chargerLimits" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stationDet07')">
        <a-select v-show="showAllParks" v-model="data.parks"  class="changeWidth" mode="multiple" :token-separators="[',']" :allow-clear="true">
          <a-select-option class="" v-for="item in parks" :key="item.id" :value="item.id">{{item.step|fmtStep}}-{{item.area}}-{{item.remark}}</a-select-option>
        </a-select>
        <a-select v-show="!showAllParks" v-model="data.parks"  class="changeWidth" mode="multiple" :token-separators="[',']" :allow-clear="true">
          <a-select-option class="" v-for="item in parksByNextStep" :key="item.id" :value="item.id">{{item.step|fmtStep}}-{{item.area}}-{{item.remark}}</a-select-option>
        </a-select>
        <div class="parks"><a-checkbox v-model="showAllParks">全部</a-checkbox></div>
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.stationName')}}:</span>
        <a-input class="changeWidth"  v-model="data.name" :placeholder="$tcache('admin.stationName')" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.stationDet08')}}:</span>
        <a-select :disabled="data.stationType==2||data.stationType==3" v-model="data.process" :allow-clear="true" class="changeWidth">
          <a-select-option v-for="item in processes" :key="item.value" :value="item.value">{{item.value}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.currentStep')}}:</span>
        <a-select :disabled="data.stationType==2||data.stationType==3" v-model="data.step" :allow-clear="true"  class="changeWidth">
          <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item v-if="typeName=='edit'" class="flex_item Width_350" label="id">
        <a-input type="number" class="changeWidth" disabled v-model.number="data.id" placeholder="id" />
      </a-form-model-item>
      <a-form-model-item   class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.nextStep01')}}:</span>
        <a-select :disabled="data.stationType==2||data.stationType==3" v-model="data.nextStep" :allow-clear="true"  class="changeWidth">
          <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.stationDet09')}}:</span>
        <a-input type="number" :disabled="data.stationType==2||data.stationType==3" class="changeWidth"  v-model.number="data.doPoint" :placeholder="$tcache('admin.stationDet09')" />
      </a-form-model-item>
      <a-form-model-item class="flex_item Width_350" :label="$tcache('admin.stationDet10')">
        <a-select :disabled="data.stationType==2||data.stationType==3" v-model="data.outRail" :allow-clear="true"  class="changeWidth">
          <a-select-option v-for="item in railType" :key="item.id+'out'" :value="item.id">{{item.name}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item class="flex_item Width_350" :label="$tcache('admin.stationDet11')">
        <a-select :disabled="data.stationType==2||data.stationType==3" v-model="data.inRail" :allow-clear="true"  class="changeWidth">
          <a-select-option v-for="item in railType" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.stationDet12')}}:</span>
        <a-input class="changeWidth"  v-model="data.relPids" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.stationDet13')}}:</span>
        <a-input  class="changeWidth" type="number" v-model.number="data.exitPoint" :placeholder="$tcache('admin.stationDet13')" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stationDet14')">
        <a-input  class="changeWidth" type="number" v-model.number="data.capacity" :placeholder="$tcache('admin.stationDet14')" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stationDet15')">
        <a-input  class="changeWidth"  v-model.number="data.alternateGroups" :placeholder="$tcache('admin.stationDet15')" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.stationDet16')}}:</span>
        <a-input  class="changeWidth" type="number" v-model.number="data.port" :placeholder="$tcache('admin.stationDet16')" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> {{$tcache('admin.stationDet17')}}:</span>
        <a-input  class="changeWidth" type="number" v-model.number="data.adsPort" :placeholder="$tcache('admin.stationDet16')" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> ip:</span>
        <a-input class="changeWidth"  v-model="data.ip" placeholder="ip" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> UDP{{$tcache('admin.stationDet18')}}:</span>
        <a-input type="number" class="changeWidth"  v-model.number="data.udpHead" :placeholder="'UDP' + $tcache('admin.stationDet18') " />
      </a-form-model-item>
      <a-form-model-item class="flex_item Width_350" :label="$tcache('admin.stationDet19')">
        <a-select :allowClear='true' v-model="data.nextDecidePoint"  class="changeWidth">
          <a-select-option v-for="item in nextDecidePoints" :key="item.id" :value="item.id">{{item.remark}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stationDet20')">
        <a-input class="changeWidth"  v-model="data.parser" :placeholder="$tcache('admin.stationDet20')" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stationDet21')">
        <!-- <a-input class="changeWidth" type="number"  v-model.number="data.stationType" :placeholder="$tcache('admin.stationDet21')" /> -->
        <a-select :allow-clear='true' v-model="data.stationType" class="changeWidth" :options="stationType" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stationDet25')">
        <a-select v-model="data.nextOutBasketStation"  class="changeWidth" mode="multiple" :token-separators="[',']" :allow-clear="true">
          <a-select-option v-for="item in alldata" :key="item.id" :value="item.doPoint">{{item.name}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" label="进料传输花篮限制">
        <a-input class="changeWidth" type="number"  v-model.number="data.inTransferBasketLimit" placeholder="0" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" label="出料传输花篮限制">
        <a-input class="changeWidth" type="number"  v-model.number="data.outTransferBasketLimit" placeholder="10" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" label="有无心跳包">
        <a-input class="changeWidth" type="number"  v-model.number="data.heartbeat" placeholder="0" />
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350" label="是否允许同时传输">
        <a-switch v-model="data.synchron" >
          <a-icon slot="checkedChildren" type="check" />
          <a-icon slot="unCheckedChildren" type="close" />
        </a-switch>
      </a-form-model-item>
      <a-form-model-item  class="flex_item Width_350">
        <span class="col"><span>*</span> 花篮尺寸:</span>
        <a-input class="changeWidth" type="number"  v-model.number="data.basketSize" />
      </a-form-model-item>
    </div>
  </a-form-model>
</template>

<script>
let vueApp=null;
export default {
  name: "station_detail",
  props:{
    data: {type:Object, required:true},
    processes: {type:Array, required: false},
    steps: {type:Array, required: false},
    groups: {type:Array, required: false},
    stations: {type:Array, required: false},
    parks: {type:Array, required: false},
    nextCacheStations: {type:Array, required: false},
    nextStationsCN: {type:String, required: false},
    nextStationsCN2: {type:String, required: false},
    typeName: {type:String, required: false},
    nextDecidePoints: {type:Array, required:false,default:()=>[]},
    alldata: {type:Array, required: false},
  },
  data(){
    return{
      chargerLimits:[],
      enabled:false,
      nextStations2:undefined,
      alld:[],
      stationNameSelected:'',
      stepsArr:[],
      areas:[{value:1, label:this.$tcache('admin.pointMap17')},{value:2,label:this.$tcache('admin.pointMap18')},{value:3,label:this.$tcache('admin.publicDet03')},{value:4,label:this.$tcache('admin.publicDet04')},{value:5,label:this.$tcache('admin.publicDet05')}],

      // areaRemark:[this.$tcache('admin.pointMap17'),this.$tcache('admin.pointMap18'),this.$tcache('admin.publicDet03'),this.$tcache('admin.publicDet04'),this.$tcache('admin.publicDet05')],
      railType:[{id:'U',name:this.$tcache('admin.cacheLayer05')},{id:'D',name:this.$tcache('admin.cacheLayer04')}],
      showAllParks:false,
      parksByNextStep:[],
      stationType:[
        {value:1,label:"普通机台"},
        {value:2,label:"移栽缓存机"},
        {value:3,label:"不带移栽缓存机"}
      ]
    }
  },
  filters:{
    fmtStep:val=>{
      let steps = [...vueApp.steps]
      let step = steps.find(e=>e.id == val)
      if(step){
        return step.name
      }
      return val
    }
  },
  beforeMount(){
    vueApp=this;
    for(let i=0;i<=30;i++){
      this.chargerLimits.push({value:i,label:i})
    }
  },
  watch:{
    alldata: {
      // 监听数据 获取到数据里的数组数据
      handler(val) {
          this.alld =val
      },
      deep: true, // 深度监听
      immediate:true, //当 watch 一个变量的时候，初始化时并不会执行你需要在created的时候手动调用一次。添加immediate属性，这样初始化的时候也会触发
    },
    steps: {
      // 监听数据 获取到数据里的数组数据
      handler(val) {
          this.stepsArr =val
      },
      deep: true, // 深度监听
      immediate:true, //当 watch 一个变量的时候，初始化时并不会执行你需要在created的时候手动调用一次。添加immediate属性，这样初始化的时候也会触发
    },
    data:{
      handler(n,o){
        console.log(n,o)
        this.parksByNextStep=this.parks.filter(p=>p.step===this.data.nextStep)
        let obj=this.data.nextStations2
        if(obj){
          this.nextStations2=JSON.parse(JSON.stringify(obj))
        }else{this.nextStations2=undefined}
        // if()
      },
      deep:true
    },
    nextStations2(n,o){
      console.log(n,o,this.nextStations2)
      this.data.nextStations2=this.nextStations2
    },
    'data.nextStations'(newV, oldV){
      console.log(newV,oldV)
    },
  },
  mounted(){
    // this.queryData()
    // this.areas=[...new Set(this.alldata.map(item=>item.area))]
    this.parksByNextStep=this.parks.filter(p=>p.step===this.data.nextStep)
    console.log(this.parksByNextStep)
    let obj=this.data.nextStations2
    if(obj){
      this.nextStations2=JSON.parse(JSON.stringify(obj))
    }
  }
}
</script>

<style lang="scss" scoped>
.flex{
  text-align: center;
}
.wrap{
  flex-wrap: wrap;
}
.changeWidth{
  width: 230px;
}
.ant-select-selection__rendered{
  color: #706969;
}
::v-deep .ant-select-selection-selected-value{
  color: #706969;
}
// .Width_350{
//   // width: 350px;
//   width: 460px;
// }
::v-deep .ant-form-item-label{
  width: 120px;
  text-align: left;
}
::v-deep .ant-form-item{
  text-align: left;
}
.nextStationsCN{
  position: absolute;
  left: 0;
  top: -36px;
  z-index: 10;
  overflow: auto;
  height: 27px;
}
.col{
  display: inline-block;
  width: 120px;
  text-align: left;
  span{
    color: red;
    position: absolute;
    left: -10px;
  }
}
.flex_item{
  // margin-right: 0;
}
.parks{
  position: absolute;
  z-index: 1;
  right: -70px;
  top: -10px;
}
</style>
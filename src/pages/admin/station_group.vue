<template>
  <div>
    <H2> {{region_name}} {{$tcache('admin.stationGroup15')}}</H2>
    <div class="colorBox">
      <div class="colorNote">
        <span>{{$t('common.optionalSteps')}}：</span>
        <a-select v-model="step" class="select" :placeholder="$t('common.step')" :allow-clear="true" @change="stepChange">
          <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
        </a-select>
        <a-popover v-model="visible_upd" :title="$t('common.options')" trigger="click" placement="bottomRight">
          <div slot="content">
            <a-radio-group  v-model="update_select" button-style="solid">
              <a-radio-button :value="v.key=='nextStations1'?'nextStations':v.key"
                v-for="v in columns2" :key="v.key" v-show="v.key!='nextStations2'&&v.key!='id'">
                {{v.key=='nextStations1'?$t('common.nextStations'):v.title}}
              </a-radio-button>
            </a-radio-group>
            <div class="btn"><a-button @click="stationsUpdatas">{{$t('common.confirm')}}</a-button></div>
          </div>
          <a-button class="edit_batch" :title="$t('common.batchModification_step')" style="margin-left:10px;"><span class="fontSty">{{$t('common.BatchModification')}}</span> </a-button>
        </a-popover>
        <div class="lefticon"><a-icon class="star" type="star" />：{{$t('common.sign')}}</div>
        <a-radio-group name="radioGroup" v-model="radioGroup">
          <div class="groupBox" :title="step?'':'请先选择步骤'" @click="()=>{if(!step){$message.info('请先选择步骤')}}">
            <div>{{$tcache('admin.group')}}：</div>
            <div v-for="(g,i) in groups" :key="i" :style="{backgroundColor:colors[g.value%30]}" class="list group">
              <a-radio :value="g.value" :disabled="!step"><span>{{ g.label }}</span></a-radio>
            </div>
          </div>
        </a-radio-group>
        <div class="colorNote">
          {{$tcache('admin.nextStations01')}}：
          <vuedraggable v-model="steps">
            <transition-group class="colorNote">
              <div v-for="s in steps" :key="s.id" :style="{backgroundColor:'#f0f2f5'}" class="list"><span style="color:black;">{{ s.name }}</span></div>
            </transition-group>
          </vuedraggable>
        </div>
      </div>
      <div>根据区域显示机台：<a-select v-model="area" class="select" placeholder="区域" :allow-clear="true" :options="areas" />(此选项不会关联其他修改项)</div>
    </div>
    <a-checkbox-group @change="handleCheck" v-model="checkedValues">
      <div class="content">
        <div class="item" v-for="(items,key) in kvData" :key="key">
          <div class="process">
            <div>{{ key|fmtStep }}</div> 
          </div>
          <div class="topBottom">
            <div class="top">
              <!-- <div class="title">上</div> -->
              <div v-for="(s,i) in items" :key="i" class="stations"  :title="s.nextStations?$tcache('admin.stationGroup01'):''"  v-show="s.area===area||!area">
                <a-checkbox @click="showWarn(s)" :value="s.id" class="station"
                  :style="{backgroundColor:colors[s.group%30]}"
                  @mouseenter="enter(key,i)" @mouseleave="leave(key,i)">
                  <span>{{s.name}}</span>
                  <a-icon v-if="isAdmin||editable" class="icon" type="edit" @click.prevent="recordEdit(s,key,i)"></a-icon>
                  <a-icon v-if="s.nextStations" class="star" type="star" />
                </a-checkbox>
              </div>
            </div>
            <!-- <div class="bottom">
              <div class="title">下</div>
              <div v-for="(s,i) in items" :key="i" class="stations"  :title="s.nextStations?$tcache('admin.stationGroup01'):''">
                <a-checkbox @click="showWarn(s)" :value="s.id" class="station" v-if="s.sortNum%2==0"
                  :style="{backgroundColor:colors[s.group%30]}"
                  @mouseenter="enter(key,i)" @mouseleave="leave(key,i)">
                  <span>{{s.name}}</span>
                  <a-icon v-if="isAdmin||editable" class="icon" type="edit" @click.prevent="recordEdit(s,key,i)"></a-icon>
                  <a-icon v-if="s.nextStations" class="star" type="star" />
                </a-checkbox>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </a-checkbox-group>
    <!-- 修改记录弹窗 -->
    <a-modal
      :title="$tcache('common.modify')"
      :visible="visible"
      :dialog-style="{ top: '20px' }"
      :width="1000"
      :okText="$tcache('common.save')"
      :cancelText="$tcache('common.cancel')"
      @ok="handleOk"
      @cancel="cancel"
    >
      <station_detail :data="record" :typeName="'edit'"  :parks="parks"
        :stations="stationsData" :nextStationsCN="nextStationsCN" :nextStationsCN2="nextStationsCN2" :alldata="stations" :groups="groups" :steps="steps" />
    </a-modal>
    <a-modal
      :title="$t('common.batchModify')"
      :visible="visible_updatas"
      :dialog-style="{ top: '20px' }"
      :width="1000"
      :okText="$t('common.save')"
      :cancelText="$t('common.cancel')"
      @ok="updataNextStations"
      @cancel="()=>{visible_updatas=false}"
    >
      <publicDetail :data="updates" type="edit" :columns="columns2" :checkbox="checkbox" :checkboxs="checkboxs" :disabled="disabled" :isNum="isNum" :radio="radio" :radios="radios" :hidden="hidden"/>
    </a-modal>
    <a-row>
      <a-col span="11">
        <a-divider orientation="left">{{$tcache('admin.groupAlready')}}：</a-divider>
        <a-checkbox-group :options="usedgroups" ></a-checkbox-group>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="11"><a-divider>{{$tcache('admin.stationGroup02')}}：</a-divider></a-col>
      <a-col :span="11"><a-divider>{{$tcache('admin.stationGroup03')}}：</a-divider></a-col>
      <a-col :span="2"></a-col>
    </a-row>
    <a-row v-if="isAdmin||editable">
      <a-col :span="9">{{checkedValues}}</a-col>
      <a-col :span="9">
        <a-radio-group :options="groups" v-model="group" button-style="solid"></a-radio-group>
      </a-col>
      <a-col :span="6" class="atn">
        <a-button type="primary" @click="toGroup">{{$tcache('admin.stationGroup04')}}</a-button>
        <!-- <a-button type="primary" @click="save">保存</a-button> -->
        <a-popconfirm
          :title="$tcache('admin.stationGroup05')"
          :ok-text="$tcache('common.confirm')"
          :cancel-text="$tcache('common.cancel')"
          @confirm="save"
          @cancel="()=>{}"
          v-if="isAdmin||editable"
        >
          <a-button type="primary">{{$tcache('common.save')}}</a-button>
        </a-popconfirm>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import {printList} from "../../utils";
import station_detail from "./station_group_detail"
import vuedraggable from 'vuedraggable';
import publicDetail from "@/components/public_detail";
const tableHeader2 = require('../../data/columns_stationlist_updata.json');
let vueApp=null;
export default {
  name: "station_group",
  components:{
    station_detail,
    vuedraggable,
    publicDetail
  },
  data(){
    return{
      // colors: ['red','green','#800000','blue','orange','#2599b3','#a2a22b','#b831ba','#ff00b1'],
      colors:['#DC143C','green','#0000FF','#008080','#f3715a','#8294C4','#19A7CE','#FF4500','#a2a22b','#AAC8A7',
        '#99627A','#FF8C00','#E9A178','#800080','#FFC0CB','#FFD700','#00CED1','#B7B7B7','#FF69B4','#9932CC',
        '#A4907C','#CE5959','#4B0082','#9400D3','#008B8B','#FF1493','#FFDAB9','#97DEFF','#FF00FF','#A0522D'
      ],
      region_id: 1,
      region_name: null,
      groups: [],
      usedgroups: [], //已使用的组

      steps:[],
      processes: [],
      stations:[], //{ id: 1, name:"发料机1", process:"发料",step:1, group: 0},
      kvData:{},

      checkedValues:[],
      group:null,
      lastStation:{},
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      record:{},//修改项
      visible:false,
      columns:[],
      disabledStrArr:[],
      showArr:[],
      stationsData:[],
      nextStep:'',
      nextStationsCN:'',
      nextStationsCN2:'',
      parks:[],
      count:0,
      NewSteps:[],

      visible_updatas:false,
      update_select:'',
      // columns2: require('@/data/columns_stationlist_updata.json'),
      checkbox:['nextStations1','nextStations2','parks','nextCacheStations'],
      checkboxs:{},
      isNum:['area','limits'],
      radio:['chargerLimits'],
      radios:{chargerLimits:[]},
      hidden:[],
      updates:{},
      disabled:{edit:['id']},
      visible_upd:false,
      step:null,
      radioGroup:null,
      area:null,
      areas:[
        {value:1,label:"一跨"},
        {value:2,label:"二跨"},
        {value:3,label:"三跨"},
        {value:4,label:"四跨"},
        {value:5,label:"五跨"},
      ]
    }
  },
  // updated() {
  //   console.log(this.steps)
  // },
  watch:{
    steps:{
      handler(newVal, oldVal) {
        console.log('steps', newVal, oldVal)
        if(Array.isArray(newVal)){
          this.NewSteps=newVal
          localStorage.setItem('NewSteps', JSON.stringify(newVal));
        }
        // localStorage.setItem('NewSteps', newVal);
        this.querySteps()
      },
      deep: true,
    },
    radioGroup(newVal,oldVal){
      console.log(oldVal,"==>",newVal)
      let stepStations=this.kvData[`step${this.step}`]?.filter(st=>st.group===this.radioGroup).map(s=>s.id)
      this.checkedValues = stepStations
    },
  },
  computed: {
    columns2() {
      return this.$transformI18n(tableHeader2);
    }
  },
  beforeMount(){
    // this.radios['chargerLimits']
    for(let i=0;i<11;i++){
      this.radios['chargerLimits'].push({value:i*60,label:i+this.$t('common.min')})
    }
  },
  mounted() {
    this.NewSteps=localStorage.getItem('NewSteps')?JSON.parse(localStorage.getItem('NewSteps')):[]
    this.region_id = localStorage.getItem('region_id')
    this.region_name = localStorage.getItem('region_name')
    this.queryParks()
    this.queryGroup()
    this.init()
    vueApp=this
    this.updates={id:'',nextStations1:undefined,nextStations2:undefined,parks:undefined,nextCacheStations:undefined,area:undefined,limits:undefined,chargerLimits:undefined}
  },
  filters:{
    fmtStep:val=>{
      let steps = [...vueApp.steps]
      let step = steps.find(e=>'step'+e.id == val)
      if(step){
        return step.name
      }
      return val
    },
  },
  methods:{
    changeGroup(group){
      let g=this.groups.find(d=>d.value==group)
      if(g){
        return g.label
      }
      return group
    },
    stationsUpdatas(){
      console.log(this.kvData,this.updates.id)
      if(!this.step){
        this.$message.warning("请先选择步骤");
        return;
      }else if(!this.update_select){
        this.$message.warning(`请选择修改项`);
        return;
      }else if(this.checkedValues.length===0){
        this.$message.warning(`请选择要修改的机台`);
        return;
      }
      let bol=false;
      let kvd=this.kvData[`step${this.step}`].map(d=>d.id)
      console.log(this.checkedValues,kvd)
      this.checkedValues.forEach(val=>{
        if(!kvd.includes(val)){
          bol=true;
        }
      })
      if(bol){
        let stepName=this.steps.find(s=>s.id===this.step).name
        this.$message.warning(`不可以选择《${stepName}》步骤以外的机台`)
        return;
      }
      this.updates.id=this.checkedValues.join(',')
      
      // this.updates.id=this.kvData[`step${this.step}`].map(d=>d.id).join(',')
      let keys=Object.keys(this.updates)
      if(this.update_select=='nextStations'){
        this.hidden=keys.filter(k=>!k.includes(this.update_select))
      }else{
        this.hidden=keys.filter(k=>!k.includes(this.update_select))
      }
      this.hidden.splice(0,1)//id不隐藏，第一位为id
      console.log(this.hidden)
      this.visible_upd=false
      this.visible_updatas=true
    },
    updataNextStations(){
      if(this.update_select=='parks'||this.update_select=='nextCacheStations'){
        this.dealt(this.updates[`${this.update_select}`],this.update_select,'update')
      }
      let obj=JSON.parse(JSON.stringify(this.updates))
      if(this.update_select=='nextStations'){
        if(obj.nextStations2?.length>0&&obj.nextStations1?.length>0){
          obj.nextStations=obj.nextStations1.join(',')+';'+this.updates.nextStations2.join(',')
        }else if(obj.nextStations1?.length>0){
          obj.nextStations=obj.nextStations1.join(',')
        }else if(obj.nextStations2?.length>0){
          obj.nextStations=obj.nextStations2.join(',')
        }
        this.$delete(obj,'nextStations1')
        this.$delete(obj,'nextStations2')
      }
      if(Object.keys(obj).length==1||Object.values(obj)[1]===""){
        this.$message.warning("值不可为空")
        return
      }
      this.axios.post(`station/updateStations`,obj).then(res=>{
        if(res.data.success){
          this.isUpdates=true
          this.isSave=false
          this.init()
          this.$message.success(res.data.message)
        }else{
          this.$message.error(res.data.message)
        }
        this.updates={id:obj.id,nextStations1:undefined,nextStations2:undefined,parks:undefined,nextCacheStations:undefined,area:undefined,limits:undefined,chargerLimits:undefined}
        this.visible_updatas=false
      }).catch(err=>{this.$message.error(err);})      
    },
    cancel(){
      console.log(this.$tcache('admin.canceled'))
      // this.kvData[this.record.]
      this.init()
      this.visible = false;
    },
    toGroup(){
      let str=this.usedgroups.map(item=>{return item.value})
      str={groups:str.join(',')}
      this.$router.push({name:'group',query:str})
    },
    recordEdit(s,k,i){
      console.log(s,k,i)
      this.nextStep=s.nextStep?s.nextStep:'';
      this.getNextStation(s.nextStations)
      let parks=s.parks
      if((parks??'')!=''&&typeof parks!=='object'){
        s.parks=parks.split(',')
      }
      this.nextStationsCN = ''
      this.nextStationsCN2 = ''
      let ids =s.nextStations
      if(typeof ids=='string'){
        if(ids.length!=0){
          if(ids.includes(';')){
            let arr1=ids.split(';')[0].split(',')
            s.nextStations=arr1
            let stations = arr1.map(id=>this.stations.find(a=>a.doPoint==id))
            this.nextStationsCN = stations.map(s=>`${s?.name}`).join(',')
            let arr2=ids.split(';')[1].split(',')
            s.nextStations2=arr2
            let stations2 = arr2.map(id=>this.stations.find(a=>a.doPoint==id))
            this.nextStationsCN2 = stations2.map(s=>`${s?.name}`).join(',')
          }else{
            let arr1 = ids.split(',')
            s.nextStations=arr1
            let stations = arr1.map(id=>this.stations.find(a=>a.doPoint==id))
            this.nextStationsCN = stations.map(s=>`${s?.name}`).join(',')
            if((s.nextStations2??'')!==''&&s.nextStations2.length!==0){
              let arr2=s.nextStations2.split(',')
              let stations2 = arr2.map(id=>this.stations.find(a=>a.doPoint==id))
              this.nextStationsCN2 = stations2.map(s=>`${s?.name}`).join(',')
            }
          }
        }
      }
      s.nextStations=s.nextStations?s.nextStations:undefined;
      s.parks=s.parks?s.parks:undefined;
      this.record=s
      this.visible=true
    },
    getNextStation(nextStations){
      this.axios.get(`station/bystep/${this.nextStep}`).then(res=>{
        if(res.status == 200&&res.data){
          this.stationsData=res.data.filter(item=>!(nextStations?.includes(item.doPoint)))
        }else{
          this.$message.warning(this.$tcache('admin.cacheListWarn'))
        }
      }).catch(()=>{this.$message.warning(this.$tcache('admin.cacheListWarn'))})
    },
    queryParks(){
      this.axios.get(`point/bytype/PARK`).then(data=>{
        this.parks=data.data
        this.checkboxs['parks']=this.parks.map(d=>{
          return {value:d.id,label:d.remark}
        })
      })
    },
    handleOk() {
      console.log(this.record)
      let that = this;
      this.$confirm({
        title: this.$tcache('common.prompt'),
        content: this.$tcache('admin.saveConfig'),
        onOk() {
          that.saveStation();
          that.visible = false;
        },
      });
    },
    dealt(value,type,sign){
      if(Array.isArray(value)){
        if(value.length==0){
          value=null;
        }else{
          value=[...new Set(value.join(',').split(','))].join(',')
        }
        if(sign=='update'){
          this.updates[`${type}`]=value
        }else{
          this.record[`${type}`]=value
        }
      }
    },
    // TOTO 中文判断
    saveStation(){
      this.dealt(this.record.nextStations,'nextStations')
      this.dealt(this.record.nextStations2,'nextStations2')
      this.dealt(this.record.parks,'parks')
      this.dealt(this.record.nextCacheStations,'nextCacheStations')
      if((!this.record.parks)&&this.record.parks!='0')this.record.parks=null
      if((!this.record.nextCacheStations)&&this.record.nextCacheStations!='0')this.record.nextCacheStations=null
      // if(this.record.area=='一跨'){this.record.area=1}
      // if(this.record.area=='二跨'){this.record.area=2}
      if(!this.record.limits){this.record.limits=0}
      if(!this.record.group){this.record.group=0}
      if(!this.record.chargerLimits&&this.record.chargerLimits!=0)this.record.chargerLimits=null
      if((this.record.nextStations2??'')!==''){
        if((this.record.nextStations??'')==''||this.record.nextStations.length==0){
          this.record.nextStations=this.record.nextStations2
        }else{this.record.nextStations+=';'+this.record.nextStations2}
      }
      let obj={...this.record}
      this.axios.post(`station/save`, obj).then(res=>{
        if(res.status == 200){
          this.$message.success(this.$tcache('common.saveSuccess'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    init(){
      this.axios.all([this.queryData(), this.queryProcess()])
          .then(this.axios.spread((res1,res2)=>{
            if(res1.status == 200){
              if(res1.data && res1.data.length){
                //过滤掉缓存机
                this.stations = res1.data.filter(e=>e.stationType == 1)
                this.checkboxs['nextStations1']=this.stations.map(d=>{
                  return {value:d.doPoint,label:this.changeGroup(d.group)+'-'+d.name}
                })
                this.checkboxs['nextStations2']=this.checkboxs['nextStations1']
                this.checkboxs['nextCacheStations']=res1.data.filter(e=>e.stationType > 1).map(d=>{return {value:d.id,label:d.name}})
                this.querySteps()
              }else{
                this.$message.warning(this.$tcache('admin.stationGroup06'))
              }
            }else{
              this.$message.warning(this.$tcache('admin.stationGroup07'))
            }
            if(res2.status == 200){
              this.processes = res2.data
              if(this.processes.length ==0){
                this.$notification.warn({message:'dict'+this.$tcache('admin.stationGroup08'), description:this.$tcache('admin.stationGroup09')})
              }
            }
            printList(`stations:`, this.stations)

            // this.makeGroup();

          })).catch(err=>{
            this.$message.error(err)
          })
    },
    queryProcess() {
      return this.axios.get(`dict/process`)
    },
    querySteps() {
      return this.axios.get(`step/all`).then((res)=>{
        if(res.status == 200){
              if(this.count==0){this.steps = res.data}
              if(this.NewSteps.length==0){
                this.NewSteps=res.data
              }else{
                this.steps=this.NewSteps
              }
              this.lastStation={}
              this.stations.forEach((item)=>{
                this.NewSteps.forEach(s=>{
                  if(item.step==s.id){
                    if(this.lastStation[s.id]){
                      this.lastStation[s.id].push(item)
                    }else{
                      this.lastStation[s.id]=[]
                      this.lastStation[s.id].push(item)
                    }
                  }
                })
              })
              this.makeGroup();
            }
      })
    },
    queryData(){
      // return this.axios.get(`/station/queryLimitColumns/id,name,process,step,line,group,do_point,next_stations,parks,alternate_groups,next_step`)
      return this.axios.post('station/list',{})
    },
    queryGroup(){
      this.axios.get(`stationGroup/list`).then(res=>{
        if(res.status == 200&&res.data){
          this.groups = res.data.map(item=>{return {value:item.group,label:item.remark}})
        }
      }).catch(err=>{this.$message.error(err)})
    },
    showWarn(station){ 
      // if(this.kvData[k][i].nextStations!=null){
      //   this.$message.info(this.$tcache('admin.stationGroup10',{name:this.kvData[k][i].name}))
      // }
      let step=this.NewSteps.find(item=>item.id==station.step)
      console.log('station==>',station,'this.lastStation[step.previousStep]==>',this.lastStation[step.previousStep])     
      if(this.lastStation[step.previousStep]){
        let arr=[]
        this.lastStation[step.previousStep].forEach(item=>{
          let n=[]
          if(item.nextStations?.includes(';')){
            n=[...item['nextStations']?.split(';')[0].split(','),...item['nextStations']?.split(';')[1].split(',')]
          }else if(item.nextStations?.includes(',')){
            n=[...item['nextStations']?.split(',')]
          }else{n.push(item.nextStations)}
          console.log('nextStations',n)
          if(n?.includes(station.doPoint+'')){
            arr.push(item.name)
            console.log(n,arr,station.doPoint)
          }
        })
        if(arr.length!==0){
          let index=arr.findIndex(item=>item==station.name)
          arr[index]=''
          this.$message.warning(`${arr} ${this.$tcache('admin.stationGroup11')}`)
        }
      }
    },
    makeGroup(){
      console.log(this.NewSteps)
      let kv = {} //根据工序分组机台{“工序1”：[机台列表],"工序2":[..], ..}
      let usedgroups = [] //已设置的分组
      this.stations.forEach(s=>{
        if(kv[s.step]){
          kv[s.step].push(s)
        }else{
          kv[s.step] = [s]
        }
        if(! usedgroups.includes(s.group) && s.group != undefined && s.group != ''){
          usedgroups.push(s.group)
        }
      })
      usedgroups = usedgroups.map(s=>{return { label: s+ this.$tcache('admin.group'), value: s, onChange:this.handleGroupItemChange }})
      if(this.groups.length!=0){
        usedgroups.forEach(item=>{
          let g=this.groups.find(e=>e.value==item.value)
          if(!g){
            this.$message.error(this.$tcache('admin.stationGroup12',{value: item.value}))
          }
          item.label=g.label
        })
      }
      this.usedgroups = usedgroups
      //确定当前区域涉及的工序，并按字段顺序排列
      let kvData = {}
      let keys = Object.keys(kv)
      let stepName=keys.map(k=>{
        let n=this.NewSteps.find(s=>s.id+''==k)
        return n?n.name:k
      })
      console.log(`${this.$tcache('admin.stationGroup13')}：`, stepName)
      if(this.count==0){
        this.$notification.info({message: this.$tcache('admin.stationGroup13'), description: stepName.join(', ')})
        this.count=1
      }
      //按步骤次序显示机台
      this.NewSteps.forEach(e=>{
        if(keys.includes(e.id+'')){
          let arr = kv[e.id].sort((a,b)=>a.step - b.step) //按Step在组内排序
          arr.forEach(item=>{
            item['showColor']=true
          })
          kvData['step'+e.id] = arr
        }
      })
      Object.keys(kvData).forEach(k=>{
        kvData[k].sort((a,b)=>a.line-b.line)
        let s=1
        kvData[k].forEach(d=>{
          d.sortNum=s
          s++
        })
      })
      this.kvData = kvData
    },
    handleCheck(e){
      console.log(e,e[e.length-1],this.kvData[`step${this.step}`])
      this.radioGroup=null
      // this.step = null
      let station = this.kvData[`step${this.step}`]?.find(s=>s.id==e[e.length-1])
      console.log(station)
      if(!station){
        this.step = null
      }
      if(this.step && e.length>0){
        this.updates.id=e.join(',');
      }
    },
    stepChange(){
      this.area=null;
      let data=this.kvData[`step${this.step}`]
      if(!data){
        return
      }
      let stepStations=data.map(d=>d.id)
      if(this.radioGroup){
        stepStations=data.filter(s=>s.group==this.radioGroup)?.map(d=>d.id)
      }
      if(stepStations){
        this.checkedValues=stepStations
      }else{
        this.checkedValues=[]
      }
      console.log(this.checkedValues)
    },
    save(){
      if(this.checkedValues.length ==0){
        this.$message.warning(this.$tcache('admin.stationGroup14'))
        return
      }
      if(!this.group){
        this.$message.warning(this.$tcache('admin.cachelayerGroup14'))
        return
      }
      console.log(this.checkedValues,this.group)
      this.axios.post(`station/grouping?ids=${this.checkedValues.join(',')}&group=${this.group}`)
      .then(res=>{
        console.log(res)
        if(res.status == 200){
          console.log(res.data.data)
          //todo 解析res.data.data {"msg1":"xxx","msg2":"yyy"}
          this.$message.success(`${this.$tcache('common.saveSuccess')}, ${res.data.data}`)
          this.init()
        }else{
          this.$message.warning(`${this.$tcache('common.saveFail')}：${res.data.message}`)
        }
      }).catch(err=>{
        this.$message.error(`${this.$tcache('common.saveFail')}：${err}`)
      })
    },
    editGroupName(){
      this.axios.post(`stationGroup/save`,{})
      .then(res=>{
        if(res.status == 200){
          this.$message.success(`${this.$tcache('common.saveSuccess')}, ${res.data.data}`)
        }
      }).catch(err=>{
        this.$message.error(`${this.$tcache('common.saveFail')}：${err}`)
      })
    },
    handleGroupItemChange(e){
      console.log(e)
      let checkedValues = this.checkedValues
      if(e.target.checked){
        this.stations.forEach(d=>{
          if(d.group == e.target.value && ! checkedValues.includes(d.id)){
            checkedValues.push(d.id)
          }
        })
      }else{
        this.stations.forEach(d=>{
          if(d.group == e.target.value && checkedValues.includes(d.id)){
            let idx = checkedValues.findIndex(x=>x == d.id)
            checkedValues.splice(idx, 1)
          }
        })
      }
    },

    enter(key,i){
      let item=this.kvData[key][i]
      item['showColor']=false
      this.$set(this.kvData[key],i,item)
      // if(this.kvData[key][i].nextStations!=null){
      //   this.$message.info(`机台<${this.kvData[key][i].name}>的下个可选机台不为空`)
      // }
    },
    leave(key,i){
      let item=this.kvData[key][i]
      item['showColor']=true
      this.$set(this.kvData[key],i,item)
    },
  }
}
</script>

<style lang="scss" scoped>
.colorBox{
  // position: fixed;
  // top: 100px;
  position: relative;
  .colorNote{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin: 5px;
    .list{
      // width: fit-content;
      padding: 5px;
      border-radius: 3px;
      background-color: rgb(235, 235, 235);
      margin-right: 10px;
      box-shadow: 1px 1px 5px 0px;
      cursor: pointer;
      &:active{
        box-shadow: 1px 1px 5px 0px inset;
      }
      span{
        color: white;
      }
    }
  }
}
:deep(.ant-checkbox-group){
  width: 100%;
}
.content{
  display: flex;
  // flex-wrap: wrap;
  overflow: auto;
  max-height: 60vh;
  width: 100%;
  .item{
    margin: 5px;
    width: fit-content;
    .process{
      margin: 5px;
      background: #f0f2f5;
      box-shadow: 1px 1px 5px 0px ;
      border-radius: 2px;
      padding: 5px;
      position: relative;
      // display: flex;
      // justify-content: center;
    }
    .topBottom{
      margin: 5px;
      display: flex;
      justify-content: space-between;
      .top,.bottom{
        // flex:1;
        display: grid;
        grid-template-columns: repeat(2, 1fr); /* 每行两个盒子，1fr 代表平均分配剩余空间 */
        grid-gap: 10px;
        .title{
          background: #f0f2f5;
          box-shadow: 1px 1px 4px -1px ;
          border-radius: 2px;
          margin: 1px;
          margin-bottom: 15px;
        }
        .stations{
          .station{
            white-space: nowrap;
            padding: 10px;
            border-radius: 3px;
            box-shadow: 1px 1px 5px 0px;
            cursor: pointer;
            span{
              color:white;
            }
          }
          .station:active{
            box-shadow: 5px 5px 10px -5px inset;
          }
        }
      }
    }
  }
}
.atn{
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.icon{
  color:white;
  // font-weight: bold;
  border: 1px solid;
  padding: 5px;
  border-radius: 5px;
  margin-left: 5px;
}
.star{
  // display: inline-block;
  margin-left: 5px;
  color: #dd780c;
  background: white;
}
.lefticon{
  position: absolute;
  right: 0;
  top: -20px;
}
.edit_batch{
  // position: absolute;
  // top: -30px;
  // left: 5px;
  margin: 0 10px;
  // box-shadow: 0px 0px 5px 0 inset;
}
.select{
    min-width: 150px;
    margin: 5px;
}
.btn{
  text-align: center;
  button{
    margin: 5px;
  }
}
.groupBox{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.group{
  width: fit-content;
  margin-bottom: 5px;
}
</style>
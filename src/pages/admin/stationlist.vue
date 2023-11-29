<template>
  <div>
    <a-row class="query-form">
      <a-button  v-if="isAdmin||editable" @click="addStation" type="primary" icon="plus" style="float: left;">{{$tcache('common.add')}}</a-button>
      <a-input type="number" v-model.number="form.area" :placeholder="$tcache('common.region')"/>
      <a-select v-model="form.step"  :placeholder="$tcache('admin.currentStep')">
        <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <a-input v-model="form.name" :placeholder="$tcache('admin.stationName')" />
      <!-- <a-input type="number" v-model.number="form.group" :placeholder="$tcache('admin.group')"/> -->
      <a-select v-model="form.group"  :placeholder="$tcache('admin.group')">
        <a-select-option v-for="item in groups" :key="item.value" :value="item.value">{{item.label}}</a-select-option>
      </a-select>
      <a-select v-model="form.enabled"  :placeholder="$tcache('admin.startOrNot01')">
        <a-select-option v-for="item in enableds" :key="item.name" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span> </a-button>
      <!-- <a-button title="请先选择步骤后批量修改" style="margin-left:10px;" @click="stationsUpdatas"><span class="fontSty">批量修改</span> </a-button> -->
      <a-popover v-model="visible_upd" title="Title" trigger="click" placement="bottomRight">
        <div slot="content">
          <a-radio-group  v-model="update_select" button-style="solid">
            <a-radio-button :value="v.key=='nextStations1'?'nextStations':v.key" v-for="v in columns2" :key="v.key" v-show="v.key!='nextStations2'&&v.key!='id'">{{v.key=='nextStations1'?$t('common.nextStations'):v.title}}</a-radio-button>
          </a-radio-group>
          <div class="btn"><a-button @click="stationsUpdatas">确认</a-button></div>
        </div>
        <a-button title="请先选择步骤后批量修改" style="margin-left:10px;"><span class="fontSty">批量修改</span> </a-button>
      </a-popover>
    </a-row>
    
    <a-row>
      <a-table :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"  :pagination="pagination"
        :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}" :row-selection="rowSelection"
        >
        <div slot="enabled" slot-scope="text, record,index" >
          <!-- <a-switch v-if="isAdmin||editable" v-model="record.enabled" >
            <a-icon slot="checkedChildren" type="check" />
            <a-icon slot="unCheckedChildren" type="close" />
          </a-switch> -->
          <a-popconfirm
            :title="record.enabled?$tcache('admin.pointDecide01'):$tcache('admin.pointDecide02') +'?'"
            :ok-text="$tcache('common.confirm')"
            :cancel-text="$tcache('common.cancel')"
            @confirm="changeEnabled(index,record)"
            @cancel="()=>{}"
             v-if="isAdmin||editable"
          >
            <a-switch :checked="record.enabled" >
              <a-icon slot="checkedChildren" type="check" />
              <a-icon slot="unCheckedChildren" type="close" />
            </a-switch>
          </a-popconfirm>
          <span v-else>{{ text?$tcache('admin.enabling'):$tcache('admin.closing') }}</span>
        </div>
        <div slot="synchron" slot-scope="text">{{ text?'允许':'不允许' }}</div>
        <a-tag class="fontColor" slot="chargerLimits" slot-scope="text" :data-id="text" >{{text||text==0?text+'s':null}}</a-tag>
        <a-tag class="fontColor" slot="step" slot-scope="text" :data-id="text" @click="showStepInfo" >{{text|fmtStep}}</a-tag>
        <a-tag class="fontColor" slot="group" slot-scope="text" :data-id="text" >{{text|fmtGroup}}</a-tag>
        <a-tag class="fontColor" slot="stationType" slot-scope="text" :data-id="text" >{{text==1?"普通机台":text==2?"移栽缓存机":text==3?"不带移栽缓存机":""}}</a-tag>
        <a-tag class="fontColor" slot="nextStep" slot-scope="text" :data-id="text" @click="showStepInfo" >{{text|fmtStep}}</a-tag>
        <!-- TODO 中文判断 -->
        <!-- <a-tag class="fontColor" slot="group" slot-scope="text,record" v-show="record.stationType == 1" :data-id="text" >{{text}}</a-tag> -->
        <a-tag slot="parks" slot-scope="text" :data-ids="text"  class="fontColor" type="primary">{{text}}</a-tag>
        <a-popover  slot="nextStations" slot-scope="text" :data-ids="text"  :title="$tcache('admin.cacheLayer06')">
          <template #content>
            <div style="width:200px;">{{nextStationsTitle}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showStationsInfo" type="primary">{{text}}</a-tag>
        </a-popover>
        <a-popover  slot="nextOutBasketStation" slot-scope="text" :data-ids="text"  title="空车可前往的机台">
          <template #content>
            <div style="width:200px;">{{NOBS_title}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showStationsInfo" type="primary">{{text}}</a-tag>
        </a-popover>
        <a-popover  slot="nextCacheStations" slot-scope="text,record" :data-ids="text"  :title="$tcache('admin.nextCache')">
          <template #content>
            <div style="width:200px;">{{NextCacheTitle}}</div>
          </template>
          <a-tag class="fontColor" @mouseenter="showInfo(record.nextCacheStations,'nextCacheStations')" type="primary">{{text}}</a-tag>
        </a-popover>
        <span  v-if="isAdmin||editable" slot="commonAction" slot-scope="text, record,index">
          <a><a-icon type="edit" @click="() => recordEdit(index,record)"></a-icon> </a>
        </span>
      </a-table>
      <div style="margin-top:10px" class="flex">
        <div class="flex fontSty">{{$tcache('admin.rowsPerPage')}}:<a-input class="fontSty" type="number" v-model.number="pagination.pageSize"  :placeholder="$tcache('admin.rowsPerPage')"/></div>
        <a-pagination :page-size="pagination.pageSize"  v-model="pagination.current"  show-quick-jumper  :total="total" @change="ChangePage" />
      </div>
      
    </a-row>

    <!-- 修改记录弹窗 -->
    <a-modal
        :title="$tcache('admin.modalTile')"
        :visible="visible"
        :dialog-style="{ top: '20px' }"
        :width="1000"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk('edit')"
        @cancel="handleCancel(record)"
    >
      <station_detail :data="record" :typeName="'edit'" :processes="processes" :steps="steps" :parks="parks" :groups="groups"
       :nextCacheStations="nextCacheStations" :stations="stationsData" :nextStationsCN="nextStationsCN" :nextStationsCN2="nextStationsCN2" :alldata="alldata" :nextDecidePoints="nextDecidePoints"/>
    </a-modal>
    <!-- 新增机台弹窗 -->
    <a-modal
        :title="$tcache('admin.addTitle')"
        :visible="visible_add"
        :dialog-style="{ top: '20px' }"
        :width="1000"
        :okText="$tcache('common.save')"
        :cancelText="$tcache('common.cancel')"
        @ok="handleOk('add')"
        @cancel="visible_add=false"
    >
      <station_detail :data="newStationInfo" :typeName="'add'" :processes="processes" :steps="steps" :parks="parks" :groups="groups"
       :nextCacheStations="nextCacheStations" :stations="alldata" :nextStationsCN="''" :nextStationsCN2="''"  :alldata="alldata" :nextDecidePoints="nextDecidePoints"/>
    </a-modal>
    <a-modal
        title="批量修改"
        :visible="visible_updatas"
        :dialog-style="{ top: '20px' }"
        :width="800"
        okText="保存"
        cancelText="取消"
        @ok="updataNextStations"
        @cancel="()=>{visible_updatas=false}"
    >
      <publicDetail :data="updates" type="edit" :columns="columns2" :checkbox="checkbox" :checkboxs="checkboxs" :disabled="disabled" :isNum="isNum" :radio="radio" :radios="radios" :hidden="hidden"/>
    </a-modal>
  </div>
</template>

<script>
import {axiosget} from '../../utils';
import station_detail from "./station_detail";
import publicDetail from "@/components/public_detail";
const tableHeader = require('../../data/columns_stationlist.json');
const tableHeader2 = require('../../data/columns_stationlist_updata.json');
let vueApp = null
export default {
  components:{
    station_detail,
    publicDetail
  },
  data(){
    return {
      nextStationsTitle:'',
      NOBS_title:'',
      NextCacheTitle:'',
      PriorityTitle:'',
      NextDecidePointTitle:'',
      total:0,//查询得到数据的条数
      pagination: {
        pageSize: Number(localStorage.getItem('pageSize'))?Number(localStorage.getItem('pageSize')):Number(this.$store.state.defaultPageSize),//每页中显示n条数据
        current: 1,
      },
      enableds:[//车辆动作选项内容
        {id:'true',name: this.$tcache('admin.enabling')},
        {id:'false',name: this.$tcache('admin.closing')}
      ],
      checked:'',
      id:'',//机台id
      enabled:'',//机台开关

      form:{}, //查询条件

      processes:[],
      steps:[],

      data:[],//查询结果
      alldata:[],
      // columns:[], //表头
      // columns: require('../../data/columns_stationlist.json'),
      // columns2: require('@/data/columns_stationlist_updata.json'),
      step_names:[],

      record:{}, //操作的行
      visible: false,

      points:[],
      // str:{1,2,3},
      nextStep:'',
      stationsData:[],
      parks:[],  //弹窗的临时停车位选项
      nextCacheStations:[],//弹窗的下一个缓存机选项
      titleArr:[],
      isSave:true,//判断是否保存
      saveId:'',//保存的id
      nextStationsCN:'',//弹窗里显示的下一个机台的中文名称
      nextStationsCN2:'',//弹窗里显示的下一个机台2的中文名称
      stepCN:'',
      nextStepCN:'',
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      newStationInfo:{},//储存添加机台的信息的对象
      visible_add:false,//新增机台的弹窗
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      stationType:[{type:1,name:this.$tcache('admin.stationType01')},{type:2,name:this.$tcache('admin.stationType02')}],
      nextDecidePoints:[],
      selectedRowKeys: [],
      updates:{},//批量更新的数据
      checkbox:['nextStations1','nextStations2','parks','nextCacheStations'],
      // checkbox:['nextStations1','nextStations2'],
      checkboxs:{},
      isNum:['area','limits'],
      visible_updatas:false,
      disabled:{edit:['id']},
      groups:[],
      isUpdates:false,
      radio:['chargerLimits'],
      radios:{chargerLimits:[
        {value:0,label:'0分钟'},{value:60,label:'1分钟'},{value:2*60,label:'2分钟'},{value:3*60,label:'3分钟'},{value:4*60,label:'4分钟'},{value:5*60,label:'5分钟'},
        {value:6*60,label:'6分钟'},{value:7*60,label:'7分钟'},{value:8*60,label:'8分钟'},{value:9*60,label:'9分钟'},{value:10*60,label:'10分钟'},
      ]},
      hidden:[],
      visible_upd:false,
      update_select:'',
    }
  },
  watch:{
    form:{
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        this.pagination.current=1
        // this.queryData()
        if(this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.filterData, 500)
      },
      deep: true
    },
    pagination:{
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        localStorage.setItem('pageSize', this.pagination.pageSize);
      },
      deep: true
    },
  },
  filters:{
    fmtStep:val=>{
      let steps = [...vueApp.steps]
      let step = steps.find(e=>e.id == val)
      if(step){
        return step.name
      }
      return val
    },
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onSelect: this.onSelect,
        onSelectAll: this.onSelectAll,
        getCheckboxProps: record => ({
          props: {
            disabled: record.stationType > 1, // Column configuration not to be checked
            name: record.name,
          },
        }),
      };
    },
    columns() {
      return this.$transformI18n(tableHeader);
    },
    columns2() {
      return this.$transformI18n(tableHeader2);
    }
  },
  beforeMount() {
    this.querySteps()
    if(this.editable||this.isAdmin)this.addRender()
    vueApp=this
  },
  mounted() {
    this.queryNextCacheStations()
    this.queryParks()
    this.queryProcess()
    this.queryGroup()
    this.queryData()
  },
  methods:{
    onSelectAll(selected) {
      const keys = selected ? this.data.filter(d=>d.stationType===1).map(item => item.id) : [];
      this.selectedRowKeys = keys;

      this.data.forEach(item => {
        item.selected = selected;
      });
      console.log(this.selectedRowKeys)
    },
    onSelect(record, selected) {
      console.log(record,selected)
      record.selected = selected;

      const keys = this.data.filter(item => item.selected).map(item => item.id);
      this.selectedRowKeys = keys;
      console.log(this.selectedRowKeys)
    },
    onChangePage() {
      this.selectedRowKeys = [];
    },
    filterData(){
      let result = this.alldata
      if(this.form.step){
        result = result.filter(d=>this.form.step==d.step)
      }
      if(this.form.name){
        result = result.filter(d=>`${d.name}`.includes(`${this.form.name}`))
      }
      if(this.form.ip){
        result = result.filter(d=>`${d.ip}`.includes(`${this.form.ip}`))
      }
      if(this.form.group){
        result = result.filter(d=>d.group==this.form.group)
      }
      if(this.form.area){
        result = result.filter(d=>d.area==this.form.area)
      }
      if(this.form.enabled){
        result = result.filter(d=>`${d.enabled}`==this.form.enabled)
      }
      this.data = result
      this.updates={id:'',nextStations1:undefined,nextStations2:undefined,parks:undefined,nextCacheStations:undefined,area:undefined,limits:undefined,chargerLimits:undefined}
      // this.updates={id:'',nextStations1:undefined,nextStations2:undefined}
      this.selectedRowKeys=[]
      this.nextStep=this.data[0]?.nextStep
      this.queryNextStations([])
      this.total=Number(this.data.length)
    },
    cancel (){
      this.$message.error(this.$tcache('admin.canceled'));
    },
    queryGroup(){
      this.axios.get(`stationGroup/list`).then(res=>{
        if(res.status == 200&&res.data){
          this.groups = res.data.map(g=>{
            return {value:g.group,label:g.remark}
          })
        }
      }).catch(err=>{this.$message.error(err)})
    },
    changeGroup(group){
      let g=this.groups.find(d=>d.value==group)
      if(g){
        return g.label
      }
      return group
    },
    queryNextStations(nextStations){
      this.axios.get(`station/bystep/${this.nextStep}`).then(res=>{
        if(res.status == 200&&res.data){
          this.stationsData=res.data.filter(item=>!(nextStations?.includes(item.doPoint)))
          this.checkboxs['nextStations1']=res.data.filter(d=>d.stationType===1).map(d=>{
            return {value:d.doPoint,label:this.changeGroup(d.group)+'-'+d.name}
          })
          this.checkboxs['nextStations2']=this.checkboxs['nextStations1']
        }else{
          this.$message.warning(this.$tcache('admin.cacheListWarn'))
        }
      }).catch(()=>{this.$message.warning(this.$tcache('admin.cacheListWarn'))})
    },
    ChangePage(pageNumber){
      this.pagination.current=pageNumber
    },
    changeEnabled(index,record){
      console.log(index,record)
      this.axios.put(`station/enabled/${record.id}/${!record.enabled}`).then((res)=>{
        console.log(res)
        if(res.data.success){
          this.isSave=false
          this.saveId=record.id
          this.queryData()
          this.$message.success(res.data.message)
        }else{
          this.$message.warning(res.data.message)
        }
      }).catch(()=>{})
    },
    clearForm(){
      this.form = {}
      // this.queryData()
      this.data=this.alldata
      this.total=0
      this.selectedRowKeys = [];
      this.updates={}
    },
    stationsUpdatas(){
      console.log(this.update_select)
      this.visible_upd=false
      if(typeof this.form.step!='number'){
        this.$message.warning('需要先对机台进行步骤筛选,才可以批量修改')
        return
      }
      if(this.selectedRowKeys.length===0){
        this.$message.warning('请先选择修改项')
        return
      }
      console.log(this.checkboxs)
      this.updates.id=this.selectedRowKeys.join(',')
      let keys=Object.keys(this.updates)
      if(this.update_select=='nextStations'){
        this.hidden=keys.filter(k=>!k.includes(this.update_select))
      }else{
        this.hidden=keys.filter(k=>!k.includes(this.update_select))
      }
      this.hidden.splice(0,1)//id不隐藏，第一位为id
      console.log(this.hidden)
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
          this.queryData()
          this.$message.success(res.data.message)
        }else{
          this.$message.error(res.data.message)
        }
      }).catch(err=>{this.$message.error(err);})
      this.updates={id:obj.id,nextStations1:undefined,nextStations2:undefined,parks:undefined,nextCacheStations:undefined,area:undefined,limits:undefined,chargerLimits:undefined}
      this.visible_updatas=false
    },
    queryProcess(){
      axiosget(`dict/process`,{}, (data)=>{
        console.log('processes',data)
        this.processes = data
      })
    },
    querySteps(){
      this.axios.get(`step/all`).then((res)=>{
        console.log(res)
        if(Array.isArray(res.data)){this.steps=res.data}else{
          this.$message.error(this.$tcache('admin.cacheListErr01'))
        }
      }).catch(()=>{
        this.$message.error(this.$tcache('admin.cacheListErr01'))
      })
    },
    queryParks(){
      this.axios.get(`point/bytype/PARK`).then(res=>{
        if(res.data){
          this.parks=res.data
          this.checkboxs['parks']=res.data.map(d=>{
            return {value:d.id,label:d.remark}
          })
        }
      }).catch(err=>{this.$message.err(err)})
    },
    // queryParksByStep(nextStep){
    //   this.axios.get(`point/type/PARK/${nextStep}`).then(res=>{
    //     if(res.data){
    //       this.parksByNextStep=res.data
    //       this.checkboxs['parks']=res.data.map(d=>{
    //         return {value:d.id,label:d.remark}
    //       })
    //     }
    //   }).catch(err=>{this.$message.err(err)})
    // },
    queryNextCacheStations(){
      this.axios.get(`station/all`).then(res=>{
        this.nextCacheStations=res.data.filter(s=>s.stationType==2||s.stationType==3)
        this.checkboxs['nextCacheStations']=this.nextCacheStations.map(d=>{return {value:d.id,label:d.name}})
      })
    },
    queryDecidePoints(nextStep){
      this.axios.get(`point/type/DECIDE/step/${nextStep}`).then(data=>{
        this.nextDecidePoints =data.data
      })
    },
    queryData(){
      let that = this
      this.axios.post(`station/list`, {}).then(res=>{
        if(res.status == 200&&res.data){
          this.alldata = res.data
          if(this.isSave){this.data=res.data}else{
            if(this.isUpdates){
              let ids=this.updates.id.split(',')
              ids.forEach(id=>{
                let i=this.data.findIndex(d=>d.id==id)
                let obj=this.alldata.find(item=>item.id==id)
                // Object.assign(this.data[index], obj)
                this.$set(this.data,i,obj)
              })
              this.isUpdates=false
            }else{
              const index = this.data.findIndex(item=>item.id==this.saveId)
              let obj=this.alldata.find(item=>item.id==this.saveId)
              // Object.assign(this.data[index], obj)
              this.$set(this.data,index,obj)
            }
          }
          this.total=Number(this.data.length)
        }else{
          that.$message.warning(this.$tcache('admin.cacheListErr02'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    addRender(){
      let b = this.columns.find(e=>e.dataIndex=='commonAction')
      if(b == undefined){//避免重复mounted时重复push(一般在开发模式下发生）
        let col = { title: this.$tcache('common.edit'), dataIndex: 'commonAction', key: 'commonAction', fixed: 'right',width:60, scopedSlots: { customRender: 'commonAction' } }
        this.columns.push(col)
      }
    },
    recordEdit(index,record){
      console.log(index,record)
      this.nextStep=record.nextStep?record.nextStep:'';
      this.queryNextStations(record.nextStations)
      this.queryDecidePoints(record.nextStep)
      // this.queryParksByStep(record.nextStep)
      this.nextStationsCN = ''
      this.nextStationsCN2 = ''
      // let ids =record.nextStations
      // if(typeof ids=='string'){
      //   if(ids.length!=0){
      //     if(ids.includes(';')){
      //       let arr1=ids.split(';')[0].split(',')
      //       record.nextStations=arr1
      //       let stations = arr1.map(id=>this.alldata.find(a=>a.doPoint==id))
      //       this.nextStationsCN = stations.map(s=>`${s?.name}`).join(',')
      //       let arr2=ids.split(';')[1].split(',')
      //       record.nextStations2=arr2
      //       let stations2 = arr2.map(id=>this.alldata.find(a=>a.doPoint==id))
      //       this.nextStationsCN2 = stations2.map(s=>`${s?.name}`).join(',')
      //     }else{
      //       let arr1 = ids.split(',')
      //       record.nextStations=arr1
      //       let stations = arr1.map(id=>this.alldata.find(a=>a.doPoint==id))
      //       this.nextStationsCN = stations.map(s=>`${s?.name}`).join(',')
      //       if((record.nextStations2??'')!==''&&record.nextStations2.length!==0){
      //         let arr2=record.nextStations2.split(',')
      //         let stations2 = arr2.map(id=>this.alldata.find(a=>a.doPoint==id))
      //         this.nextStationsCN2 = stations2.map(s=>`${s?.name}`).join(',')
      //       }
      //     }
      //   }
      // }
      let nextCacheStations=record.nextCacheStations
      if((nextCacheStations??'')!=''&&typeof nextCacheStations!=='object'){
        record.nextCacheStations=nextCacheStations.split(',')
      }
      let parks=record.parks
      if((parks??'')!=''&&typeof parks!=='object'){
        record.parks=parks.split(',')
      }
      // this.parks=[]
      if(!record.parks){record.parks=''}
      record.nextStations=record.nextStations?record.nextStations:undefined;
      // record.nextOutBasketStation=record.nextOutBasketStation?record.nextOutBasketStation:undefined;
      record.nextOutBasketStation=record.nextOutBasketStation?record.nextOutBasketStation.split(','):undefined;
      record.parks=record.parks?record.parks:undefined;
      record.nextCacheStations=record.nextCacheStations?record.nextCacheStations:undefined;
      this.record=record
      this.visible= true
      
    },
    addStation(){
      this.newStationInfo={
        synchron:false,
        inTransferBasketLimit:0,
        outTransferBasketLimit:10,
        heartbeat:0,
        enabled:false,
        limits:0,
        group:0
      }
      this.visible_add=true
    },
    handleOk(e){
      let state=false
      let requierdstr=''
      let requierds=['line','name','process','step','nextStep','relPids','exitPoint','doPoint','ip','port','adsPort','udpHead','basketSize']
      // if(e=='add')requierds.push('alternateGroups')
      let obj=e=='edit'?this.record:this.newStationInfo
      requierds.forEach(r=>{
        if(((obj[r]??'')==''||obj[r]?.length==0)&&obj[r]!==0&&obj[r]!=='0'){
          requierdstr+='-'+r+'-'
          state=true
        }
      })
      if(state){
        this.$message.info(this.$tcache('admin.validateTips01',{requierdstr}))
        return
      }
      let that = this
      this.$confirm({
        title:this.$tcache('common.prompt'),
        content:this.$tcache('admin.saveConfig'),
        onOk(){
          if(e=='edit'){that.save();that.visible = false}else{that.newStationInfoSave();that.visible_add = false}
        },
      })
    },
    handleCancel(record){
      this.isSave=false
      this.record={}
      this.visible = false
      this.saveId=record.id
      this.queryData()
    },
    dealt(value,type,sign){
      console.log(value,type,sign)
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
    save(){
      // this.dealt(this.record.nextStations,'nextStations')
      this.dealt(this.record.nextStations2,'nextStations2')
      this.dealt(this.record.parks,'parks')
      this.dealt(this.record.nextCacheStations,'nextCacheStations')
      this.dealt(this.record.nextOutBasketStation,'nextOutBasketStation')
      // this.dealt(this.record.nextOutBasketStation,5)
      if((!this.record.parks)&&this.record.parks!='0')this.record.parks=null
      if((!this.record.nextCacheStations)&&this.record.nextCacheStations!='0')this.record.nextCacheStations=null
      if(!this.record.limits){this.record.limits=0}
      if(!this.record.group){this.record.group=0}
      if(!this.record.chargerLimits&&this.record.chargerLimits!=0)this.record.chargerLimits=null
      // if((this.record.nextStations2??'')!==''){
      //   if((this.record.nextStations??'')==''||this.record.nextStations.length==0){
      //     this.record.nextStations=this.record.nextStations2
      //   }else{this.record.nextStations+=';'+this.record.nextStations2}
      // }
      this.axios.post(`station/save`, this.record).then(res=>{
        if(res.data.success){
          this.isSave=false
          this.saveId=this.record.id
          // this.record.nextStations2=undefined
          this.$message.success(res.data.message)
          this.queryData()
        }else{
          this.$message.warning(res.data.message)
        }
      }).catch(err=>{this.$message.error(err)})
    },
    newStationInfoSave(){
      let arr=['nextStations','nextStations2','parks','nextCacheStations','nextOutBasketStation']
      // let arr=['nextStations','nextStations2','parks','nextCacheStations','nextOutBasketStation']
      arr.forEach(item=>{
        let value=this.newStationInfo[`${item}`]
        if(Array.isArray(value)){
          if(value.length==0){value=null}else{value=value.join(',')}
          this.newStationInfo[`${item}`]=value
        }
      })
      if((this.newStationInfo.nextStations2??'')!==''){
        console.log(this.newStationInfo.nextStations,this.newStationInfo.nextStations2)
        if((this.newStationInfo.nextStations??'')==''||this.newStationInfo.nextStations.length==0){
          this.newStationInfo.nextStations=this.newStationInfo.nextStations2
        }else{this.newStationInfo.nextStations+=';'+this.newStationInfo.nextStations2}
      }
      if(!this.newStationInfo.enabled)this.newStationInfo.enabled=false
      Object.keys(this.newStationInfo).forEach(k=>{
        if(this.newStationInfo[k]===""){
          this.newStationInfo[k]=null;
        }
      })
      this.axios.post(`station/save`, this.newStationInfo).then(res=>{
        if(res.data.success){
          this.isSave=true
          this.$message.success(res.data.message)
          this.queryData()
        }else{
          this.$message.warning(res.data.message)
        }
      }).catch(err=>{this.$message.error(err)})
    },
    showStepInfo(evt){
      let id = evt.target.dataset.id
      let step = this.steps.find(e=>e.id==id)
      if(step){
        let desc = JSON.stringify(step).slice(1,-1).split(',').join(', ')
        console.log(desc)
        this.$notification.info({message:this.$tcache('admin.configErrTips'), description:desc})
      }else{
        this.$notification.error({message:this.$tcache('admin.configErr'), description:this.$tcache('admin.configErrMsg', {id})})
      }
    },
    showStationsInfo(evt){
      let ids = evt.target.dataset.ids
      if(!ids){
        this.nextStationsTitle='';
        this.NOBS_title=''
        return;
      }
      if(ids.includes(';')){
        ids=ids.replace(/;/g,',')
      }
      let arr = ids.split(',')
      let stations = arr.map(doPoint=>this.alldata.find(a=>a.doPoint==doPoint))
      let desc = stations.map(s=>`${s.doPoint}:${s.name}；`)
      let msg=desc.join(' ')
      this.nextStationsTitle=msg
      this.NOBS_title=msg
    },
    showInfo(item,keys){
      this.NextCacheTitle = null
      this.PriorityTitle=null;
      this.NextDecidePointTitle=null;
      let ids =item&&JSON.parse(JSON.stringify(item))
      console.log('ids',item)
      if(typeof ids=='string'){
        if(ids.length!=0){
          let arr = ids.split(',')
          let stations = arr.map(doPoint=>this.alldata.find(a=>a.doPoint==doPoint));console.log(keys)
          if(keys=='nextCacheStations'){this.NextCacheTitle = stations.map(s=>`${s.doPoint}:${s.name}`).join(', ')}
          if(keys=='nextDecidePoint'){this.NextDecidePointTitle = stations.map(s=>`${s.name}`).join(',')}
        }
      }
    },
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
::v-deep .ant-table-thead > tr > th,::v-deep .ant-table-tbody > tr > td{
  text-align: center;
}
// ::v-deep .ant-table-tbody > tr > td{
//   color: black;
// }
.flex{
  display: flex;
  justify-content: center;
  align-items: center;
}
::v-deep .ant-table-pagination{
  display: none;
}
::v-deep .ant-table-thead > tr > th{
  background-color: $bgcolor !important;
  color: $color;
  // font-weight: bold;
}
::v-deep .ant-tag{
  // color: #3aadbd !important;
  // font-weight: 600;
  cursor: pointer;
}
::v-deep .table-striped {
  background-color: #f0f0f0;
}
.btn{
  text-align: right;
  margin: 10px 10px 0 0;
}
::v-deep .ant-modal-content{
  max-height: 95vh;
  overflow: auto;
}
</style>
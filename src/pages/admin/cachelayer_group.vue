<template>
  <div>
    <H2> {{region_name}} {{$tcache('admin.cacheStationsTitle')}}</H2>
    <div id="container">
      <a-checkbox-group @change="handleCheck" v-model="checkedValues">
        <a-row>
          <a-card>
            <a-card-grid v-for="(items, key) in kvData" :key="key" style="width:25%;text-align:center" :title="stations[key]?.nextStep|fmtStep">
              <a-row>[{{$tcache('admin.nextStep01')}}:<span style="color:#1890ff;">{{stations[key]?.nextStep|fmtStep}}</span>]-{{$tcache('admin.cacheSiteID')}}：{{key}}</a-row>
              <a-row><span style="color:#1890ff;">{{stations[key]?.name}}</span></a-row>
              <!-- <a-checkbox 
                :value="key+'all'"
                :key="key+'all'"
                :indeterminate="indeterminate[key]"
                @change="onCheckAllChange(key)"
              >
                全部
              </a-checkbox> -->
              <a-checkbox v-for="s in items" :key="s.id" :value="s.id"
                :style="{color:colors[s.group%30]}" class="item">
                <!-- @change="checkbox" -->
                {{s.name}}-[<b>{{s.group|fmtGroup}}</b>]
              </a-checkbox>
            </a-card-grid>
          </a-card>
        </a-row>
      </a-checkbox-group>

      <a-row>
        <a-col span="11">
          <a-divider orientation="left">{{$tcache('admin.groupAlready')}}：</a-divider>
          <a-checkbox-group :options="usedgroups" v-model="checkedGroups" >
          </a-checkbox-group>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="11"><a-divider orientation="left">{{$tcache('admin.cachelayerGroup01')}}：</a-divider></a-col>
        <a-col :span="11"><a-divider orientation="left">{{$tcache('admin.cachelayerGroup02')}}：</a-divider></a-col>
        <a-col :span="2"></a-col>
      </a-row>
      <a-row>
        <a-col :span="11">{{checkedValues}}</a-col>
        <a-col :span="11">
          <a-radio-group :options="groups" v-model="group" button-style="solid"></a-radio-group>
        </a-col>
        <a-col :span="2">
          <a-button type="primary" @click="save">{{$tcache('common.save')}}</a-button>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
let vueApp=null
export default {
  name: "station_group",
  data(){
    return{
      // colors: ['red','green','#800000','blue','orange','purple','cyan','#469990'],
      colors:['#DC143C','green','#0000FF','#008080','#f3715a','#8294C4','#19A7CE','#FF4500','#a2a22b','#AAC8A7',
        '#99627A','#FF8C00','#E9A178','#800080','#FFC0CB','#FFD700','#00CED1','#B7B7B7','#FF69B4','#9932CC',
        '#A4907C','#CE5959','#4B0082','#9400D3','#008B8B','#FF1493','#FFDAB9','#97DEFF','#FF00FF','#A0522D'
      ],
      region_id: Number(localStorage.getItem('region_id')),
      region_name: localStorage.getItem('region_name'),
      groups: [],
      usedgroups: [], //已使用的组
      checkedGroups: [],

      steps:[],
      processes: [],
      listdata:[], //缓存层列表
      kvData:{},

      checkedValues:[],  //选择缓存层
      group:null, //当前设置的组
      stations:{},
      checkedState:{},
      checkedAllList:[],
      indeterminate:{},
      key_select:'',
      cacheVal:[],
      selectVal:''
    }
  },
  mounted() {
    this.queryGroup()
    this.init()
    vueApp=this
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
  methods:{
    init(){
      this.axios.all([this.queryData(), this.queryProcess()])
        .then(this.axios.spread((res1,res2)=>{
          if(res1.status == 200){
            if(res1.data && res1.data.length){
              this.listdata = res1.data
            }else{
              this.$message.warning(this.$tcache('admin.cachelayerGroup11'))
            }
          }else{
            this.$message.warning(this.$tcache('admin.cachelayerGroup12'))
          }
          if(res2.status == 200){
            this.processes = res2.data
          }
          console.log(`listdata:`, this.listdata)
          console.log(`process:`, this.processes)

          this.queryStation();

        })).catch(err=>{
          this.$message.error(err)
        })
    },
    onCheckAllChange(key){
      if(typeof this.checkedState[key]=='boolean'){
        this.checkedState[key]=!this.checkedState[key]
      }else{
        this.checkedState[key]=true
      }
      console.log(this.checkedState)
    },
    checkbox(e){
      // console.log(e.target.checked,this.checkedValues)
      // this.checkedValues.push(e.target.value)
      this.cacheVal=[]
      if(e.target.checked){
        this.checkedValues.push(e.target.value)
      }else{
        let index=this.checkedValues.findIndex(cv=>cv==e.target.value)
        console.log(index)
        this.checkedValues.splice(index,1)
        this.selectVal=e.target.value
      }
      let bol={}
      Object.keys(this.kvData).forEach(kv=>{
        if(e.target.checked){
          let arr=this.kvData[kv].map(v=>v.id)
          bol[kv]=true
          arr.forEach(n=>{
            if(!this.checkedValues.includes(n)){
              bol[kv]=false
            }
          })
          if(bol[kv]){
            this.checkedValues=[...new Set([...this.checkedValues,...arr,...[kv+'all']])]
          }
        }else if(this.checkedValues.includes(`${kv+'all'}`)){
          let index=this.checkedValues.findIndex(cv=>cv===`${kv+'all'}`)
          console.log(index)
          this.checkedValues.splice(index,1)
        }
      })
      this.cacheVal=[...this.checkedValues]
      console.log(this.checkedValues)
    },
    checked(items){
      console.log(items)
      let c=true;
      items.forEach(t=>{
        if(!this.checkedValues.includes(t)){
          c=false;
        }
      });
      return c;
    },
    queryProcess() {
      return this.axios.get(`dict/process`)
    },
    queryData(){
      return this.axios.get(`/stationBufferLayer/all`)
    },
    queryGroup(){
      this.axios.get(`stationGroup/list`).then(res=>{
        if(res.status == 200&&res.data){
          this.groups = res.data.map(item=>{return {value:item.group,label:item.remark}})
          console.log(this.groups)
        }
      }).catch(err=>{this.$message.error(err)})
    },
    querySteps(){
      this.axios.get(`step/all`).then((res)=>{
        if(Array.isArray(res.data)){this.steps=res.data}else{
          this.$message.error(this.$tcache('admin.cacheListErr01'))
        }
      }).catch(()=>{
        this.$message.error(this.$tcache('admin.cacheListErr01'))
      })
    },
    queryStation(){
      this.axios.post(`station/list`, {}).then(res=>{
        if(res.status == 200&&res.data){
          res.data.forEach(item=>{
            this.stations[item.doPoint]=item
          })
          console.log(this.stations)
          this.makeGroup();
        }
      }).catch(err=>{this.$message.error(err)})
    },
    makeGroup(){
      let kv = {} //根据station_id分组
      let usedgroups = [] //已设置的分组
      this.listdata.forEach(s=>{
        if(kv[s.cacheId]){
          kv[s.cacheId].push(s)
        }else{
          kv[s.cacheId] = [s]
        }
        // this.checkedState[s.cacheId]=null
        // this.indeterminate[s.cacheId]=false
        if(! usedgroups.includes(s.group) && s.group != undefined && s.group != ''){
          usedgroups.push(s.group)
        }
      })
      this.kvData = kv
      console.log(usedgroups)
      usedgroups = usedgroups.map(s=>{return { label: s+ this.$tcache('admin.group'), value: s, onChange:this.handleGroupItemChange }})
      if(this.groups.length!=0){
        usedgroups.forEach(item=>{
          let g=this.groups.find(e=>e.value==item.value)
          item.label=g.label
        })
      }
      console.log(usedgroups)
      this.usedgroups = usedgroups
      console.log(`kv`, kv, `usedgroups:`, usedgroups)
      this.querySteps()
    },
    handleCheck(e){
      console.log(e)
      // this.checkedValues=e
      // let index=this.checkedValues.findIndex(cv=>cv==this.selectVal)
      // console.log(index)
      // if(index!==-1)this.checkedValues.splice(index,1)
      // console.log(this.checkedValues,this.cacheVal)
      // this.checkedValues=[...new Set([...e,...this.cacheVal])]
    },
    save(){
      if(this.checkedValues.length ==0){
        this.$message.warning(this.$tcache('admin.cachelayerGroup13'))
        return
      }
      if(!this.group){
        this.$message.warning(this.$tcache('admin.cachelayerGroup14'))
        return
      }
      this.axios.post(`stationBufferLayer/grouping`, {ids:this.checkedValues.join(','), group: this.group})
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
    //批量选择一个组的对象
    // checkByGroup(arr){
    //   let checkedValues = this.checkedValues
    //   arr.forEach(gid=>{
    //     this.listdata.forEach(d=>{
    //       if(d.group == gid && ! checkedValues.includes(d.id)){
    //         checkedValues.push(d.id)
    //       }
    //     })
    //   })
    // },
    handleGroupItemChange(e){
      console.log(e)
      let checkedValues = this.checkedValues
      if(e.target.checked){
        this.listdata.forEach(d=>{
          if(d.group == e.target.value && ! checkedValues.includes(d.id)){
            checkedValues.push(d.id)
          }
        })
      }else{
        this.listdata.forEach(d=>{
          if(d.group == e.target.value && checkedValues.includes(d.id)){
            let idx = checkedValues.findIndex(x=>x == d.id)
            checkedValues.splice(idx, 1)
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.item{
  padding:1px 2px;
  margin:1px;
  border-radius:5px;
  display: block;
}
::v-deep .ant-checkbox-group{
  width: 100%;
}
::v-deep .ant-card-grid{
  padding:5px;
}
</style>
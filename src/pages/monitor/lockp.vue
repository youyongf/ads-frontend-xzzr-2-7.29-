<template>
  <div style="padding: 100px;">
    <a-row class="query-form">
      <a-input v-model="form.id"  placeholder="Point ID" @focus="focusId"/>
      <a-input v-model="form.agvId"  placeholder="AGV ID" @focus="focusAgvId"/>
      <a-button @click="clearForm">{{$tcache('common.clearCondition')}}</a-button>
    </a-row>

    <a-row>
      <a-table :dataSource="data" :columns="columns" rowKey="id" size="small" :scroll="{ x: true}">
        <a-tag slot="type" slot-scope="text" :data-ids="text"  >{{text|fmtType}}</a-tag>
        <span slot="commonAction" slot-scope="text, record,index">
          <a><a-icon type="minus-square" @click="() => recordEdit(index,record)"></a-icon> </a>
          <!--      <a-divider type="vertical" />-->
        </span>
      </a-table>
    </a-row>
  </div>
</template>

<script>
import { makeColumns } from "../../utils";
const agvtypes = require('../../data/agvtypes.json')

export default {
  name: "agvlist",
  data(){
    return{
      form:{}, //查询条件
      alldata:[],//查询结果
      data:[],
      columns:[], //表头

      visible: false,
    }
  },
  computed: {
     types() {
      return this.$transformI18n(agvtypes,"text");
     }
  },
  watch:{
    form:{
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        if(newVal.id){
          this.data = this.alldata.filter(d=>d.id == newVal.id)
        }else if(newVal.agvId){
          this.data = this.alldata.filter(d=>d.agvId == newVal.agvId)
        }else{
          this.data = this.alldata
        }
      },
      deep: true
    },
  },
  filters:{
    fmtType(val){
      let ptype = agvtypes.find(p=>p.value == val)
      if(ptype){
        return this.$tcache(ptype.text)
      }
      return val
    },
  },
  mounted() {
    this.queryData()
  },
  methods:{
    clearForm(){
      this.form = {}
    },
    queryData(){
      this.axios.get(`cache/lockp`).then(res=>{
        if(res.status == 200){
          console.log(res.data)
          if(res.data && Object.keys(res.data).length){
            this.data = Object.keys(res.data).map(key=>{
              return {id: key, agvId: res.data[key]}
            })
            this.alldata = this.data
            let cols = makeColumns(this.data[0])
            cols.push(this.getCommonActionCfg())
            this.addRender(cols)
            this.columns = cols
          }

        }else{
          this.$message.warning(this.$tcache('common.queryFailure'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    getCommonActionCfg(){
      return { title: 'Action', dataIndex: '', key: 'commonAction', fixed: 'right',width:60, scopedSlots: { customRender: 'commonAction' } }
    },
    addRender(cols){
      //列中添加类似： "scopedSlots":{ "customRender":"createTime"}
      return cols.map(col=>{
        if(col.dataIndex == 'type'){
          if(col.scopedSlots == undefined){
            col['scopedSlots'] = {"customRender":col.dataIndex}
          }
        }
        return col;
      })
    },
    recordEdit(index,record){
      console.log(index,record)
      this.axios.put(`cache/unlockp/${record.id}`)
      .then(res=>{
        if(res.status == 200){
          this.alldata.splice(index, 1)
          this.$message.success(this.$tcache("common.operateSuccess"))
        }else{
          this.$message.warning(this.$tcache("common.operateFail"))
        }
      }).catch(err=>{
        this.$message.error(`${this.$tcache('common.RequestException')}:${err}`)
      })
    },
    focusId(){
      this.form.agvId = null
    },
    focusAgvId(){
      this.form.id =null
    }
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';

</style>
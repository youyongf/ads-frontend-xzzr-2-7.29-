<template>
  <div>
    <a-row class="query-form">
      <a-month-picker v-model="form.countTime"  @change="onChange" :placeholder="$tcache('statistics.date')"/>
      <a-input type="hidden" v-model="form.year"></a-input>
      <a-input type="hidden" v-model="form.month"></a-input>
      <a-select v-model="form.process" :placeholder="$tcache('common.productionProcesses')">
        <a-select-option value="">{{$tcache('statistics.whole')}}</a-select-option>
        <a-select-option value="制绒">{{$tcache('statistics.makeHerbsIntoWool')}}</a-select-option>
        <a-select-option value="扩散">{{$tcache('statistics.diffuse')}}</a-select-option>
        <a-select-option value="BSG">BSG</a-select-option>
        <a-select-option value="碱抛">{{$tcache('statistics.alkaliThrowing')}}</a-select-option>
        <a-select-option value="POPAID">POPAID</a-select-option>
        <a-select-option value="退火">{{$tcache('statistics.anneal')}}</a-select-option>
        <a-select-option value="BOE">BOE</a-select-option>
        <a-select-option value="ALD">{{$tcache('statistics.aldDryProcess')}}</a-select-option>
        <a-select-option value="正膜">{{$tcache('statistics.positiveMembrane')}}</a-select-option>
        <a-select-option value="背膜">{{$tcache('statistics.dorsalMembrane')}}</a-select-option>
        <a-select-option value="丝网">{{$tcache('statistics.silkScreen')}}</a-select-option>
      </a-select>
      <a-button @click="clearForm">{{$tcache('common.clearCondition')}}</a-button>
    </a-row>
    <a-row>
      <a-table :columns="columns" :data-source="datalist" rowKey="id">
        <span slot="workday" slot-scope="text">{{text|fmtDate}}</span>
        <span slot="countTime" slot-scope="text">{{text|fmtDateTime}}</span>
      </a-table>
    </a-row>
  </div>
</template>

<script>
export default {
  name: "transfermonth",
  data(){
    return{
      form:{},
      datalist:[],
      columns:[],
      colStr:{id:'id',year:this.$tcache('statistics.year'),month:this.$tcache('statistics.month'),process:this.$tcache('common.productionProcesses'),times:this.$tcache('statistics.handlingFrequency'),amount:this.$tcache('statistics.numFlowerBaskets'),countTime:this.$tcache('statistics.statisticalTime'),region:this.$tcache('common.region')},
    }
  },
  watch:{
    form:{
      handler(){
        if(this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.queryData, 500)
      },
      deep:true,
    },
  },
  mounted() {
    this.queryData()
  },
  methods:{
    queryData(){
      let _this = this
      this.axios.post(`statistics/month/list`,_this.form).then(res=>{
        if(res.status === 200){
          _this.datalist = res.data
          if(_this.columns.length===0){
            Object.keys(res.data[0]).forEach(item=>{
              if (item === 'countTime'){
                _this.columns.push({title: _this.colStr[item], dataIndex: item, key: item, scopedSlots: {customRender: 'countTime'}})
              }else
                _this.columns.push({title:_this.colStr[item],dataIndex:item,key:item})
            })
          }
        }else{
          _this.$message.warning(this.$tcache('common.infoFailed'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    clearForm(){
      this.form = {}
    },
    onChange(date){
      this.form.year = date._d.getFullYear()
      this.form.month = date._d.getMonth()+1
    }
  },
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
</style>
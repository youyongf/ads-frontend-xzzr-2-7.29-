<template>
  <div>
    <a-row class="query-form">
      <a-date-picker v-model="form.workday" :placeholder="$tcache('statistics.date')"/>
      <a-select v-model="form.workShift" :placeholder="$tcache('statistics.classes')" default-value="">
        <a-select-option value="">{{$tcache('statistics.whole')}}</a-select-option>
        <a-select-option value="A">{{$tcache('common.dayShift')}}A</a-select-option>
        <a-select-option value="B">{{$tcache('common.nightShift')}}B</a-select-option>
      </a-select>
      <a-select v-model="form.process" :placeholder="$tcache('common.productionProcesses')">
        <a-select-option value="">{{$tcache('statistics.whole')}}</a-select-option>
        <a-select-option value="制绒">{{$tcache('common.makeHerbsIntoWool')}}</a-select-option>
        <a-select-option value="扩散">{{$tcache('common.diffuse')}}</a-select-option>
        <a-select-option value="BSG">BSG</a-select-option>
        <a-select-option value="碱抛">{{$tcache('common.alkaliThrowing')}}</a-select-option>
        <a-select-option value="POPAID">POPAID</a-select-option>
        <a-select-option value="退火">{{$tcache('common.anneal')}}</a-select-option>
        <a-select-option value="BOE">BOE</a-select-option>
        <a-select-option value="ALD">ALD干法</a-select-option>
        <a-select-option value="正膜">{{$tcache('common.positiveMembrane')}}</a-select-option>
        <a-select-option value="背膜">{{$tcache('common.dorsalMembrane')}}</a-select-option>
        <a-select-option value="丝网">{{$tcache('common.silkScreen')}}</a-select-option>
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
  name: "transferprocess",
  data(){
    return{
      form:{},
      datalist:[],
      columns:[],
      colStr:{id:'id',workday:this.$tcache('statistics.date'),workShift:this.$tcache('statistics.classes'),process:this.$tcache('common.productionProcesses'),times:this.$tcache('statistics.handlingFrequency'),amount:this.$tcache('statistics.numFlowerBaskets'),countTime:this.$tcache('statistics.statisticalTime')},
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
  methods: {
    queryData() {
      let _this = this
      this.axios.post(`statistics/process/list`, _this.form).then(res => {
        if (res.status === 200) {
          _this.datalist = res.data
          if (_this.columns.length === 0) {
            Object.keys(res.data[0]).forEach(item=>{
              if(item === 'workday') {
                _this.columns.push({title: _this.colStr[item], dataIndex: item, key: item, scopedSlots: {customRender: 'workday'}})
              }else if (item === 'countTime'){
                _this.columns.push({title: _this.colStr[item], dataIndex: item, key: item, scopedSlots: {customRender: 'countTime'}})
              }else
                _this.columns.push({title:_this.colStr[item],dataIndex:item,key:item})
            })
          }
        } else {
          _this.$message.warning(this.$tcache('common.infoFailed'))
        }
      }).catch(err => {
        this.$message.error(err)
      })
    },
    clearForm() {
      this.form = {}
    },
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
</style>
<template>
  <div>
    <a-row class="query-form">
      <a-range-picker v-model="dates" @change="onChange" />
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
  name: "transferDay",
  data(){
    return{
      datalist:[],
      columns:[],
      colStr:{id:'id',workday:this.$tcache('statistics.date'),process:this.$tcache('common.productionProcesses'),times:this.$tcache('statistics.handlingFrequency'),amount:this.$tcache('statistics.numFlowerBaskets'),countTime:this.$tcache('statistics.statisticalTime'),region:this.$tcache('common.region')},
      begin:'',
      end:'',
      url:'statistics/day/all',
      dates:null,
    }
  },
  mounted() {
    this.queryData()
  },
  methods:{
    queryData(){
      let _this = this
      this.axios.get(_this.url).then(res=>{
        if(res.status === 200){
          _this.datalist = res.data
          if(_this.columns.length===0){
            Object.keys(res.data[0]).forEach(item=>{
              if(item === 'workday') {
                _this.columns.push({title: _this.colStr[item], dataIndex: item, key: item, scopedSlots: {customRender: 'workday'}})
              }else if (item === 'countTime'){
                _this.columns.push({title: _this.colStr[item], dataIndex: item, key: item, scopedSlots: {customRender: 'countTime'}})
              }else
                _this.columns.push({title:_this.colStr[item],dataIndex:item,key:item})
            })
          }
          _this.loading = false
        }else{
          _this.$message.warning(this.$tcache('common.infoFailed'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
    clearForm(){
      this.dates = null
      this.url = `statistics/day/all`
      this.queryData()
    },
    onChange(date,dateStr){
      this.begin = dateStr[0]
      this.end = dateStr[1]
      if(this.begin === '' || this.end === ''){
        this.url = `statistics/day/all`
      }else {
        this.url = `statistics/day/begin/${this.begin}/end/${this.end}`
      }
      this.queryData()
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
</style>
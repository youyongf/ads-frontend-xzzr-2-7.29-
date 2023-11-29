<template>
  <div>
    <a-row class="query-form">
      <a-date-picker v-model="form.workday" :placeholder="$tcache('statistics.date')"/>
      <a-select v-model="form.workShift" :placeholder="$tcache('statistics.classes')" default-value="">
        <a-select-option value="">{{$tcache('statistics.whole')}}</a-select-option>
        <a-select-option value="A">{{$tcache('common.dayShift')}}A</a-select-option>
        <a-select-option value="B">{{$tcache('common.nightShift')}}B</a-select-option>
      </a-select>
      <a-select v-model="form.stationName" style="width: 200px" :placeholder="$tcache('common.machineName')">
        <a-select-option v-for="item in stations" :key="item.id" :value="item.name">{{item.name}}</a-select-option>
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
import {axiosget} from "../../utils";

export default {
  name: "transferstation",
  data(){
    return{
      form:{},
      datalist:[],
      columns:[],
      colStr:{id:'id',workday:this.$tcache('statistics.date'),workShift:this.$tcache('statistics.classes'),stationName:this.$tcache('common.machineName'),stationAction:this.$tcache('statistics.machineAction'),times:this.$tcache('statistics.handlingFrequency'),amount:this.$tcache('statistics.numFlowerBaskets'),chips:this.$tcache('statistics.numberSiliconWafers'),countTime:this.$tcache('statistics.statisticalTime')},
      stations:[],
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
    this.queryStations()
    this.queryData()
  },
  methods: {
    queryData() {
      let _this = this
      this.axios.post(`statistics/station/list`, _this.form).then(res => {
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
    queryStations(){
      axiosget(`station/all`,{},(data)=>{
        this.stations = data
      })
    },
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
</style>
<template>
<div>
  <a-row>
    <a-form layout="inline">
      <a-form-item :label="$tcache('statistics.classes')">
        <a-select v-model="shift" :placeholder="$tcache('statistics.classes')" @change="handleChange">
          <a-select-option value="All">{{$tcache('statistics.whole')}}</a-select-option>
          <a-select-option value="A">{{$tcache('common.dayShift')}}</a-select-option>
          <a-select-option value="B">{{$tcache('common.nightShift')}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$tcache('statistics.date')">
        <a-date-picker @change="onChange" />
      </a-form-item>
      <a-form-item >
        <a-button type="primary" icon="search" @click="sub" :loading="loading">Search</a-button>
      </a-form-item>
    </a-form>
  </a-row>
  <a-row>
    <a-table :columns="columns" :data-source="datalist" rowKey="id">
      <span slot="agvAction" slot-scope="text">
        <a-tag color="#f50" v-if="text === '接料'">{{text}}</a-tag>
        <a-tag color="#2db7f5" v-else>{{text}}</a-tag>
      </span>
      <span slot="shift" slot-scope="text">
        <a-tag color="#333" v-if="text === '夜班'">{{text}}</a-tag>
        <a-tag v-else>{{text}}</a-tag>
      </span>
    </a-table>
  </a-row>
</div>
</template>

<script>

// import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import {axiosget} from "../../utils";
// import XLSX from 'xlsx';


export default {
  name: "statistics",
  data(){
    return{
      // locale,
      shift:'All',
      dataString:'',
      datalist:[],
      columns:[],
      steps:[],
      loading:false,
    }
  },
  methods:{
    onChange(data,dataString){
      this.dataString =  dataString
    },
    handleChange(value){
      this.shift = value
    },
    sub(){
      this.loading = true
      if(this.dataString === ''){
        this.$message.error(this.$tcache('statistics.statisticalDate'))
        this.loading = false
        return
      }
      this.queryData()
    },
    queryData(){
      let _this = this
      axiosget(`transferlog/statistics/${this.shift}/${this.dataString}`,{},(data)=>{
        _this.datalist = data
        _this.datalist.filter(item => {
          if(item.agvAction === 'in'){
            item.agvAction = '接料'
          }else {
            item.agvAction = '送料'
          }
          if(item.step === 15){
            item.process = 'ALD湿法';
          }
          if(item.step === 16){
            item.process = 'ALD干法';
          }
        })
        if(_this.columns.length===0){
          Object.keys(data[0]).forEach(item=>{
            if(item === 'agvAction'){
              _this.columns.push({title:item,dataIndex:item,key:item,scopedSlots:{customRender:'agvAction'}})
            }else if(item === 'shift'){
              _this.columns.push({title:item,dataIndex:item,key:item,scopedSlots:{customRender:'shift'}})
            }else
              _this.columns.push({title:item,dataIndex:item,key:item})
          })
        }
        _this.loading = false
      })
    },
  }
}
</script>

<style scoped>

</style>
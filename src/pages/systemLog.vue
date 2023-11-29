<template>
  <div>
    <div class="log">
        <span>{{$tcache('systemLog.logType')}}：</span>
        <a-select v-model="log"  class="select">
           <a-select-option v-for="item in logs" :key="item.id" :value="item.id" @click="queryLogs(item.id)">{{item.name}}</a-select-option>
        </a-select>
        <a-input v-show="log=='sta.input'" class="btn" v-model="form.ip" placeholder="ip" />
    </div>
    <!-- <div v-if="log=='sta.input'">
      <a-table :columns="columns" :data-source="data" :row-class-name="(record, index) => (index % 2 === 1 ? 'table-striped' : null)" rowKey="ts">
        <a slot="name" slot-scope="text">{{ text }}</a>
      </a-table>
    </div> -->
    <div style="background:#ECECEC; padding:30px">
      <a-card class="log" :title="log|fmtLog" :bordered="false">
        <div v-for="(t,i) in data" :key="i">{{i}}、{{t}}</div>
      </a-card>
    </div>
  </div>
</template>
<script>
let vueApp=null;
const tableData = require('../data/columns_systemLog.json');
export default {
  data() {
    return {
      logs: [
        { id: "sta.input", name: this.$tcache('systemLog.machineInformation'), log: null },
        { id: "agv.input", name: this.$tcache('systemLog.carInformation'), log: null },
        { id: "ads.warn", name: this.$tcache('systemLog.warningLog'), log: null },
        { id: "ads.error", name: this.$tcache('systemLog.errorLog'), log: null },
      ],
      log: "sta.input",
      data: [],
      form:{}
    };
  },
  watch:{
    log(newVal, oldVal) {
      console.log('log', newVal, oldVal)
      if(this.timer)clearTimeout(this.timer)
      this.timer=setTimeout(()=>{
        this.queryLogs(newVal)
      },500)
    },
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
  },
  computed: {
    columns() {
      return this.$transformI18n(tableData, "title");
    },
  },
  beforeMount() {
    vueApp=this
  },
  mounted() {
    this.queryLogs(this.log);
  },
  filters:{
    fmtLog(val){
      let log=vueApp.logs.find(l=>l.id==val)
      console.log(log)
      if(log){
        return log.name
      }
      return val
    }
  },
  methods: {
    filterData(){
      let result = JSON.parse(JSON.stringify(this.data))
      if(this.form.ip){
        result = result.filter(d=>`${d.ip}`.includes(`${this.form.ip}`))
      }
      this.data = result
    },
    callback(key) {
      console.log(key);
    },
    queryLogs(log) {
      console.log(log)
      this.axios
        .get(`ads/logs/${log}`)
        .then((res) => {
          if (res.data) {
            let text=''
            // if(log=='sta.input'){
              text='\\r\\n'
            // }else if(log=='agv.input'||text=='ads.warn'){
            //   text='\r\n'
            // }else if(log=='ads.error'){
            //   text="\\r\\n"
            // }
            this.data = res.data.msg.split(text)
            console.log(this.data)
            // let arr=[]
            // this.data.forEach((item,index)=>{
            //   if(log=='sta.input'){
            //     let d=item.split(',')
            //     let d_port=d.find(t=>t.includes('端口')),d_ip=d.find(t=>t.includes('IP')),d_data=d.find(t=>t.includes('数据')),d_ts=d[0];
            //     arr[index]={ts:d_ts,ip:d_ip,port:d_port,data:d_data}
            //   }
            // })
            // if(log=='sta.input')this.data=arr
          } else {
            this.$message.error(this.$tcache('systemLog.failedObtainLogInfo'));
          }
        })
        .catch(() => {
          this.$message.error(this.$tcache('systemLog.failedObtainLogInfo'));
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.log{
    margin: 5px;
    text-align: left;
}
.select{
    min-width: 120px;
}
::v-deep .table-striped {
  background-color: #f0f0f0;
}
.btn{
  width: fit-content;
  margin: 0 10px;
}
</style>
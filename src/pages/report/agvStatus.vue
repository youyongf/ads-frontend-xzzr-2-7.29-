<template>
  <div>
    <div class="colors">
        <div class="lis" v-for="item in colors" :key="item.color">
          <div :style="{ background: item.color }"></div>
          {{ item.text }}
        </div>
        <div>{{$tcache('report.agvBattery')}}</div>
      </div>
    <div>
      {{$tcache('report.agvDiffMode')}}：
      <a-radio-group :default-value="model" button-style="solid">
        <a-radio-button @click="()=>model='step'" value="step">
          {{$tcache('report.step')}}
        </a-radio-button>
        <a-radio-button @click="()=>model='cycle'" value="cycle">
          {{$tcache('report.circulate')}}
        </a-radio-button>
      </a-radio-group>
    </div>
    <!-- 根据步骤区分Agv -->
    <div class="flex" v-show="model=='step'">
      <a-card
        v-for="key in Object.keys(agvdata)"
        :key="key"
        :title="key | fmtStep"
      >
        <a-card-grid
          @click="() => recordEdit(a, key, i)"
          v-for="(a, i) in agvdata[key]"
          :key="a.id"
          :style="{ backgroundColor: a.offline == true ? '#8b8b81' : '#93c94d' }"
          :title="'ip:' + a.ip+' |'+ $tcache('report.end')+':'+a.to"
        >
          {{ a.id }}<span v-if="a.power||a.power==0" :style="{color:a.power>50?'green':'#d11313'}">({{a.power}})</span>
        </a-card-grid>
      </a-card>
    </div>

    <!-- 根据循环区分Agv -->
    <div class="flex" v-show="model=='cycle'">
      <a-card :title="$tcache('report.agvOnlineStatus')" style="width:100%;margin-bottom: 10px;" :tab-list="tabListNoTitle_agv" :active-tab-key="noTitleKey_agv"
        @tabChange="key => onTabChange_agv(key, 'noTitleKey_agv')">
        <div class="station-header">
          <div><span class="span4">{{$tcache('common.onLine')}}({{noTitleKey_agv=='all'?agv_online.length:agv_online_child[noTitleKey_agv]?agv_online_child[noTitleKey_agv].length:0}})</span></div>
          <div><span class="span3">{{$tcache('common.offLine')}}({{noTitleKey_agv=='all'?agv_offline.length:agv_offline_child[noTitleKey_agv]?agv_offline_child[noTitleKey_agv].length:0}})</span></div>
        </div>
        <div class="content" v-show="thekey_agv==noTitleKey_agv" >
          <span v-for="(item,index) in agv_data" :key="item.id"  :title="'ip:' + item.ip+' | '+$tcache('report.end')+':'+item.to">
            <a-card-grid
              @click="() => recordEdit(item, index)"
              v-show="item.remark == noTitleKey_agv||noTitleKey_agv=='all'"
              :style="{ backgroundColor: item.offline == true ? '#8b8b81' : '#93c94d'}"
              >
              <span style="font-weight: bold;">{{ item.id }}<span v-if="item.power||item.power==0" :style="{color:item.power>50?'green':'#d11313'}">({{item.power}})</span></span>
            </a-card-grid>
          </span>
        </div>
      </a-card>

    </div>

    <a-modal
      :title="$tcache('common.modify')"
      :visible="visible"
      :dialog-style="{ top: '20px' }"
      :width="800"
      :okText="$tcache('common.save')"
      :cancelText="$tcache('common.cancel')"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <agv_detail :data="record" :types="types" />
    </a-modal>
  </div>
</template>

<script>
import agv_detail from "../admin/agv_detail.vue";
const agvtypes = require('../../data/agvtypes.json')
let vueApp = null;
export default {
  data() {
    return {
      agvdataCache: {},
      steps: [],
      agvdata: {},
      colors: [
        { text: this.$tcache("common.onLine"), color: "#93c94d" },
        { text: this.$tcache("common.offLine"), color: "#8b8b81" },
      ],
      alldata: [],
      record: {},
      visible: false,
      // types: agvtypes,
      selectedAgv:{},
      agvKey:'',
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      editable:localStorage.getItem('RoleMenu').includes('/admin_agv_editable'),//验证当前页面是否可编辑


      model:'step',
      tabListNoTitle_agv: [
        {
          key: 'all',
          tab: this.$tcache("report.all"),
        }
      ],
      thekey_agv: 'all',
      noTitleKey_agv: 'all',
      agv_offline: [],
      agv_online: [],
      agv_data: [],
      agv_offline_child:{},
      agv_online_child:{}


    };
  },
  components: {
    agv_detail,
  },
  beforeDestroy() {
    clearInterval(this.timer_agvinfo);
  },
  computed: {
    types() {
      return this.$transformI18n(agvtypes, "text");
    },
  },
  mounted() {
    vueApp = this;
    this.querySteps();
  },
  filters: {
    fmtStep: (val) => {
      let steps = [...vueApp.steps];
      let step = steps.find((e) => e.id == val);
      if (step) {
        return step.name;
      }
      return val;
    },
  },
  methods: {
    onTabChange(key, type) {
      this.thekey = key
      this[type] = key;
      console.log(key, this.noTitleKey);
    },
    onTabChange_agv(key, type) {
      this.thekey_agv = key
      this[type] = key;
      console.log('key:'+key, 'noTitleKey_agv:'+this.noTitleKey_agv,'type:'+type);
    },
    querySteps() {
      this.axios
        .post(`step/list`, {})
        .then((res) => {
          if (res.status == 200 && res.data) {
            this.steps = res.data;
            res.data.forEach((s) => {
              this.agvdataCache[s.id] = [];
              this.agvdataCache["other"] = [];
            });
            this.queryAgv();
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    queryAgv() {
      this.axios
        .get(`agv/all`)
        .then((res) => {
          if (res.status == 200 && res.data) {
            this.alldata = res.data.sort((a, b) => {
              return a.id - b.id;
            });
          
            let arr=[]
            let obj={}
            res.data.forEach(item => {
              arr.push(JSON.stringify({ key: item.remark + '', tab: item.remark }))
              if(obj[item.remark+'']){
                obj[item.remark+''].push(item)
              }else{
                obj[item.remark+'']=[]
                obj[item.remark+''].push(item)
              }
            })
            this.tabListNoTitle_agv=[{key: 'all',tab: this.$tcache("map.whole"),}]
            this.tabListNoTitle_agv=[...new Set([...this.tabListNoTitle_agv,...arr])]
            for(let i=0;i<this.tabListNoTitle_agv.length;i++){
              if(typeof this.tabListNoTitle_agv[i]=='string'){
                this.tabListNoTitle_agv[i]=JSON.parse(this.tabListNoTitle_agv[i])
                this.tabListNoTitle_agv[i].tab+=`(${obj[this.tabListNoTitle_agv[i].tab].length})`
              }else{
                this.tabListNoTitle_agv[i].tab+=`(${res.data.length})`
              }
            }

            this.queryAgvinfo(this.alldata);

          }
        })
        .catch(() => {
          this.$message.warning(this.$tcache("report.agvCacheQueryFailed"));
        });
    },

    queryAgvinfo(agvdata) {
      agvdata.forEach((a) => {
        a["offline"] = true;
      });
      this.axios
        .get(`cache/agvinfo/list`)
        .then((res) => {
          if (res.status == 200 && res.data) {
            console.log(Object.keys(this.agvdataCache));
            res.data.forEach((item) => {
              let index = agvdata.findIndex((e) => e.id == item.id);
              if (index !== -1) {
                agvdata[index].step = null;
                agvdata[index].to = item.to;
                if (item["nextStep"]) {
                  agvdata[index].step = item["nextStep"];
                }
              }
            });
            this.queryAgvreply(agvdata);
          }
        })
        .catch(() => {
          this.$message.warning(this.$tcache("report.agvCacheQueryFailed"));
        });
    },

    queryAgvreply(agvdata) {
      this.axios
        .get(`cache/agvreply/list`)
        .then((res) => {
          if (res.status == 200 && res.data) {
            // let now = Date.now();
            Object.keys(this.agvdataCache).forEach((k) => {
              this.agvdataCache[k] = [];
            })
            agvdata.forEach((item,i) => {
              let index = res.data.findIndex((e) => e.id == item.id);
              if ((index && index !== -1) || index == 0) {
                let data=res.data[index]
                if (agvdata[i].lastTs<data.ts) {
                  agvdata[i].offline = false;
                }
                agvdata[i].lastTs=data.ts
                agvdata[i].power = data.power;
                agvdata[i].state = data.state;
                agvdata[i].stateTitle = data.stateTitle;
              }
              let step = agvdata[i].step ? agvdata[i].step + "" : -1;
              if (this.agvdataCache[step]) {
                this.agvdataCache[step].push(agvdata[i]);
              } else {
                this.agvdataCache["other"].push(agvdata[i]);
              }
            });
            this.agvdata = this.agvdataCache;

            let offnum=agvdata.filter(item => item.offline == true).length
            let onnum=agvdata.filter(item => item.offline == false).length
            if(this.agv_offline.length!=offnum||this.agv_online.length!=onnum){
              this.agv_offline = agvdata.filter(item => item.offline == true)
              this.agv_online = agvdata.filter(item => item.offline == false)
            }
            let off={}
            this.agv_offline.forEach(item=>{
              if(off[item.remark]){
                off[item.remark].push(item)
              }else{
                off[item.remark]=[]
                off[item.remark].push(item)
              }
            })
            this.agv_offline_child=off
            let on={}
            this.agv_online.forEach(item=>{
              if(on[item.remark]){
                on[item.remark].push(item)
              }else{
                on[item.remark]=[]
                on[item.remark].push(item)
              }
            })
            this.agv_online_child=on
            this.agv_data=agvdata


            if (this.timer_agvinfo) clearInterval(this.timer_agvinfo);
            this.timer_agvinfo = setTimeout(() => {
              this.queryAgvinfo(this.alldata);
            }, 5000);
          } else {
            this.$message.warning(this.$tcache("report.agvDataQueryFailed"));
          } 
        })
        .catch(() => {
          this.$message.warning(this.$tcache("report.agvDataQueryFailed"));
        });
    },
    recordEdit(record, key, index) {
      console.log(index)
      if(this.editable||this.isAdmin){
        console.log(record, key, index);
        if(index){
          this.selectedAgv=this.agvdata[key][index]
          this.agvKey=index
        }else{
          this.selectedAgv=this.agv_data[key]
          this.agvKey=key
        }
        this.record = record;
        this.visible = true;
      }
    },
    handleOk() {
      let that = this;
      this.$confirm({
        title: this.$tcache("common.prompt"),
        content: this.$tcache("common.pressOkSave"),
        onOk() {
          that.save();
          that.visible = false;
        },
      });
    },
    handleCancel() {
      this.visible = false;
    },
    save() {
      this.axios
        .post(`agv/save`, this.record)
        .then(() => {
          if(this.model=='step'){
            this.$set(this.agvdata[this.record.step],this.agvKey,this.selectedAgv)
          }else{
            this.$set(this.agv_data,this.agvKey,this.selectedAgv)
          }
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  overflow: auto;
  max-height: 70vh;
}
::v-deep .ant-card-grid {
  width: 80px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  // background: #78acdc;
  color: white;
  font-weight: bold;
  border-radius: 3px;
}
::v-deep .ant-card {
  // margin: 5px;
  width: calc(50% - 10px);
  background: #aaa8b5;
}
::v-deep .ant-card-body {
  display: flex;
  flex-wrap: wrap;
  padding: 24px !important;
  justify-content: center;
}
::v-deep .ant-card-head {
  background: #544e72;
  color: white;
}
::v-deep .ant-layout-content {
  // position: relative;
}
.colors {
  display: flex;
  padding: 10px 0;
  position: absolute;

  top: 45px;
  .lis {
    display: flex;
    align-items: center;
    margin-right: 10px;

    div {
      width: 40px;
      height: 20px;
      border-radius: 5px;
      margin-right: 5px;
    }
  }
}
.station-header {
  padding-bottom: 10px;

  div {
    display: inline-block;
    margin-right: 30px;
    .span3,
    .span4 {
      padding: 5px;
      display: inline-block;
      background: #8b8b81;
      color: white;
      border-radius: 5px;
    }
    .span4 {
      background: #93c94d;
    }
  }
  h3 {
    margin-right: 50px;
  }
}
.span1,
.span2 {
  height: 15px;
  display: inline-block;
  background: #36ab36;
  width: 15px;
  border-radius: 50%;
}

.span2 {
  background: #e96666;
}
.content{
  width: 100%;
}
</style>

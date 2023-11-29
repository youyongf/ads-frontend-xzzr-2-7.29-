<template>
  <div class="bd">
    <div class="head">
      <a-select v-model="form.step" :placeholder="$tcache('monitor.step')" :options="steps" class="step"/>
      <div class="cen">
        <h2 class="title">{{form.step}}AGV</h2>
        {{$tcache('monitor.refreshInterval')}}：<a-input type="number" v-model.number="count"/>({{$tcache('home.minutes')}})
      </div>
    </div>
    <div class="cardBox">
      <div v-for="(item, index) in data" :key="index" class="card" :style="{ boxShadow: `0px 0px 10px 0px #a1a3a6 inset`}">
        <div class="head">{{ item.carNumber }}</div>
        <div class="content">
          <div class="item">
            {{$tcache('monitor.inProcessTime')}}：<span class="text">{{ item.qtime }}({{$tcache('home.minutes')}})</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="data?.length == 0" class="bgimg-null">
      <img src="@/assets/img/null.png" alt="" />
    </div>
  </div>
</template>
<script>
let vueApp=null;
export default {
  data() {
    return {
      data: [],
      form: {},
      steps: [],
      count:5
    };
  },
  watch:{
    form:{
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        if(this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.filterData, 500)
      },
      deep: true
    },
  },
  beforeMount(){vueApp=this},
  filters:{
    fmtStep:val=>{
      let steps = [...vueApp.steps]
      let step = steps.find(e=>e.value == val)
      if(step){
        return step.label
      }
      return val
    },
  },
  mounted() {
    this.querySteps()
    this.queryData()
  },
  beforeDestroy(){
    if(this.timer)clearTimeout(this.timer)
  },
  methods:{
    queryData(){
      this.axios.get(`getAgvLoadTimeList`).then((res)=>{
        console.log(res.data)
        if(res.data.success){
          this.alldata=res.data.data
          this.data=res.data.data
          if(res.data.data.length===0){
              this.$message.warning(this.$tcache('monitor.dataIsEmpty'))
          }else{
              this.$message.success(res.data.message)
          }
          if(this.timer)clearTimeout(this.timer)
          if(!this.count){this.count=1}
          this.timer=setTimeout(()=>{this.queryData()},this.count*60000)
        }else{
          this.$message.error(res.data.message)
        }
      }).catch(()=>{
        this.$message.error(this.$tcache('monitor.dataIsEmpty'))
      })
    },
    querySteps(){
      this.axios.get(`step/all`).then((res)=>{
        if(Array.isArray(res.data)){
            this.steps=res.data.map(s=>{
                return {value:s.name,label:s.name}
            })
        }else{
          this.$message.error(this.$tcache('monitor.stepErrTips'))
        }
      }).catch(()=>{
        this.$message.error(this.$tcache('monitor.stepErrTips'))
      })
    },
    filterData(){
      let result = this.alldata
      if(this.form.step){
        result = result.filter(d=>`${this.form.step}`.includes(`${d.processType}`))
      }
      this.data = result
    },
  }
};
</script>
<style lang="scss" scoped>
$textColor: #0783ed;
.bd {
  width: 100%;
  height: 100%;
  .head {
    position: relative;
    padding: 10px;
    .step {
      width: 150px;
      position: absolute;
      left: 0;
      top: 0;
    }
    .cen{
      // display: flex;
      // justify-content: center;
      // align-items: center;
      input{
        width: 120px;
      }
    }
  }
  .title{
    color: $textColor;
    margin-right: 10px;
  }
}
.state {
  display: flex;
  align-items: center;
  font-size: 20px;
  padding: 5px;
  min-height: 45px;
  flex-wrap: wrap;
  border-radius: 3px;
  box-shadow: rgb(161, 163, 166) 0px 0px 10px 5px inset;
}
:deep(.ant-tag) {
  font-size: 20px;
  padding: 5px;
  border-radius: 5px;
}
.cardBox {
  width: 100%;
  height: calc(100% - 50px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
$cardWidth: 5rem;
$cardHeight: 5rem;
$headWidth: 3rem;
.card {
  border: 1px solid #fff;
  min-width: $cardWidth;
  min-height: 40%;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  padding: 5px;
  flex-wrap: wrap;
  margin: 10px;
  .head {
    width: $headWidth;
    height: $headWidth;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 0px 10px 2px rgb(174, 174, 177) inset;
    overflow: hidden;
    font-weight: 500;
    color: $textColor;
    font-size: 1.5rem;
  }
  .content {
    width: 100%;
    .charger {
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .item {
      text-align: center;
      .text {
        font-weight: 500;
        color: $textColor;
      }
    }
  }
}
</style>

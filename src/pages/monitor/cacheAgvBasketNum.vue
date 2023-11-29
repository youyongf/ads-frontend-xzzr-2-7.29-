<template>
  <div>
    <div class="heard">
        <h2>{{$tcache('monitor.cacheMachine')}}</h2>
    </div>
    <div class="flex">
        <div class="flex">
            <span>{{$tcache('monitor.step')}}：</span>
            <a-select v-model="form.step"  class="select">
               <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
            </a-select>
            <div class="tip"><span>*{{$tcache('common.prompt')}}：</span>{{$tcache('monitor.cmTips')}}</div>
        </div>
        
        <div class="heardL">
            <a-select v-model="form.cacheStation" class="select"  placeholder="缓存机" :options="cacheStations" mode="multiple" :token-separators="[',']" :allow-clear="true"/>
            <a-button @click="generate('voluntarilyQtime')" type="primary" icon="plus">生成缓存站position数据</a-button>
            <a-button @click="generate('voluntarilyCache')" type="primary" icon="plus">生成缓存存放数据</a-button>
        </div>
    </div>
    <div class="tips">
        <div class="tip1"></div>
        <div style="color:#c3651f;">生成缓存存放数据：不选择缓存机时，doPoint传值为0(代表生成全部缓存机的数据)</div>
    </div>
    <a-row></a-row>
    <a-row v-for="item in cacheStation" :key="item.id" class="row flex">
        <a-col :span="3">{{item.name}}</a-col>
        <a-col class="right r" :span="21">
            <a-row v-for="c in Object.keys(item.cacheLayerInfos)" :key="c" class="flex bl">
                <a-col :span="3">{{c}}{{$tcache('monitor.layer')}}({{item.cacheLayerInfos[c].basketNum}})-[{{item.cacheLayerInfos[c].group}}]</a-col>
                <a-col class="right" :span="21">
                     <a-row class="contentBox">
                        <a-col class="content" :class="{'color':item.cacheLayerInfos[c].basketNum==60,'timeOut':item.cacheLayerInfos[c].timeOut===1&&item.cacheLayerInfos[c].basketNum==60,'huanliao':item.cacheLayerInfos[c].timeOut===2&&item.cacheLayerInfos[c].basketNum==60}" :span="3">
                            {{item.cacheLayerInfos[c].qtimeList[5]>0?item.cacheLayerInfos[c].qtimeList[5]+'分钟':''}}
                        </a-col>
                        <a-col class="content" :class="{'color':item.cacheLayerInfos[c].basketNum>=50,'timeOut':item.cacheLayerInfos[c].timeOut===1&&item.cacheLayerInfos[c].basketNum==60,'huanliao':item.cacheLayerInfos[c].timeOut===2&&item.cacheLayerInfos[c].basketNum==60}" :span="3">
                            {{item.cacheLayerInfos[c].qtimeList[4]>0?item.cacheLayerInfos[c].qtimeList[4]+'分钟':''}}
                        </a-col>
                        <a-col class="content" :class="{'color':item.cacheLayerInfos[c].basketNum>=40,'timeOut':item.cacheLayerInfos[c].timeOut===1&&item.cacheLayerInfos[c].basketNum==60,'huanliao':item.cacheLayerInfos[c].timeOut===2&&item.cacheLayerInfos[c].basketNum==60}" :span="3">
                            {{item.cacheLayerInfos[c].qtimeList[3]>0?item.cacheLayerInfos[c].qtimeList[3]+'分钟':''}}
                        </a-col>
                        <a-col class="content" :class="{'color':item.cacheLayerInfos[c].basketNum>=30,'timeOut':item.cacheLayerInfos[c].timeOut===1&&item.cacheLayerInfos[c].basketNum==60,'huanliao':item.cacheLayerInfos[c].timeOut===2&&item.cacheLayerInfos[c].basketNum==60}" :span="3">
                            {{item.cacheLayerInfos[c].qtimeList[2]>0?item.cacheLayerInfos[c].qtimeList[2]+'分钟':''
                        }}
                        </a-col>
                        <a-col class="content" :class="{'color':item.cacheLayerInfos[c].basketNum>=20,'timeOut':item.cacheLayerInfos[c].timeOut===1&&item.cacheLayerInfos[c].basketNum==60,'huanliao':item.cacheLayerInfos[c].timeOut===2&&item.cacheLayerInfos[c].basketNum==60}" :span="3">
                            {{item.cacheLayerInfos[c].qtimeList[1]>0?item.cacheLayerInfos[c].qtimeList[1]+'分钟':''}}
                        </a-col>
                        <a-col class="content" :class="{'color':item.cacheLayerInfos[c].basketNum>=10,'timeOut':item.cacheLayerInfos[c].timeOut===1&&item.cacheLayerInfos[c].basketNum==60,'huanliao':item.cacheLayerInfos[c].timeOut===2&&item.cacheLayerInfos[c].basketNum==60}" :span="3">
                            {{item.cacheLayerInfos[c].qtimeList[0]>0?item.cacheLayerInfos[c].qtimeList[0]+'分钟':''}}
                        </a-col>
                    </a-row>
                </a-col>
            </a-row>
        </a-col>
    </a-row>
  </div>
</template>

<script>
export default {
    data(){
        return{
            cacheStation:[],
            steps:[],
            form:{},
            alldata:[],
            isSave:true,
            saveId:null,
            cacheStations:[]
            // isAdmin:this.$store.state.isAdmin,//判断是否为管理员
            // editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
        }
    },
    mounted(){
        this.queryCacheStation()
        this.querySteps()
    },
    beforeDestroy(){
        if(this.timer)clearTimeout(this.timer)
    },
    watch:{
        form:{
            handler(newVal, oldVal) {
                console.log('form', newVal, oldVal)
                if(this.timeout) clearTimeout(this.timeout)
                this.timeout = setTimeout(this.filterData, 500)
            },
            deep: true
        }
    },
    methods:{
        queryCacheStation(){
            this.axios.post(`station/list`, {}).then(res=>{
                if(res.status == 200&&res.data){
                    let data=res.data.filter(item=>item.stationType==2||item.stationType==3)
                    this.cacheStations=data.map(d=>{
                        return {value:d.doPoint,label:d.name}
                    });
                    this.queryStationinfo(data)
                }
            }).catch(err=>{this.$message.error(err)})
        },
        queryStationinfo(data){
            this.axios.get(`stationBufferLayer/getBufferLayerTimeList`).then(res=>{
              res.data.forEach(e => {
                let index=data.findIndex(d=>d.id==e.id)
                if(index!=-1&&e.cacheLayerInfos){
                    console.log(e.cacheLayerInfos)
                    data[index].cacheLayerInfos=e.cacheLayerInfos
                }
              });
              let cadata=data.filter(item=>item.cacheLayerInfos)
              this.alldata=cadata
              this.cacheStation =cadata
              if(this.isSave){
                this.cacheStation=cadata
              }else{
                this.cacheStation.forEach((item,index)=>{
                    let obj=this.alldata.filter(a=>a.id==item.id)
                    this.$set(this.cacheStation,index,obj)
                })
              }
              if(this.timer)clearTimeout(this.timer)
              this.timer=setTimeout(()=>{this.queryStationinfo(this.cacheStation)},30000)
            })
        },
        querySteps(){
            this.axios.get(`step/all`).then((res)=>{
                if(Array.isArray(res.data)){this.steps=res.data}else{
                  this.$message.error(this.$tcache("monitor.stepErrTips"))
                }
            }).catch(()=>{
                this.$message.error(this.$tcache("monitor.stepErrTips"))
            })
        },
        generate(url){
            if(this.form.cacheStation?.length>0||url=='voluntarilyCache'){
                let doPoint=this.form.cacheStation?.join(',')
                if(!doPoint){
                    doPoint=0
                }
                console.log(doPoint)
                this.axios.get(`voluntarily/${url}/${doPoint}`).then((res)=>{
                    console.log(res.data);
                    if(res.data.success){
                        this.$message.success(res.data.message);
                    }else{
                        this.$message.warning(res.data.message)
                    }
                }).catch((err)=>{
                    this.$message.error(err)
                })
            }else{
                this.$message.warning("请先选择缓存机")
            }
        },
        filterData(){
            let result = this.alldata
            if(this.form.step){
              result = result.filter(d=>this.form.step==d.step)
            }
            this.cacheStation = result
            this.isSave=false
        },
    }
}
</script>

<style lang="scss" scoped>
.row{
    margin: 10px;
    border-radius: 5px;
    background: linear-gradient(45deg, #e1d5bc, #eeefe7);
    color: #0094dd;
    font-weight: bold;
}
.col,.row{
    border: 1px solid;
    .right{
        border-left: 1px solid;
    }
}
.bl{
    border-bottom: 1px solid;
}
.r .bl:last-child{
    border: none;
}
.flex{
    display: flex;
    justify-content: center;
    align-items: center;
}
.contentBox{
    display: flex;
    justify-content: space-around;
    padding: 5px;
}
.content{
    height: 20px;
    border-radius: 5px;
    border: 1px solid #0094dd;
}
.color{
    background-color: #0094dd;
    color: #e1d5bc;
    text-align: center;
    // border: none;
}

.flex{
    display: flex;
    justify-content: space-between;
}
.tip{
    font-size: 16px;
    margin-left: 10px;
    span{
        color: red;
    }
}
.heard{
    position: relative;
}
.select{
    min-width: 150px;
}
.heardL{
    // position: absolute;
    // right: 0;
    // top: 0;
    button{
        margin-left: 10px;
    }
    // float: right;
}
.timeOut{
    // box-shadow: 1px 1px 5px 0 inset;
    background-color: red !important;
    // color: red;
}
.huanliao{
    // box-shadow: 1px 1px 5px 0 inset;
    // color: #d7991d;
    background-color: #d7991d !important;
}
.tips{
    display: flex;
    justify-content: space-between;
    .tip1{
        margin-right: 10px;
    }
}
</style>
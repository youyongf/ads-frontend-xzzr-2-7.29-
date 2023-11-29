<template>
  <div>
    <div class="head">
      <a-checkbox v-if="isAdmin||editable" :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">{{$t('common.selectAll')}}</a-checkbox>
      <a-popconfirm
        :title="$t('common.clearNextStations')"
        :ok-text="$t('common.confirm')"
        :cancel-text="$t('common.cancel')"
        @confirm="clearChecked"
        @cancel="()=>{}"
        v-if="isAdmin||editable"
      >
        <a-button class="clearAll">{{$t('common.clearSelected')}}</a-button>
      </a-popconfirm>
      {{$tcache('admin.nextStations01')}}:<a-select v-model="form.step"  :placeholder="$tcache('admin.nextStations01')" :options="steps" class="step"/>
      <a-button @click="cancelAll">{{$t('common.cancelUnsaved')}}</a-button>
      <!-- <div class="title"><span>*</span></div> -->
    </div>
    <div class="content">
      <a-checkbox-group v-model="checkedList" @change="onChange">
        <div class="station" v-for="(item,index) in data" :key="item.id">
          <div class="sn">
            <a-checkbox :value="item.id">
              {{item.name}}<br/>
              <span :style="{color:groupColors[item.group%30],fontWeight:'bold'}">({{item.group|fmtGroup}})</span>
            </a-checkbox>
          </div>
          <div class="nextStations">
            <div class="nsn">{{$tcache('admin.nextStations03')}}</div>
            <div class="lis">
              <a-tag v-for="station in nextStations" :key="station.id" class="tag" :title="station.name" :disabled="station.stationType>1"
               :color="item.nextStations1?.includes(station.doPoint+'')?'blue':item.nextStations2?.includes(station.doPoint+'')?'green'
               :item.nextStations3?.includes(station.doPoint+'')?'orange':item.nextStations4?.includes(station.doPoint+'')?'red':''"
               @click="tag(item,index,station)">{{station.smallName}}<span :style="{color:groupColors[station.group%30],fontWeight:'bold'}">({{station.group|fmtGroup}})</span></a-tag>
            </div>
          </div>
          <div v-if="isAdmin||editable" class="save">
            <a-tag v-for="t in item.nextStationType" @click="tagType(item,index,t)" :key="t" :title="$t('common.priority')+`${t}`" class="btn" :color="item[`colors${t}`]" v-show="item[`nextStations${t-1}`]?.length>0&&t!==1||t==1">{{t}}</a-tag>
            <a-popconfirm
              :title="$tcache('admin.nextStations04')"
              :ok-text="$tcache('common.confirm')"
              :cancel-text="$tcache('common.cancel')"
              @confirm="save(item,index)"
              @cancel="cancel(index)"
            >
              <a :title="$tcache('common.save')"><a-icon style="font-size:20px;" type="save"></a-icon></a>
            </a-popconfirm>
          </div>
        </div>
      </a-checkbox-group>
    </div>
  </div>
</template>

<script>
let vueApp=null;
export default {
  name: "agvlist",
  data(){
    return{
      data:[],
      alldata:[],
      steps:[],
      isSave:true,
      form:{},
      nextStations:[],
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
      cacheData:[],
      checkedList: [],
      indeterminate: false,
      checkAll: false,
      plainOptions:[],
      colors:['blue','green','orange','red','#FF6347','#8294C4'],
      groupColors:['#DC143C','green','#0000FF','#008080','#FF6347','#8294C4','#19A7CE','#FF4500','#a2a22b','#AAC8A7',
        '#99627A','#FF8C00','#E9A178','#800080','#FFC0CB','#FFD700','#00CED1','#B7B7B7','#FF69B4','#9932CC',
        '#A4907C','#CE5959','#4B0082','#9400D3','#008B8B','#FF1493','#FFDAB9','#97DEFF','#FF00FF','#A0522D'
      ],
    }
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
  beforeMount() {
    vueApp=this
  },
  mounted() {
    this.querySteps()
    this.queryData()
  },
  methods:{
    queryData(){
      this.axios.get(`station/all`).then(res=>{
        if(res.status == 200&&res.data){
          this.alldata=[...res.data]
          this.alldata.forEach(s => {
            s.nextStationType=[1,2,3,4];//true优先级1的下个可选机台，false为优先级2的下个可选机台
            s.colors1=this.colors[0]
            s.nst_select=1;
            s.nextStationType.forEach(t=>{
              s[`nextStations${t}`]=[];
            })
            if(s.nextStations){
              if(s.nextStations?.includes(';')){
                let nextStations=s.nextStations.split(';');
                s.nextStationType.forEach(t=>{
                  s[`nextStations${t}`]=nextStations[t-1]?.length>0?nextStations[t-1].split(','):[];
                })
              }else{
                s.nextStations1=s.nextStations.split(',')
              }
            }
          })
        }else{
          this.$message.warning(this.$tcache('common.queryFailure'))
        }
      }).catch(err=>{this.$message.error(err+'')})
    },
    tag(item,index,station){
      let doPoint=station.doPoint+''
      let type=`nextStations${item.nst_select}`
      if(!item[type]){
        item[type]=[]
      }
      if(item[type]?.includes(doPoint)){
        if(item[type].length==1){
          item.nextStationType.forEach(t=>{
            if(item[`nextStations${t+1}`]&&t>=item.nst_select){
              item[`nextStations${t}`]=[...item[`nextStations${t+1}`]];
            }else if(t==item.nextStationType.length){
              item[`nextStations${t}`]=[]
            }
          })
          return;
        }
        let i=item[type].findIndex(s=>s==doPoint)
        item[type].splice(i,1)
      }else{
        let bol=true;
        item.nextStationType.forEach(t=>{
          if(item[`nextStations${t}`].includes(doPoint)){
            let i=item[`nextStations${t}`].findIndex(n=>n==doPoint)
            item[`nextStations${t}`].splice(i,1);
            bol=false;
          }
        })
        if(station.stationType>1&&bol){
          this.$message.warning("缓存机不可以作为下个可选机台")
          return;
        }
        if(station.stationType===1){
          item[type].push(doPoint);
        }
      }
      this.$set(this.data,index,item)
      this.$nextTick(()=>{
        console.log(this.data[index])
      })
    },
    tagType(item,index,bol){
      item.nst_select=bol
      item.nextStationType.forEach(t=>{
        if(t==bol){
          item[`colors${bol}`]=this.colors[bol-1];
        }else{
          item[`colors${t}`]='';
        }
      })
      this.$set(this.data,index,item)
    },
    queryNextStation(nextStep){
      this.axios.get(`station/bystep/${nextStep}`).then(res=>{
        console.log(res.data)
        if(res.status == 200&&res.data){
          this.nextStations=res.data
          this.nextStations.forEach(s => {
            let step=this.steps.find(e=>e.value==s.step)
            s.smallName=s.name.replace(step.label,'')
            if(s.smallName.charAt(0)=='-'){
              s.smallName=s.smallName.replace('-','')
            }
          })
        }else{
          this.$message.warning(this.$tcache('admin.cacheListWarn'))
        }
      }).catch(()=>{this.$message.warning(this.$tcache('admin.cacheListWarn'))})
    },
    
    save(item,i){
      let obj=JSON.parse(JSON.stringify(item))
      console.log(obj.nextStations1,obj.nextStations2)
      if(obj.nextStations1?.length>0){
        obj.nextStations=obj.nextStations1.join(',')
        if(obj.nextStations2.length>0){obj.nextStations=obj.nextStations+';'+obj.nextStations2.join(',');}
        if(obj.nextStations3.length>0){obj.nextStations=obj.nextStations+';'+obj.nextStations3.join(',');}
        if(obj.nextStations4.length>0){obj.nextStations=obj.nextStations+';'+obj.nextStations4.join(',');}
      }else if(obj.nextStations1?.length==0){
        obj.nextStations=[...obj.nextStations2,...obj.nextStations3,...obj.nextStations3];
        if(obj.nextStations.length>0){
          obj.nextStations=obj.nextStations.join(',');
        }else{
          obj.nextStations=null;
        }
      }
      this.axios.post(`station/save`,obj).then((res)=>{
        if(res.data.success){
          let index=this.alldata.findIndex(d=>d.id==obj.id)
          this.cacheData[i]=JSON.parse(JSON.stringify(item))
          this.alldata[index]=JSON.parse(JSON.stringify(item))
          this.$message.success(res.data.message)
        }else{
          this.$message.error(res.data.message)
        }
      }).catch((err)=>{this.$message.error(err+'')})
    },
    querySteps(){
      this.axios.get(`step/all`).then((res)=>{
        if(Array.isArray(res.data)){
          this.steps=res.data.map(s=>{
            return {value:s.id,label:s.name}
          })
        }else{
          this.$message.error(this.$tcache('admin.cacheListErr01'))
        }
      }).catch(()=>{
        this.$message.error(this.$tcache('admin.cacheListErr01'))
      })
    },
    filterData(){
      let result = JSON.parse(JSON.stringify(this.alldata))
      console.log(this.alldata)
      if(this.form.step){
        result = result.filter(d=>d.step==this.form.step)
      }
      this.data = result.sort((a,b)=>a.line-b.line)
      this.plainOptions=this.data.map(d=>d.id)
      console.log(this.plainOptions)
      this.cacheData=JSON.parse(JSON.stringify(this.data))
      this.queryNextStation(this.data[0].nextStep)
    },
    cancelAll(){
      this.data=JSON.parse(JSON.stringify(this.cacheData))
      console.log(this.cacheData)
    },
    cancel(index){
      Object.assign(this.data[index],this.cacheData[index])
    },
    onChange(checkedList) {
      this.indeterminate = !!checkedList.length && checkedList.length < this.plainOptions.length;
      this.checkAll = checkedList.length === this.plainOptions.length;
      console.log(this.checkedList);
    },
    onCheckAllChange(e) {
      Object.assign(this, {
        checkedList: e.target.checked ? this.plainOptions : [],
        indeterminate: false,
        checkAll: e.target.checked,
      });
      console.log(this.checkedList);
    },
    clearChecked(){
      if(this.checkedList.length===0){
        this.$message.warning('选项不可为空')
        return;
      }
      let obj={id:this.checkedList.join(','),nextStations:null}
      this.axios.post(`station/updateStations`,obj).then((res)=>{
        if(res.data.success){
          this.data.forEach(data=>{
            if(this.checkedList.includes(data.id)){
              data.nextStations=null;
              data.nextStationType.forEach(t=>{
                data[`nextStations${t}`]=[]
              })
              let index=this.alldata.findIndex(d=>d.id==data.id)
              let i=this.cacheData.findIndex(c=>c.id==data.id)
              this.cacheData[i]=data
              this.alldata[index]=data
            }
          })
          this.indeterminate=false;
          this.checkedList=[];
          this.checkAll=false;
          this.$message.success(res.data.message)
        }else{
          this.$message.error(res.data.message)
        }
      }).catch((err)=>{this.$message.error(err+'')})
    }
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
.head{
  display: flex;
  justify-content: center;
  align-items: center;
  .step{
    width: 150px;
    margin-right: 50px;
  }
}
.content{
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 16px;
  .station{
    // border: 1px solid #0000004f;
    box-shadow: 0px 0px 3px 0px;
    display: flex;
    width: fit-content;
    margin: 5px;
    border-radius: 5px;
    // align-items: center;
    .sn{
      padding: 10px;
      // border-right: 1px dashed;
      display: flex;
      align-items: center;
      white-space: nowrap;
    }
    .nextStations{
      display: flex;
      // border-right: 1px dashed;
      box-shadow: 0px 0px 3px 0px inset;
      .nsn{
        writing-mode: vertical-rl; /* 设置文字竖向排列，从右到左 */
        text-orientation: upright; /* 保持文字正常的方向 */
        white-space: nowrap; /* 防止文字换行 */
        padding: 5px;
        // font-size: 20px; 
      }
      .lis{
        display: flex;
        // justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        padding: 10px;
        .tag{
          margin: 5px;
          padding: 5px 10px;
          box-shadow: 1px 1px 3px 0px;
          cursor: pointer;
        }
      }
    }
    .save{
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      .btn{
        margin: 5px;
        box-shadow: 0px 0px 3px 0;
      }
    }
  }
}
::v-deep .ant-tag-blue{
  box-shadow: 1px 1px 3px 0px inset !important;
}
::v-deep .ant-tag-green{
  box-shadow: 1px 1px 3px 0px inset !important;
}
::v-deep .ant-tag-red{
  box-shadow: 1px 1px 3px 0px inset !important;
}
::v-deep .ant-tag-orange{
  box-shadow: 1px 1px 3px 0px inset !important;
}
::v-deep .ant-popover-buttons{
  display: flex !important;
}
::v-deep .ant-tag{
  margin-right: 0;
}
.clearAll{
  margin-right: 50px;
}
</style>

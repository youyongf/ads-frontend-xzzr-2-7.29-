<template>
  <div>
    <a-row class="query-form">
      <a-input v-model="form.fileName" :placeholder="$tcache('admin.routefiles01')" addon-after=".csv" />
      <a-button @click="clearForm"><span class="fontSty">{{$tcache('common.clearCondition')}}</span></a-button>
      <a-button style="margin-left: 10px;" @click="deleteRoute"><span class="fontSty">{{$tcache('admin.routefiles02')}}</span></a-button>
      <a-button style="margin-left: 10px;" @click="() => $router.push('/admin_route')"><span
          class="fontSty">{{$tcache('common.back')}}</span></a-button>
    </a-row>
    <div :style="{ borderBottom: '1px solid #E9E9E9' }">
      <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange" class="selectAll">{{$tcache('admin.routefiles03')}}</a-checkbox>
    </div>
    <br />
    <a-checkbox-group v-model="checkedList" @change="onChange" class="group">
      <span v-for="item in plainOptions" :key="item.value" :title="item.title">
        <a-checkbox :value="item.value">
          {{item.label}}
        </a-checkbox>
      </span>
    </a-checkbox-group>
  </div>
</template>

<script>
const plainOptions = [];
const defaultCheckedList = [];

export default {
  name: "agvlist",
  data() {
    return {
      form: {}, //查询条件
      data: [],//查询结果
      alldata: [],
      isAdmin: this.$store.state.isAdmin,//判断是否为管理员
      checkedList: defaultCheckedList,
      indeterminate: false,
      checkAll: false,
      plainOptions,
      plainOptionTitile:''
    }
  },
  watch: {
    form: {
      handler(newVal, oldVal) {
        console.log('form', newVal, oldVal)
        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.filterData, 500)
      },
      deep: true
    }
  },
  mounted() {
    this.queryData()
  },
  methods: {
    filterData() {
      let result = this.alldata
      if (this.form.fileName) {
        result = result.filter(d => d.value==this.form.fileName)
      }
      let obj = {...result}
      this.plainOptions=[{label:'',value:''}]
      for (let i = 0; i < Object.keys(obj).length; i++) {
        this.$set(this.plainOptions,i,obj[i])
      }
      if(this.plainOptions.length>1)this.plainOptions=this.plainOptions.sort((a,b)=>{return Number(a.value)-Number(b.value)})
    },
    clearForm() {
      this.form = {}
    },
    queryData() {
      let that = this
      this.axios.get(`route/listfiles`).then(res => {
        if (res.status == 200 && res.data) {
          let obj = res.data
          let arr = []
          for (let i = 0; i < Object.keys(obj).length; i++) {
            arr[i] = {label:Object.keys(obj)[i],value:Object.keys(obj)[i].substring(0, Object.keys(obj)[i].length - 4),title:Object.values(obj)[i]}
            this.$set(this.plainOptions,i,arr[i])
          }
          this.plainOptions=this.plainOptions.sort((a,b)=>{return Number(a.value)-Number(b.value)})
          this.alldata = arr
        } else {
          that.$message.warning(this.$tcache('common.queryFailure'))
        }
      }).catch(err => { this.$message.error(err) })
    },
    deleteRoute() {
      if (this.checkedList.length == 0) {
        this.$message.info(this.$tcache('admin.routefiles04'))
        return
      }
      let arr = [...this.checkedList]
      console.log(arr)
      let rids = arr.join(',')
      console.log(rids)
      this.visible = true
      this.axios.delete(`route/delfiles/${rids}`).then((res) => {
        if(res.data.success){
          console.log(res)
          this.checkedList = []
          this.plainOptions=this.plainOptions.filter(item=>!arr.includes(item.value))
          this.indeterminate=false
          this.$message.success(this.$tcache('admin.routefiles04',{rids}))
        }
      }).catch((err) => {this.$message.error(this.$tcache('admin.routefiles06')+err) })
    },


    onChange(checkedList) {
      console.log(checkedList)
      this.indeterminate = !!checkedList.length && checkedList.length < plainOptions.length;
      this.checkAll = checkedList.length === plainOptions.length;
    },
    onCheckAllChange(e) {
      let arr=[]
      plainOptions.forEach(item=>{
        arr.push(item.value)
      })
      Object.assign(this, {
        checkedList: e.target.checked ? arr : [],
        indeterminate: false,
        checkAll: e.target.checked,
      });
      console.log(this.checkedList)
    },
  }
}
</script>

<style scoped lang="scss">
@import '~@/assets/scss/style.scss';
::v-deep .ant-checkbox-wrapper{
  width: 100px;
  margin: 2.5px 5px;
  margin-left: 0;
  text-align: left;
  background: #fdde89a3;
}
.group{
  max-height: 68vh !important;
  overflow: auto;
}
::v-deep .ant-input-group{
  width: 130px;
}
::v-deep .ant-input-group-wrapper{
  width: auto;
  margin-right: 10px;
}
.selectAll{
  padding: 5px;
  border-radius: 5px
}
</style>
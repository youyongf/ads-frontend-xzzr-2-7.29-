<template>
  <a-form-model layout="inline" :form="data">
    <a-form-model-item  class="flex_item Width_350" label="id">
      <a-input disabled class="changeWidth" type="number" v-model="data.id" placeholder="id" />
    </a-form-model-item>
    <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.name')">
      <a-input class="changeWidth" v-model="data.name" :placeholder="$tcache('admin.name')" />
    </a-form-model-item>
    <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stepDet01')">
      <a-select :allowClear='true' v-model="data.decidePoints"  class="changeWidth" mode="multiple" :token-separators="[',']">
        <a-select-option v-for="item in decidePoints" :key="item.id" :value="item.id">{{item.remark}}</a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stepDet02')">
      <!-- <a-input class="changeWidth"  @blur="changeKey(data.chargePoints,1,'充电点')"  v-model="data.chargePoints" placeholder="充电点" /> -->
      <a-select :allowClear='true' v-model="data.chargePoints"  class="changeWidth" mode="multiple" :token-separators="[',']">
        <a-select-option v-for="item in chargePoints" :key="item.id" :value="item.id">{{item.id}}</a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.cacheLayer03')">
      <a-select v-model="data.parks"  class="changeWidth" mode="multiple" :token-separators="[',']">
        <a-select-option v-for="item in parks" :key="item.id" :value="item.id">{{item.remark}}</a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stepDet03')">
      <a-input class="changeWidth"  type="number" v-model.number="data.defaultPoint"  :placeholder="$tcache('admin.stepDet03')" />
    </a-form-model-item>
    <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stepDet04')">
      <a-input class="changeWidth"  type="number" v-model.number="data.parksLimits"  :placeholder="$tcache('admin.stepDet04')" />
    </a-form-model-item>
    <a-form-model-item  class="flex_item Width_350" :label="$tcache('admin.stepDet05')">
      <a-input class="changeWidth"  type="number" v-model.number="data.parksLowLimits"  :placeholder="$tcache('admin.stepDet05')" />
    </a-form-model-item>
    <!-- <a-form-model-item  class="flex_item Width_350" label="缓存机">
      <a-select v-model="data.cachePoints"  class="changeWidth" mode="multiple" :token-separators="[',']">
        <a-select-option v-for="item in cachePoints" :key="item.id" :value="item.doPoint">{{item.name}}</a-select-option>
      </a-select>
    </a-form-model-item> -->
  </a-form-model>
</template>

<script>
export default {
  name: "step_detail",
  props:{
    data: {type:Object, required:true},
    decidePoints: {type:Array, required:true},
    parks: {type:Array, required:true},
    chargePoints: {type:Array, default:()=>[]},
    // cachePoints: {type:Array, required:true},
  },
  methods:{
    changeKey(value,num,text){
       let rgx =/^[0-9,]+\d$/
       let va=`${value}`
       console.log(va)
      if(!rgx.test(va)&&va!='null'&&va!=''){
        //验证通过调用回调函数
        switch(num){
          case 1:
            this.data.chargePoints=''
            break;
        }
        this.$message.error(this.$tcache('admin.validateTips',{text}))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ant-form-item-label{
  width: 120px;
  text-align: left;
}
.changeWidth{
  width: 200px;
}
</style>
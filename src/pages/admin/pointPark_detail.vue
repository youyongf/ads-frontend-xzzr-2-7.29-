<template>
  <a-form-model layout="inline" :form="data">
    <a-form-model-item class="Width_350"  :label="$tcache('common.point') +'ID'">
      <a-input type="number" class="Width_200" :disabled="type!='add'" v-model.number="data.pointId"/>
    </a-form-model-item>
    <!-- <a-form-model-item class="Width_350"  label="缓存(buffers)">
      <a-input class="Width_200" v-model="data.buffers"/>
    </a-form-model-item> -->
    <a-form-model-item  class="Width_350" :label="$tcache('admin.pointDecideDet04')">
      <a-select v-model="data.buffers"  class="Width_200" mode="multiple" :token-separators="[',']" :allow-clear="true">
        <a-select-option  v-for="item in cacheStations" :key="item.value" :value="item.value">{{item.label}}</a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.pointDecideDet05')">
      <a-switch v-model="data.enabled" :checked-children="$tcache('admin.pointParkDet01')" :un-checked-children="$tcache('admin.pointParkDet02')" />
    </a-form-model-item>
    <a-form-model-item class="Width_350" :label="$tcache('common.region')">
      <a-input type="number" class="Width_200" v-model.number="data.area"/>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
export default {
  name: "agv_detail",
  props:{
    data: {type:Object, required:true},
    types: {type:Array, required: false},
    type: {type:String, required: false},
    cacheStations: {type:Array, required:false,default:()=>[]},
  },
  data(){
    return{
      regions:[
        {id:1,remark:this.$tcache('admin.frontParagraph')},
        {id:2,remark:this.$tcache('admin.posteriorSegment')},
        {id:3,remark:this.$tcache('admin.surveySection')}
      ]
    }
  },
  methods:{
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ant-form-item-label{
  width: 120px;
  text-align: left;
}
::v-deep .ant-modal-body{
  text-align: center;
}
</style>
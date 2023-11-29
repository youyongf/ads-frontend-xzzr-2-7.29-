<template>
  <a-form-model layout="inline" :form="data">
    <a-form-model-item class="Width_350"  label="id">
      <a-input type="number" class="Width_200" :disabled="type!='add'" v-model.number="data.id"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  label="ip">
      <a-input class="Width_200"  v-model="data.ip"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.port')">
      <a-input class="Width_200" type="number"  v-model.number="data.port"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350" :label="$tcache('admin.belongingCycle')">
      <a-select class="Width_200"   v-model="data.region" >
          <a-select-option v-for="item in stepRegions" :key="item.value" :value="item.value">{{item.value}}</a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.hlThreshold')">
      <a-input class="Width_200" type="number"  v-model.number="data.maxBasket"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.remarks')">
      <a-input class="Width_200"  v-model="data.remark"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350" :label="$tcache('admin.carType')">
      <a-select class="Width_200"   v-model="data.type" >
          <a-select-option v-for="item in types" :key="item.value" :value="item.value">{{item.text}}</a-select-option>
      </a-select>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
export default {
  name: "agv_detail",
  props:{
    data: {type:Object, required:true},
    types: {type:Array, required: true},
    type: {type:String, required: false},
    stepRegions: {type:Array, required: false},
  },
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
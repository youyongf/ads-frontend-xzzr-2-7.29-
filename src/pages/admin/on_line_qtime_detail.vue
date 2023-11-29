<template>
  <a-form-model layout="inline" :form="data">
    <a-form-model-item class="Width_350"  label="id">
      <a-input class="Width_200" disabled v-model="data.id"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.name')">
      <a-input class="Width_200"  v-model="data.name"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.achePositionDetail03')">
      <a-input class="Width_200" type="number"  v-model.number="data.item"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350" :label="$tcache('admin.nextStations01')">
      <a-select style="width:194px"   v-model="data.stepId" >
          <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
      </a-select>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
export default {
  name: "agv_detail",
  props:{
    data: {type:Object, required:true},
    steps: {type:Array, required: true},
  },
  data(){
    return{
    }
  },
  methods:{
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ant-form-item-label{
  width: 112px;
}
</style>
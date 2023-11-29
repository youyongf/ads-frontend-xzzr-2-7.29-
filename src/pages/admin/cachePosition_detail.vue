<template>
  <a-form-model layout="inline" :form="data">
    <a-form-model-item class="Width_350"  label="id">
      <a-input type="number" class="Width_200" :disabled="type!='add'" v-model.number="data.id"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.achePositionDetail01')">
      <a-input type="number" class="Width_200" v-model.number="data.bufferLayerId"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.name')">
      <a-input class="Width_200" v-model="data.name"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.achePositionDetail02')">
      <a-input class="Width_200" v-model="data.address"/>
    </a-form-model-item>
    <a-form-model-item class="Width_350"  :label="$tcache('admin.achePositionDetail03')">
      <a-input type="number" class="Width_200" v-model.number="data.item"/>
    </a-form-model-item>
    <!-- <a-form-model-item class="Width_350"  label="开关状态">
      <a-switch v-model="data.enabled" checked-children="开" un-checked-children="关" />
    </a-form-model-item>
    <a-form-model-item class="Width_350" label="区域">
      <a-input type="number" class="Width_200" v-model.number="data.area"/>
    </a-form-model-item> -->
  </a-form-model>
</template>

<script>
export default {
  name: "agv_detail",
  props:{
    data: {type:Object, required:true},
    types: {type:Array, required: false},
    type: {type:String, required: false},
  },
  data(){
    return{
      regions:[
        {id:1,remark: this.$tcache('admin.frontParagraph')},
        {id:2,remark: this.$tcache('admin.posteriorSegment')},
        {id:3,remark: this.$tcache('admin.surveySection')}
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
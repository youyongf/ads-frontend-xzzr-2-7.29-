<template>
  <a-form-model layout="inline" :form="data">
    <span v-for="item in Object.keys(data)" :key="item"  class="Width_200">
      <a-form-model-item 
        class="Width_350" 
        :label="item|fmtRemark"
        v-if="showArr.length==0?true:showArr.includes(item)"
      >
        <span v-if="requireds.includes(item)" class="requireds">*</span>
        <a-input :type="isNumArr.includes(item)?'number':''" :disabled="disabledStrArr.includes(item)" v-model="data[item]" />
      </a-form-model-item>
    </span>
    <span v-if="isCacheLayer">
      <a-form-model-item class="Width_350">
        <div class="flex">
          <span class="col">{{$tcache('admin.cacheLayer03')}}:</span>
          <a-select v-model="data.parks" mode="multiple" :token-separators="[',']" :allow-clear="true">
            <a-select-option v-for="item in parks" :key="item.value" :value="item.value">{{item.label}}</a-select-option>
          </a-select>
        </div>
      </a-form-model-item>
    </span>
    <span v-if="isPoint">
      <a-form-model-item class="Width_350">
        <div class="flex">
          <span class="col">{{$tcache('admin.pointMap09')}}:</span>
          <a-select v-model="data.type"  class="" :allow-clear="true">
            <a-select-option v-for="item in pointType" :key="item.value" :value="item.value">{{item.title}}</a-select-option>
          </a-select>
        </div>
      </a-form-model-item>
      <a-form-model-item class="Width_350">
        <div class="flex">
          <span class="col">{{$tcache('admin.publicDet01')}}:</span>
          <a-select v-model="data.step"  class="" :allow-clear="true">
            <a-select-option v-for="item in steps" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
          </a-select>
        </div>
      </a-form-model-item>
      <a-form-model-item class="Width_350">
        <div class="flex">
          <span class="col">{{$tcache('common.region')}}:</span>
          <a-select v-model="data.area"  class="" :allow-clear="true">
            <a-select-option v-for="item in areas" :key="item" :value="item">{{areaRemark[item-1]}}</a-select-option>
          </a-select>
        </div>
      </a-form-model-item>
      <a-form-model-item class="Width_350">
        <div class="flex">
          <span class="col">{{$tcache('admin.publicDet02')}}:</span>
          <a-select v-model="data.cacheStations" mode="multiple" :token-separators="[',']" :allow-clear="true">
            <a-select-option v-for="item in cacheStations" :key="item.id" :value="item.doPoint">{{item.name}}</a-select-option>
          </a-select>
        </div>
      </a-form-model-item>
    </span>
  </a-form-model>
</template>
  
<script>
let vueApp=null
export default {
  name: "public",
  props: {
    data: { type: Object, required: true },
    remark: { type: Array, required: true },
    disabledStrArr:{ type: Array, required: false,default:()=>[] },
    showArr:{ type: Array,default:()=>[] },
    pointType:{ type: Array,default:()=>[]},
    steps:{ type: Array,default:()=>[]},
    isPoint:{ type: Boolean,default:()=>false},
    isNumArr:{ type: Array,default:()=>[]},
    areas: { type: Array, required: false,default:()=>[] },
    requireds: { type: Array, required: false,default:()=>[] },
    cacheStations:{ type: Array,default:()=>[]},
    isCacheLayer:{ type: Boolean,default:()=>false},
    parks:{ type: Array,default:()=>[]},
  },
  filters: {
    fmtRemark: val => {
      let rm = [...vueApp.remark]
      rm = rm.find(e => e.key == val)
      if (rm) {
        return rm.title
      }
      return val
    },
  },
  beforeMount(){vueApp=this},
  data() {
    return {
      areaRemark:[this.$tcache('admin.pointMap17'),this.$tcache('admin.pointMap18'),this.$tcache('admin.publicDet03'),this.$tcache('admin.publicDet04'),this.$tcache('admin.publicDet05')],
    }
  },
  methods: {
  }
}
</script>
  
<style lang="scss" scoped>
::v-deep .ant-form-item-label {
  width: 120px;
  text-align: left;
}
.flex{
  .col{
    display: inline-block;
    width: 120px;
    text-align: left;
  }
}
::v-deep .ant-select{
  width: 195px !important; 
}
::v-deep .ant-modal-body{
  text-align: left;
}
.requireds{
  color:red;
  position: absolute;
  left: -130px;
  z-index: 1;
}
</style>
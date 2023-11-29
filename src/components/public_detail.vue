<template>
  <a-form-model layout="inline" :form="data">
    <a-form-model-item v-show="!hidden.includes(k)&&!(type=='add'&&k=='id')" v-for="k in Object.keys(inputData)" :key="k"
     class="Width_350" :class="requireds.includes(k)?'require':''" :label="k|fmtColumns">
      <a-input :disabled="disabled[`${type}`]?.includes(k)" class="Width_200"  v-model="data[k]"/>
    </a-form-model-item>
    <a-form-model-item v-show="!hidden.includes(k)" v-for="k in Object.keys(isNumData)" :key="k"
     class="Width_350" :class="requireds.includes(k)?'require':''" :label="k|fmtColumns">
        <a-input :disabled="disabled[`${type}`]?.includes(k)" class="Width_200" type="number"  v-model.number="data[k]"/>
      </a-form-model-item>
    <a-form-model-item v-show="!hidden.includes(k)" v-for="k in Object.keys(radioData)" :key="k" class="Width_350" :class="requireds.includes(k)?'require':''" :label="k|fmtColumns">
      <a-select :disabled="disabled[`${type}`]?.includes(k)" class="Width_200" v-model="data[k]" :options="radios[k]"  :allow-clear="true"/>
    </a-form-model-item>
    <a-form-model-item v-show="!hidden.includes(k)" v-for="k in Object.keys(checkboxData)" :key="k" class="Width_350" :class="requireds.includes(k)?'require':''" :label="k|fmtColumns">
      <a-select :disabled="disabled[`${type}`]?.includes(k)" class="Width_200" v-model="data[k]" mode="multiple" :token-separators="[',']" :allow-clear="true" :options="checkboxs[k]"/>
    </a-form-model-item>
    <a-form-model-item v-show="!hidden.includes(k)" v-for="k in Object.keys(bolData)" :key="k" class="Width_350" :class="requireds.includes(k)?'require':''" :label="k|fmtColumns">
      <a-switch v-model.number="data[k]"  :checked-children="$tcache('onlineInfo.open')" :un-checked-children="$tcache('onlineInfo.close')" />
    </a-form-model-item>
  </a-form-model>
</template>

<script>
let vueApp=null;
export default {
  name: "agv_detail",
  props:{
    data: {type:Object, required:true},
    columns: {type:Array, required: true},
    radio: {type:Array, required: false,default:()=>[]},
    checkbox: {type:Array, required: false,default:()=>[]},
    bol: {type:Array, required: false,default:()=>[]},
    radios: {type:Object, required:false,default:()=>{}},
    checkboxs: {type:Object, required:false,default:()=>{}},
    disabled: {type:Object, required: false,default:()=>{return {edit:[],add:[]}}},
    isNum: {type:Array, required:false,default:()=>[]},
    requireds: {type:Array, required:false,default:()=>[]},
    type: {type:String, required: false},
    hidden: {type:Array, required: false,default:()=>[]},
  },
  data(){
    return{
      inputData:{},
      radioData:{},
      checkboxData:{},
      isNumData:{},
      bolData:{},
    }
  },
  created(){
    vueApp=this
    Object.keys(this.data).forEach(k=>{
      if(this.radio.includes(k)){
        this.radioData[k]=this.data[k]
      }else if(this.checkbox.includes(k)){
        this.checkboxData[k]=this.data[k]
      }else if(this.isNum.includes(k)){
        this.isNumData[k]=this.data[k]
      }else if(this.bol.includes(k)){
        this.bolData[k]=this.data[k]
      }else{
        this.inputData[k]=this.data[k]
      }
    })
    console.log(this.radioData,this.checkboxData,this.inputData)
  },
  filters:{
    fmtColumns(val){
      let cols=[...vueApp.columns]
      let col=cols.find(c=>c.key==val)
      if(col){
        return col.title
      }
      return val
    }
  },
  methods:{
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ant-form-item-label{
  width: 150px;
  text-align: left;
}
::v-deep .ant-modal-body{
  text-align: center;
}
.require::before{
  content: '*';
  font-weight: bold;
  position: absolute;
  left: -10px;
  line-height: 40px;
  color: red;
}
</style>
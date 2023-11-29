<template>
  <div>
    <a-row>
      <a-button type="primary" class="_operation"  @click="()=> recordEdit('',false)">
        <a-icon type="plus" />{{$tcache('common.add')}}
      </a-button>
    </a-row>
    <br/>
    <a-table :columns="columns" :data-source="data" rowKey="id">
      <span slot="action" slot-scope="text, record">
       <a>
         <a-tooltip :title="$tcache('admin.controlArealist01')">
           <a-icon type="edit" @click="() => recordEdit(record,true)"></a-icon>
         </a-tooltip>
       </a>
        <a-divider type="vertical" />
        <a>
          <a-tooltip :title="$tcache('admin.controlArealist02')">
            <a-icon type="delete" @click="() => recordDel(record)"></a-icon>
          </a-tooltip>
        </a>
      </span>
    </a-table>
    <a-modal :title="$tcache('admin.controlArealist03')" :visible="visible" @ok="handleOk" @cancel="handleCancel" >
      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="id">
          <a-input-number v-model="records.id" placeholder="id" :disabled="true" ></a-input-number>
        </a-form-item>
        <a-form-item label="name">
          <a-input placeholder="name" v-model="records.name" ></a-input>
        </a-form-item>
        <a-form-item label="axes">
          <a-textarea  v-model="records.axes" placeholder="axes" :auto-size="{ minRows: 3, maxRows: 5 }"></a-textarea >
        </a-form-item>
        <a-form-item label="inPoints">
          <a-input v-model="records.inPoints" placeholder="inPoints" ></a-input>
        </a-form-item>
        <a-form-item label="outPoints">
          <a-input v-model="records.outPoints" placeholder="outPoints" ></a-input>
        </a-form-item>
        <a-form-item label="inRoutes">
          <a-input v-model="records.inRoutes" placeholder="inRoutes" ></a-input>
        </a-form-item>
        <a-form-item label="outRoutes">
          <a-input v-model="records.outRoutes" placeholder="outRoutes" ></a-input>
        </a-form-item>
      </a-form>

    </a-modal>

  </div>
</template>
<script>

export default {
  name: "controlArealist",
  data() {
    return {
      data:[],
      columns:[],
      visible:false,
      records:[],
      edit:true,
    };
  },
  mounted() {
    this.queryCA();
  },
  methods:{
    queryCA(){
      this.axios.get('/ca/all').then(res =>{
        this.data = res.data
        if(this.columns.length===0){
          Object.keys(res.data[0]).forEach(item=>{
            this.columns.push({title:item,dataIndex:item,key:item})
          })
          this.columns.push({title:'Action',dataIndex:'action',key:'action',width:'10%',scopedSlots:{customRender:'action'}})
        }
      })
    },
    recordEdit(record,bol){
      this.edit = bol
      this.visible = true
      if(bol){
        this.records = record
      }else {
        let record = {id:'',name:'',axes:'',inPoints:'',outPoints:'',inRoutes:'',outRoutes:''}
        this.records = record
      }
    },
    recordDel(record){
      let _this = this
      this.$confirm({
        title: this.$tcache('admin.controlArealist04'),
        content: this.$tcache('admin.controlArealist05',{name: record.name}),
        onOk(){
          _this.axios.put(`/ca/controlAreaDel/${record.id}`).then(res=>{
            if(res.status == 200){
              _this.$message.success(this.$tcache('common.operateSuccess'))
              let index = _this.data.findIndex(item =>{
                if(item.id === record.id){
                  return true
                }
              })
              _this.data.splice(index,1)
            }else {
              _this.$message.error(this.$tcache('common.operateFail'))
            }
          }).catch(err=>{this.$message.error(err)})
        },
        onCancel(){},
      })
    },
    handleOk(){
      let _this = this
      this.$confirm({
        title:this.$tcache('admin.controlArealist06'),
        content:this.records.axes,
        onOk(){
          _this.save()
        },
        onCancel(){},
      })
      this.visible = false
    },
    handleCancel(){
      this.visible = false
    },
    save(){
      let _this = this
      let url = "ca/controlAreaEdit";
      if(!this.edit){
        url = "ca/controlAreaSave"
      }
      this.axios({
        headers:{'Content-Type':'application/json'},
        method:"put",
        url:url,
        data:JSON.stringify(_this.records)
      }).then(res=>{
        if(res.status == 200){
          _this.$message.success(this.$tcache('common.saveSuccess'))
          _this.queryCA()
        }else {
          _this.$message.error(this.$tcache('common.saveFail'))
        }
      }).catch(err=>{this.$message.error(err)})
    },
  },
};
</script>
<style scoped lang="scss">
._input{display: inline-block;}
._operation{float: left}
</style>

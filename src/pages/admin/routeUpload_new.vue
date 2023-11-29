<template>
    <div>
        <a-card title="">
            <template #extra>
                <a-button class="btn" @click="()=>$router.push('/admin_route')">{{$tcache('common.back')}}</a-button>
                <div class="upload">
                  <Upload
                    style="display: inline-block;margin-right: 5px;"
                    :show-upload-list="false"
                    action="api/route/uploadandimport"
                    :data="{ isAll: routeIsAll==1?true:false }"
                    :before-upload="handleUpload"
                    :on-success="handleSuccess"
                    :on-error="handleError">
                    <Button icon="ios-cloud-upload-outline"><span class="fontSty">{{$tcache('admin.routeUploadNew01')}}</span></Button>
                  </Upload>
                  <a-radio-group v-model="routeIsAll">
                    <a-radio :value="1">{{$tcache('admin.pointlist02')}}</a-radio>
                    <a-radio :value="0">{{$tcache('admin.pointlist03')}}</a-radio>
                  </a-radio-group>
                  <a-icon style="color: #faad14;" type="warning"></a-icon>
                  <span>{{$tcache('admin.pointlist04')}}(csv)。</span>
                  <a-progress v-if="showProgress" :percent="percent" size="small" :status="uploadStatus" />
                </div>
            </template>
            <div class="select">
              <div><span class="fontSty">{{$tcache('admin.pointlist02')}}</span>：{{$tcache('admin.routeUploadNew02')}}</div>
              <div><span class="fontSty">{{$tcache('admin.pointlist03')}}</span>：{{$tcache('admin.routeUploadNew03')}}</div>
            </div>
            <a-divider />
            <a-tag :style="{fontSize:'14px',backgroundColor:uploadStatus=='success'?'#52c41a':uploadStatus=='exception'?'#f5222d':''}">{{message}}</a-tag>
        </a-card>
    </div>
</template>
<script>
export default {
    data() {
        return {
            routeIsAll:1,
            showProgress:false,
            percent:0,//进度条进度
            uploadStatus:'',
            //文件上传携带参数
            fileData: {
              // companyCode: "1",  
              files: "",
              // serviceType: "finacie",  
              // tenantCode: "1", 
            },
            message:''
        };
    },
    beforeDestroy(){
      if(this.timer)clearInterval(this.timer)
    },
    methods: {
        handleUpload(file) {
          console.log(file)
          this.message=''
          this.showProgress=true
          this.uploadStatus='active'
          this.percent=60
          this.timer=setInterval(()=>{
            console.log(this.percent)
            if(this.percent<99){
              this.percent+=1
            }else if(this.percent>=99&&this.percent<99.99){
              this.percent=Number((this.percent+0.01).toFixed(2))
            }
          },200)
          this.$message.info(this.$tcache('admin.pointlist05') + '...')
          this.fileData.file = file.name;
        },
        handleSuccess(res, file) {
          console.log(res, file);
          if(this.timer)clearInterval(this.timer)
          this.$message.success(res.message);
          this.message=res.message
          if(res.success){
            let data = res.data
            if(data)this.$notification.success({message: this.$tcache('admin.pointlist06'), description: `${this.$tcache('common.add')}：${data.add}, ${this.$tcache('common.modify')}：${data.update}, ${this.$tcache('common.del')}：${data.delete}`})
            this.percent=100
            this.uploadStatus='success'
            this.isSave=true
          }else{
            this.uploadStatus='exception'
          }
          setTimeout(()=>{this.showProgress=false},3000)
        },
        handleError(error, file){
          if(this.timer)clearInterval(this.timer)
          this.uploadStatus='exception'
          console.error(error,file)
          this.$message.error(error.message)
          setTimeout(()=>{this.showProgress=false},3000)
        },
    },
};
</script>
<style scoped lang="scss">
.Progress { 
    width: 200px;
}
::v-deep .ivu-form-item{
    margin-bottom: 0;
}
::v-deep .ant-card-extra{
    margin-left: 0;
}
::v-deep .ant-card-head-wrapper{
    justify-content: center;
}
.btn{
    position: absolute;
    right: 30px;
}
::v-deep .ivu-form-item-content{
    line-height: 0;
}
.upload{
  width: 100% !important;
}
::v-deep .ant-progress-line{
  width: 65%;
}
.select{
  display: flex;
  justify-content: space-around;
}
</style>

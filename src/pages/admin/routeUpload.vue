<template>
    <div>
        <a-spin :spinning="spinning"  :tip="$tcache('admin.routeUpload01')+'...'">
        <a-card title="">
            <template #extra>
                <a-button class="btn" @click="()=>$router.push('/admin_route')">{{$tcache('common.back')}}</a-button>
                <Form :model="formData" :label-width="80">
                    <FormItem>
                        <div class="upload">
                            <span>{{$tcache('admin.pointlist01')}}：</span>
                            <Upload :before-upload="handleUpload" :action="''" :multiple="true" name="files">
                                <Button icon="ios-cloud-upload-outline">{{$tcache('admin.routeUpload02')}}</Button>
                            </Upload>
                            <!-- 进度条 -->
                            <Progress class="Progress" v-if="upload.fileProgressShow" :percent="upload.fileProgress" />
                            <a-button style="margin-left: 5px;" v-if="state.checkedList.length!==0" @click="ImportAllRoutes"><span class="fontSty">{{$tcache('admin.routeUpload03')}}</span></a-button>
                        </div> 
                        <div>
                            <a-icon style="color: #faad14;" type="warning"></a-icon>
                            <span>{{$tcache('admin.routeUpload04')}}</span>
                        </div>
                    </FormItem>
                </Form>
            </template>
            <div>
                <a-checkbox v-model="state.checkAll" :indeterminate="state.indeterminate" @change="onCheckAllChange">
                    {{$tcache('admin.all')}}
                </a-checkbox>
            </div>
            <a-divider />
            <a-checkbox-group v-model="state.checkedList" style="width: 100%;">
                <a-row>
                    <a-col :span="3" v-for="item in plainOptions" :key="item">
                        <a-checkbox :value="item">
                            <a-tag v-if="item.includes('true')" style="background:green;color:white">{{ item.replace(/true/,'上传成功') }}</a-tag>
                            <a-tag v-if="item.includes('false')" style="background:red;color:white">{{ item.replace(/false/,'上传失败') }}</a-tag>
                        </a-checkbox>
                    </a-col>
                </a-row>
            </a-checkbox-group>
        </a-card>
        </a-spin>
    </div>
</template>
<script>
export default {
    data() {
        return {
            //文件上传携带参数
            // fileData: {
            //     files: "",
            // },
            // import_success: false,
            plainOptions: [],
            state: {
                indeterminate: false,
                checkAll: false,
                checkedList: []
            },

            formData: {
                dispalyFile: [] // 临时数组，同时用于显示在页面
            },
            // 上传配置
            upload: {
                look: true, // 控制多文件上传，只触发一次ajax请求
                fileProgressShow: false, // 进度条
                fileProgress: 0 // 进度条进度
            },
            spinning:false
        };
    },
    watch: {
        'state.checkedList': {
            handler(val, oldV) {
                console.log("state", val, oldV)
                console.log(this.state.checkedList)
                this.state.indeterminate = !!val.length && val.length < this.plainOptions.length;
                this.state.checkAll = val.length === this.plainOptions.length;
            },
            // immediate: true
        }
    },
    methods: {
        handleUpload(selectFile) {
            console.log(selectFile)
            // 临时数组，同时用于显示在页面
            this.formData.dispalyFile.push(selectFile)
            // 控制多文件上传，只触发一次ajax请求
            if (this.upload.look) {
                this.upload.look = false;
                // 延迟请求，等待所有文件都从本地读取完毕
                setTimeout(() => {
                    let formData = new FormData();
                    this.formData.dispalyFile.map(item => {
                        // files为后台接收参数
                        // []为多文件数组
                        formData.append('files', item);
                    })
                    console.log(this.formData)
                    this.axios.request({
                        url: 'route/uploads',
                        method: 'post',
                        data: formData,
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (progressEvent) => {
                            // 用于上传过程中显示进度条
                            if (progressEvent.lengthComputable) {
                                // 显示进度条
                                this.upload.fileProgressShow = true;
                                // 计算当前进度
                                let curValue = (progressEvent.loaded / progressEvent.total * 100).toFixed(0);
                                // 赋值给进度条组件
                                this.upload.fileProgress = parseInt(curValue);
                            }
                        }
                    })
                        .then(res => {
                            let data=res.data.data
                            if((data??'')!==''){this.$message.success(this.$tcache('admin.routeUpload05'))}
                            Object.keys(data).forEach(item=>{
                                this.plainOptions.push(`${item}:${data[item]}`)
                            })
                            Object.assign(this.state, {
                                checkedList: this.plainOptions,
                                indeterminate: false,
                            })
                            // 上传成功处理
                            // 隐藏进度条
                            this.upload.fileProgressShow = false;
                            this.upload.look = true
                            this.formData.dispalyFile=[]
                        })
                        .catch(() => {
                            // 上传失败处理
                            // 隐藏进度条
                            this.upload.fileProgressShow = false;
                            this.$message.error(this.$tcache('admin.routeUpload06'))
                        })
                }, 50);
            }
            return false;
        },



        onCheckAllChange(e) {
            Object.assign(this.state, {
                checkedList: e.target.checked ? this.plainOptions : [],
                indeterminate: false,
            })
        },
        ImportAllRoutes() {
            this.spinning=true
            let arr=[]
            if(this.state.checkedList.length!==0){
                arr=this.state.checkedList.map(item=>item=Number(item.split('.')[0])) 
                console.log(arr)
            }
            this.axios
                .post(`route/importroutes`,arr)
                .then((res) => {
                    console.log(res.data)
                    if (res.data.success) {
                        this.$message.success(res.data.message);
                        this.$router.push({path:'/admin_routeImport',query:{data:res.data.data}})
                        this.spinning=false
                    } else {
                        this.$message.error(res.data.message);
                        this.spinning=false
                    }
                })
                .catch((err) => {
                    this.$message.error(err);
                    console.warn(err)
                    this.spinning=false
                });
        },
    },
};
</script>
<style scoped lang="scss">
.Progress { 
    width: 200px;
}
.upload{
    display: flex;
    justify-content: center;
    align-items: center;
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
// .btn_import{
//     position: absolute;
//     right: -300px;
//     top: -18px;
// }
.btn{
    position: absolute;
    right: 30px;
}
::v-deep .ivu-form-item-content{
    line-height: 0;
}
::v-deep .ivu-btn{
    margin-top: 9px;
}
</style>

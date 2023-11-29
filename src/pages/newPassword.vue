<template>
    <div>
        <div :style="{width:wth}" class="topTitle"><a-icon type="lock"  style="margin-left: 100px;" /><span>{{$tcache('newPassword.passwordMod')}}</span></div>
        <div>
            <h2>{{$tcache('newPassword.setNewLP')}}</h2>
            <a-form :form="form" @submit="handleSubmit">
                <a-form-item has-feedback :validate-status="status" :label-col="formItemLayout.labelCol"
                    :wrapper-col="formItemLayout.wrapperCol" :label="$tcache('newPassword.originalLP')">
                    <a-input-password @input="input" allow-clear v-decorator="[
                        'oldPassword',
                        { rules: [{ required: true, message: $tcache('newPassword.pFillOriginalLP') }] },
                    ]" :placeholder="$tcache('newPassword.pFillOriginalLP')" />
                </a-form-item>
                <a-form-item has-feedback :validate-status="status1" :label-col="formItemLayout.labelCol"
                    :wrapper-col="formItemLayout.wrapperCol" :label="$tcache('newPassword.newLoginPass')">
                    <a-input-password @input="input1" allow-clear v-decorator="[
                        'newPassword',
                        { rules: [{ required: true, message: $tcache('newPassword.pFillNewLP') }] },
                    ]" :placeholder="$tcache('newPassword.pFillNewLP')" />
                </a-form-item>
                <a-form-item has-feedback :validate-status="status2" :label-col="formItemLayout.labelCol"
                    :wrapper-col="formItemLayout.wrapperCol" :label="$tcache('newPassword.confirmNewLP')">
                    <a-input-password @input="input2" allow-clear v-decorator="[
                        'newPassword2',
                        { rules: [{ required: true, message: $tcache('newPassword.pConfirmNewLP') }] },
                    ]" :placeholder="$tcache('newPassword.pConfirmNewLP')"/>
                </a-form-item>
            </a-form>
            <a-button type="primary" @click="handleSubmit">{{$tcache('newPassword.submit')}}</a-button>
        </div>
    </div>
</template>
<script>
import { mapMutations } from 'vuex';
const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
};
const formTailLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16, offset: 4 },
};
export default {
    data() {
        return {
            formItemLayout,
            formTailLayout,
            form: this.$form.createForm(this, { name: 'coordinated' }),
            status:'',
            status1: '',//'error'：输入密码错误、'success'：输入密码正确
            status2: '',//'error'：再次输入密码错误、'success'：再次输入密码正确
            isDisabled:true,
            value2:'',
            oldPassword:'',
            newPassword:'',
            newPassword2:'',
            userid:localStorage.getItem('userid'),
            wth:'0px'
        };
    },
    mounted(){setTimeout(()=>{this.wth='100%'},0)},
    methods: {
        ...mapMutations(['changeRole','changeIsAdmin']),
        handleSubmit(e) {
            if(this.oldPassword==''||this.newPassword==''||this.newPassword2==''){
                this.$message.warning(this.$tcache('newPassword.allPasswordsNotEmpty'))
                return
            }else if(this.newPassword!==this.newPassword2){
                this.$message.warning(this.$tcache('newPassword.newLPConfirmedLPNotMatch'))
                this.status2='warning'
                return
            }
            if(this.oldPassword==this.newPassword){
                this.$message.warning(this.$tcache('newPassword.newLPNotMatchOriginalLP'))
                return
            }
            console.log(e)
            // e.preventDefault();
            this.axios.post(`my/upPassword?id=${this.userid}&oldPassword=${this.oldPassword}&newPassword=${this.newPassword}&newPassword2=${this.newPassword2}`)
            .then(res=>{
                if(res.status==200){
                    this.$message.success(`${res.data.message},`+this.$tcache('newPassword.pLogAgain'))
                    this.changeRole('');
                    this.changeIsAdmin('')
                    localStorage.clear()
                    this.$router.push('/login')
                }else{this.$message.info(`${res.data.message}`)}
            }).catch(err=>{
                this.$message.error(err)
            })
        },
        input(){
            this.form.validateFields((err, values) => {
                this.oldPassword=values.oldPassword
            });
        },
        input1(){
            this.form.validateFields((err, values) => {
                this.status2=''
                this.newPassword=values.newPassword
                if(this.newPassword==this.newPassword2&&this.newPassword!==''){
                    this.status2='success'
                }else if(this.newPassword!==''){this.status2='warning'}
            });
        },
        input2(){
            this.form.validateFields((err, values) => {
                this.newPassword2=values.newPassword2
                if(this.newPassword==values.newPassword2){
                    this.status2='success'
                }else{
                    this.status2='warning'
                }
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.topTitle {
    background-color: #36bbfb;
    padding: 20px 0;
    // height: 100px;
    overflow: hidden;
    white-space:nowrap;
    color: white;
    font-size: 28px;
    text-align: left;
    border-radius: 10px;
    border-left: 10px solid #1890ff;
    border-right: 10px solid #1890ff;
    transition: all .5s linear 0s;
}
</style>
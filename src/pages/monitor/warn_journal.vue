<template>
    <div>
        <div v-for="(item,index) in msg" :key="item" class="msgbox"><span class="msgcls">{{index+1}}：{{item}}</span></div>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                msg:[]
            }
        },
        mounted(){this.queryWarn()},
        methods:{
            queryWarn(){
                this.axios.get('ads/warn')
                .then(res=>{
                    console.log(res)
                    this.msg=res.data.msg.split('\\r\\n')
                })
                .catch(err=>{this.$message.error(err)})
            }
        }
    }
</script>

<style lang="scss" scoped>
    // .msgbox{
    //     max-height: 1000px;
    //     overflow: auto;
        // display: flex;
    // }
    .msgcls{
        display: inline-block;
        margin: 3px;
        padding: 5px;
        // box-shadow: 1px 1px 5px ;
        // border-radius: 5px;
        user-select: text;
    }
</style>
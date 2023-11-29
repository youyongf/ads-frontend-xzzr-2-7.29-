<template>
    <div>
        <a-card hoverable :title="$tcache('admin.routeImport01')">
            <template #extra>
                <a-button @click="()=>$router.push('/admin_route')">{{$tcache('common.back')}}</a-button>
            </template>
            <a-row>
                <a-col :span="3" v-for="item in plainOptions" :key="item.id">
                    <a-tag :style="{ background: item.status ? 'green' : 'red', color: 'white' }">{{ item.id }}.csv：{{item.msg}}</a-tag>
                </a-col>
            </a-row>
        </a-card>
    </div>
</template>
<script>
export default {
    data(){
        return{
            plainOptions: [],
            state: {
                indeterminate: false,
                checkAll: false,
                checkedList: []
            },
        }
    },
    created(){
        console.log(this.$route.query.data)
        this.plainOptions=this.$route.query.data.map(d =>{
            if(d.db_status){
                return {id:d.id, status:d.db_status, msg: d.db_msg}
            }else if(d.file_status){
                return {id:d.id, status:d.file_status, msg: d.file_msg}
            }else {
                return {id:d.id, status: false, msg: d.file_msg}
            }
        })
    }
}
</script>
<style scoped lang="scss">

</style>
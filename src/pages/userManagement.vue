<template>
    <div>
        <a-table :columns="columns" :data-source="data" bordered>
            <template v-for="col in ['name', 'age', 'address']" #[col]="{ text, record }" >
                <div :key="col">
                    <a-input v-if="editableData[record.key]" v-model ="editableData[record.key][col]"
                        style="margin: -5px 0" />
                    <template v-else>
                        {{ text }}
                    </template>
                </div>
            </template>
            <template #operation="{ record }">
                <div class="editable-row-operations">
                    <span v-if="editableData[record.key]">
                        <a @click="save(record.key)">Save</a>
                        <a-popconfirm title="Sure to cancel?" @confirm="cancel(record.key)">
                            <a>Cancel</a>
                        </a-popconfirm>
                    </span>
                    <span v-else>
                        <a @click="edit(record.key)">Edit</a>
                    </span>
                </div>
            </template>
        </a-table>
    </div>
</template>
<script>
import { cloneDeep } from 'lodash-es';
export default {
    data(){
        return{
            columns:[],
            data:[],
            editableData:{}
        }
    },
    methods:{
        edit(key){
            this.editableData[key]=cloneDeep(this.data.filters(item=>key===item.key)[0])
        },
        save(key){
            Object.assign(this.data.filter(item => key === item.key)[0], this.editableData[key]);
            delete this.editableData[key];
        },
        cancel(key){
            delete this.editableData[key]        
        },
    }
}
</script>
<style scoped lang="scss">
.editable-row-operations a {
  margin-right: 8px;
}
</style>
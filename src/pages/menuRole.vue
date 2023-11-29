<template>
  <div>
    <H2>{{$tcache('menuRole.menuPermissionSettings')}}</H2>
    <div id="container">
      <a-checkbox-group @change="handleCheck" v-model="checkedValues">
        <a-row>
          <a-card>
            <a-card-grid v-for="(items, i) in menuData" :key="i" style="width:25%;">
              <a-row style="font-weight: bold;">{{items.title}}</a-row>
              <a-checkbox v-for="s in items.value" :key="s.id" :value="s.path" :style="{color:colors[s.roleId], backgroundColor:colors[s.roleId]}" class="item">
                {{s.value}}<span v-if="!uneditable.includes(s.path)">(<a-checkbox :disabled="!checkedValues.includes(s.path)" :value="s.path+'_editable'" :checked="checkbox">{{$tcache('menuRole.editable')}}</a-checkbox>)</span>
              </a-checkbox>
            </a-card-grid>
          </a-card>
        </a-row>
      </a-checkbox-group>

      <span v-for="item in explain" :key="item.id" style="margin-left: 10px;"><a-tag style="font-size: 14px;" v-if="item.id!=1">{{item.roleName+' : '+item.sname}}</a-tag></span>

      <a-row>
        <a-col span="11">
          <a-divider orientation="left">{{$tcache('menuRole.permissionsAlreadySet')}}：</a-divider>
          <a-checkbox-group :options="usedgroups" v-model="checkedGroups" ></a-checkbox-group>
        </a-col>
      </a-row>

      <a-row>
        <a-col :span="11"><a-divider orientation="left">{{$tcache('menuRole.pageSelected')}}：</a-divider></a-col>
        <a-col :span="11"><a-divider orientation="left">{{$tcache('menuRole.assignPermissionsPage')}}：</a-divider></a-col>
        <a-col :span="2"></a-col>
      </a-row>
      <a-row>
        <a-col :span="11">{{checkedValues}}</a-col>
        <a-col :span="11">
          <a-radio-group :options="groups" v-model="group" button-style="solid"></a-radio-group>
        </a-col>
        <a-col :span="2">
          <a-button type="primary" @click="save">{{$tcache('common.save')}}</a-button>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
const tableData = require('../data/menus.json');
export default {
  name: "menuRole",
  data(){
    return{
      colors: ['#00502d','#540053','#1e9600','#3a0a74'],
      groups: [
        // {value:2,label:'SUPER'},
        // {value:3,label:'USER'},
        // {value:4,label:'GUEST'}
      ],
      usedgroups: [], //已使用的组
      checkedGroups: [],

      checkedValues:[],  //选择缓存层
      group:null, //当前设置的组
      // menuData:require('../data/menus.json'),//可设置的菜单
      paths:[],//所有已设置的路径
      explain:[],//角色权限说明
      checkbox:false,
      uneditable:[
        '/monitor_station','/monitor_warn_journal','/monitor_offlinepointmap',
        '/check_transferlog','/check_agvAnomaly','/check_statelog','/check_car','/cacheAgvBasketNum',
        '/transfer_step_output','/transfer_day','/transfer_month','/Qtime','/onLineQtimeBaskVol','/check_groupOnLineQtimeBaskVol',
        '/newPassword','/admin_stationmap','/admin_pointmap','/admin_camap','/admin_cachelayergroup','/systemLog'
      ],//不可编辑的页面地址
    }
  },
  computed: {
    menuData() {
      let arr=this.$transformI18n(tableData, "title");
      arr.forEach(item=>{
        item.value=this.$transformI18n(item.value, "value");
      })
      return arr
    },
  },
  mounted() {
    this.queryRoleMenu()
  },
  methods:{
    handleCheck(e){
      console.log(e)
    },
    queryAllRole(roleIds){
      this.axios.get('role/findall')
      .then(res=>{
        this.explain=res.data
        let roleArr=[]
        res.data.forEach(d=>{
          if(d.id!=1&&this.groups.length<res.data.length-1)this.groups.push({value:d.id,label:d.roleName})
          roleIds.forEach(item=>{
            if(d.id==item){
              roleArr.push(item+d.roleName)
            }
          })
        })
        this.usedgroups=roleArr.map(s=>{return { label: s.slice(1), value: s.slice(0,1), onChange:this.handleGroupItemChange }})
      }).catch(err=>{
         this.$message.error(this.$tcache("menuRole.roleMenuPermissionQueryFailed")+`：${err}`)
      })
    },
    queryRoleMenu(){
      this.axios.get(`rolemenu/findall`)
      .then(res=>{
          if(res.status==200){
            this.paths=res.data
            let roleIds=res.data.map(item=>{return item.roleId})
            this.queryAllRole(roleIds)
          }
      }).catch(err=>{
        this.$message.error(this.$tcache("menuRole.roleMenuPermissionQueryFailed")+`：${err}`)
      })
    },
    handleGroupItemChange(e){
      console.log(e)
      let checkedValues = this.checkedValues
      if(e.target.checked){
        console.log(this.paths)
        this.paths.forEach(d=>{
          if(d.path){
            let pathList=d.path.split(',')
            pathList.forEach(item=>{
              if(d.roleId == e.target.value && ! checkedValues.includes(item)){
                checkedValues.push(item)
              }
            })
          }
        })
      }else{
        this.paths.forEach(d=>{
          if(d.path){
            let pathList=d.path.split(',')
            pathList.forEach(item=>{
              if(d.roleId == e.target.value && checkedValues.includes(item)){
                let idx = checkedValues.findIndex(x=>x == item)
                checkedValues.splice(idx, 1)
              }
            })
          }
        })
        console.log(checkedValues)
      }
    },
    save(){
      if(this.checkedValues.length ==0){
        this.$message.warning(this.$tcache('menuRole.selectMenu'))
        return
      }
      if(!this.group){
        this.$message.warning(this.$tcache('menuRole.pleaseSelectPermissions'))
        return
      }
      this.axios.post(`rolemenu/save`, {path:this.checkedValues.join(','), roleId: this.group})
      .then(res=>{
        console.log(res)
        if(res.status == 200){
          this.queryRoleMenu()
          this.$message.success(this.$tcache("common.saveSuccess")+`, ${res.data.data}`)
        }else{
          this.$message.warning(this.$tcache("common.saveException")+`：${res.data.message}`)
        }
      }).catch(err=>{
        this.$message.error(this.$tcache("common.saveFail")+`：${err}`)
      })
    },
  }
}
</script>

<style scoped>
.item{padding:1px 2px;margin:1px;border-radius:5px;width: 100%;text-align: left;}
::v-deep .ant-card-grid{
  height: 300px;
  overflow: auto;
}
</style>
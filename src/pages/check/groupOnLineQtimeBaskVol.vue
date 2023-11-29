<template>
  <div class="flex">
    <div class="rt0"><span>*{{$tcache('check.prompt')}}</span>：{{$tcache('check.lineTypeNumberVehicles')}}</div>
    <div class="list" v-for="k in Object.keys(dataObj)" :key="k">
      <a-card :title="k" style="margin: 10px">
        <span v-for="d in dataObj[k]" :key="d.name">
          <a-card-grid style="width: 25%; text-align: center">
            {{ d.name }}(<span class="fontSty">{{d.group}}</span>)：<span class="fontSty">{{d.count}}</span>
          </a-card-grid>
        </span>
      </a-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [],
      dataObj: {},
    };
  },
  mounted() {
    this.queryData();
  },
  methods: {
    //获取背景图配置信息
    queryData() {
      this.axios
        .get(`groupOnLineQtimeBaskVol`)
        .then((res) => {
          if (res.status == 200) {
            this.dataObj = {};
            this.data = res.data;
            this.data.forEach((item) => {
              if (this.dataObj[item.process]) {
                this.dataObj[item.process].push(item);
              } else {
                this.dataObj[item.process] = [];
                this.dataObj[item.process].push(item);
              }
            });
            this.data = this.dataObj;
          }
        })
        .catch((err) => {
          this.$message.error(err, this.$tcache("check.failedInfoVehicleUnderPro"));
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  position: relative;
  .list {
    width: 50%;
  }
}
.rt0{
  position: absolute;
  right: 15px;
  top: -15px;
  span{
    color: #dd4a24;
    font-weight: bold;
  }
}
</style>

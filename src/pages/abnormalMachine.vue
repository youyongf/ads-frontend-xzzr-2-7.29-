<template>
  <div>
    <div class="abnormal">
      <div class="title">异常机台:</div>
      <div class="content">
        <a-card
          v-for="s in cacheStations"
          :key="s.id"
          :title="s.name"
          style="width: fit-content"
        >
          <p><span>id: </span>{{s.id}}</p>
          <p><span>时间: </span>{{s.ts|fmtDateTime}}</p>
        </a-card>
      </div>
    </div>
    <div class="abnormal">
      <div class="title">异常AGV:</div>
      <div class="content">
        <a-card
          v-for="a in cacheAgv"
          :key="a.id"
          :title="a.id"
          style="width: 200px"
        >
          <p><span>currentX: </span>{{a.currentX}}</p>
          <p><span>currentY: </span>{{a.currentY}}</p>
          <p><span>ts: </span>{{a.ts|fmtDateTime}}</p>
        </a-card>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cacheStations: [],
      cacheAgv: [],
    };
  },
  mounted() {
    this.queryCacheStations();
    this.queryCacheAgv();
  },
  methods: {
    queryCacheStations() {
      return this.axios
        .get(`cache/stationinfo/list`)
        .then((res) => {
          let data = res.data;
          if (Array.isArray(data)) {
            this.cacheStations = data.filter((d) => d.controlState === 2);
          }
        })
        .catch(() => {
          this.$message.error(this.$tcache("monitor.stationQueryFail05"));
        });
    },
    queryCacheAgv() {
      return this.axios
        .get(`cache/agvreply/list`)
        .then((res) => {
          let data = res.data;
          if (Array.isArray(data)) {
            this.cacheAgv = data.filter((d) => d.state === 9);
            console.log(this.cacheAgv);
          }
        })
        .catch(() => {
          this.$message.error(this.$tcache("monitor.stationQueryFail05"));
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.abnormal {
  display: flex;
  box-shadow: 1px 1px 5px 0;
  margin: 10px 0;
  border-radius: 5px;
  .title {
    white-space: nowrap;
    display: flex;
    align-items: center;
    padding: 10px;
  }
  .content {
    padding: 10px;
    box-shadow: 1px 1px 5px 0 inset;
    display: flex;
    flex-wrap: wrap;
    // width: 100%;
  }
}
.ant-tag {
  margin: 5px;
}
.ant-card {
  margin: 0 5px 5px 0;
  box-shadow: 1px 1px 5px 0 inset;
  color: red;
}
:deep(.ant-card-body){
    color: #000000a6;
}
</style>
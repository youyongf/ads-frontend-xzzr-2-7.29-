<template>
  <div>
    <div class="flex">
      <a-card
        v-for="d in data"
        :key="d.id"
        :title="d.name"
        style="width: 300px"
        :style="{
          boxShadow: `0px 0px 8px 1px ${
            d.status ? '#2db7f5' : '#fb7070'
          } inset`,
        }"
      >
        <!-- <a slot="extra" href="#">more</a> -->
        <div class="c-li" v-for="k in Object.keys(d)" :key="k">
          <span class="key">{{ k|fmtColumn }}：</span>
          <span
            v-if="k == 'status'"
            class="val"
            :style="{ color: d[k] ? '#2db7f5' : '#fb7070' }"
            >{{ d[k] ? $tcache('monitor.openDoor') : $tcache('monitor.closeDoor') }}</span
          >
          <span v-else class="val">{{ d[k] }}</span>
        </div>
        <div class="btn" v-if="isAdmin|editable">
          <a-popconfirm
            :title="$tcache('monitor.confirmOpenDoor')"
            :ok-text="$tcache('common.confirm')"
            :cancel-text="$tcache('common.cancel')"
            @confirm="save(d, true)"
            @cancel="cancel"
          >
            <a-button
              :disabled="d.status"
              :style="{ background: d.status ? '#ededed' : '#2db7f5' }"
              ><span>{{$tcache('monitor.openDoor')}}</span></a-button
            >
          </a-popconfirm>
          <a-popconfirm
            :title="$tcache('monitor.confirmCloseDoor')"
            :ok-text="$tcache('common.confirm')"
            :cancel-text="$tcache('common.cancel')"
            @confirm="save(d, false)"
            @cancel="cancel"
          >
            <a-button
              :disabled="!d.status"
              :style="{ background: d.status ? '#fb7070' : '#ededed' }"
              ><span>{{$tcache('monitor.closeDoor')}}</span></a-button
            >
          </a-popconfirm>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script>
let vueApp = null;
const tableData = require("../../data/columns_door.json");
export default {
  data() {
    return {
      data: [
        // { id: 1, name: "1号门", runAgvs: { 1: 3 }, status: false },
        // { id: 2, name: "2号门", runAgvs: { 2: 3 }, status: true },
        // { id: 3, name: "3号门", runAgvs: { 3: 3 }, status: false },
      ],
      alldata:[],
      isSave: true,
      saveId: "",
      isAdmin:this.$store.state.isAdmin,//判断是否为管理员
      editable:localStorage.getItem('RoleMenu').includes(this.$route.path+'_editable'),//验证当前页面是否可编辑
    };
  },
  computed: {
    columns() {
      return this.$transformI18n(tableData)
    }
  },
  beforeMount() {
    vueApp = this;
  },
  mounted() {
    this.queryData();
  },
  filters: {
    fmtColumn: (val) => {
      let columns = [...vueApp.columns];
      let column = columns.find((e) => e.key == val);
      if (column) {
        return column.title;
      }
      return val;
    },
  },
  methods: {
    queryData() {
      this.axios
        .get(`door/all`)
        .then((res) => {
          if (res.status == 200) {
            this.alldata = res.data;
            if (this.isSave) {
              this.data = res.data;
            } else {
              const index = this.data.findIndex(
                (item) => item.id == this.saveId
              );
              let obj = this.alldata.filter((item) => item.id == this.saveId);
              this.data[index] = Object.assign(this.data[index], obj[0]);
            }
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    cancel(e) {
      console.log(e);
    },
    save(record, bol) {
      let r = { ...record };
      r.status = bol;
      this.axios
        .post(`door/save`, r)
        .then((res) => {
          if (res.status == 200) {
            this.isSave = false;
            this.saveId = r.id;
            this.$message.success(this.$tcache('common.saveSuccess'));
            this.queryData();
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.ant-card {
  margin: 10px;
  //   box-shadow: 0px 0px 8px 5px #3f1f1f1a inset;
}
$color: #2db7f5;
.c-li {
  span {
    margin: 2px;
  }
  .val {
    color: $color;
    font-weight: bold;
  }
}
.btn {
  button {
    span {
      color: white;
    }
    &:active {
      box-shadow: 1px 1px 3px 0px inset;
    }
  }
  button:nth-child(1) {
    background-color: $color;
    margin-right: 10px;
  }
  button:nth-child(2) {
    background-color: #fb7070;
  }
}
</style>

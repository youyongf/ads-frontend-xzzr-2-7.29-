<template>
  <div class="title_box" >
      <div class="titles">
        <div class="title1">403</div>
        <div class="title2">{{$tcache('permissionDenied')}}</div>
        <div class="title_box"><div @click="goHome" class="title2 btn">{{$tcache('returnHome')}}</div></div>
      </div>
  </div>
</template>

<script>
export default {
  methods:{
    goHome(){
      this.$router.push('/home')
    }
  }
}
</script>

<style lang="scss" scoped>
.title_box{
  display: flex;
  justify-content: center;
}
.titles{
  /* border: 1px solid #000; */
  // width: 500px;
  height: 500px;
}
.title1{
  font-size: 120px;
  color: #bfbfbf;
}
.title2{
  font-size: 30px;
  color: #8d8d8d;
}
.btn{
  width: 200px;
  height: 50px;
  /* border: 1px solid #000; */
  font-weight: bold;
  color: #40a9ffde;
  cursor: pointer;
  &:hover{
    border-bottom: 2px dotted #40a9ffde;
  }
}
</style>
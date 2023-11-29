<template>
  <a-dropdown>
    <span class="lang-title" @click="e => e.preventDefault()" :style="{fontSize: (size-2)+'px', color}">
      <i class="iconfont icon-zhongyingwen" style="margin-right:6px" :style="{fontSize: size+'px', color}" />{{showLanguage.label}}
    </span>
    <a-menu slot="overlay" @click="changeLanguageHandle">
      <a-menu-item v-for="item in languageList"  :key="item.value" :disabled="showLanguage.value === item.value">
        {{item.label}}
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
  name:"Language",
  data() {
    return {
      languageList:[
        { label: "简体中文", value: "ch" },
        { label: "English", value: "en" },
        { label: "ภาษาไทย", value: "th" }
      ],
    }
  },
  props:{
    color: {
      type: String,
      default: ''
    },
    size: {
      type:Number,
      default: 16
    }
  },
  computed:{
    ...mapState(["language"]),
    showLanguage(){
      const currentLang = this.languageList.find(item => item.value == this.language);
      console.log(currentLang,this.language);
      return currentLang ? currentLang : this.languageList[0]
    }
  },
  methods: {
    ...mapActions(["changeLanguage","clearCacheLang"]),
    async changeLanguageHandle(item) {
      console.log(item)
      try{
        await this.changeLanguage(item.key);
        this.clearCacheLang();
        location.reload(true);
      } catch(err) {
        this.$message.error(this.$tcache('components.changeLanguageFail'));
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
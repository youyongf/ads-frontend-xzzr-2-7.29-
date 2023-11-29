import Vue from 'vue'; 
import Vuex from 'vuex'; 
import axios from 'axios'
import { getInitLocaleLanguage } from '@/utils';
Vue.use(Vuex); 
const localeLanguageCache = localStorage.getItem('langcache') ? JSON.parse(localStorage.getItem('langcache')) : {};

const languageMap = {
  en:'en_US',
  ch: 'zh_CN'
}
export const changeLanguageAction = async (language) => {
  const paramsList = languageMap[language].split("_");
  const countryName = paramsList[1] || "";
  const res = await axios.put(`language/userlanguage/language/${paramsList[0]}/country/${countryName}`);
  console.log(res);
}

export const changeAdsLanguageAction = (language) => {
  const paramsList = languageMap[language].split("_");
  const countryName = paramsList[1];
  const params = {
    language: paramsList[0],
    country: countryName,
    variant: ""
  }
  axios.post(`language/adslanguage`,params);
}
const store = new Vuex.Store({ 
    state: { 
        // 存储token 
        // Authorization: localStorage.getItem('Authorization') ? localStorage.getItem('Authorization') : '' ,
        // username: localStorage.getItem('username') ? localStorage.getItem('username') : '' ,
        loginTime: localStorage.getItem('loginTime') ? localStorage.getItem('loginTime') : null ,
        authorities: localStorage.getItem('authorities') ? localStorage.getItem('authorities') : null ,
        isAdmin: localStorage.getItem('isAdmin')=='true'?true:false,
        userid: localStorage.getItem('userid')?localStorage.getItem('userid'):null,
        defaultPageSize:15,
        userInfo: localStorage.getItem('userInfo') ? localStorage.getItem('userInfo') : null,
        language: getInitLocaleLanguage(),
        languageCache: localeLanguageCache,
    },  
    actions: {
      updateUserInfo({ commit }, payload) {
        const userInfo = JSON.stringify(payload);
        commit("updateUserInfo", userInfo);
      },
      async changeLanguage({ commit }, language) {
        try {
          await changeLanguageAction(language);
          changeAdsLanguageAction(language)
          commit("changeLanguage", language);
        }catch(err){
          throw new Error(this.$tcache('components.changeLanguageFail'));
        }
      },
      addCacheLang({ commit }, payload) {
        commit("addCacheLang", payload);
      },
      clearCacheLang({ commit }) {
        commit("clearCacheLang");
      }
    },
    mutations: { 
        // 修改token，并将token存入localStorage 
        // changeAuthorization (state, user) { 
        //     console.log('user',user)
        //     state.Authorization = user.Authorization; 
        //     localStorage.setItem('Authorization', user.Authorization); 
        // } ,
        changeLanguage(state, language) {
          state.language = language;
          localStorage.setItem('language', language); 
          console.log(localStorage.getItem('language'))
        },

        clearCacheLang(state) {
          state.language = {};
          localStorage.removeItem('langcache');
          console.log(localStorage.getItem('langcache'))
        },

        addCacheLang(state , payload) {
          if(!state.languageCache) return;
          state.languageCache[payload.key] = payload.val;
          const saveString = JSON.stringify(state.languageCache);
          localStorage.setItem('langcache', saveString); 
        },

        updateUserInfo(state, payload) {
          state.userInfo = payload;
          localStorage.setItem('userInfo', payload); 
        },
        //登录时间
        recordLoginTime (state, loginTime) { 
            console.log('loginTime',loginTime)
            state.loginTime = loginTime; 
            localStorage.setItem('loginTime', loginTime); 
        } ,
        //角色权限
        changeRole (state, authorities) { 
            console.log('authorities',authorities)
            state.authorities = JSON.stringify(authorities);
            localStorage.setItem('authorities', state.authorities); 
        } ,
        changeIsAdmin (state, isAdmin) { 
            console.log('isAdmin',isAdmin)
            state.isAdmin =  isAdmin
            localStorage.setItem('isAdmin', isAdmin); 
        } ,
        changeUserid (state, userid) { 
            console.log('userid',userid)
            state.userid =  userid
            localStorage.setItem('userid', userid); 
        } ,
        clearAll(state,nullStr){
            Object.keys(state).forEach(key=>{
              if(!(key == "language" || key == "languageCache")) {
                state[key]=nullStr
                localStorage.setItem(`${key}`,nullStr)
              }
            })
            state['defaultPageSize']=15
        }
    }
}); 
export default store;


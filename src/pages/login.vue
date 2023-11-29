<template> 
  <div class="bgbox"> 
    <div class="inpbox">
        <div style="padding:10px 0"><img src="../assets/img/LH_logo.png" alt=""></div>
        <div class="title">{{$tcache('login.loginTitle')}}</div>
        <div v-show="title==$tcache('login.login')">
            <div> <a-input @keyup.enter="login" class="inp" type="text" v-model="loginForm.username" :placeholder="$tcache('login.userName')"><a-icon style="color: #bfbfbf;" slot="prefix" type="user" /></a-input> </div>
            <div> <a-input @keyup.enter="login" class="inp" type="password" v-model="loginForm.password" :placeholder="$tcache('login.password')"><a-icon style="color: #bfbfbf;" slot="prefix" type="lock" /></a-input> </div>
            <div class="login_btn">
               <!-- <button class="btn" @click="goRegister">注册</button>  -->
               <button class="btn" @click="login">{{$tcache('login.login')}}</button>
               <!-- <span @click="forget">忘记密码</span>  -->
            </div>
        </div>
        <!-- <div v-show="title=='注册'">
            <div> <a-input class="inp" type="text" v-model="registerForm.username" placeholder="用户名"/> </div>
            <div> <a-input class="inp" type="password" v-model="registerForm.password" placeholder="密码"/> </div>
            <button class="btn" @click="register">注册</button> 
            <div class="span_title"><span>已有账号?去</span><span @click="goLogin" class="go-login">登录</span></div>
        </div> -->
    </div>
    <div class="footer">ADS ©2018 Created by LanhaiRobot</div>

    <canvas id="myCanvas"></canvas>
  </div>
</template> 
<script>
import { mapMutations } from 'vuex';
export default { 
    data () { 
        return { 
            loginForm: { username: '', password: '' } ,
            title: this.$tcache('login.login'),
            registerForm:{
                username:'',
                password:''
            },
            config:null
        }; 
    },
    mounted() {
        // this.$i18n.locale = 'en';
        this.queryConfig()

        console.log(document.getElementById("myCanvas"))
        var canvas = document.getElementById("myCanvas");
        //   canvas.width = document.documentElement.clientWidth;
        //   canvas.height = document.documentElement.clientHeight;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var ctx = canvas.getContext("2d");
 
        //窗口改变时修改画布大小
        window.onresize = function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
 
        //创建小球的构造函数
        function Ball() {
            //横纵坐标
            this.x = randomNum(3, canvas.width - 3);
            this.y = randomNum(3, canvas.height - 3);
            //半径
            this.r = randomNum(2, 5);
            // this.color = randomColor();
            //颜色
            this.color="#7ec7fd";
            //平移速度，正负区间是为了移动方向的多样性
            this.speedX = randomNum(-3, 3) * 0.2;
            this.speedY = randomNum(-3, 3) * 0.2;
        }
        Ball.prototype = {
            //绘制小球
            draw: function () {
                ctx.beginPath();
                ctx.globalAlpha = 1;
                ctx.fillStyle = this.color;
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
            },
            //小球移动
            move: function () {
                this.x += this.speedX;
                this.y += this.speedY;
                //为了合理性,设置极限值(判断边界值，让圆球始终保证在画面内)
                if (this.x <= 3 || this.x > canvas.width - 3) {
                    this.speedX *= -1;
                }
                if (this.y <= 3 || this.y >= canvas.height - 3) {
                    this.speedY *= -1;
                }
            },
        };
        //存储所有的小球
        var balls = [];
        //创建100个小球
        for (var i = 0; i < 100; i++) {
            var ball = new Ball();
            balls.push(ball);
        }
        main();
 
        function main() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //鼠标移动绘制线
            mouseLine();
            //小球与小球之间自动画线
            drawLine();
            //使用关键帧动画，不断的绘制和清除
            window.requestAnimationFrame(main);
        }
        //添加鼠标移动事件
        //记录鼠标移动时的mouseX坐标
        var mouseX;
        var mouseY;
        canvas.onmousemove = function (e) {
            // var ev = event || e;
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        };
        //判断是否划线
 
        function drawLine() {
            for (var i = 0; i < balls.length; i++) {
                balls[i].draw();
                balls[i].move();
                for (var j = 0; j < balls.length; j++) {
                    if (i != j) {
                        if (
                            Math.sqrt(
                                Math.pow(balls[i].x - balls[j].x, 2) +
                                Math.pow(balls[i].y - balls[j].y, 2)
                            ) < 80
                        ) {
                            ctx.beginPath();
                            ctx.moveTo(balls[i].x, balls[i].y);
                            ctx.lineTo(balls[j].x, balls[j].y);
                            ctx.strokeStyle = "blue";
                            ctx.globalAlpha = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            }
        }
        //使用鼠标移动划线
        function mouseLine() {
            for (var i = 0; i < balls.length; i++) {
                if (
                    Math.sqrt(
                        Math.pow(balls[i].x - mouseX, 2) +
                        Math.pow(balls[i].y - mouseY, 2)
                    ) < 80
                ) {
                    ctx.beginPath();
                    ctx.moveTo(balls[i].x, balls[i].y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = "blue";
                    ctx.globalAlpha = 0.8;
                    ctx.stroke();
                }
            }
        }
        //随机函数
        function randomNum(m, n) {
            return Math.floor(Math.random() * (n - m + 1) + m);
        }
        //随机颜色
        // function randomColor() {
        //     return (
        //         "rgb(" +
        //         randomNum(0, 255) +
        //         "," +
        //         randomNum(0, 255) +
        //         "," +
        //         randomNum(0, 255) +
        //         ")"
        //     );
        // }
  },
  methods: { 
        // ...mapMutations(['changeAuthorization','changeName','recordLoginTime']), 
        ...mapMutations(['changeRole','changeIsAdmin','changeUserid','recordLoginTime']),
        login () {
            //  localStorage.removeItem('Authorization')//退出登录后删除Authorization
            if (this.loginForm.username ==='' || this.loginForm.password ==='') {
                this.$message.error(this.$tcache('login.login01'))
            } else { 
                // this.axios({ method: 'post', url: '/user/login', data: this.loginForm })
                this.axios.post( `login?username=${this.loginForm.username}&password=${this.loginForm.password}`)
                .then(res => { 
                    if(res.data.code==200){
                        console.log(res.data.data)
                        this.queryConfig()
                        //   this.userToken = res.data.token;
                        // 将用户token保存到vuex中 
                        //   this.changeAuthorization({ Authorization: this.userToken });
                        let authorities=res.data.data.authorities;
                        if(authorities&&(authorities?.length!=0)){
                              this.changeRole(authorities);//登录角色保存(数组)
                              this.changeIsAdmin(JSON.stringify(authorities).includes('ADMIN'));
                              this.$store.dispatch("updateUserInfo",res.data.data);
                            //   let loginTime=new Date().getTime();
                            //   this.recordLoginTime({ loginTime: loginTime });//保存登录时间，以备设置过期时间
                            if(authorities.length==1){
                                this.queryRoleMenu(authorities[0].authority.slice(0,1))
                            }else{
                                let roleIdArr=[]
                                authorities.map(item=>{roleIdArr.push(item.authority.slice(0,1))})  
                                this.queryRoleMenu(roleIdArr.join(','))
                            }
                            // this.queryRoleMenu("4,2")
                            this.$message.info(res.data.message);
                        }else{
                            this.$message.info(this.$tcache('login.login02'));
                        }
                        if(res.data.data?.principal.uid){
                            this.changeUserid(res.data.data.principal.uid)
                        }
                    }
                }).catch(() => { 
                    this.$message.error(this.$tcache('login.login03')) 
                });
            } 
        },
        queryRoleMenu(roleId){
            this.axios.get(`rolemenu/findall`)
            .then(res=>{
                let RoleMenu = res.data.filter(item=>roleId.includes(item.roleId))
                let arr= RoleMenu.map(item=>{return item.path})
                arr= arr.join(',').split(',')
                let arr2=[...new Set(arr)]
                localStorage.setItem('RoleMenu',JSON.stringify(arr2))
                let loginTime=Date.now()
                this.recordLoginTime(loginTime)
                this.config.forEach(item=>{
                    if(item['key']=='timeOut'){
                        localStorage.setItem('timeOut',item['value'])
                    }
                })
                this.$router.push('/home');
            }).catch(err=>{
              this.$message.error(`保存失败：${err}`)
            })
        },
        queryConfig(){
          this.axios.get(`config/list`).then(res=>{
            if(res.status==200){
                console.log(res)
                this.config=res.data
              if(res.data.length < 3){
                this.$notification.info({message:this.$tcache('login.login07'), description:this.$tcache('login.login08')})
              }
              for(let i=0;i<res.data.length;i++){
                if(res.data[i].key=='region.id')localStorage.setItem('region_id', res.data[i].value);
                if(res.data[i].key=='region.name')localStorage.setItem('region_name', res.data[i].value);
                if(res.data[i].key=='workshop.name')localStorage.setItem('workshop_name', res.data[i].value);
              }
            }else {
              console.error(this.$tcache('login.login05'))
            }
          }).catch(err=>{
            console.error(`${this.$tcache('login.login06')}：${err}`)
          })
        },       
        register(){

        },
        forget(){

        },
        goRegister(){
            this.title = this.$tcache('login.login04')
        } ,
        goLogin(){
            this.title = this.$tcache('login.login')
        }
    }
};
</script>
<style lang="scss" scoped>
.bgbox{
    width: 100vw;
    height: 100vh;
    background: url('../assets/img/login_img.png') no-repeat ;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.inpbox{
    // user-select: none;
    padding: 50px;
    // border: 1px solid rgb(88, 82, 82);
    width: 600px;
    // height: 400px;
    // background-color: rgba(255, 255, 255, 0.3);
    background-color: #8db5e070;
    border-radius: 20px;
    // box-shadow: ;
    color: white;
    z-index: 1;
}
.inp{
    // height: 50px;
    // width: 400px;
    // height: 50px;
    margin-bottom: 20px;
    // background-color: #f5f9ff;
}
.btn{
    padding: 10px 30px;
    border-radius: 5px;
    border: 0;
    font-size: 18px;
    color: #7df9ff;
    box-shadow: 1px 1px 3px;
    cursor: pointer;
    font-weight: bold;
    background-color: rgb(0 0 0 / 25%);
    &:hover{
        box-shadow: 1px 1px 10px;
    }
}
.title{
    margin-bottom: 20px;
    font-size: 25px;
    color: #7df9ff;
    font-weight: bold;
}
.login_btn{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    span{
        cursor: pointer;
        padding: 5px;
        color:#dcdee2;
        box-shadow: 1px 1px 5px;
        border-radius: 3px;
        font-weight: bold;
        &:hover{
            box-shadow: 1px 1px 10px;
        }
    }
}
.go-login{
    color: #7df9ff;
    font-weight: bold;
    font-size: 17px;
    cursor: pointer;
    &:hover{
            box-shadow: 1px 1px 20px;
        }
}
.span_title{
    margin-top: 10px;
}
.footer{
    position: absolute;
    bottom: 0;
    color: #d1bdbd66;
    font-weight: bold;
    font-size: 18px;
}

#myCanvas{
    position: absolute;
}
::v-deep .ant-input{
    height: 50px;
    font-size: 16px;
    padding-left: 35px !important;
}
::v-deep .anticon svg{
    width: 1.1rem;
    height: 1.1rem;
}
</style>
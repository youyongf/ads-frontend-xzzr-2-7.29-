export default {
  welcome: "欢迎",
  directory: {
    debug: "设备调试",
    monitor: "实时监控",
    query: "业务查询",
    analysis: "统计分析",
    data: "基础数据",
    system: "系统管理",

    tips: "打开/关闭"
  },
  menu:{
    home: "首页",

    map: "车间地图",

    olog: "操作日志",
    slog: "调度日志",

    machine: "机台对接监控",
    signal: "AGV信号监控",
    mstatus: "机台状态查询",
    astatus: "AGV状态查询",
    process: "实时在制",
    qtime: "实时QTime",
    mcache: "缓存机花篮",
    door: "自动门",

    thistory: "传输历史",
    shistory: "AGV状态历史",
    astatistics: "Agv异常统计",
    lineFixed: "定线在制",

    trolleyRate: "小车搬运率",
    dailyRate: "日工序搬运率",
    monthRate: "月工序搬运率",

    pointMap: "点位分布图",
    cacheStation: "缓存站分层定线",
    machineGroup: "机台定线分组",
    diagram: "对接工位分布图",

    step: "步骤",
    astep: "步骤区域",
    mplatform: "机台",
    machineCache: "缓存机",
    cacheMachineLayer: "缓存机分层",
    cacheLocation: "缓存位置",
    distributionArea: "交管区分布图",
    point: "点位",
    decisionPoint: "扩展决策点",
    standbyPoint: "扩展待命点",
    route: "路线",
    offLine: "离线点位分布图",
    agv: "AGV",
    tControl: "交管",
    information: "在制信息配置",
    outputTarget: "工序产量目标",
    cInformation: "配置信息",
    mPermission: "菜单权限",
    cPassword: "密码修改",
    agvQtime:"agv在制时间",
    singleStation:"单机台搬运量",
    nextStations:"下一可选机台",
		AgvChange: "人工修改目的地统计"
  },
  components: {
    /**stationCard.vue start */
    stationCard_C01:"机台反馈",
    stationCard_C02:"AGV反馈",
    stationCard_C03:"机台指令",
    stationCard_C04:"AGV指令",
    stationCard_C05:"AGV到位",
    stationCard_C06:"申请传输",
    stationCard_C07:"申请离开",
    stationCard_C08:"结束传输",
    stationCard_C09:"信号交互日志",
    /**stationCard.vue end */

    /**agvInfoDetail.vue start */
    agvInfoDetail_C01: "电量",
    agvInfoDetail_C02: "命令执行",
    agvInfoDetail_C03: "错误执行",
    agvInfoDetail_C04: "正常执行",
    agvInfoDetail_C05: "持续",
    agvInfoDetail_C06: "车辆状态",
    agvInfoDetail_C07: "时间",
    agvInfoDetail_C08: "物料状态",
    agvInfoDetail_C09: "上料",
    agvInfoDetail_C10: "下料",
    agvInfoDetail_C11: "空",
    agvInfoDetail_C12: "上空下满",
    agvInfoDetail_C13: "上满下空",
    agvInfoDetail_C14: "上满下满",
    agvInfoDetail_C15: "小车(AGV-{id})信息",
    agvInfoDetail_C16: "电池状态",
    agvInfoDetail_C17: "路线号",
    /**agvInfoDetail.vue end */
    changeLanguageFail: "后台切换语言失败, 请稍后重试",
  }
 
}
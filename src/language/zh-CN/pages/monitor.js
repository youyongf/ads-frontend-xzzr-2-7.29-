// 已完成
export default {
  monitor:{
    /** agv.vue start */
    carPlaceholder: "输入车辆编号",
    vehicle: "车辆",
    vFeedback: "车辆反馈",
    tFeedback: "反馈时间",
    cahngeTime: "状态变化时间",
    aOtherInfo: "AGV其它信息",
    dInstruction: "调度指令",
    deliveryTime: "下发时间",
    instruction: "指令",
    routing: "下发路线",
    reroute: "更改路线",
    changeRoute: "是否更改车辆的路线为",
    routeSuccess: "下发路线成功",
    routeFailed: "下发路线失败",

    AFDFailed: "AGV反馈数据失败",
    ASDFailed: "调度->AGV数据失败",
    queryRouteFailed: "查询路线失败",
    /** agv.vue end */
    // agvQtime.vue
    refreshInterval: "刷新间隔",
    inProcessTime: "在制时间",
    dataIsEmpty: "数据为空",
    agvInfoAcqFailed: "agv信息获取失败",
    /** agvstate_list.vue.vue start */
    group: "组别",
    destination: "目的地",
    condition: "进出料状态",
    nextStep: "下一步骤",
    clearCondition: "清除条件",
    feed: "进料",
    discharge: "出料",
    refueling: "换料",
    noTransmission: "没有传输",
    toMachine: "向机台传料",
    reMaterial: "接料",
    releasePoint: "点位释放",
    vehicleInspection: "车辆检查",
    focusVehicle: "需要关注的车辆有",
    numberLayers: "层数",
    lessThan: "低于",
    layer: "层",
    saveConfig: "按确定保存配置",
    warningTips: "存在需要运维人员注意的车辆，请及时关注. 其它离线{offline}辆，在线停止{warnings}辆。",
    normalTips: "车辆运行状况正常",
    charging: "充电中",
    uncharged: "未充电",
    /** agvstate_list.vue.vue end */

    /** cacheAgvBasketNum.vue start */
    cacheMachine: "缓存机花篮",
    step: "步骤",
    cmTips: "第几层(花篮数)-[组别]",
    stepErrTips: "步骤信息获取失败",
    /** agvstate_list.vue.vue end */

    /** door.vue start */
    openDoor: "已开门",
    closeDoor: "已关门",
    confirmOpenDoor: "确认开门",
    confirmCloseDoor: "确认关门",
    /** door.vue end */

    /** offline_point_map.vue start */
    offlineDays: "小车离线天数[最近几天]",
    offlineTable: "离线点位信息表",
    origin: "原点",
    oneSpan: "一跨",
    twoSpan: "二跨",
    tips01: "点位表未配置",
    tips02: "机台信息未配置",
    machineConfig: "机台配置",
    makeSvgErrTips01: "机台{id}对接位配置错误",
    makeSvgErrMsg01: "未配置对接点位，对接点：{doPoint},退出点：{exitPoint}",
    makeSvgErrMsg02: "点位号不存在，对接点：{doPoint},退出点：{exitPoint}",
    pointGetfail: "离线点位获取失败",
    /** offline_point_map.vue end */

    /** station.vue start */
    gxAbutment: "对接工序(可选)",
    abutmentInfo: "机台对接信息",
    stationQueryFail01: "查询机台信息失败",
    stationQueryFail02: "查询实时机台反馈信息失败",
    stationQueryFail03: "未匹配到对接机台",
    stationQueryFail04: "查询机台实时状态失败",
    stationQueryFail05: "机台缓存信息查询失败",
    /** station.vue end */

    /** stationCardList.vue start */
    stationInfo: "机台信息",
    abutmentPoint: "对接点",
    threshold: "机台料口阀值",
    enableOrNot: "是否启用",
    feedingStatus: "上料状态",
    blankingStatus: "下料状态",
    feedQuantity: "进料数",
    dischargeQuantity: "出料数",
    card: "卡片",
    dockingSteps: "对接步骤",
    stationState01: "机台复位信息",
    stationState02: "机台物料信息",
    stationState03: "允许AGV发起传输",
    stationState04: "允许AGV离开",
    stationState05: "机台异常",
    stationState06: "通知AGV准备转动",
    stationState07: "要求AGV停止传输",
    queryStepFail: "查询对接步骤失败",
    responseFail: "响应失败",
    queryAvgFail: "查询AGV状态缓存失败",
    normal: "正常"
    /** stationCardList.vue end */
    
  }
  
}
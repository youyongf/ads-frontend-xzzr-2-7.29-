export default {
  admin: {
    /** agv_detail.vue start*/
    port: "端口号",
    belongingCycle: "所属循环",
    hlThreshold: "出料花篮阈值",
    remarks: "备注",
    carType: "车辆类型",
    frontParagraph: "前段",
    posteriorSegment: "后段",
    surveySection: "测段",
    /** agv_detail.vue end*/

    /** agvlist.vue start*/
    deleteConfirm: "确认删除吗",
    rowsPerPage: "每页行数",
    queryFail: "信息查询失败",
    canceled: "已取消",
    delete: "已删除",
    notEmpty: "全部选项不可为空",
    saveConfig: "按确定保存配置",
    /** agvlist.vue end*/

    /** ca_map.vue end*/
    screenCoordinate: "屏幕坐标",
    slamCoordinates: "SLAM坐标",
    origin: "原点",
    changeCoordinates: "点击选择点位更改坐标",
    drawerTitle: "操作设置面板",
    drawerTitle01: "操作面板",
    showRoutes: "显示选中点的路线",
    all: "全部",
    startPoint: "起点",
    midpoint: "中点",
    endPont: "终点",
    noChecked: "未选择",
    cancelChecked:"取消选择",
    drawRegion: "绘制交管区",
    show: "显示",
    hidden: "隐藏",
    placeholder01: "请填写交管区名称",
    title01: "SLAM坐标(毫米)",
    mForward: "前移",
    mBack: "后移",
    type: "类型",
    type01: "独占",
    type02: "单入口放行",
    type03: "多入口放行(基于路线)",
    type04: "联合交管",
    release: "具备避障释放",
    newBuilt: "新建",
    deleteRegion: "删除选择的交管区",
    title02: "交管区删除",
    confirmDel: "确认删除所选交管区",
    asRoute: "关联路线",
    error01: "查询数据错误",
    error02: "车间地图配置有误,请检查config表",
    error03: "请求地图配置项失败",
    error04: "背景图配置信息获取失败",
    error05: "机台{id}对接位配置错误",
    errorTips01:"未配置对接点位，对接点：{doPoint},退出点：{exitPoint}",
    errorTips02: "点位号不存在，对接点：{doPoint},退出点：{exitPoint}",
    inspect: "交管区顶点坐标检查",
    emptyData: "查无数据",
    error06: "路线{id}上不存在的点",
    tipsInfo: "第{selectedPoint}号点已选择，请点击更改后的坐标",
    error07: "交管区设置的顶点不够,至少设置3个点以上!",
    error08: "请设置交管区名称",
    error09: "请设置交管区类型",
    caMap01: "交管区",
    /** ca_map.vue end*/

    /** cache_detail.vue start*/
    name: "名称",
    tpType: "运载类型",
    startOrNot: "是否启动",
    group: "组别",
    nextMachine: "下个可选机台",
    emptyBasket: "空篮",
    basketful: "满篮",
    stop: "停止",
    firing: "启动",
    validateTips: "'{text}'输入格式有误,请重新输入",
    /** cache_detail.vue end*/

    /** cache_list.vue start*/
    currentStep: "当前步骤",
    stationName: "机台名称",
    startOrNot01: "是否启用",
    enabling: "启用中",
    closing: "关闭中",
    noEnabing: "未启用",
    nextStep: "下一步骤机台",
    nextCache: "下一个缓存机",
    modalTile:"修改(带' * '号为必填项')",
    addTitle: "新增(带' * '号为必填项')",
    stationType01: "普通机台",
    stationType02: "缓存机",
    cacheListWarn: "下个可选机台查询失败",
    cacheListErr01: "步骤信息获取失败",
    cacheListErr02: "机台对接信息查询失败",
    validateTips01: "必填项({requierdstr})不可为空",
    configErr: "配置错误",
    configErrTips: "对接步骤",
    configErrMsg: "对接步骤{id}不存在",
    /** cache_list.vue end*/

     /** cache.vue start*/
     stationId: "机台ID",
     nextStation: "下一个可选机台",
     upDataBit: "上料数据位",
     downDataBit: "下料数据位",
     upBasket: "上料花篮",
     downBasket: "下料花篮",
     upInstruction: "上料指令数据位",
     downInstruction: "下料指令数据位",
     layer: "层",
     sysState: "系统状态",
    /** cache.vue end*/
    
    /** cachelayer_group.vue start */
    cacheStationsTitle: "缓存站分层定线",
    nextStep01: "下一步骤",
    cacheSiteID: "缓存站ID",
    groupAlready: "已经设置的组别",
    cachelayerGroup01: "已经选择缓存层",
    cachelayerGroup02: "将选择的缓存层定线为",
    cachelayerGroup03: "2组",
    cachelayerGroup04: "3组",
    cachelayerGroup05: "4组",
    cachelayerGroup06: "5组",
    cachelayerGroup07: "6组",
    cachelayerGroup08: "7组",
    cachelayerGroup09: "8组",
    cachelayerGroup10: "9组",
    cachelayerGroup11: "未查询到缓存层配置数据",
    cachelayerGroup12: "查询缓存层配置信息失败",
    cachelayerGroup13: "请选择缓存层",
    cachelayerGroup14: "请选择组别",
    /** cachelayer_group.vue end */

    /** cacheLayer.vue start */
    cacheLayer01: "机台对接点",
    cacheLayer02: "层名称",
    cacheLayer03: "待命点",
    cacheLayer04: "下层",
    cacheLayer05: "上层",
    cacheLayer06: "下一可选机台",
    cacheLayer07: "确定删除吗",
    cacheLayer08: "机台对接点",
    /** cacheLayer.vue end */

    /** cachePosition_detail.vue start */
    achePositionDetail01: "缓存层id",
    achePositionDetail02: "寄存器地址",
    achePositionDetail03: "序号",
    /** cachePosition_detail.vue end */

     /** cachePosition.vue start */
     cachePosition01: "已开启",
     cachePosition02: "已关闭",
     /** cachePosition.vue end */

    /** config.vue start */
    
    /** config.vue end */

    /** control.vue start */
    control01: "生成路线与交管区的相交点",
    control02: "相交点生成中",
    control03: "生成全部相交点",
    control04: "获取线路进出交管区的点",
    control05: "进出点生成中",
    control06: "生成全部进出点",
    control07: "先生成相交点后生成进出点",
    control08: "生成相交点",
    control09: "生成进出点",
    control10: "相交点生成成功",
    control11: "相交点生成失败",
    control12: "进出点生成成功",
    control13: "进出点生成失败",
    /** control.vue end */

    /** controlArealist.vue start */
    controlArealist01: "编辑行",
    controlArealist02: "删除行",
    controlArealist03: "属性",
    controlArealist04: "确定执行删除操作",
    controlArealist05: "删除名称为：'{name}'的交管区配置",
    controlArealist06: "请认真确认坐标组合",
    /** controlArealist.vue end */

    /** group.vue start */
    group01: "确认定线是否正确",
    group02: "确定取消",
    group03: "该组别已被使用，不可删除",
    group04: "花篮规格",
    group05: "组别对接检测是否开启",
    group06: "开启",
    group07: "关闭",
    group08: "知道了",
    /** group.vue end */

    /** nextStations.vue start */
    nextStations01: "步骤",
    nextStations02: "请先选择步骤",
    nextStations03: "定线机台",
    nextStations04: "确定保存吗?",
    /** nextStations.vue end */

    /** point_map.vue start */
    pointMap01: "对应点",
    pointMap02: "点位区域",
    pointMap03: "标签",
    pointMap04: "注释",
    pointMap05: "更新时间",
    pointMap06: "批量设置:[非必选]",
    pointMap07: "选择的点位",
    pointMap08: "点位配置信息",
    pointMap09: "点位类型",
    pointMap10: "点位步骤",
    pointMap11: "点路线设置：[非必填]位步骤",
    pointMap12: "线路备注",
    pointMap13: "线路优先级",
    pointMap14: "线路标记",
    pointMap15: "优先级",
    pointMap16: "标记",
    pointMap17: "一跨",
    pointMap18: "二跨",
    pointMap19: "查找的点位({pointid})不存在",
    pointMap20: "{pointid}点已高亮,高亮10秒后消失",
    pointMap21: "路线已高亮",
    pointMap22: "单一点位保存失败",
    pointMap23: "点位表未配置",
    pointMap24: "选择框内容为空",
    pointMap25: "未选择点位",
    pointMap26: "点位配置更新失败",
    pointMap27: "未选择路线",
    pointMap28: "路线配置更新失败",
    /** point_map.vue end */

    /** pointDecide_detail.vue start */
    pointDecideDet01: "暂停点",
    pointDecideDet02: "车辆数上限",
    pointDecideDet03: "车辆数下限",
    pointDecideDet04: "缓存(buffers)",
    pointDecideDet05: "开关状态",
    pointDecideDet06: "去往暂停点的阈值",
    /** pointDecide_detail.vue end */

    /** pointDecide.vue start */
    pointDecide01: "确认关闭",
    pointDecide02: "确认开启",
    pointDecide03: "选项{str}不可为空",
    /** pointDecide.vue end */

    /** pointlist.vue start */
    pointlist01: "上传文件",
    pointlist02: "全量",
    pointlist03: "增量",
    pointlist04: "注意：请先选择全量或增量再导入点位文件",
    pointlist05: "文件正在上传，请稍等",
    pointlist06: "导入结果",
    pointlist07: "注释不可为空",
    pointlist08: "x,y坐标不可为空",
    /** pointlist.vue end */

    /** pointPark_detail.vue start */
    pointParkDet01: "开",
    pointParkDet02: "关",
    /** pointPark_detail.vue end */

    /** pointPark.vue start */
    pointPark01: "{key}选项不可为空",
    /** pointPark.vue end */

     /** public_detail.vue start */
     publicDet01: "调度步骤",
     publicDet02: "限定点位可去机台",
     publicDet03: "三跨",
     publicDet04: "四跨",
     publicDet05: "五跨",
     /** public_detail.vue end */

     /** routefiles.vue start */
     routefiles01: "文件名称",
     routefiles02: "删除所选文件",
     routefiles03: "选择全部",
     routefiles04: "请选择要删除的路线文件",
     routefiles05: "文件{rids}已被删除",
     routefiles06: "删除失败",
    /** routefiles.vue end */

     /** routeImport.vue start */
     routeImport01: "文件导入状态",
     /** routeImport.vue end */

     /** routelist.vue start */
     routelist01: "二维码模式",
     routelist02: "路线文件",
     routelist03: "(旧)上传文件(多文件)",
     routelist04: "(新)上传文件(单文件)",
     routelist05: "未开启",
     routelist06: "开启",
     routelist07: "线路沿途所有点获取成功",
     routelist08: "生成相交点成功",
     routelist09: "路径获取成功",
     /** routelist.vue end */

     /** routeUpload_new.vue start */
     routeUploadNew01: "上传文件(单文件)",
     routeUploadNew02: "最新上传的路线文件包括全部路线，不在文件中的路线会被删除",
     routeUploadNew03: "可以依次上传多个路线文件，以增量的方式保存到数据库；不会删除数据库中旧记录",
     /** routeUpload_new.vue end */

     /** routeUpload.vue start */
     routeUpload01: "导入中",
     routeUpload02: "请选择附件",
     routeUpload03: "导入",
     routeUpload04: "注意：每次导入必须是本区域全量的点位，若多个点位文件则必须合并到一个文件一次性导入",
     routeUpload05: "上传完成",
     routeUpload06: "上传失败",
    /** routeUpload.vue end */

    /** station_detail.vue start */
    stationDet01: "启用",
    stationDet02: "停用",
    stationDet03: "机台料口阀值",
    stationDet04: "线别",
    stationDet05: "优先的下料缓存机",
    stationDet06: "同步充电停留时间",
    stationDet07: "邻近停车位",
    stationDet08: "工序",
    stationDet09: "对接点",
    stationDet10: "出料轨",
    stationDet11: "进料轨",
    stationDet12: "同步锁定点位",
    stationDet13: "退出点",
    stationDet14: "缓存机仓位数",
    stationDet15: "备选分组",
    stationDet16: "机台端口",
    stationDet17: "调度端口",
    stationDet18: "包头",
    stationDet19: "下一决策点",
    stationDet20: "反馈标识",
    stationDet21: "设备类型",
    stationDet22: "分钟",
    stationDet23: "下个可选机台{index} 所选最后的机台已被{name}机台分组",
    stationDet24: "是否启用",
    stationDet25: "空车可前往的机台",
    /** station_detail.vue end */

    /** station_group.vue start */
    stationGroup01: "该机台的下个可选机台不为空",
    stationGroup02: "已经选择机台",
    stationGroup03: "将选择的机台定线为",
    stationGroup04: "组别编辑",
    stationGroup05: "确认定线是否正确",
    stationGroup06: "未查询到机台配置数据",
    stationGroup07: "查询机台配置信息失败",
    stationGroup08: "表中未配置好生产工序",
    stationGroup09: "请手工将工序添加到dict表,注意工序名称必须与station.process一致",
    stationGroup10: "机台[{name}]的下个可选机台不为空",
    stationGroup11: "机台配置了优先当前机台",
    stationGroup12: "机台组别[{value}]在[station_group]表中不存在",
    stationGroup13: "当前调度机台涉及的步骤",
    stationGroup14: "请选择机台",
    stationGroup15: "分层定线",
    /** station_group.vue end */

     /** station_map.vue start */
     stationMap01: "对接工位(机台)批量设置",
     stationMap02: "选择设置项",
     stationMap03: "干扰点",
     stationMap04: "下游机台",
     stationMap05: "下料缓存台",
     stationMap06: "选择的对接工位",
     stationMap07: "先点击输入框后选择对应的点位",
     stationMap08: "当前step部分待命点(停车位)距离太远时，需要设置就近的待命点",
     stationMap09: "干扰对接位",
     stationMap10: "当前对接影响旁边的对接位时，需要设置旁边对接位的",
     stationMap11: "去往同一工序的路线有多条(决策点有多个)时，可能需要设置不同的区域来平衡车辆数量",
     stationMap12: "下游缓存机",
     stationMap13: "机台信息未配置",
     stationMap14: "输入框内容为空",
     stationMap15: "待命点更新失败",
     stationMap16: "干扰点更新失败",
     stationMap17: "区域更新失败",
     stationMap18: "下游机台更新失败",
     stationMap19: "下游缓存机更新失败",
     stationMap20: "机台配置",
     stationMap21: "请选择同一步骤的机台",
     stationMap22: "机台信息",
     stationMap23: "机台",
     stationMap24: "下一步骤可选机台",
     stationMap25: "临时停车位",
     stationMap26: "关联点位",
     stationMap27: "工艺机台",
     stationMap28: "机台{name} 未配置步骤",
    /** station_map.vue end */

    /** stationlist.vue end */

    /** stationlist.vue end */

     /** step_detail.vue end */
     stepDet01: "决策点",
     stepDet02: "充电点",
     stepDet03: "默认点",
     stepDet04: "待命点泊位限制",
     stepDet05: "补位阈值",
    /** step_detail.vue end */

    /** steplist.vue end */
    steplist01: "普通花篮",
    steplist02: "原始硅料盒",
    steplist03: "成品料盒",
    steplist04: "料",
    steplist05: "无",
    steplist06: "缓存机更新",
    steplist07: "全部机台信息查询失败",
    /** steplist.vue end */
 
  }
}
// 已完成
export default {
  monitor:{
    /** agv.vue start */
    carPlaceholder: "Enter vehicle number",
    vehicle: "vehicle",
    vFeedback: "Vehicle feedback",
    tFeedback: "Feedback time",
    cahngeTime: "State change time",
    aOtherInfo: "AGV Other Information",
    dInstruction: "Scheduling instruction",
    deliveryTime: "Issuance time",
    instruction: "instructions",
    routing: "Distribution route",
    reroute: "Change Route",
    changeRoute: "Do you want to change the vehicle's route to",
    routeSuccess: "Successfully issued route",
    routeFailed: "Failed to issue route",

    AFDFailed: "AGV feedback data failed",
    ASDFailed: "Scheduling ->AGV data failed",
    queryRouteFailed: "Failed to query route",
    /** agv.vue end */
    // agvQtime.vue
    refreshInterval: "refresh interval",
    inProcessTime: "In process time",
    dataIsEmpty: "Data is empty",
    agvInfoAcqFailed: "AGV information acquisition failed",
    /** agvstate_list.vue.vue start */
    group: "group",
    destination: "Destination",
    condition: "Incoming and outgoing status",
    nextStep: "Next step",
    clearCondition: "Clear conditions",
    feed: "Feed",
    discharge: "Discharge",
    refueling: "Refueling",
    noTransmission: "No transmission",
    toMachine: "Transfer materials to the machine",
    reMaterial: "Receiving materials",
    releasePoint: "Point release",
    vehicleInspection: "Vehicle inspection",
    focusVehicle: "Vehicles that need attention include",
    numberLayers: "Number of layers",
    lessThan: "under",
    layer: "layer",
    saveConfig: "Press OK to save the configuration",
    warningTips: "There are vehicles that require attention from operation and maintenance personnel, please pay attention promptly Other offline {offline} vehicles, stop {warnings} vehicles online.",
    normalTips: "The vehicle is operating normally",
    charging: "charging",
    uncharged: "uncharged",
    /** agvstate_list.vue.vue end */

    /** cacheAgvBasketNum.vue start */
    cacheMachine: "Cache Machine Flower Basket",
    step: "step",
    cmTips: "Which layer (number of flower baskets) - [group]",
    stepErrTips: "Step information acquisition failed",
    /** agvstate_list.vue.vue end */

    /** door.vue start */
    openDoor: "Opened",
    closeDoor: "Closed",
    confirmOpenDoor: "Confirm opening the door",
    confirmCloseDoor: "Confirm closing the door",
    /** door.vue end */

    /** offline_point_map.vue start */
    offlineDays: "Number of days the car has been offline [in the past few days]",
    offlineTable: "Offline point information table",
    origin: "origin",
    oneSpan: "One span",
    twoSpan: "Two spans",
    tips01: "The point table is not configured",
    tips02: "Machine information not configured",
    machineConfig: "Machine configuration",
    makeSvgErrTips01: "Machine {id} docking position configuration error",
    makeSvgErrMsg01: "No docking point is configured, docking point: {doPoint}, exit point: {exitPoint}",
    makeSvgErrMsg02: "The point number does not exist, docking point: {doPoint}, exit point: {exitPoint}",
    pointGetfail: "Offline point acquisition failed",
    /** offline_point_map.vue end */

    /** station.vue start */
    gxAbutment: "Docking process (optional)",
    abutmentInfo: "Machine docking information",
    stationQueryFail01: "Failed to query machine information",
    stationQueryFail02: "Failed to query real-time machine feedback information",
    stationQueryFail03: "Not matched to docking machine",
    stationQueryFail04: "Failed to query the real-time status of the machine",
    stationQueryFail05: "Machine cache information query failed",
    /** station.vue end */

    /** stationCardList.vue start */
    stationInfo: "Machine information",
    abutmentPoint: "Docking point",
    threshold: "Machine material inlet threshold",
    enableOrNot: "Enable or not",
    feedingStatus: "Feeding status",
    blankingStatus: "Blanking status",
    feedQuantity: "Feed quantity",
    dischargeQuantity: "Discharge quantity",
    card: "card",
    dockingSteps: "Docking steps",
    stationState01: "Machine reset information",
    stationState02: "Machine material information",
    stationState03: "Allow AGV to initiate transmission",
    stationState04: "Allow AGV to leave",
    stationState05: "Machine abnormality",
    stationState06: "Notify AGV to prepare for rotation",
    stationState07: "Request AGV to stop transmission",
    queryStepFail: "Failed to query docking steps",
    responseFail: "Response failed",
    queryAvgFail: "Failed to query AGV status cache",
    normal: "normal",
    /** stationCardList.vue end */
    
  }
  
}
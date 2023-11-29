export default {
  welcome: "welcome",
  directory: {
    debug: "Equipment debugging",
    monitor: "Real time monitoring",
    query: "Business Query",
    analysis: "statistical analysis",
    data: "Basic data",
    system: "system management",

    tips: "On/Off"
  },
  menu:{
    home: "home page",

    map: "Workshop Map",

    olog: "Operation log",
    slog: "Dispatch Log",

    machine: "Machine docking monitoring",
    signal: "AGV signal monitoring",
    mstatus: "Machine status query",
    astatus: "AGV status query",
    process: "Real time in production",
    qtime: "Real time QTime",
    mcache: "Cache Machine Flower Basket",
    door: "Automatic door",

    thistory: "Transmission History",
    shistory: "AGV Status History",
    astatistics: "Agv anomaly statistics",
    lineFixed: "Alignment in progress",

    trolleyRate: "Trolley handling rate",
    dailyRate: "Daily process handling rate",
    monthRate: "Monthly process handling rate",

    pointMap: "Point distribution map",
    cacheStation: "Layered routing of cache stations",
    machineGroup: "Machine routing grouping",
    diagram: "Distribution diagram of docking stations",

    step: "step",
    astep: "Step area",
    mplatform: "Machine",
    machineCache: "Cache machine",
    cacheMachineLayer: "Cache machine layering",
    cacheLocation: "Cache location",
    distributionArea: "Traffic Management Area Distribution Map",
    point: "Point position",
    decisionPoint: "Extended Decision Points",
    standbyPoint: "Extended standby point",
    route: "route",
    offLine: "Offline point distribution map",
    agv: "AGV",
    tControl: "Traffic management",
    information: "In process information configuration",
    outputTarget: "Process yield target",
    cInformation: "configuration information",
    mPermission: "Menu permissions",
    cPassword: "Password modification",
    agvQtime:"AGV in process time",
    singleStation:"Single machine handing capacity",
    nextStations:"next optional machine",
    AgvChange:"AgvChange"
  },
  components: {
    /**stationCard.vue start */
    stationCard_C01:"Machine feedback",
    stationCard_C02:"AGV feedback",
    stationCard_C03:"Machine command",
    stationCard_C04:"AGV instruction",
    stationCard_C05:"AGV in place",
    stationCard_C06:"Apply for transmission",
    stationCard_C07:"Apply to leave",
    stationCard_C08:"End Transfer",
    stationCard_C09:"Signal interaction log",
    /**stationCard.vue end */

    /**agvInfoDetail.vue start */
    agvInfoDetail_C01: "Electricity level",
    agvInfoDetail_C02: "Command execution",
    agvInfoDetail_C03: "Error execution",
    agvInfoDetail_C04: "Normal execution",
    agvInfoDetail_C05: "sustained",
    agvInfoDetail_C06: "Vehicle status",
    agvInfoDetail_C07: "time",
    agvInfoDetail_C08: "Material status",
    agvInfoDetail_C09: "Blanking",
    agvInfoDetail_C10: "Blanking",
    agvInfoDetail_C11: "empty",
    agvInfoDetail_C12: "Above and below full",
    agvInfoDetail_C13: "Up full and down empty",
    agvInfoDetail_C14: "Top full and bottom full",
    agvInfoDetail_C15: "Car (AGV {id}) information",
    agvInfoDetail_C16: "battery status",
    agvInfoDetail_C17: "Route number",
    /**agvInfoDetail.vue end */
    changeLanguageFail: "Switching language failed. Please try again later",
  }
 
}
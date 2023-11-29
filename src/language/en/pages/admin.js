export default {
  admin: {
    /** agv_detail.vue start*/
    port: "Port number",
    belongingCycle: "Belonging cycle",
    hlThreshold: "Discharge basket threshold",
    remarks: "Remarks",
    carType: "Vehicle type",
    frontParagraph: "Front paragraph",
    posteriorSegment: "Posterior segment",
    surveySection: "Survey section",
    /** agv_detail.vue end*/

    /** agvlist.vue start*/
    deleteConfirm: "Are you sure to delete",
    rowsPerPage: "Rows per page",
    queryFail: "Information query failed",
    canceled: "Canceled",
    delete: "Deleted",
    notEmpty: "All options cannot be empty",
    saveConfig: "Press OK to save the configuration",
    /** agvlist.vue end*/

    /** ca_map.vue end*/
    screenCoordinate: "Screen coordinates",
    slamCoordinates: "SLAM coordinates",
    origin: "origin",
    changeCoordinates: "Click to select a point to change coordinates",
    drawerTitle: "Operation Settings Panel",
    drawerTitle01: "operation panel",
    showRoutes: "Display the route of the selected point",
    all: "whole",
    startPoint: "starting point",
    midpoint: "midpoint",
    endPont: "end point",
    noChecked: "Not selected",
    cancelChecked:"Deselect",
    drawRegion: "Draw traffic management area",
    show: "display",
    hidden: "hide",
    placeholder01: "Please fill in the name of the traffic management area",
    title01: "SLAM coordinates (millimeters)",
    mForward: "Move forward",
    mBack: "Move back",
    type: "type",
    type01: "Exclusive",
    type02: "Single Entry Release",
    type03: "Multiple entry release (based on route)",
    type04: "Joint Traffic Management",
    release: "Equipped with obstacle avoidance release",
    newBuilt: "New",
    deleteRegion: "Delete the selected traffic management area",
    title02: "Delete Traffic Management Area",
    confirmDel: "Confirm deletion of the selected traffic management area",
    asRoute: "Associated Route",
    error01: "Query data error",
    error02: "The workshop map configuration is incorrect, please check the config table",
    error03: "Request for map configuration item failed",
    error04: "Failed to obtain background image configuration information",
    error05: "Machine {id} docking position configuration error",
    errorTips01:"No docking point is configured, docking point: {doPoint}, exit point: {exitPoint}",
    errorTips02: "The point number does not exist, docking point: {doPoint}, exit point: {exitPoint}",
    inspect: "Inspection of vertex coordinates in traffic management area",
    emptyData: "No data found",
    error06: "Points on route {id} that do not exist",
    tipsInfo: "The {selectedPoint} point has been selected, please click on the changed coordinates",
    error07: "There are not enough vertices set in the traffic management area, at least 3 or more points should be set",
    error08: "Please set the name of the traffic management area",
    error09: "Please set the type of traffic management area",
    caMap01: "Traffic management area",
    /** ca_map.vue end*/

    /** cache_detail.vue start*/
    name: "name",
    tpType: "Transport type",
    startOrNot: "Start or not",
    group: "group",
    nextMachine: "Next optional machine",
    emptyBasket: "Empty basket",
    basketful: "Full basket",
    stop: "cease",
    firing: "start-up",
    validateTips: "The input format is incorrect. Please re-enter",
    /** cache_detail.vue end*/

    /** cache_list.vue start*/
    currentStep: "Current step",
    stationName: "Machine name",
    startOrNot01: "Enable or not",
    enabling: "Enabling",
    closing: "Closing",
    noEnabing: "not enabled",
    nextStep: "Next step machine",
    nextCache: "Next cache machine",
    modalTile:"Modify (mandatory with '*')",
    addTitle: "New (mandatory with '*')",
    stationType01: "Ordinary machine",
    stationType02: "Cache machine",
    cacheListWarn: "Next optional machine query failed",
    cacheListErr01: "Step information acquisition failed",
    cacheListErr02: "Machine docking information query failed",
    validateTips01: "The required item [{requeststr}] cannot be empty",
    configErr: "Configuration error",
    configErrTips: "Docking steps",
    configErrMsg: "Docking step {id} does not exist",
    /** cache_list.vue end*/

     /** cache.vue start*/
     stationId: "Machine ID",
     nextStation: "Next optional machine",
     upDataBit: "Loading data bit",
     downDataBit: "Blanking data bits",
     upBasket: "Feeding basket",
     downBasket: "Blanking flower basket",
     upInstruction: "Loading instruction data bit",
     downInstruction: "Blanking instruction data bit",
     layer: "layer",
     sysState: "system state",
    /** cache.vue end*/
    
    /** cachelayer_group.vue start */
    cacheStationsTitle: "Layered routing of cache stations",
    nextStep01: "Next step",
    cacheSiteID: "Cache Station ID",
    groupAlready: "Group already set",
    cachelayerGroup01: "Cache Layer Selected",
    cachelayerGroup02: "Line the selected cache layer to",
    cachelayerGroup03: "2 groups",
    cachelayerGroup04: "3 groups",
    cachelayerGroup05: "4 groups",
    cachelayerGroup06: "5 groups",
    cachelayerGroup07: "6 groups",
    cachelayerGroup08: "7 groups",
    cachelayerGroup09: "8 groups",
    cachelayerGroup10: "9 groups",
    cachelayerGroup11: "No cache layer configuration data found",
    cachelayerGroup12: "Failed to query cache layer configuration information",
    cachelayerGroup13: "Please select a cache layer",
    cachelayerGroup14: "Please select a group",
    /** cachelayer_group.vue end */

    /** cacheLayer.vue start */
    cacheLayer01: "Machine docking point",
    cacheLayer02: "Layer Name",
    cacheLayer03: "Standby point",
    cacheLayer04: "Lower layer",
    cacheLayer05: "Upper layer",
    cacheLayer06: "Next optional machine",
    cacheLayer07: "Are you sure to delete it",
    cacheLayer08: "Machine docking point",
    /** cacheLayer.vue end */

    /** cachePosition_detail.vue start */
    achePositionDetail01: "Cache Layer ID",
    achePositionDetail02: "Register Address",
    achePositionDetail03: "Serial number",
    /** cachePosition_detail.vue end */

     /** cachePosition.vue start */
     cachePosition01: "Opened",
     cachePosition02: "Closed",
     /** cachePosition.vue end */

    /** config.vue start */
    
    /** config.vue end */

    /** control.vue start */
    control01: "Generate intersection points between route and traffic management area",
    control02: "Intersection point generation in progress",
    control03: "Generate all intersection points",
    control04: "Obtain the points where the route enters and exits the traffic management area",
    control05: "Generating entry and exit points",
    control06: "Generate all entry and exit points",
    control07: "Sir, generate entry and exit points after forming intersection points",
    control08: "Generate Intersection Points",
    control09: "Generate entry and exit points",
    control10: "Successfully generated intersection points",
    control11: "Intersection point generation failed",
    control12: "Successfully generated entry and exit points",
    control13: "Entry and exit point generation failed",
    /** control.vue end */

    /** controlArealist.vue start */
    controlArealist01: "Edit Line",
    controlArealist02: "Delete Row",
    controlArealist03: "attribute",
    controlArealist04: "Confirm to perform the deletion operation",
    controlArealist05: "Delete the traffic management area configuration with the name '{name}'",
    controlArealist06: "Please carefully confirm the coordinate combination",
    /** controlArealist.vue end */

    /** group.vue start */
    group01: "Confirm if the alignment is correct",
    group02: "Confirm cancellation",
    group03: "This group is already in use and cannot be deleted",
    group04: "Flower basket specifications",
    group05: "Is group docking detection enabled",
    group06: "open",
    group07: "close",
    group08: "Got it",
    /** group.vue end */

    /** nextStations.vue start */
    nextStations01: "step",
    nextStations02: "Please select a step first",
    nextStations03: "Alignment machine",
    nextStations04: "Are you sure to save",
    /** nextStations.vue end */

    /** point_map.vue start */
    pointMap01: "Corresponding point",
    pointMap02: "Point area",
    pointMap03: "label",
    pointMap04: "annotation",
    pointMap05: "Update time",
    pointMap06: "Batch Settings: [Not Required]",
    pointMap07: "Selected points",
    pointMap08: "Point configuration information",
    pointMap09: "Point type",
    pointMap10: "Point step",
    pointMap11: "Point route setting: [non mandatory] step",
    pointMap12: "Line remarks",
    pointMap13: "Line priority",
    pointMap14: "Line markings",
    pointMap15: "priority",
    pointMap16: "sign",
    pointMap17: "One span",
    pointMap18: "Two spans",
    pointMap19: "The searched point ({pointid}) does not exist",
    pointMap20: "The [{pointid}] point has been highlighted and disappears after 10 seconds of highlighting",
    pointMap21: "Route highlighted",
    pointMap22: "Single point save failed",
    pointMap23: "The point table is not configured",
    pointMap24: "The selection box content is empty",
    pointMap25: "No point selected",
    pointMap26: "Point configuration update failed",
    pointMap27: "No route selected",
    pointMap28: "Route configuration update failed",
    /** point_map.vue end */

    /** pointDecide_detail.vue start */
    pointDecideDet01: "Pause point",
    pointDecideDet02: "Maximum number of vehicles",
    pointDecideDet03: "Lower limit of vehicles",
    pointDecideDet04: "Buffers",
    pointDecideDet05: "Switch status",
    pointDecideDet06: "Threshold for going to the pause point",
    /** pointDecide_detail.vue end */

    /** pointDecide.vue start */
    pointDecide01: "Confirm Close",
    pointDecide02: "Confirm Open",
    pointDecide03: "Option {str} cannot be empty",
    /** pointDecide.vue end */

    /** pointlist.vue start */
    pointlist01: "Upload files",
    pointlist02: "Total quantity",
    pointlist03: "increment",
    pointlist04: "Note: Please select full or incremental before importing point files",
    pointlist05: "The file is currently being uploaded, please wait",
    pointlist06: "Import Results",
    pointlist07: "Comment cannot be empty",
    pointlist08: "[x, y] coordinates cannot be empty",
    /** pointlist.vue end */

    /** pointPark_detail.vue start */
    pointParkDet01: "open",
    pointParkDet02: "shut",
    /** pointPark_detail.vue end */

    /** pointPark.vue start */
    pointPark01: "The {key} option cannot be empty",
    /** pointPark.vue end */

     /** public_detail.vue start */
     publicDet01: "Scheduling Steps",
     publicDet02: "Limited point location for machine access",
     publicDet03: "Three spans",
     publicDet04: "Four Spans",
     publicDet05: "Five spans",
     /** public_detail.vue end */

     /** routefiles.vue start */
     routefiles01: "File Name",
     routefiles02: "Delete the selected file",
     routefiles03: "Select All",
     routefiles04: "Please select the route file to delete",
     routefiles05: "File {rids} has been deleted",
     routefiles06: "Delete failed",
    /** routefiles.vue end */

     /** routeImport.vue start */
     routeImport01: "File import status",
     /** routeImport.vue end */

     /** routelist.vue start */
     routelist01: "QR code mode",
     routelist02: "Route file",
     routelist03: "[Old] Upload files [Multiple files]",
     routelist04: "[New] Upload File [Single File]",
     routelist05: "Not turned on",
     routelist06: "open",
     routelist07: "Successfully obtained all points along the route",
     routelist08: "Successfully generated intersection points",
     routelist09: "Path obtained successfully",
     /** routelist.vue end */

     /** routeUpload_new.vue start */
     routeUploadNew01: "Upload file [single file]",
     routeUploadNew02: "The latest uploaded route file includes all routes, and routes that are not in the file will be deleted",
     routeUploadNew03: "Multiple route files can be uploaded sequentially and saved incrementally to the database; Old records in the database will not be deleted",
     /** routeUpload_new.vue end */

     /** routeUpload.vue start */
     routeUpload01: "Importing",
     routeUpload02: "Please select an attachment",
     routeUpload03: "Import",
     routeUpload04: "Note: Each import must have a full range of points in the region. If multiple point files are merged into one file, they must be imported at once",
     routeUpload05: "Upload completed",
     routeUpload06: "Upload failed",
    /** routeUpload.vue end */

    /** station_detail.vue start */
    stationDet01: "Enable",
    stationDet02: "Deactivate",
    stationDet03: "Machine material inlet threshold",
    stationDet04: "Line type",
    stationDet05: "Priority cutting buffer machine",
    stationDet06: "Synchronous charging dwell time",
    stationDet07: "Adjacent parking spaces",
    stationDet08: "working procedure",
    stationDet09: "Docking point",
    stationDet10: "Discharge rail",
    stationDet11: "Feed rail",
    stationDet12: "Synchronize locking points",
    stationDet13: "Exit point",
    stationDet14: "Number of cache slots",
    stationDet15: "Alternative grouping",
    stationDet16: "Machine port",
    stationDet17: "Scheduling Port",
    stationDet18: "Baotou",
    stationDet19: "Next Decision Point",
    stationDet20: "Feedback identification",
    stationDet21: "Equipment type",
    stationDet22: "minute",
    stationDet23: "Next optional machine {index} The last machine selected has been grouped by {name} machines",
    stationDet24: "Enable or not",
    stationDet25: "Machines accessible by empty cars",
    /** station_detail.vue end */

    /** station_group.vue start */
    stationGroup01: "The next optional machine for this machine is not empty",
    stationGroup02: "Machine has been selected",
    stationGroup03: "Route the selected machine as",
    stationGroup04: "Group Editing",
    stationGroup05: "Confirm if the alignment is correct",
    stationGroup06: "No machine configuration data found",
    stationGroup07: "Failed to query machine configuration information",
    stationGroup08: "The production process is not configured in the table",
    stationGroup09: "Please manually add the process to the [dict] table, and note that the process name must be consistent with the [station. process]",
    stationGroup10: "The next optional machine for machine [{name}] is not empty",
    stationGroup11: "The machine is configured with priority to the current machine",
    stationGroup12: "Machine group [{value}] does not exist in the [station_group] table",
    stationGroup13: "Steps involved in the current dispatching machine",
    stationGroup14: "Please select a machine",
    stationGroup15: "Machine differentiation group",
    /** station_group.vue end */

     /** station_map.vue start */
     stationMap01: "Batch setting of docking stations (machines)",
     stationMap02: "Select Settings Item",
     stationMap03: "Interference point",
     stationMap04: "Downstream machine",
     stationMap05: "Blanking buffer table",
     stationMap06: "Selected docking station",
     stationMap07: "First click on the input box and then select the corresponding point",
     stationMap08: "When the distance between some standby points (parking spaces) in the current [step] is too far, it is necessary to set the nearest standby point",
     stationMap09: "Interference docking position",
     stationMap10: "When the current docking affects the adjacent docking position, it is necessary to set the",
     stationMap11: "When there are multiple routes to the same process, different areas may need to be set to balance the number of vehicles",
     stationMap12: "Downstream cache machine",
     stationMap13: "Machine information not configured",
     stationMap14: "The input box content is empty",
     stationMap15: "Standby point update failed",
     stationMap16: "Interference point update failed",
     stationMap17: "Region update failed",
     stationMap18: "Downstream machine update failed",
     stationMap19: "Downstream cache machine update failed",
     stationMap20: "Machine configuration",
     stationMap21: "Please select a machine from the same step",
     stationMap22: "Machine information",
     stationMap23: "Machine",
     stationMap24: "Next step: optional machine",
     stationMap25: "Temporary parking spaces",
     stationMap26: "Associated points",
     stationMap27: "Process machine",
     stationMap28: "Machine {name} is not configured with steps",
    /** station_map.vue end */

    /** stationlist.vue end */

    /** stationlist.vue end */

     /** step_detail.vue end */
     stepDet01: "Decision points",
     stepDet02: "Charging point",
     stepDet03: "Default point",
     stepDet04: "Standby Point Berth Restrictions",
     stepDet05: "Filling threshold",
    /** step_detail.vue end */

    /** steplist.vue end */
    steplist01: "Ordinary flower basket",
    steplist02: "Original silicon material box",
    steplist03: "Finished material box",
    steplist04: "material",
    steplist05: "nothing",
    steplist06: "Cache machine update",
    steplist07: "Failed to query all machine information",
    /** steplist.vue end */
 
  }
}
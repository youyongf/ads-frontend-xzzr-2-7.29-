// 已完成
export default {
  monitor:{
    /** agv.vue start */
    carPlaceholder: "ป้อนหมายเลขรถ",
    vehicle: "ยานพาหนะ",
    vFeedback: "ความคิดเห็นเกี่ยวกับรถยนต์",
    tFeedback: "เวลาข้อเสนอแนะ",
    cahngeTime: "เวลาเปลี่ยนสถานะ",
    aOtherInfo: "AGV ข้อมูลอื่น ๆ",
    dInstruction: "คำสั่งการตั้งเวลา",
    deliveryTime: "เวลาออกเดินทาง",
    instruction: "คำแนะนำ",
    routing: "เส้นทาง Shimohatsu",
    reroute: "เปลี่ยนเส้นทาง",
    changeRoute: "ไม่ว่าจะเป็นการเปลี่ยนเส้นทางของรถยนต์เป็น",
    routeSuccess: "เส้นทางขาลงประสบความสำเร็จ",
    routeFailed: "เส้นทางขาลงล้มเหลว",

    AFDFailed: "ข้อมูลการตอบรับของ AGV ล้มเหลว",
    ASDFailed: "การตั้งเวลา -> ข้อมูล AGV ล้มเหลว",
    queryRouteFailed: "เส้นทางการสอบถามล้มเหลว",
    /** agv.vue end */
    // agvQtime.vue
    refreshInterval: "ចន្លោះ​ពេល​ធ្វើ​ឲ្យ​ស្រស់",
    inProcessTime: "ក្នុង​ពេលវេលា​ដំណើរការ",
    dataIsEmpty: "ទិន្នន័យ​ទទេ",
    agvInfoAcqFailed: "បាន​បរាជ័យ​ក្នុង​ការ​ទទួល​យក​ព័ត៌មាន AGV",
    /** agvstate_list.vue.vue start */
    group: "กลุ่ม",
    destination: "จุดหมายปลายทาง",
    condition: "สถานะขาเข้าและขาออก",
    nextStep: "ขั้นตอนต่อไป",
    clearCondition: "ล้างเงื่อนไข",
    feed: "การให้อาหาร",
    discharge: "ปล่อยออก",
    refueling: "การเปลี่ยนวัสดุ",
    noTransmission: "ไม่มีการส่ง",
    toMachine: "ฟีดไปยังโต๊ะ",
    reMaterial: "การรับวัสดุ",
    releasePoint: "จุดปล่อย",
    vehicleInspection: "การตรวจสอบยานพาหนะ",
    focusVehicle: "ยานพาหนะที่ต้องให้ความสนใจมี",
    numberLayers: "จำนวนชั้น",
    lessThan: "ต่ำกว่า",
    layer: "เลเยอร์",
    saveConfig: "กด OK เพื่อบันทึกการกำหนดค่า",
    warningTips: "มีรถที่ต้องให้ความสนใจกับเจ้าหน้าที่ฝ่ายปฏิบัติการและบำรุงรักษาโปรดติดตาม รถออฟไลน์อื่น ๆ {ofline}, หยุดรถออนไลน์ {warnings}.",
    normalTips: "สภาพรถใช้การได้ตามปกติ",
    charging: "ในการชาร์จ",
    uncharged: "ไม่มีการชาร์จ",
    /** agvstate_list.vue.vue end */

    /** cacheAgvBasketNum.vue start */
    cacheMachine: "กระเช้าดอกไม้สำหรับเครื่องแคช",
    step: "ขั้นตอน",
    cmTips: "ชั้น 2 (จำนวนกระเช้าดอกไม้) - [กลุ่ม]",
    stepErrTips: "การรับข้อมูลขั้นตอนล้มเหลว",
    /** agvstate_list.vue.vue end */

    /** door.vue start */
    openDoor: "เปิดแล้ว",
    closeDoor: "ปิด",
    confirmOpenDoor: "ยืนยันการเปิดประตู",
    confirmCloseDoor: "ยืนยันการปิด",
    /** door.vue end */

    /** offline_point_map.vue start */
    offlineDays: "จำนวนวันที่รถเข็นออฟไลน์ [วันที่ผ่านมา]",
    offlineTable: "ตารางข้อมูลจุดออฟไลน์",
    origin: "จุดกำเนิด",
    oneSpan: "หนึ่งช่วง",
    twoSpan: "สองช่วง",
    tips01: "ตารางจุดไม่ได้กำหนดค่า",
    tips02: "ข้อมูลตารางไม่ได้กำหนดค่า",
    machineConfig: "การกำหนดค่าตาราง",
    makeSvgErrTips01: "การตั้งค่าการเชื่อมต่อ {id} ของโต๊ะผิดพลาด",
    makeSvgErrMsg01: "ไม่มีการกำหนดค่า Dockpoint, Dockpoint: {doPoint}, Exitpoint: {exitpoint}",
    makeSvgErrMsg02: "ไม่มีเลขที่จุด, จุดเชื่อมต่อ: {doPoint}, จุดออก: {exitPoint}",
    pointGetfail: "การรับบิตออฟไลน์ล้มเหลว",
    /** offline_point_map.vue end */

    /** station.vue start */
    gxAbutment: "ขั้นตอนการเชื่อมต่อ (อุปกรณ์เสริม)",
    abutmentInfo: "ข้อมูลการเทียบท่าของโต๊ะ",
    stationQueryFail01: "การสอบถามข้อมูลโต๊ะทำงานล้มเหลว",
    stationQueryFail02: "แบบสอบถาม Live Table ข้อเสนอแนะ ข้อมูลล้มเหลว",
    stationQueryFail03: "ไม่ตรงกับโต๊ะเทียบท่า",
    stationQueryFail04: "การสอบถามสถานะแบบเรียลไทม์ของโต๊ะทำงานล้มเหลว",
    stationQueryFail05: "การสอบถามข้อมูลแคชโต๊ะล้มเหลว",
    /** station.vue end */

    /** stationCardList.vue start */
    stationInfo: "ข้อมูลตาราง",
    abutmentPoint: "จุดเชื่อมต่อ",
    threshold: "ตารางวัสดุพอร์ตวาล์วค่า",
    enableOrNot: "ไม่ว่าจะเป็นการเปิดใช้งาน",
    feedingStatus: "สถานะการให้อาหาร",
    blankingStatus: "สถานะ Blanking",
    feedQuantity: "จำนวนฟีด",
    dischargeQuantity: "จำนวนปล่อย",
    card: "บัตร",
    dockingSteps: "ขั้นตอนการเทียบท่า",
    stationState01: "ข้อมูลการรีเซ็ตโต๊ะ",
    stationState02: "ข้อมูลวัสดุของโต๊ะเครื่อง",
    stationState03: "อนุญาตให้ AGV เริ่มการส่งผ่าน",
    stationState04: "อนุญาตให้ออก AGV",
    stationState05: "โต๊ะทำงานผิดปกติ",
    stationState06: "แจ้ง AGV พร้อมเลี้ยว",
    stationState07: "ขอให้ AGV หยุดการส่งสัญญาณ",
    queryStepFail: "ขั้นตอนการเชื่อมต่อแบบสอบถามล้มเหลว",
    responseFail: "การตอบสนองล้มเหลว",
    queryAvgFail: "การสอบถามแคชสถานะ AGV ล้มเหลว",
    normal: "ปกติ"
    /** stationCardList.vue end */
    
  }
  
}
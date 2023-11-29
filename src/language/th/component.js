export default {
  welcome: "ยินดีต้อนรับ",
  directory: {
    debug: "การว่าจ้างอุปกรณ์",
    monitor: "การตรวจสอบแบบเรียลไทม์",
    query: "สอบถามธุรกิจ",
    analysis: "การวิเคราะห์ทางสถิติ",
    data: "ข้อมูลพื้นฐาน",
    system: "การจัดการระบบ",

    tips: "เปิด / ปิด"
  },
  menu:{
    home: "หน้าหลัก",

    map: "แผนที่โรงงาน",

    olog: "บันทึกการทำงาน",
    slog: "บันทึกการตั้งเวลา",

    machine: "การตรวจสอบ Docking Table",
    signal: "การตรวจสอบสัญญาณ AGV",
    mstatus: "สอบถามสถานะโต๊ะ",
    astatus: "สอบถามสถานะ AGV",
    process: "เรียลไทม์ในระบบ",
    qtime: "QTime แบบเรียลไทม์",
    mcache: "กระเช้าดอกไม้สำหรับเครื่องแคช",
    door: "ประตูอัตโนมัติ",

    thistory: "ประวัติการโอน",
    shistory: "ประวัติสถานะ AGV",
    astatistics: "สถิติความผิดปกติของ Agv",
    lineFixed: "เส้นตายอยู่ในระบบ",

    trolleyRate: "อัตราการจัดการรถเข็น",
    dailyRate: "อัตราการจัดการกระบวนการรายวัน",
    monthRate: "อัตราการจัดการกระบวนการรายเดือน",

    pointMap: "แผนที่การกระจายจุด",
    cacheStation: "สถานีแคช Layered Line",
    machineGroup: "การจัดกลุ่มไลน์แบบตั้งโต๊ะ",
    diagram: "แผนที่การกระจายสถานีเทียบท่า",

    step: "ขั้นตอน",
    astep: "พื้นที่ขั้นตอน",
    mplatform: "โต๊ะเครื่อง",
    machineCache: "เครื่องแคช",
    cacheMachineLayer: "เครื่องแคช Layering",
    cacheLocation: "ตำแหน่งแคช",
    distributionArea: "แผนที่การกระจายเขตท่อจราจร",
    point: "จุด จุด",
    decisionPoint: "ขยายจุดตัดสินใจ",
    standbyPoint: "ขยายจุดเตรียมพร้อม",
    route: "เส้นทาง",
    offLine: "แผนที่การกระจายจุดออฟไลน์",
    agv: "AGV",
    tControl: "หลอดจราจร",
    information: "การกำหนดค่าข้อมูลในระบบ",
    outputTarget: "เป้าหมายการผลิตกระบวนการ",
    cInformation: "ข้อมูลการกำหนดค่า",
    mPermission: "สิทธิ์เมนู",
    cPassword: "แก้ไขรหัสผ่าน",
    agvQtime:"AGV เวลาทำ",
    singleStation:"โต๊ะเครื่อง ปริมาณการขนส่ง",
    nextStations:"ถัดไป สามารถเลือกได้ โต๊ะเครื่อง",
		AgvChange: "人工修改目的地统计"
  },
  components: {
    /**stationCard.vue start */
    stationCard_C01:"ข้อเสนอแนะของตาราง",
    stationCard_C02:"ข้อเสนอแนะ AGV",
    stationCard_C03:"คำแนะนำของตาราง",
    stationCard_C04:"คำแนะนำ AGV",
    stationCard_C05:"AGV ในสถานที่",
    stationCard_C06:"ใบสมัคร โอน",
    stationCard_C07:"สมัครออก",
    stationCard_C08:"สิ้นสุดการถ่ายโอน",
    stationCard_C09:"บันทึกการโต้ตอบสัญญาณ",
    /**stationCard.vue end */

    /**agvInfoDetail.vue start */
    agvInfoDetail_C01: "พลังงานไฟฟ้า",
    agvInfoDetail_C02: "การดำเนินการตามคำสั่ง",
    agvInfoDetail_C03: "การดำเนินการที่ไม่ถูกต้อง",
    agvInfoDetail_C04: "การดำเนินการตามปกติ",
    agvInfoDetail_C05: "ต่อเนื่อง",
    agvInfoDetail_C06: "สถานะรถ",
    agvInfoDetail_C07: "เวลา",
    agvInfoDetail_C08: "สถานะวัสดุ",
    agvInfoDetail_C09: "blanking วัสดุ",
    agvInfoDetail_C10: "blanking วัสดุ",
    agvInfoDetail_C11: "ว่างเปล่า",
    agvInfoDetail_C12: "ท้องฟ้าเต็มไปด้วย",
    agvInfoDetail_C13: "ขึ้น ลง เต็ม",
    agvInfoDetail_C14: "ขึ้น เต็ม ลง เต็ม",
    agvInfoDetail_C15: "รถเข็น (AGV-{id}) ข้อมูล",
    agvInfoDetail_C16: "สถานะแบตเตอรี่",
    agvInfoDetail_C17: "หมายเลขเส้นทาง",
    /**agvInfoDetail.vue end */
    changeLanguageFail: "การสลับภาษาล้มเหลว โปรดลองอีกครั้งในภายหลัง",
  }
 
}
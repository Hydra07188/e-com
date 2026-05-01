const fs = require('fs');
const path = require('path');

// อ้างอิงไปยังตำแหน่งไฟล์ data.Json ที่อยู่ด้านนอกสุด
const dataPath = path.join(__dirname, '../data.Json');

exports.getAllProducts = () => {
    // อ่านไฟล์และแปลงเป็น JSON Object
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
};
const express = require('express');
const cors = require('cors'); 
const path = require('path'); // 1. เพิ่ม module path สำหรับจัดการที่อยู่ไฟล์

const app = express();
const PORT = 5500;

const productRoutes = require('./routes/routes');

app.use(cors()); 
app.use(express.json());

// 🌟 2. ลบ app.get('/') แบบเก่าทิ้งไป และเพิ่มบรรทัดนี้เข้ามาแทน
// คำสั่งนี้จะบอกให้ Express เสิร์ฟไฟล์หน้าเว็บ (HTML, CSS, JS, รูปภาพ) ทั้งหมดที่อยู่ในโฟลเดอร์นี้
app.use(express.static(path.join(__dirname)));

app.use('/api/products', productRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
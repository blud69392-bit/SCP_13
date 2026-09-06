const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Создаем папку для uploads если она не существует
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Настройка Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB лимит
  }
});

// Мідлвари для підключення CORS та читання JSON з тіла запитів
app.use(cors());
app.use(express.json());

// Раздаем статические файлы из папки uploads
app.use('/uploads', express.static(uploadsDir));

// Масив із новинами (база даних у пам'яті)
let newsData = [
  {
    id: 1,
    title: "Витік даних у секторі 4",
    date: "2026-09-01",
    text: "Проведено локалізацію дрібного витоку інформації. Ситуацію взято під контроль."
  },
  {
    id: 2,
    title: "Планове обслуговування",
    date: "2026-09-05",
    text: "Системи спостереження Чернівецького Ліцею №13 працюють у штатному режимі."
  }
];

// Масив із секретними аномаліями
const anomaliesData = [
  {
    id: "SCP-13-01",
    name: "Замурований 13-й кабінет",
    objectClass: "Euclid",
    description: "Приміщення, присутнє на кресленнях, але закладене цеглою."
  }
];

// Масив із архівними записами
let archiveData = [
  {
    id: 1,
    title: "Архівний запис #001",
    date: "2026-08-15",
    content: "Перша архівна запис у системі SCP 13."
  }
];

// 1. Отримання списку новин (Public GET)
app.get('/api/news', (req, res) => {
  res.json({
    success: true,
    data: newsData
  });
});

// 2. Публікація нової новини (POST с файлами)
app.post('/api/news', upload.fields([
  { name: 'videos', maxCount: 5 },
  { name: 'images', maxCount: 10 },
  { name: 'audio', maxCount: 3 },
  { name: 'files', maxCount: 5 }
]), (req, res) => {
  const { title, text } = req.body;

  if (!title || !text) {
    return res.status(400).json({
      success: false,
      message: "Будь ласка, вкажіть заголовок і текст новини!"
    });
  }

  // Обработка загруженных файлов
  const files = {
    videos: req.files['videos']?.map(f => ({ name: f.originalname, url: `/uploads/${f.filename}` })) || [],
    images: req.files['images']?.map(f => ({ name: f.originalname, url: `/uploads/${f.filename}` })) || [],
    audio: req.files['audio']?.map(f => ({ name: f.originalname, url: `/uploads/${f.filename}` })) || [],
    files: req.files['files']?.map(f => ({ name: f.originalname, url: `/uploads/${f.filename}` })) || []
  };

  const newArticle = {
    id: newsData.length + 1,
    title: title,
    text: text,
    date: new Date().toISOString().split('T')[0],
    files: files
  };

  newsData.unshift(newArticle); // Нова новина додається на початок списку

  res.json({
    success: true,
    message: "Новину успішно додано!",
    data: newArticle
  });
});

// 3. Отримання закритих аномалій (Protected GET)
app.get('/api/anomalies', (req, res) => {
  const accessKey = req.headers['x-access-key'];

  if (accessKey === 'Misha13SCP!') {
    res.json({
      success: true,
      data: anomaliesData
    });
  } else {
    res.status(403).json({
      success: false,
      message: "Доступ заборонено! Невірний ключ доступу."
    });
  }
});

// 4. Отримання архівних записів (Protected GET)
app.get('/api/archive', (req, res) => {
  const accessKey = req.headers['x-access-key'];

  if (accessKey === 'Misha13SCP!') {
    res.json({
      success: true,
      data: archiveData
    });
  } else {
    res.status(403).json({
      success: false,
      message: "Доступ заборонено! Невірний ключ доступу."
    });
  }
});

// 5. Додавання архівного запису (Protected POST с файлами)
app.post('/api/archive', upload.fields([
  { name: 'videos', maxCount: 5 },
  { name: 'images', maxCount: 10 },
  { name: 'audio', maxCount: 3 },
  { name: 'files', maxCount: 5 }
]), (req, res) => {
  const accessKey = req.headers['x-access-key'];
  const { title, content } = req.body;

  if (accessKey !== 'Misha13SCP!') {
    return res.status(403).json({
      success: false,
      message: "Доступ заборонено! Невірний ключ доступу."
    });
  }

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Будь ласка, вкажіть заголовок і зміст архівного запису!"
    });
  }

  // Обработка загруженных файлов
  const files = {
    videos: req.files['videos']?.map(f => ({ name: f.originalname, url: `/uploads/${f.filename}` })) || [],
    images: req.files['images']?.map(f => ({ name: f.originalname, url: `/uploads/${f.filename}` })) || [],
    audio: req.files['audio']?.map(f => ({ name: f.originalname, url: `/uploads/${f.filename}` })) || [],
    files: req.files['files']?.map(f => ({ name: f.originalname, url: `/uploads/${f.filename}` })) || []
  };

  const newArchiveEntry = {
    id: archiveData.length + 1,
    title: title,
    content: content,
    date: new Date().toISOString().split('T')[0],
    files: files
  };

  archiveData.unshift(newArchiveEntry);

  res.json({
    success: true,
    message: "Архівний запис успішно додано!",
    data: newArchiveEntry
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

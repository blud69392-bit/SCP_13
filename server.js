const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к Neon PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_If1DqPetyHQ3@ep-damp-rain-aycnwnsz-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

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

// Инициализация таблиц в базе данных
async function initDatabase() {
  try {
    // Таблица новостей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        date DATE NOT NULL,
        files JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица архивов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS archive (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        files JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// 1. Отримання списку новин (Public GET)
app.get('/api/news', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при отриманні новин'
    });
  }
});

// 2. Публікація нової новини (POST с файлами)
app.post('/api/news', upload.fields([
  { name: 'videos', maxCount: 5 },
  { name: 'images', maxCount: 10 },
  { name: 'audio', maxCount: 3 },
  { name: 'files', maxCount: 5 }
]), async (req, res) => {
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

  try {
    const result = await pool.query(
      'INSERT INTO news (title, text, date, files) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, text, new Date().toISOString().split('T')[0], JSON.stringify(files)]
    );

    res.json({
      success: true,
      message: "Новину успішно додано!",
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при створенні новини'
    });
  }
});

// 3. Отримання закритих аномалій (Protected GET)
app.get('/api/anomalies', (req, res) => {
  const accessKey = req.headers['x-access-key'];

  if (accessKey === 'Misha13SCP!') {
    res.json({
      success: true,
      data: [
        {
          id: "SCP-13-01",
          name: "Замурований 13-й кабінет",
          objectClass: "Euclid",
          description: "Приміщення, присутнє на кресленнях, але закладене цеглою."
        }
      ]
    });
  } else {
    res.status(403).json({
      success: false,
      message: "Доступ заборонено! Невірний ключ доступу."
    });
  }
});

// 4. Отримання архівних записів (Protected GET)
app.get('/api/archive', async (req, res) => {
  const accessKey = req.headers['x-access-key'];

  if (accessKey === 'Misha13SCP!') {
    try {
      const result = await pool.query('SELECT * FROM archive ORDER BY created_at DESC');
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching archive:', error);
      res.status(500).json({
        success: false,
        message: 'Помилка при отриманні архіву'
      });
    }
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
]), async (req, res) => {
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

  try {
    const result = await pool.query(
      'INSERT INTO archive (title, content, date, files) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, new Date().toISOString().split('T')[0], JSON.stringify(files)]
    );

    res.json({
      success: true,
      message: "Архівний запис успішно додано!",
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating archive entry:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка при створенні архівного запису'
    });
  }
});

// Инициализация базы данных и запуск сервера
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://192.168.1.6:${PORT}`);
    console.log(`Database: Connected to Neon PostgreSQL`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
});

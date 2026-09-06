const express = require('express');
const cors = require('cors');

const app = express();

// Дозволяємо запити з інших сайтів (наприклад, з вашого GitHub Pages)
app.use(cors());
app.use(express.json());

// --- БАЗА ДАНИХ У ПАМ'ЯТІ СЕРВЕРА ---
const publicNews = [
  { id: 1, title: "Планові роботи", date: "2026-09-06", text: "Систему безпеки Ліцею №13 успішно оновлено." },
  { id: 2, title: "Режим роботи", date: "2026-09-01", text: "Перепустки перевіряються на головному вході." }
];

const secretAnomalies = [
  { id: "SCP-67-13", name: "SCP_67_13 (Миша 67)", class: "Safe", description: "Секретний об'єкт кабінету." }
];

// Ключ доступу для робітників/власника (можна змінити на свій)
const WORKER_KEY = "Misha13SCP!";

// --- ПУБЛІЧНІ МАРШРУТИ (Для гостей) ---

// Отримати новини
app.get('/api/news', (req, res) => {
  res.json({ success: true, data: publicNews });
});

// Додати нову новину (гості теж можуть бачити оновлення, які додаються)
app.post('/api/news', (req, res) => {
  const { title, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ success: false, message: "Заповніть усі поля!" });
  }

  const newArticle = {
    id: publicNews.length + 1,
    title,
    date: new Date().toISOString().split('T')[0],
    text
  };

  publicNews.unshift(newArticle);
  res.json({ success: true, data: newArticle });
});

// --- ЗАКРИТІ МАРШРУТИ (Тільки для працівників та власника) ---

// Отримати секретні аномалії
app.get('/api/anomalies', (req, res) => {
  const userKey = req.headers['x-access-key'];

  if (userKey !== WORKER_KEY) {
    return res.status(403).json({ 
      success: false, 
      message: "ДОСТУП ЗАБОРОНЕНО: Необхідний рівень доступу 3 або вище." 
    });
  }

  res.json({ success: true, data: secretAnomalies });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[SCP FOUNDATION] Сервер запущено на порту ${PORT}`);
});
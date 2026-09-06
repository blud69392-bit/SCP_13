const API_URL = 'https://scp-13-backend.onrender.com';

// 1. Отримання публічних новин
async function loadNews() {
  try {
    const response = await fetch(`${API_URL}/api/news`);
    const result = await response.json();

    if (result.success) {
      console.log('[SCP FOUNDATION] Новини завантажено:', result.data);
    }
  } catch (error) {
    console.error('[SCP ERROR] Помилка завантаження новин:', error);
  }
}

// 2. Отримання закритих аномалій з ключем доступу
async function loadAnomalies() {
  try {
    const response = await fetch(`${API_URL}/api/anomalies`, {
      headers: {
        'x-access-key': 'Misha13SCP!'
      }
    });
    const result = await response.json();

    if (result.success) {
      console.log('[SCP FOUNDATION] Секретні аномалії отримано:', result.data);
    } else {
      console.warn('[SCP ACCESS DENIED]:', result.message);
    }
  } catch (error) {
    console.error('[SCP ERROR] Помилка доступу до аномалій:', error);
  }
}

// Запускаємо перевірку при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  loadAnomalies();
});

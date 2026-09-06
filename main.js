const API_URL = 'http://localhost:3000';

// 1. Отримання новин із сервера
async function loadNews() {
  try {
    const response = await fetch(`${API_URL}/api/news`);
    const result = await response.json();

    if (result.success) {
      renderNews(result.data);
    }
  } catch (error) {
    console.error('[SCP ERROR] Помилка завантаження новин:', error);
  }
}

// 2. Відображення новин у HTML
function renderNews(newsArray) {
  const container = document.getElementById('news-list');
  if (!container) return;

  container.innerHTML = '';

  newsArray.forEach(article => {
    const newsCard = document.createElement('div');
    newsCard.className = 'news-card-retro';
    
    let filesHTML = '';
    if (article.files) {
      // Видео с плеером
      if (article.files.videos && article.files.videos.length > 0) {
        filesHTML += '<div class="news-files-section"><h5>Відео:</h5>';
        article.files.videos.forEach(video => {
          filesHTML += `
            <div class="news-file-item">
              <video controls src="${API_URL}${video.url}" class="news-video-player"></video>
              <a href="${API_URL}${video.url}" download="${video.name}" class="news-download-btn">Завантажити</a>
            </div>
          `;
        });
        filesHTML += '</div>';
      }
      
      // Изображения
      if (article.files.images && article.files.images.length > 0) {
        filesHTML += '<div class="news-files-section"><h5>Зображення:</h5>';
        article.files.images.forEach(image => {
          filesHTML += `
            <div class="news-file-item">
              <img src="${API_URL}${image.url}" alt="${image.name}" class="news-image">
              <a href="${API_URL}${image.url}" download="${image.name}" class="news-download-btn">Завантажити</a>
            </div>
          `;
        });
        filesHTML += '</div>';
      }
      
      // Аудио с плеером
      if (article.files.audio && article.files.audio.length > 0) {
        filesHTML += '<div class="news-files-section"><h5>Аудіо:</h5>';
        article.files.audio.forEach(audio => {
          filesHTML += `
            <div class="news-file-item">
              <audio controls src="${API_URL}${audio.url}" class="news-audio-player"></audio>
              <a href="${API_URL}${audio.url}" download="${audio.name}" class="news-download-btn">Завантажити</a>
            </div>
          `;
        });
        filesHTML += '</div>';
      }
      
      // Другие файлы для скачивания
      if (article.files.files && article.files.files.length > 0) {
        filesHTML += '<div class="news-files-section"><h5>Інші файли:</h5>';
        article.files.files.forEach(file => {
          filesHTML += `
            <div class="news-file-item">
              <span class="news-file-name">${file.name}</span>
              <a href="${API_URL}${file.url}" download="${file.name}" class="news-download-btn">Завантажити</a>
            </div>
          `;
        });
        filesHTML += '</div>';
      }
    }
    
    newsCard.innerHTML = `
      <div class="news-card-header">
        <h4 class="news-card-title">${article.title}</h4>
        <span class="news-card-date">${article.date}</span>
      </div>
      <div class="news-card-content">${article.text}</div>
      ${filesHTML}
    `;
    
    container.appendChild(newsCard);
  });
}

// 3. Відправка нової новини на сервер (POST с файлами)
async function sendNews() {
  const titleInput = document.getElementById('news-title');
  const textInput = document.getElementById('news-content');
  const videosInput = document.getElementById('news-videos');
  const imagesInput = document.getElementById('news-images');
  const audioInput = document.getElementById('news-audio');
  const filesInput = document.getElementById('news-files');

  const title = titleInput.value.trim();
  const text = textInput.value.trim();

  if (!title || !text) {
    alert('Будь ласка, заповніть заголовок та текст!');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('text', text);

  // Добавляем файлы
  if (videosInput.files.length > 0) {
    for (let i = 0; i < videosInput.files.length; i++) {
      formData.append('videos', videosInput.files[i]);
    }
  }
  if (imagesInput.files.length > 0) {
    for (let i = 0; i < imagesInput.files.length; i++) {
      formData.append('images', imagesInput.files[i]);
    }
  }
  if (audioInput.files.length > 0) {
    for (let i = 0; i < audioInput.files.length; i++) {
      formData.append('audio', audioInput.files[i]);
    }
  }
  if (filesInput.files.length > 0) {
    for (let i = 0; i < filesInput.files.length; i++) {
      formData.append('files', filesInput.files[i]);
    }
  }

  try {
    const response = await fetch(`${API_URL}/api/news`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      alert('Новину успішно опубліковано!');
      titleInput.value = '';
      textInput.value = '';
      videosInput.value = '';
      imagesInput.value = '';
      audioInput.value = '';
      filesInput.value = '';
      loadNews(); // Автоматично оновлюємо список новин на сторінці
    } else {
      alert('Помилка: ' + result.message);
    }
  } catch (error) {
    console.error('Помилка відправки:', error);
    alert('Не вдалося з\'єднатися з сервером.');
  }
}

// 4. Отримання архівних записів із сервера
async function loadArchive() {
  try {
    const response = await fetch(`${API_URL}/api/archive`, {
      headers: {
        'x-access-key': 'Misha13SCP!'
      }
    });
    const result = await response.json();

    if (result.success) {
      renderArchive(result.data);
    }
  } catch (error) {
    console.error('[SCP ERROR] Помилка завантаження архіву:', error);
  }
}

// 5. Відображення архівних записів у HTML
function renderArchive(archiveArray) {
  const container = document.getElementById('archive-list');
  if (!container) return;

  container.innerHTML = '';

  archiveArray.forEach(entry => {
    const archiveCard = document.createElement('div');
    archiveCard.className = 'news-card-retro';
    
    let filesHTML = '';
    if (entry.files) {
      // Видео с плеером
      if (entry.files.videos && entry.files.videos.length > 0) {
        filesHTML += '<div class="news-files-section"><h5>Відео:</h5>';
        entry.files.videos.forEach(video => {
          filesHTML += `
            <div class="news-file-item">
              <video controls src="${API_URL}${video.url}" class="news-video-player"></video>
              <a href="${API_URL}${video.url}" download="${video.name}" class="news-download-btn">Завантажити</a>
            </div>
          `;
        });
        filesHTML += '</div>';
      }
      
      // Изображения
      if (entry.files.images && entry.files.images.length > 0) {
        filesHTML += '<div class="news-files-section"><h5>Зображення:</h5>';
        entry.files.images.forEach(image => {
          filesHTML += `
            <div class="news-file-item">
              <img src="${API_URL}${image.url}" alt="${image.name}" class="news-image">
              <a href="${API_URL}${image.url}" download="${image.name}" class="news-download-btn">Завантажити</a>
            </div>
          `;
        });
        filesHTML += '</div>';
      }
      
      // Аудио с плеером
      if (entry.files.audio && entry.files.audio.length > 0) {
        filesHTML += '<div class="news-files-section"><h5>Аудіо:</h5>';
        entry.files.audio.forEach(audio => {
          filesHTML += `
            <div class="news-file-item">
              <audio controls src="${API_URL}${audio.url}" class="news-audio-player"></audio>
              <a href="${API_URL}${audio.url}" download="${audio.name}" class="news-download-btn">Завантажити</a>
            </div>
          `;
        });
        filesHTML += '</div>';
      }
      
      // Другие файлы для скачивания
      if (entry.files.files && entry.files.files.length > 0) {
        filesHTML += '<div class="news-files-section"><h5>Інші файли:</h5>';
        entry.files.files.forEach(file => {
          filesHTML += `
            <div class="news-file-item">
              <span class="news-file-name">${file.name}</span>
              <a href="${API_URL}${file.url}" download="${file.name}" class="news-download-btn">Завантажити</a>
            </div>
          `;
        });
        filesHTML += '</div>';
      }
    }
    
    archiveCard.innerHTML = `
      <div class="news-card-header">
        <h4 class="news-card-title">${entry.title}</h4>
        <span class="news-card-date">${entry.date}</span>
      </div>
      <div class="news-card-content">${entry.content}</div>
      ${filesHTML}
    `;
    
    container.appendChild(archiveCard);
  });
}

// 6. Відправка нового архівного запису на сервер (POST с файлами)
async function sendArchive() {
  const titleInput = document.getElementById('archive-title');
  const contentInput = document.getElementById('archive-content');
  const videosInput = document.getElementById('archive-videos');
  const imagesInput = document.getElementById('archive-images');
  const audioInput = document.getElementById('archive-audio');
  const filesInput = document.getElementById('archive-files');

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert('Будь ласка, заповніть заголовок та зміст!');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);

  // Добавляем файлы
  if (videosInput.files.length > 0) {
    for (let i = 0; i < videosInput.files.length; i++) {
      formData.append('videos', videosInput.files[i]);
    }
  }
  if (imagesInput.files.length > 0) {
    for (let i = 0; i < imagesInput.files.length; i++) {
      formData.append('images', imagesInput.files[i]);
    }
  }
  if (audioInput.files.length > 0) {
    for (let i = 0; i < audioInput.files.length; i++) {
      formData.append('audio', audioInput.files[i]);
    }
  }
  if (filesInput.files.length > 0) {
    for (let i = 0; i < filesInput.files.length; i++) {
      formData.append('files', filesInput.files[i]);
    }
  }

  try {
    const response = await fetch(`${API_URL}/api/archive`, {
      method: 'POST',
      headers: {
        'x-access-key': 'Misha13SCP!'
      },
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      alert('Архівний запис успішно додано!');
      titleInput.value = '';
      contentInput.value = '';
      videosInput.value = '';
      imagesInput.value = '';
      audioInput.value = '';
      filesInput.value = '';
      loadArchive(); // Автоматично оновлюємо список архіву на сторінці
    } else {
      alert('Помилка: ' + result.message);
    }
  } catch (error) {
    console.error('Помилка відправки:', error);
    alert('Не вдалося з\'єднатися з сервером.');
  }
}

// Автоматичне завантаження новин при відкритті сторінки
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
});

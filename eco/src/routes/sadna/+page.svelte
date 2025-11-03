<script>
    let name = '';
    let phone = '';
    let message = '';
  
    const submitForm = async () => {
      const telegramBotToken = 'YOUR_TELEGRAM_BOT_TOKEN';
      const chatId = 'YOUR_TELEGRAM_CHAT_ID';
      const text = `פנייה חדשה:\nשם: ${name}\nטלפון: ${phone}\nהודעה: ${message}`;
      const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
  
      alert('הפרטים נשלחו בהצלחה!');
      name = '';
      phone = '';
      message = '';
    };
  
    const images = [
      '/images/jewelry1.jpg',
      '/images/jewelry2.jpg',
      '/images/jewelry3.jpg',
    ];
  </script>
  
  <style>
    .gradient-bg {
      background: linear-gradient(90deg, #f8c291, #f78fb3);
      color: #fff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
  
    button {
      background-color: #f8c291;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  
    button:hover {
      background-color: #e77f67;
    }
  
    input, textarea {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
  
    .gallery {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }
  
    .gallery img {
      width: calc(33% - 10px);
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;
    }
  
    .gallery img:hover {
      transform: scale(1.05);
    }
  </style>
  
  <div class="gradient-bg">
    <h1>עצבו את התכשיט המושלם שלכם</h1>
    <p>סדנה ליצירת תכשיטים אישיים מפנינים וחרוזים</p>
  </div>
  
  <div>
    <h2>מה בסדנה?</h2>
    <ul>
      <li>לומדים טכניקות חדשות</li>
      <li>יוצרים תכשיט בעיצוב אישי</li>
      <li>מחדשים ומשדרגים תכשיטים ישנים</li>
    </ul>
  </div>
  
  <div class="gallery">
    {#each images as image}
      <img src={image} alt="תכשיט מעוצב" />
    {/each}
  </div>
  
  <div>
    <button onclick={location.href='https://wa.me/+97258151719'}>שלחי הודעה בווצאפ</button>
  </div>
  
  <div>
    <h2>השאירו פרטים ונחזור אליכם</h2>
    <form onsubmit={submitForm}>
      <input
        type="text"
        placeholder="שם"
        bind:value={name}
        required
      />
      <input
        type="tel"
        placeholder="טלפון"
        bind:value={phone}
        required
      />
      <textarea
        placeholder="הודעה"
        bind:value={message}
      ></textarea>
      <button type="submit">שלחי</button>
    </form>
  </div>

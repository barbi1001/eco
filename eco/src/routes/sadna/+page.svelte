<script>
    let name = $state('');
    let phone = $state('');
    let message = $state('');
    let isLoading = $state(false);
    let status = $state(null); // null | 'success' | 'error'

    const submitForm = async (event) => {
      event.preventDefault();
      if (!name || !phone || isLoading) return;

      isLoading = true;
      status = null;

      try {
        // Server endpoint — the Telegram credentials must never reach the browser.
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, message, source: 'סדנה' })
        });

        if (!res.ok) throw new Error(`Contact request failed: ${res.status}`);

        status = 'success';
        name = '';
        phone = '';
        message = '';
      } catch (error) {
        console.error('Contact submit failed:', error);
        status = 'error';
      } finally {
        isLoading = false;
      }
    };
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

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }

    .cta {
      background-color: #f8c291;
      color: #fff;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 700;
    }

    .cta:hover {
      background-color: #e77f67;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .status {
      margin: 10px 0 0;
      font-weight: 700;
    }

    .status.success { color: #15803d; }
    .status.error { color: #b91c1c; }
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

  <div class="actions">
    <a class="cta" href="/tachshit-ishi">לעצב תכשיט אונליין עכשיו</a>
    <a class="cta" href="https://wa.me/972585171519" target="_blank" rel="noopener noreferrer">
      שלחי הודעה בווצאפ
    </a>
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
      <button type="submit" disabled={!name || !phone || isLoading}>
        {isLoading ? 'שולח...' : 'שלחי'}
      </button>

      {#if status === 'success'}
        <p class="status success">הפרטים נשלחו בהצלחה! נחזור אלייך בהקדם.</p>
      {:else if status === 'error'}
        <p class="status error">
          לא הצלחנו לשלוח את הפרטים. אפשר לנסות שוב, או לפנות בווצאפ.
        </p>
      {/if}
    </form>
  </div>

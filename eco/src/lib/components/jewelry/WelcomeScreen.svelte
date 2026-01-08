<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  interface Props {
    onStart?: () => void;
  }

  let { onStart }: Props = $props();

  function handleStart() {
    onStart?.();
  }
</script>

<div class="welcome-screen" in:fade={{ duration: 600 }}>
  <div class="welcome-content" in:fly={{ y: 30, duration: 800, delay: 200, easing: quintOut }}>
    <div class="welcome-icon">💎</div>
    <h1 class="welcome-title">ברוכה הבאה למעצבת התכשיטים</h1>
    <p class="welcome-subtitle">
      צרי תכשיט ייחודי ומותאם אישית בקלות ובמהירות
    </p>
    
    <div class="features">
      <div class="feature">
        <span class="feature-icon">✨</span>
        <p>בחרי מתבניות מעוצבות</p>
      </div>
      <div class="feature">
        <span class="feature-icon">🎨</span>
        <p>התאימי רכיבים לפי טעמך</p>
      </div>
      <div class="feature">
        <span class="feature-icon">💝</span>
        <p>קבלי תכשיט מושלם</p>
      </div>
    </div>
    
    <button class="start-button" onclick={handleStart}>
      התחילי לעצב
    </button>
  </div>
</div>

<style>
  .welcome-screen {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .welcome-content {
    text-align: center;
    max-width: 600px;
  }
  
  .welcome-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  .welcome-title {
    font-family: 'MakabiYG', sans-serif;
    font-size: 2.5rem;
    font-weight: bold;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
  }
  
  .welcome-subtitle {
    font-size: 1.25rem;
    color: #6b7280;
    margin-bottom: 3rem;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .feature-icon {
    font-size: 2rem;
  }
  
  .feature p {
    font-size: 1rem;
    color: #374151;
    margin: 0;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .start-button {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    color: #374151;
    font-weight: 600;
    padding: 1rem 3rem;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    font-size: 1.25rem;
    font-family: 'MakabiYG', sans-serif;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(191, 149, 63, 0.3);
  }
  
  .start-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(191, 149, 63, 0.4);
  }
  
  .start-button:active {
    transform: translateY(-1px);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .welcome-title {
      font-size: 2rem;
    }
    
    .welcome-subtitle {
      font-size: 1.1rem;
    }
    
    .features {
      gap: 1.5rem;
    }
    
    .start-button {
      padding: 0.875rem 2.5rem;
      font-size: 1.1rem;
    }
  }
  
  @media (max-width: 480px) {
    .welcome-icon {
      font-size: 3rem;
    }
    
    .welcome-title {
      font-size: 1.75rem;
    }
    
    .welcome-subtitle {
      font-size: 1rem;
      margin-bottom: 2rem;
    }
    
    .features {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>

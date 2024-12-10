<script>
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { Drawer } from "vaul-svelte";
    import { quintOut, backOut } from 'svelte/easing';
    import { page } from '$app/stores';
    import WhatsappButton from '$lib/comonents/whatsappButton.svelte';
    import HeartScene from '$lib/comonents/HeartScene.svelte';
    import HeartButton from '$lib/ui/heartButton.svelte';
    import { Canvas } from '@threlte/core';
    import Crown3D from '$lib/components/Crown3D.svelte';
    import { Send, Check } from 'lucide-svelte';
    import { Head } from 'svead';
	import { goto } from '$app/navigation';

    let name = '';
    let phone = '';
    let message = '';
    let stars = [];
    let b = false;
    let dialogOpen = false;
    let isLoading = false;
    let isSuccess = false;

    async function submitForm(event) {
      if (!name || !phone) return;
      
      isLoading = true;
      isSuccess = false;
      try {
        const Token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
        const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
        const text = `פנייה חדשה:
        %0A שם: ${name}
        %0A טלפון: ${phone}
        %0A הודעה: ${message}`;
        const url = `https://api.telegram.org/bot${Token}/sendMessage?chat_id=${chatId}&text=${text}`;

        await fetch(url);

        isSuccess = true;
        
        // Show success message and close after delay
        setTimeout(() => {
          dialogOpen = false;
          name = '';
          phone = '';
          message = '';
          isSuccess = false;
        }, 10000);
      } catch (error) {
        console.error('Error:', error);
        alert('אירעה שגיאה, אנא נסי שוב');
      } finally {
        isLoading = false;
      }
    }

    const starCount = 100;
    const sparkle = 20;
  
    onMount(() => {
      for(let i = 0; i < starCount; i++) {
        let size = i % 2 === 0 ? 'small' : i % 3 === 0 ? 'medium' : 'large';
        stars.push({
          top: Math.random() * 100,
          left: Math.random() * 100,
          delay: Math.random() * sparkle,
          size: size
        });
      }
      stars = stars
    });
</script>

<Head
    title="תכשיט משלי - עיצוב תכשיטים בהתאמה אישית | ברבי עיצובים"
    description="הצטרפי למפגש יצירת תכשיטים מיוחד עם נוף פנורמי לכינרת. למדי טכניקות מסורתיות וחדשניות ליצירת תכשיטים בעבודת יד בהתאמה אישית בסטודיו של ברבי."
    canonical="https://barbracha.vercel.app/sadnaot"
    openGraph={{
        title: 'תכשיט משלי - עיצוב תכשיטים בהתאמה אישית | ברבי עיצובים',
        description: 'הצטרפי למפגש יצירת תכשיטים מיוחד עם נוף פנורמי לכינרת. למדי טכניקות מסורתיות וחדשניות ליצירת תכשיטים בעבודת יד בהתאמה אישית בסטודיו של ברבי.',
        url: 'https://barbracha.vercel.app/sadnaot',
        siteName: 'ברבי עיצובים',
        image: {
            url: 'https://res.cloudinary.com/barb1/image/upload/v1672529650/%D7%A6%D7%99%D7%9C%D7%95%D7%9D_%D7%9E%D7%A1%D7%9A_20221108_142006_tmkrfo.png',
            width: 1080,
            height: 1080,
            alt: 'עיצוב תכשיטים עם נוף לכינרת - ברבי עיצובים'
        }
    }}
/>

<div class="starshine">
    {#each stars as star (star.top + star.left)}
      <div class=" shine {star.size}" style="top: {star.top}%; left: {star.left}%; animation-delay: {star.delay}s;"></div>
    {/each}
  
  <div data-vaul-drawer-wrapper class="h-screen overflow-auto w-screen bg-pinki
    flex flex-col justify-start items-center">
    <Drawer.Root  bind:open={dialogOpen}  shouldScaleBackground>
        <div class="text-center -mt-44">
            <div class="crown-container relative h-[32rem] -mb-44">
                <Canvas>
                    <Crown3D />
                </Canvas>
            </div>
            <h1 class="text-5xl font-bold mb-3 sparkly-uv font-[MakabiYG]">תכשיט משלי</h1>
            <p class="sm:px-28 text-2xl mb-6 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-transparent bg-clip-text font-[MakabiYG]">ברבי מזמינה אותך ליצירת תכשיט בהתאמה אישית <br> בסטודיו עם נוף פנורמי מרהיב לכינרת, תגלי את הקסם שבעיצוב תכשיטים בעבודת יד, תוך שילוב של טכניקות מסורתיות וחדשניות ומיומנויות מקצועיות.</p>
            <h2 class="text-3xl font-[MakabiYG] mb-4 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-transparent bg-clip-text sparkly-uv pearl-effect">?איך יוצרות תכשיט בעיצוב אישי</h2>
            <ul class="benefits-list space-y-5">
              <li class="bg-pink-50 p-5 rounded-lg shadow-lg border-2 border-pink-200 flex flex-row-reverse gap-2 justify-center text-indigo-600 cool-hover font-bold">
                <div class="heart-number ml-2"><span>1</span></div> קובעות תאריך למפגש יצירה ועיצוב
              </li>
              <li class="bg-pink-50 p-5 rounded-lg shadow-lg border-2 border-pink-200 flex flex-row-reverse gap-2 justify-center text-indigo-600 cool-hover font-bold">
                <div class="heart-number ml-2"><span>2</span></div> מגיעות עם תכשיט לתיקון או רעיון לתכשיט חדש
              </li>
              <li class="bg-pink-50 p-5 rounded-lg shadow-lg border-2 border-pink-200 flex flex-row-reverse gap-2 justify-center text-indigo-600 cool-hover font-bold">
                <div class="heart-number ml-2"><span>3</span></div> מעצבות ביחד את התכשיט המושלם עבורך
              </li>
              <li class="bg-pink-50 p-5 rounded-lg shadow-lg border-2 border-pink-200 flex flex-row-reverse gap-2 justify-center text-indigo-600 cool-hover font-bold">
                <div class="heart-number ml-2"><span>4</span></div> מקבלות תכשיט שעוצב במיוחד בשבילך
              </li>
            </ul>
          </div>
    
      <Drawer.Trigger/>
  <div class="flex flex-col items-center justify-center align-middle pb-2 mb-2 nod w-full">
     
      <button on:click={(()=>dialogOpen=true)} class="p-2 mb-2 focus:outline-none bg-transparent hover:bg-transparent">
        <div class="heart-container relative w-full h-[300px] max-w-[400px] -mb-20">
          <span class="absolute top-8 left-1/2 transform -translate-x-1/2 text-4xl font-extrabold font-[MakabiYG] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-transparent bg-clip-text">להזמנה</span>

          <Canvas>
            <HeartScene />
          </Canvas>
        </div>
      </button>
      <WhatsappButton text="מפגש עיצוב תכשיטים"	rotate={true}/>
  </div>
    <Drawer.Portal>
      <Drawer.Overlay class="fixed inset-0 bg-black/40" />
            <Drawer.Content
                  class="z-50 fixed bottom-0 left-0 right-0 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-zinc-100 border-t-2 border-pink-700"
              >
             

                  <div class="flex-1 rounded-t-[10px] bg-pinki p-4 z-[51]" dir="rtl">
                 

                      <div class="mx-auto  h-1.5   starshine" >
                        {#each stars as star (star.top + star.left)}
                          <div class=" shine {star.size}" style="top: {star.top}%; left: {star.left}%; animation-delay: {star.delay}s;"></div>
                        {/each}
                      <div class="mx-auto max-w-md text-center">
                          <Drawer.Title class="mb-4 text-2xl font-[MakabiYG] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-transparent bg-clip-text sparkly-uv">כמה פרטים כדי שהמפגש יהיה  מושלם</Drawer.Title>
                          {#if b == false}
                          <div class="">
                            <h2 class="text-lg font-medium bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#d462cb] text-transparent bg-clip-text mb-4 sparkly-uv pearl-effect">השאירי פרטים ואני אחזור אלייך בהקדם!</h2>
                            <form class="flex flex-col space-y-4" on:submit|preventDefault={submitForm}>
                                <input
                                  class="text-indigo-600 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
                                  type="text"
                                  placeholder="שם מלא"
                                  bind:value={name}
                                  required
                                  dir="rtl"
                                />
                                <input
                                  class="text-indigo-600 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
                                  type="tel"
                                  placeholder="טלפון נייד"
                                  bind:value={phone}
                                  required
                                  dir="rtl"
                                  pattern="[0-9]*"
                                  inputmode="numeric"
                                />
                                <textarea
                                  class="text-indigo-600 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10 min-h-[100px] resize-y"
                                  placeholder="הודעה (אופציונלי)"
                                  bind:value={message}
                                  dir="rtl"
                                ></textarea>
                                <button 
                                  class="z-[1000] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-gray-900 font-medium rounded-lg text-base px-6 py-3 text-center
                                  hover:to-pink-600 hover:from-pink-600 hover:via-[#FCF6BA] transition-all duration-300 hover:opacity-70 focus:ring-4 focus:ring-[#BF953F] focus:ring-opacity-50 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden"
                                  type="submit"
                                  disabled={!name || !phone || isLoading}
                                >
                                  {#if isSuccess}
                                    <div 
                                      class="success-container"
                                      in:fly={{ y: 20, duration: 400, easing: backOut }}
                                      out:fade
                                    >
                                      <Check class="check-icon" size={24} />
                                      <span class="inline-block">נשלח בהצלחה!</span>
                                    </div>
                                
                                  {:else}
                                    <Send 
                                      class="send-icon {isLoading ? 'send-loading' : ''}"
                                      size={20}
                                    />
                                    {#if isLoading}
                                      <span class="inline-block">שולח...</span>
                                    {:else}
                                      <span class="inline-block">לשליחת פרטים</span>
                                    {/if}
                                  {/if}
                                </button>
                              </form>
                          </div>
      {:else}
      תכף
      {/if}
      {#if isSuccess}
      <button on:click={()=> goto('/')} class="z-[1000] mt-4 bg-transparent text-white font-bold rounded-lg text-lg px-6 py-3 transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-4
         focus:ring-[#22c55e] focus:ring-opacity-50 transform hover:-translate-y-0.5">
        <HeartButton text="לדף הבית" className="text-white" />
      </button>
      {/if}
                      </div>
                  </div>
              </div>
              </Drawer.Content>
      </Drawer.Portal>
  </Drawer.Root>
    </div>

  </div>
  
  <style>
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .heart-container {
          perspective: 1000px;
          margin: 0 auto;
          animation: float 3s ease-in-out infinite;
        }

        .heart-container :global(canvas) {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain;
        }
.starshine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}    
        .shine {
          display: block;
          position: absolute;
          top: 50%;
          left: 50%;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAMAAACJuGjuAAADAFBMVEX///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/LkhhAAAA/3RSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7rCNk1AAAbWElEQVR4AezcS8uU9QOHcf3/ayFWYyHixlnYAREHa9GhGCSxFjIgFthhxI1Y+RRibmwQEcRirIWIiynosBAHsRYiDG7sEMxGnoXII+LGgqmFWIueQNyIXcHNj3sffO/d9XkJ1wu4lvwXesQETdBqE6gJHROoCS+bQE3omUBNeM8EasKHJlAThiZogr4wQRM0NkET9LMJmqB5EzRBMxM0QX+boAliiZT3EA8bQXmP8pgRlNembQTlPclTRlBeh44RlPciLxlBeZvYZATl9egZQXmv8boRlNenbwTlvcO7RlDe+3xgBOUNGBhBeUc4YgTlDRkaQXmnOGUE5Y343AjKGzM2gvK+5TsjKG/CxAjK+5GfjKC8KVMjKG+BBSMo7wY3jKC8GTMjKO8P/jSC8hZZNILy/gEjKO4B4EEzKK0FtMygtNXAajMorQ1eQZS3AdhgBqU9DTxjBqV1ga4ZlPYK8KoZlNYDryDKewt42wxK2wXsMoPS5oA5MyjtAHDADEobgFcQ5X0MfGIGpX0KfGYGpY2AkRmU9jXwjRmUNgavIMq7AFwwg9IuAhfNoLQpOG9Q3jwwbwalLYBXEOX9AvxqBqX9BvxuBqUtgvMG5d0F7ppBaQCYQWHLAVhuCGWtAGCFIZTVBucNynscgCcMoawOAB1DKOt5AF4whLK64BVEeT1w3qC87QBsN4Sy+gD0DaGsPQDsMYSy5sAriPI+AucNyjsMwGFDKGsIwNAQyjoJwElDKGsEXkGUdwaAM4ZQ1jkAzhlCWRMAJoZQ1vcA/GAIZU3BK4jyrgJw1RDKug7AdUMoawbAzBDKug3AbUNkaRHyVxDpPgD3DRGl/0Hl/6ZIUgsqLVMkaRVUVpkiSW3IX0Gk9VBZb4okbYTKRlMkqQv5eYO0BSpbTJGkHuSvINIbUHnTFEnaCZWdpkjSHOTnDdJ+qOw3RZIGkL+CSMegcswUSToOleOmSNII8vMG6UuofGWKJI2hMjZFks5D5bwpkjSB/BVEmkJ+3iBdhsplUyRpASoLpkjSTajcNEWSZpC/gkh/QX7eIN2Byh1TJAkKUwRpGRTLjJGjFuSvINIaKNYYI0droVhrjBx1oOgYI0fPQvGcMXLUhfwVRNoKxVZj5GgbFNuMkaM+FH1j5Gg3FLuNkaM5yF9BpINQHDRGjg5BccgYORpCMTRGjk5AccIYORpB/goinYbitDFydBaKs8bI0QTy8wbpEhSXjJGjKeSvINIVKK4YI0fXoLhmjBzNID9vkG5BccsYOVqE/BVEugfFPWPEaCnUlpojRS3IzxuklVBbaY4UtaHWNkeK1kFtnTlS1IH8FUTqQn7eIG2G2mZzpKgHtZ45UrQDajvMkaI+5K8g0l6o7TVHivZBbZ85UjSA2sAcKToKtaPmUP4J8i979/7fVGH/cfwdAgXKpQRE7YCCGYJOqpOgKGNeWAQVZE6MDxQFnC7aydTxZaa4L2MyB5kXp2NWog8Fpx0zXlCUL2oEQRBRgkrVDcHIfShCLJQLxZL3t1ww55yENpdzTnP5PP+G/tDzOvm8j6yCCB09yqhHkYtEIZrA44x6HKZr1hPCaMWnw3yVjKqE2VoOt0AY7vzLYLqXGPUiTGb7QwGECUbe2oSbIOavgnSbXQRhivKpFphrMaMWw1RnLu8KYZKKfxTAVMsYtQxmGrSxFMIs1lcC7WCmKkZVwUSjagZBmKdw+cfFMNEaRq2BeTwHR8FMovPa9T8yfxPE5FUQ63SWw1yi57bwT2GaMKPCMEnrl1gBs4n+e/ZdDbPUMGoXzNHxXb5ihenE8LqDd8AkVIIpTlnN5YVoAuKGCB+0wAwtqdQSJui7lWs7o0mIcvJfLc3eBDFnFWRIDbf1RBMRFeTbHWC8LlTqAsPdeIB7+kM0XSglP+kGw/WgUg8YbVKEB4ajKUkoJTeXmjndYMJ4g/VxMjIKTUtCKVl9MQzWj0r9YKg2r8rFRkaEUrL2WrM2QUxYBTnxfVLCaEaEUjLyOxjqUioNgYF6riUljGZIKCX5NysMNIxKw2Ccc7eREkYzRBnrvdjK8OkGE8YbrthNShjNrKu/pR1hmLFUGgujuOtICaOZw/Is6/2nB4xSRqUyGMMyhaSE0UxSsID1tp4Ng0yg0gQYosVM1qsbDpE5iqpYb9dgGGMiafgqSLvXeUgZRCbpuon1DowxcrrB0PGGk1fKMERGOm0b60X+F0Z4kEoPQH+91/GQZy0QGRhK682wQn8VVKqA7n6yg4csKEBmklBKzm0D3c2i0izo7aq9PKSqCJlKQim5vLMRmyBGroKMq+MhG7pCZPI82tofGjDdYNx4g+UvJDM/jEooJb8+B/p6g0pvQE8FlWRWhFEJpeTuodDVEiotgY6KFpBZEkYllJJ1N0NPK6kUhH66rCKzJoxKKK13j0XfTRBjVkH6bMySxVxRWs0jnmpuzHQDuR56uShMZkkYFYNqecT8ttDLFiptgU6u2U9mTRgVoyI8IngydFJNpWro47cRMhvDqHyf5Mte0EctlWqhh2YP86hNXZEVRAWP2j4AuqAadNDKz6OqS5E15ED6qL1XQgftqdYeabMt5lG1g5AtROFCHlV3G9LXiWodka7un/GwLD15llBab5oF6SqhWgnSdNaWbP9InYRS8pkCpKk31XohPc6dPKYCWUpCKflWe103QdJeBbm+lse8ZEW2klBKrvoB0jKAagOQjokRUsJoLoRScsMZSMeFVLsQqbM+SlLCaG6EUjJ8AdIwlGpDkbLWc0gJozkTSsn9LqRuBNVGIFWd3iMljOZQKCUP3pn+JkjaqyD2z0kJo7mxJBn1UDOk6BaquZGafltJCaO5siQZ9VxLpGYc1VKs+ZfWkBJGc2dJMmqRLfWngPTHG375HSlhNJcOpKM+7YZUTKbaZKRgcoRRObEFKQfSUZvPTGcTJI1VkOZPUEG2IHNBGRV2DkLyplNtOpLVZh4VZAsyN/yBCrWjkLQZVJuBJJ30ARXk5DlXVFAh4klzuiH58YZTv6CCnDznVChVmG5Fcl6g2vNISv9tVJCT51wNpeRLrZPeBEljFWT4HipE3MhREkrJdzsiGYuo9jaScGsdmR9hVEIpufoUJGEp1ZYiYZZ7qVKBHCahlNzaN7nphhTHG1o8TTJ/wqiEUrJmCBK2mmqrkaB2b5ISRnNdGVUOjE1xE4TcgMQUf0hKGM1906gSmYQEbafadiTk9HVk3oRRWZJUeNyKhOykWjUSMXAHmUdhVJYkFV5tg0RQCwkYsY/MqzAqB9IK75+IxhVQqwUadXsd1cqQ6+RAWmFtTzSqiFpFaITlfmpMQ+6TA2mFbeeiMcXUKkbDCmZTQ7Ygc90Fe6i2e1iymyCNroJ0WEiNvDt5llBK1rmTnG5obLyhaxU15OQ5H5RRa4oFDelLrb5oQJ9N1JCT5/wwjVozW6ABA6k1EMd38bfU2F6KvCShlHy9HY5vMLUuwXGN3E9KGJVQeszKkxPcBGlkFWRChJQwKqE0al3vhKcbyGsRX7NHqCRhVEIpuWMAjmM0tUYjrlYvkBJGJZRq7L0q4cfIMsTT8R1SwqgsSVKrbhziGk+t8Yij+79JCaNiVIQx/mJBHOXUKkesH/+X9SSMinLGerYAsaZSaypiXLKLh0kYFRWMtaAIMe6n1n3QGn2AWrIFKQfSCqu6JPAHWAGNuyNUky1IOZDW2HgGNGZS6ymoWB+jgmxBis6fMlb4okY2QbSrIIUvM45yCAmlKvuvgcpcas2FwgnLGUcFhIRSjchvoTSfWvMRZV9DLTl5VpJQqvDXZohaQq0l+N45XzGOJYUQEkrj8LfC91ZQ6wMcc/luUsJooiSUkottsZsgsasgN31HShhNnIRS8rMSHLWOWl/iiD9SS8KoloRSrS1n4YjN1NqEQ5o/yVgSRrUklGrtdOKwampVo17b/yMljCZCliQ1aq/HIfuotQ/ASStICaOJkSVJjUg56jEW0CtEShhNmCxJajxqRVvGanvedlLCaOLkQFprTmsbY43Zy7hkC1JolTG+ZWczYbIFGUtMY3xbmRDZgoxPWGYyPXLy3DgJpY2Tk+f0SChNUBkaJySUJmsKRJIklGpJGE2fhFItCaP6kVCqIWE0DRJKJYyaQEKphNE0yZKkhFHjyJKkhFETyJKkhFGRpja2EvsVe5iwBT9znG0vsbWByHvNbSfaT3cMdA533eie4Jnq9T3hfzGwKFgV2hLez5TtD28JVQUXBV70P+HzTvVMcN/oGu4c6DjdfpKtOXKFaGfrYXf0cw5xXece55nsfcT3rH9+4P3gF1+Gq9kEqsNffhF8PzDf/6zvEe9kzzj3da4hzn4Oew9bO4gMU2Artp/huMB5pesm910e732+J/1zAu8EPw1tDR9gFjkQ3hr6LPhOYI7/Sd99Xs9d7ptcVzovcJxhL7YVQBijyGbv6TjXeZnrevftnnu8033/9L8RWLEytD68i3lhV3h9aOWKwBv+f/r+7r3Hc7v7etdlznMdPe22IogGtbJ1sZc6LnJe5frVLZ6J3gd8M/2vBJYG/xP6OlxH0YC68Neh/wSXBl7xz/Q94J3oueVXrhHOixyl9i62VsgPtk72Xo7znENdo913ev7krfD9yx94K/hRaGN4N4Uhdoc3hj4KvhXw/8tX4f2T5073aNdQ53mOXvZONmSVQls3+1mOQU7XNe4yz++9D/me9r8aWBb8PPRNOEKRUSLhb0KfB5cFXvU/7XvI+3tPmfsal3OQ4yx7N1shmoDV1tl+mmOA8wrXWPd4z5+9M3z+FwILg6tCm8N7KXLE3vDm0KrgwsALft8M7589491jXVc4BzhOs3e2WZG6trbu9rMdzsGuke7bPJO8D/ue8c8LLA+uDe34lnlPfLsjtDa4PDDP/4zvYe8kz23uka7BzvpC3N3WFhodOjvOd43x3Ot7LvBRqIYpEqIm9FHgOd+fPWNc5yNWe9spdsc5h8Pib+rD4t98lfVh8YNDYXEn857YeSj0flAfeit9f6sPvb85HHrPcdhPsbVP61XISYdfhfz88KuQacdehXyifRUiso321dQnx15NTTv8aurnzoGOHzXVq6m2thL72Y6fXeIa6f61Z5L3r75/+OcF3guuCe0IU2SY8I7QmuB7gXn+fxz+V+nX7pGuS468TG+LbNLMdoK9t2OAc5hrjHu8517vY77nng8sDH4c2hTeQ2GIveFNoY+DCwPPP+d7zHuvZ7x7jGuYc4Cjt/0EWzPkhda2rvYzHRc7r3a5b/Xc7X3QN8s/N/BucHVoW/ggRQMOhreFVgffDcz1z/I96L3bc6vbdbXzYseZ9q621hAN6tDRfqqjv/Ny1/XuOzxTvH/3zfa/GQh+GFofrmFeqAmvD30YDLzpn+37u3eK5w73Da7Lnf0dp9o7doAwRktbsb2P40LnL1w3u+8q997ve9L/cuCd4Gehr7Lt1w1fHf51w8v+J333e8vvct/s+oXzQkcfe7GtJUSGMT+bmP6Ybj5hfjaJ/5guvyAV0WziqmNS1vY34jFdyDDIsxYIA8iU0TQII8j4WhlEw2QuUmYihQEqZNhWGGAqNWRxxgSyjSUbWSaQNT9Z9UuD7I/KDqnZJIxqPWFBgoSE0bo5EkqF/mF078+HMtZ2CaUirTD6zXm4gLEGz5FQKtIIo6FewPmMdZ710cZDqRDljGvFSQBKGasUmBhpJJQKMSrCeOa1Rb1TGasngBtqJZSKBg2qZTxPNschJYxVgnrOnRJKRQNKqxnPH3GEjbFsOOSsLccNpUJ03cQ4vrsJR7VlrLY4rPtn8om5pMjXAmoux/cYC0fZFjOecuQ7UbiMcXx1DqL2U2sfjmnlZxyRURASRmOtsUOhmlrV+F6zhxlH7SBoCQmjy0+A0mZqbYLC+AhjVZdCTUgYfbkQKuuo9SWUrtnPWJu6QkgYVXrMCrUqalVB5aIwY1VJKJUwqhC5G1orqLUCan02SigVDYbR2tGIsYRaS6DRZZWEUtFAGN11CWLNp9Z8aBUtOG4oFRJG//tjxPEqteYiRkHlcUKpkA8//7s74qmkViViWe6LG0qFfKr+nY6Iaya1nkI84+ryPpSKaYzxQquEI2oF4rpqr4RSLTl5fqQZjuN+at2H+H6yQ0Kpipw8R/4nmUGHqTiO3uuoVVWEvCUnz/tH4vjKk3jaO3kltRYUIC+I0h3U+PZiNGA8tcbjuNq9LkuSR0kY3dQHDSlL6i61xSw5kD5MwmhVVzRoDLVGowGWKXIgXU/C6MIOaNh11LoWDXLXyYG0hNHZBWjEUGoNRcOu2E21PT9FfpEwer8FjRlMrUvQiHO35XUolTBadzsaN5BaA9GYnmvzOJRKGN03AgnoS62+aNSJ7+dtKJUwumMgElFKrVI0rs1reRpKZQty3elISAm1SpAA6+N5GUplC/LDYiTmB9QqRkImRfIvlMoW5JvtkKAiahUhMTceyLdQKifPT7dAogqo1QIJGlKTX6FUTp7vtSBx1ELC+m6VJck8OnmuuxXJ2Em1aiTulNWyJJnD3BEq7BmOpGyn2nYkodO7siSZJ2F0W38kZwPVNiAZrV+SA+m8CKNfnIokrabaaiTFOl0OpPMgjH5wEpJVRbUqJMkTkQPpXA+j89ogaUupthTJGlVLhckQuRZGn2iO5C2i2ttI2qCdORxKJYxGJiMVr1HtNSTvzM05G0oljH73S6TkBao9jxSUfJqjoVTCaM1lSE0l1SqRCtuinAylsgW5tR9SNINqM5CSls/lYCiVLcjP7UjVdKpNR2qaPZRzoVS2IN/rhJRN0+0A9c6DuRVK5eR5TmukbjJJnTqUa38uhVI5eX7UijSU67gAeUFYliRz5uQ5MhFpGUe125CGMzbIkmQ2s0bjU+0NSM8tVHMjHT9YJUuSORFGdzqRpuuodh3S0v4tOZDOgTC65SykawTVRiA9Bc/IgXTWh9HPuiNtQ6k2FGmyTJMD6SwPo4ttSN+FVLsQabutjkctKoTIujDqbwUdDKDaAKTvyr0SSrM3jD7cDHoopVopdDBgu4TSLA2jkfHQR2+q9YIeen0poTQrw+j+a6CTEqqVQBcnB7MwlMoWZPgi6KUT1TpCH23nZ10olS3IjX2gm/ZUaw+dNH8qy0KpbEFWdYGOqAbdWO7JqlAqJ88LiqCnWirVQkc312VPKJWT58oC6KqaStXQ09Dd2bIkKSfP91mgry1U2gJdnfN1Zi9Jiq4hHlI3DnrbQKX10NcP18qSZBaE0b1XQXdVVKqCzjovz/gDaQmjO34C/a2k0krorXBuhh9ISxhddxoMsIRKS6A764yMPpCWMLryZBjhDSq9AQP8PsJ62/ogA0kYfb0dDPGadhPEAGMOZGoolTA6qwWMUUmlShhi8K7MDKUSRqdYYJBZVJoFY5y9NQNDqYTROrdZI/EVMEiPf2dcKJUtyN1XwDgPUukBGKXj0gwLpbIFua2/ed9lnQbDtHoxo0KpbEGu7QkjTaTSRBjH+kgGhVI5eX7/RBhqApUmwEi/i2RKKJWT59famFDJTNs8vrY2M5Yk5eT5CSsMNpZKY2Gsi6tlSbKpXV7LyCQY7jrtJoixSjfJkmSTh9EDN8J4w6g0DEbr9okcSDdxGK25FCa4lEpDYLgOb8uBdJOG0a19YYaBVBoI47WcLQfSTRhGV58CU/SjUj+YwPIAIzdBNEkYfbcTzFFKpVKY4o6DEkqbQoV2YttAPajUA+a4ep/5oVSUc7oVZulCpS4wyU93mB1KxaiDHpiniEpFMMuP1psbSsWgmuthopZUagnTFH9sZigVpRsHwVRUgonavWleKBVdl58Jc9UwahfMVPB0BcwhimaXwGRhRoVhKsvUcphBFEy2wWwbGLUBJrt1JITxLMNbwnRrGLUGZrvsPAjDdWsG81UxqgqmO70YIictY9QymK8QIict/v927qVl6jKOwzh2WIjVWJQ8G2dhB0QcxEWHYpDEWsgfxAI7jLgRO0wh5sYG7ICIjLUQERzDDgtxEIsSYXBjh2JayLOxRsSNBVMLERdNIG7k6Rs3Nzf/rYvvb3d9XsL1Ai7VfiEHXEYR6wbgO9W+JYcLhhFPEOC4asfJ4YKjqh0lhwv6EesGYJ9q+8gBl55qPXLAZadqO8mBiCvI2+SASydi3QBsUW0LOeBSqVaRAy7rVVtPDri0I54gQCti3QCsVG0lOeDSVK1JDrg8otrD5IBLI+IJAixSbRE5YHNbxW1iwGemYkYMH1xTcY0YPphGPEGASyouEcMHF1VcJIYPxirGxPDBeRXnieGDUcQTBDil4hQxfHBCxQli+GCgwnjHBg6pOEQMH/QjniDAXhV7ieGDPSr2ECMC84YuMXywXcV2YvigE/EEATap2EQMH2xUsZEYPmhHrBuAJ1U8RQwftCKeIMAKFSuI4YPlKpYTwwcN1g2IsFjFYmIYQQUpnHBT2U1SOOEfniCIMGXdgAhXlV0lhRMmyiakcMIFZRdI4YQxTxBEGLFuQIQzys6QwglDZUNSOOFzZV+QwgkDniCIcFDZQVI4Yb+y/aRwQk9ZjxRO2KVsFymc0OUJgghblW0lhRNeUfYqKZxQKatI4YQNyjaQwgltniCIsEbZGlI4YZWyVaRwQlNZkxROWKZsGSmc0OAJggh3KbubFFZYULJACC/MWDcgwnUl1wnhhSlPEES4rOQyIbzwm5LfCeGFMesGRPheyQ+E8MKIJwginFZymhBeOKnkJCG8MGDdgAiHlRwmhBf6SvqE8MIHSj4kBLze5wkSAV3WDRGwQ8kOQsCro6RDCHhtVrKZEPCqeIJEQJt1QwQ8reQZQsCrpaRFCHg9quQxQsCryRMkApYqWUoIeC1RsoQQMFNCBrjdknSLDHCb8QSJgL8k/U0GuP0h6U8ywG0iaUIGuM1LmicD3MY8QSLgnKRzZIDbWUlnyQC3oaQhGeD2paSvyAC3AU+QCPhE0qdkgNsBSQfIALce64YI2C1pNxng1uUJEgHbJG0jA9xek/Q6GeBWsW6IgBckvUgGuLV5gkTAWklryQC31ZJWkwFuTdYNETAnaY4McGtIapABbvdIupcMsPtPIgL8ZqwbIuCGbhABflNNiQC/K7pCBPhNeIJEwFi/EgF+P+onIsBvpBER4Pe1viEC/IY8QSLgmI4RAX5HdIQI8OurTwT4faSPiQC/Hk+QCHhH7xIBfm/oTSLAr6MOEeD3kl4mAvwqniARsE7riAC/Z/UcEeDXUosI8HtcTxABfk2eIBHwoB4iAvzu0/1ECACRIAL+JUEETEkQAfMkiICfSRABQxJEwGckiIA+CSLgPRJEwFskiICKBBHwPAkioEWCCJgjQQQ8QII79D/eDQrIqmTAwgAAAABJRU5ErkJggg==);
background-repeat: no-repeat;
background-position:center;
background-size: 100% 100%;
  overflow: hidden;
  z-index: 2;
  color: tansparent;
  -moz-opacity: 0.0;
  opacity: 0.0;
  animation: glitter 6s linear 0s infinite normal;
  -webkit-animation: glitter 6s linear 0s infinite normal;
  -moz-animation: glitter 8s linear 0s infinite normal;
  -ms-animation: glitter 8s linear 0s infinite normal;
  -o-animation: glitter 8s linear 0s infinite normal;
}

.shine.small {
  width: 20px;
  height: 20px;
}

.shine.medium {
  width: 30px;
  height: 30px;
}

.shine.large {
  width: 50px;
  height: 50px;
}

/*CSS3 keyframes for glittering effect*/
@-webkit-keyframes glitter {
  0% {
    -webkit-transform: scale(0.3) rotate(0deg);
    opacity: 0;
  }
  25% {
    -webkit-transform: scale(1) rotate(360deg);
    opacity: 1;
  }
  50% {
    -webkit-transform: scale(0.3) rotate(720deg);
    opacity: 0;
  }
  100% {
    -webkit-transform: scale(0.3) rotate(0deg);
    opacity: 0;
  }
}
@keyframes glitter {
  0% {
    transform: scale(0.3) rotate(0deg);
    opacity: 0;
  }
  25% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
  50% {
    transform: scale(0.3) rotate(720deg);
    opacity: 0;
  }
  100% {
    transform: scale(0.3) rotate(0deg);
    opacity: 0;
  }
}
.send-icon {
  display: inline-block;
  margin-left: 8px;
}
    
.send-loading {
  animation: sendLoading 1.5s infinite;
}

@keyframes sendLoading {
  0% {
    transform: translateX(0) rotate(0);
    opacity: 1;
  }
  50% {
    transform: translateX(50px) rotate(15deg);
    opacity: 0;
  }
  51% {
    transform: translateX(-50px) rotate(-15deg);
    opacity: 0;
  }
  100% {
    transform: translateX(0) rotate(0);
    opacity: 1;
  }
}

.success-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, #4ade80, #22c55e);
  color: white;
  justify-content: center;
}

.check-icon {
  animation: checkmark 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

@keyframes checkmark {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}
  </style>
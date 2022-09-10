
export const post = async ({ request }) => {
    console.log("tryng")
   // const form = await request.body();
   // const name = (form.get('name'));
   // const email = (form.get('email'));
   // const contact = (form.get('contact'));
    const botMessage = `יש לי הזמנה חדשה  כדאי להיכנס ולבדוק `;
// %0A is url encoded '\n' which is used for new line. 
    try {
        const Token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
        const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
        const url = `https://api.telegram.org/bot${Token}/sendMessage?chat_id=${chatId}&text=${botMessage}`;
        const res = await fetch(url);
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
};
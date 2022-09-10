
export const post = async ({ request }) => {
    console.log("tryng",request.body)
   const data = await request.json()
   
   const name = data.name;
   const phone = data.phone;
   const total = data.total
   // const email = (form.get('email'));
   // const contact = (form.get('contact'));
    const botMessage = `יש לי הזמנה חדשה מ-${name} %0A 
    טלפון ${phone} %0A 
    על סך ${total} %0A 
     כדאי להיכנס ולבדוק בלינק hhttps://strapi-7iq2.onrender.com/admin/content-manager/collectionType/api::hazmana.hazmana?page=1&pageSize=10&sort=id:DESC`;
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
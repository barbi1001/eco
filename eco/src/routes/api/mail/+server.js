    import { render } from 'svelty-email';
	import Welcome from '$lib/emails/welcome.svelte';
import nodemailer from 'nodemailer';


 function sendMail(name,phone,total,email,cart){

const transporter = nodemailer.createTransport({
	host: 'smtp.ethereal.email',
	port: 587,
	secure: false,
	auth: {
		user: import.meta.env.VITE_EMAIL,
		pass: import.meta.env.VITE_PASSWORD
	}
});

const emailHtml = render({
	template: Welcome,
	props: {
		name: name,
        total: total,
        cart: cart
	}
});

const options = {
	from: import.meta.env.VITE_EMAIL,
	to: email,
	subject: 'Welcome to BarB',
	html: emailHtml
};

transporter.sendMail(options);
   }

export async function POST({ request }) {
    const data = await request.json()
    console.log("Form submitted a",data); 
 const name = data.name 
 const phone = data.phone
  const cart = data.cart 
 const total = data.total
  const email = data.email 
  await sendMail(name,phone,total,email,cart)
  .then()
      return new Response();
}

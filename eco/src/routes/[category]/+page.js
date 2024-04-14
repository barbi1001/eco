/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  try {
    const response = await fetch(`https://strapi-7iq2.onrender.com/api/categories/${params.category}?populate[1]=items.img1`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();

    return {
      shopsi: data,
      data: params.category,
      fulfild: true
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    // You can handle errors here (e.g., show an error page)
    throw error;
  }
}

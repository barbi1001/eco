import * as sitemap from 'super-sitemap';

export const prerender = false;

const STRAPI = 'https://strapi-7iq2.onrender.com';

async function fetchCategories() {
  try {
    const res = await fetch(`${STRAPI}/api/categories?populate=items`);
    if (!res.ok) return { categories: [], itemPairs: [] };
    const { data } = await res.json();

    const categories = data.map((c) => [String(c.id)]);
    const itemPairs = data.flatMap((c) =>
      (c.attributes?.items?.data ?? []).map((item) => [String(c.id), String(item.id)])
    );

    return { categories, itemPairs };
  } catch {
    return { categories: [], itemPairs: [] };
  }
}

export const GET = async () => {
  const { categories, itemPairs } = await fetchCategories();

  return await sitemap.response({
    origin: 'https://barbracha.vercel.app',
    additionalPaths: [
      { path: '/bartikun', changefreq: 'weekly', priority: 0.8 },
      { path: '/customjewelry', changefreq: 'weekly', priority: 0.8 },
      { path: '/sadnaot', changefreq: 'weekly', priority: 0.8 },
      { path: '/sadna', changefreq: 'monthly', priority: 0.6 },
      { path: '/pele', changefreq: 'monthly', priority: 0.6 },
      { path: '/rikma', changefreq: 'monthly', priority: 0.6 }
    ],
    paramValues: {
      '/[category]': categories.length ? categories : [['1']],
      '/[category]/[item]': itemPairs.length ? itemPairs : [['1', '7']]
    },
    defaultChangefreq: 'daily',
    defaultPriority: 0.7,
    sort: 'alpha'
  });
};

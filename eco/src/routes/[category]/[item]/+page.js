import { PUBLIC_STRAPI_URL } from '$lib/config/strapi';

export const load = async ({ params, fetch}) => {
  console.log(params, "fh")
  const id = params.item;
  let pdata, relatedP,pdatar
  let loading = true
  const related = await fetch(`${PUBLIC_STRAPI_URL}/api/items?populate=%2A`)
  .then(response => response.json())
  .then(data => {
     pdatar = data.data.filter(t => t.id == id )
    pdata = {"data":pdatar[0]}
     relatedP =  data.data.filter(t => t.id != id )
     loading = false
  })
    return {
  id,
  pdata,
  relatedP,
  loading
}
}

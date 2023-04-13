
export const load = async ({ params}) => {
  const id = params.item;
  let pdata, relatedP
  let loading = true
  const related = await fetch(`https://strapi-7iq2.onrender.com/api/items?populate=%2A`)
  .then(response => response.json())
  .then(data => {
     pdata = data.data.filter(t => t.id == id )
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

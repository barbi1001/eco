<script>
  /** @type {{level?: any, checked?: boolean, tr?: any, fl?: any}} */
  let {
    level = [],
    checked = $bindable(true),
    tr = [],
    fl = [],
    onchange
  } = $props();

function ch (){
  onchange({checked:checked})
}
		const uniqueID = Math.floor(Math.random() * 100)
		const uniqueIDD = Math.floor(Math.random() * 100)

</script>

<h2 class="text-barbi ">{level}</h2>

<div class="flex items-center justify-center z-50" dir="ltr">
  <label for={`Toggle${uniqueID}+${uniqueIDD}`}  class="inline-flex items-center  p-2 rounded-md cursor-pointer text-gray-800">
    <input id={`Toggle${uniqueID}+${uniqueIDD}`} type="checkbox" class="hidden peer" bind:checked onchange={ch}>
    <span class="px-4 py-2 rounded-l-md text-pink-900 peer-checked:text-gray-900 bg-yellow-500 peer-checked:bg-pink-200 underline peer-checked:no-underline">{tr}</span>
    <span class="px-4 py-2 rounded-r-md  peer-checked:text-pink-900  bg-pink-200 peer-checked:bg-yellow-500 no-underline peer-checked:underline">{fl}</span>
  </label>
  </div>
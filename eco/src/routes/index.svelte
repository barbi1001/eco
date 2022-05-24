<script>
import { goto } from "$app/navigation";


	const carouselPhotos = [
		'https://res.cloudinary.com/barb1/image/upload/v1641771584/%D7%91%D7%A8%D7%91%D7%99_4_zvtv3p.gif',
		'https://res.cloudinary.com/barb1/image/upload/v1641771587/%D7%91%D7%A8%D7%91%D7%99_3_srzbj7.gif',
		'https://res.cloudinary.com/barb1/image/upload/v1641771584/%D7%91%D7%A8%D7%91%D7%99_2_owj5x1.gif'
	]
	

	let firstIndex = 0


	

    setInterval(() => {
        if (firstIndex < 4){
  firstIndex = (firstIndex + 1) % carouselPhotos.length
	} else {
         firstIndex = 0
    }
  }, 2700)
</script>






<div class="r">

<img  src={carouselPhotos[firstIndex]} alt="barbi" title="מזל טוב" />
</div>
<button on:click={()=> goto("./rikma")}  class="bg-red-400 bt rounded-full p-2 text-yellow-400 hover:scale-125 hover:bg-yellow-400 hover:text-red-400">להזמנת רקמה</button>
<style>
    .r{
        height: 100vh;
        width: 100vw;
        display: grid;
        justify-content: center;
        align-items: center;
        background-color: #ff83a8;
    }
    .bt{
      position: absolute;
      left: 50%;
      transform: translate(-50%,-50%);
      top: 90%;
    }
</style>
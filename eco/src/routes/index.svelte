<script>
	const carouselPhotos = [
		'https://res.cloudinary.com/barb1/image/upload/v1641771584/%D7%91%D7%A8%D7%91%D7%99_4_zvtv3p.gif',
		'https://res.cloudinary.com/barb1/image/upload/v1641771587/%D7%91%D7%A8%D7%91%D7%99_3_srzbj7.gif',
		'https://res.cloudinary.com/barb1/image/upload/v1641771584/%D7%91%D7%A8%D7%91%D7%99_2_owj5x1.gif',
		'https://res.cloudinary.com/barb1/image/upload/v1641771583/%D7%91%D7%A8%D7%91%D7%99_5_g53bjt.gif'
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

<img  src={carouselPhotos[firstIndex]} alt="barbi" title="מזל טוב לי" />
</div>

<style>
    .r{
        height: 100vh;
        width: 100vw;
        display: grid;
        justify-content: center;
        align-items: center;
        background-color: #ff83a8;
    }
    
</style>
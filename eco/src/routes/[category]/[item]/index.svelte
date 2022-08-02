    
<script context="module">
  export const load = async ({ params, fetch ,status}) => {
    const id = params.item;
    console.log(params)

    const response  = await fetch(`https://strapi-7iq2.onrender.com/api/items/${id}?populate=%2A`);
    return {
         status: response.status,
      props: {
         shopsi: response.ok && (await response.json())
      }
    };
}
</script>
<script>

    export let shopsi;
    export let status;
    console.log(status)
    import Mobile from '$lib/comonents/mobileItem.svelte'
    let urlx = "https://strapi-7iq2.onrender.com/api/";
   
  console.log(shopsi)
    let productB;
  
   
import { onMount } from 'svelte'
     let imga
     let imgb
     let imgc
     let imgd
     let imge
     import {products, cart} from "$lib/stores/cart.js";
    let prod = {};
    let mobiles ;  

onMount(async () => {
   if (mobiles < 600){
  imga = shopsi.data.attributes.img1.data.attributes.formats.large.url
  imgb = shopsi.data.attributes.img2.data.attributes.formats.large.url
  imgc = shopsi.data.attributes.img3.data.attributes.formats.large.url
  imgd = shopsi.data.attributes.img4.data.attributes.formats.large.url
 // imge = shopsi.data.attributes.img5.data.attributes.formats.small.url
   } else {
      imga = shopsi.data.attributes.img1.data.attributes.formats.large.url
  imgb = shopsi.data.attributes.img2.data.attributes.formats.large.url
  imgc = shopsi.data.attributes.img3.data.attributes.formats.large.url
  imgd = shopsi.data.attributes.img4.data.attributes.formats.large.url
 // imge = shopsi.data.attributes.img5.data.attributes.formats.medium.url

   }
  $products.push({
    name: shopsi.data.attributes.name,
    image: shopsi.data.attributes.img1.data.attributes.formats.small.url,
    id: shopsi.data.id,
    price: shopsi.data.attributes.price, 
    quantity: 1
  })
  prod = ({
    name: shopsi.data.attributes.name,
    image: shopsi.data.attributes.img1.data.attributes.formats.small.url,
    id: shopsi.data.id,
    price: shopsi.data.attributes.price, 
    quantity: 1
  })
})

productB = shopsi.data.attributes;
        import { Swiper, SwiperSlide } from "swiper/svelte";

// Import Swiper styles
import "swiper/css";

import "swiper/css/effect-cube";
import "swiper/css/pagination";

import "$lib/style.css";

// import required modules
import { EffectCube, Pagination } from "swiper";
import Buy from '$lib/svg/buy.svelte'
import DesctoItem from '$lib/comonents/desctoItem.svelte';
	
	function addToCart (event) {
      const product = event.detail.pr
		for(let item of $cart) {
				if(item.id === product) {
					prod.quantity += 1
					$cart = $cart;
					return;
				}
		}
		$cart = [...$cart, prod]
    console.log($cart)
      open()
	}
let h,w;
$: if(w>600){
   mobiles = false;
} else{
   mobiles = true;
}
import Carta from '$lib/comonents/carta.svelte'
	import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
    let isOpen;
  const open = () => {
    isOpen = true;
  };

  const close = () => {
    isOpen = false;
	//get name from event timout to show goodby msg
  };
</script>
<DialogOverlay class="over" {isOpen} onDismiss={close}>
	<DialogContent aria-label="form" class="content">
		<div class="tofes" dir="rtl">
<Carta on:close={close}/>
		</div>

	</DialogContent>
	</DialogOverlay >
{#await shopsi}
<div bind:clientHeight="{h}" class="fullwidth" bind:clientWidth="{w}">

{#if mobiles}
<Mobile low="true"/>
{:else if mobiles == false}
<DesctoItem low="true"/>
{/if}
</div>
{:then}
<div bind:clientHeight="{h}" class="fullwidth" bind:clientWidth="{w}">

{#if mobiles}
<Mobile on:addto={addToCart} shem={shopsi.data.attributes.name} {imga}{imgb}{imgc}{imgd}{imge} id={shopsi.data.id} kind={shopsi.data.attributes.kind} url={shopsi.data.attributes.url} des={shopsi.data.attributes.des} price={shopsi.data.attributes.price}/>
{:else if mobiles == false}
<DesctoItem on:addto={addToCart} shem={shopsi.data.attributes.name} {imga}{imgb}{imgc}{imgd}{imge} id={shopsi.data.id} kind={shopsi.data.attributes.kind} url={shopsi.data.attributes.url} des={shopsi.data.attributes.des} price={shopsi.data.attributes.price}/>
{:else}
<Swiper
effect={"cube"}
grabCursor={true}
cubeEffect={{
  shadow: true,
  slideShadows: true,
  shadowOffset: 20,
  shadowScale: 0.94,
}}
loop=true
pagination={true}
modules={[EffectCube, Pagination]}
class="mySwiper"
>
<SwiperSlide
  ><img alt="{`${shopsi.data.attributes.name} תמונת המוצר`}" src={imga} /></SwiperSlide
><SwiperSlide
  ><img alt="{`${shopsi.data.attributes.name} תמונת המוצר`}"   src={imgb} /></SwiperSlide
><SwiperSlide
  ><img alt="{`${shopsi.data.attributes.name} תמונת המוצר`}" src={imgc} /></SwiperSlide
><SwiperSlide
  ><img alt="{`${shopsi.data.attributes.name} תמונת המוצר`}" src={imgd} /></SwiperSlide
><!--<SwiperSlide
><img alt="{`${shopsi.data.attributes.name} תמונת המוצר`}" src={imge} /></SwiperSlide
>-->
</Swiper>


  <div dir="rtl">
    <div class="p-4 text-pink-200"  style="position:absolute; top: 15%; left: 50%; transform: translate(-50%, -50%); ">
<svg
   id="svg2"
   viewBox="310 10 300 410"
   version="1.1"
   width="200"
   height="200"
   sodipodi:docname="pink_button_leaderboards_morgaine1976.svg"
   inkscape:version="1.1 (c68e22c387, 2021-05-23)"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <sodipodi:namedview
     id="namedview29507"
     pagecolor="#ffffff"
     bordercolor="#666666"
     borderopacity="1.0"
     inkscape:pageshadow="2"
     inkscape:pageopacity="0.0"
     inkscape:pagecheckerboard="0"
     inkscape:document-units="in"
     showgrid="false"
     inkscape:zoom="0.74503968"
     inkscape:cx="2.0133156"
     inkscape:cy="611.37683"
     inkscape:window-width="1920"
     inkscape:window-height="1001"
     inkscape:window-x="1358"
     inkscape:window-y="-8"
     inkscape:window-maximized="1"
     inkscape:current-layer="svg2" />
  <defs
     id="defs4">
    <filter
       style="color-interpolation-filters:sRGB"
       id="filter3816-7"
       x="-0.031878628"
       y="-0.031878628"
       width="1.0637573"
       height="1.0637573">
      <feGaussianBlur
         id="feGaussianBlur3818-6"
         stdDeviation="0.63462833" />
    </filter>
    <radialGradient
       gradientUnits="userSpaceOnUse"
       cx="34.040001"
       cy="31.184999"
       r="23.552"
       id="gradient-3"
       gradientTransform="matrix(1, 0, 0, 1.004344, 0, -0.065803)">
      <stop
         offset="0"
         style="stop-color: rgba(234, 108, 182, 1)"
         id="stop69765" />
      <stop
         offset="0.101"
         style="stop-color: rgb(51, 165, 191);"
         id="stop69767" />
      <stop
         offset="0.411"
         style="stop-color: rgb(245, 214, 247);"
         id="stop69769" />
      <stop
         offset="1"
         style="stop-color: rgba(210, 30, 135, 1)"
         id="stop69771" />
    </radialGradient>
    <radialGradient
       gradientUnits="userSpaceOnUse"
       cx="33.863998"
       cy="53.112999"
       r="15.467"
       id="gradient-4"
       spreadMethod="repeat"
       gradientTransform="matrix(1, 0, 0, 3.3388, 0, -128.331533)">
      <stop
         offset="0"
         style="stop-color: rgba(93, 190, 255, 1)"
         id="stop69774" />
      <stop
         offset="0.483"
         style="stop-color: rgb(245, 48, 131);"
         id="stop69776" />
      <stop
         offset="0.748"
         style="stop-color: rgb(228, 227, 226);"
         id="stop69778" />
      <stop
         offset="1"
         style="stop-color: rgba(0, 147, 246, 1)"
         id="stop69780" />
    </radialGradient>
    <radialGradient
       gradientUnits="userSpaceOnUse"
       cx="34.040001"
       cy="31.184999"
       r="23.552"
       id="gradient-5"
       gradientTransform="matrix(1, 0, 0, 1.004344, 0, -0.065803)">
      <stop
         offset="0"
         style="stop-color: rgba(93, 190, 255, 1)"
         id="stop69783" />
      <stop
         offset="0.284"
         style="stop-color: rgb(120, 232, 129);"
         id="stop69785" />
      <stop
         offset="0.573"
         style="stop-color: rgb(241, 0, 145);"
         id="stop69787" />
      <stop
         offset="1"
         style="stop-color: rgb(146, 185, 211);"
         id="stop69789" />
    </radialGradient>
    <radialGradient
       gradientUnits="userSpaceOnUse"
       cx="-181.815"
       cy="1355.446"
       r="31.731001"
       id="gradient-0"
       gradientTransform="matrix(1.622955,0,0,1,113.26263,0)">
      <stop
         offset="0"
         style="stop-color: rgba(244, 0, 102, 1)"
         id="stop69792" />
      <stop
         offset="0.451"
         style="stop-color: rgb(241, 157, 192);"
         id="stop69794" />
      <stop
         offset="1"
         style="stop-color: rgba(142, 0, 59, 1)"
         id="stop69796" />
    </radialGradient>
    <linearGradient
       gradientUnits="userSpaceOnUse"
       x1="241.96001"
       y1="779.91998"
       x2="241.96001"
       y2="821.41998"
       id="gradient-1">
      <stop
         offset="0"
         style="stop-color: rgba(255, 0, 106, 1)"
         id="stop69799" />
      <stop
         offset="0.193"
         style="stop-color: rgb(88, 151, 125);"
         id="stop69801" />
      <stop
         offset="0.447"
         style="stop-color: rgb(0, 202, 209);"
         id="stop69803" />
      <stop
         offset="0.62"
         style="stop-color: rgb(177, 196, 201);"
         id="stop69805" />
      <stop
         offset="1"
         style="stop-color: rgba(153, 0, 64, 1)"
         id="stop69807" />
    </linearGradient>
    <linearGradient
       gradientUnits="userSpaceOnUse"
       x1="-181.815"
       y1="1323.714"
       x2="-181.815"
       y2="1387.177"
       id="gradient-6">
      <stop
         id="stop3798-8"
         style="stop-color:#f63ec5"
         offset="0" />
      <stop
         id="stop3804-9"
         style="stop-color:#f876c2"
         offset="0.8779" />
      <stop
         id="stop3800-7"
         style="stop-color:#f99dd2"
         offset="1" />
    </linearGradient>
    <linearGradient
       gradientUnits="userSpaceOnUse"
       x1="-181.815"
       y1="1323.714"
       x2="-181.815"
       y2="1387.177"
       id="gradient-7">
      <stop
         offset="0"
         style="stop-color: rgba(85, 216, 218, 1)"
         id="stop69814" />
      <stop
         offset="0.481"
         style="stop-color: rgb(192, 61, 190);"
         id="stop69816" />
      <stop
         offset="1"
         style="stop-color: rgba(36, 163, 165, 1)"
         id="stop69818" />
    </linearGradient>
    <linearGradient
       gradientUnits="userSpaceOnUse"
       x1="33.865"
       y1="44.11"
       x2="33.865"
       y2="54.871"
       id="gradient-8">
      <stop
         offset="0"
         style="stop-color: rgba(36, 163, 165, 1)"
         id="stop29452" />
      <stop
         offset="1"
         style="stop-color: rgb(18, 247, 251);"
         id="stop29454" />
    </linearGradient>
    <linearGradient
       gradientUnits="userSpaceOnUse"
       x1="33.865"
       y1="44.11"
       x2="33.865"
       y2="54.871"
       id="gradient-9">
      <stop
         offset="0"
         style="stop-color: rgba(113, 236, 255, 1)"
         id="stop29457" />
      <stop
         offset="1"
         style="stop-color: rgb(226, 97, 174);"
         id="stop29459" />
    </linearGradient>
    <linearGradient
       gradientUnits="userSpaceOnUse"
       x1="34.04"
       y1="15.146"
       x2="34.04"
       y2="47.223"
       id="gradient-10">
      <stop
         offset="0"
         style="stop-color: rgba(250, 222, 255, 1)"
         id="stop29462" />
      <stop
         offset="0.196"
         style="stop-color: rgb(125, 216, 238);"
         id="stop29464" />
      <stop
         offset="0.522"
         style="stop-color: rgb(170, 176, 244);"
         id="stop29466" />
      <stop
         offset="0.58"
         style="stop-color: rgb(177, 170, 245);"
         id="stop29468" />
      <stop
         offset="0.58"
         style="stop-color: rgb(176, 170, 245);"
         id="stop29470" />
      <stop
         offset="1"
         style="stop-color: rgba(235, 120, 255, 1)"
         id="stop29472" />
    </linearGradient>
    <linearGradient
       gradientUnits="userSpaceOnUse"
       x1="33.865"
       y1="43.135"
       x2="33.865"
       y2="54.871"
       id="gradient-11">
      <stop
         offset="0"
         style="stop-color: rgba(234, 108, 182, 1)"
         id="stop69760" />
      <stop
         offset="0.311"
         style="stop-color: rgb(195, 172, 201);"
         id="stop29476" />
      <stop
         offset="0.427"
         style="stop-color: rgb(167, 219, 216);"
         id="stop29478" />
      <stop
         offset="0.693"
         style="stop-color: rgb(181, 153, 188);"
         id="stop29480" />
      <stop
         offset="1"
         style="stop-color: rgba(210, 30, 135, 1)"
         id="stop69762" />
    </linearGradient>
    <path
       id="path-0"
       style="fill: none;"
       d="M 260.217 567.573 C 275.727 545.41 284.879 541.461 296.365 534.569 C 303.046 532.998 309.918 526.646 314.438 525.139 C 325.869 524.354 335.595 520.425 345.87 520.425 C 364.735 520.425 380.55 517.386 387.518 524.354 C 394.731 528.745 401.78 536.258 406.378 540.856 C 413.059 545.768 415.862 550.34 419.736 554.214 C 423.048 559.266 429.166 562.033 429.166 568.359 L 429.166 569.931 L 429.166 571.502" />
  </defs>
  <g
     style="display: inline;"
     id="g4186"
     transform="matrix(5.770015, 0, 0, 5.770015, 269.634399, 22.159834)">
    <g
       id="g4190"
       transform="matrix(1, 0, 0, 1, -207.940002, -760.375977)">
      <circle
         r="31.731417"
         cy="1355.4458"
         cx="-181.81483"
         id="circle4192"
         style="fill:none;stroke:#000000;filter:url(#filter3816-7)"
         transform="matrix(1.0085,0,0,1.0085,425.31,-572.52)" />
      <circle
         r="31.731417"
         cy="1355.4458"
         cx="-181.81483"
         id="circle4194"
         style="fill:url(#gradient-6);stroke:url(#gradient-7);stroke-miterlimit:2"
         transform="matrix(1.0085,0,0,1.0085,425.31,-572.52)" />
      <circle
         r="31.731417"
         cy="1355.4458"
         cx="-181.81483"
         id="circle4196"
         style="fill:#71123b"
         transform="matrix(0.88241,0,0,0.88241,402.39,-401.65)" />
      <circle
         r="31.731417"
         cy="1355.4458"
         cx="-181.81483"
         id="circle4198"
         style="fill:url(#gradient-0);stroke-width:2.35048px"
         transform="matrix(0.85089,0,0,0.85089,396.66,-358.94)" />
      <path
         id="path4200"
         style="fill:url(#gradient-1)"
         d="m 240.96,779.92 c -5.9532,0 -11.223,2.89 -14.5,7.3438 -1.7374,-0.5587 -3.577,-0.8438 -5.5,-0.8438 -1.7392,0 -3.4091,0.2585 -5,0.7188 -0.64736,2.3166 -1,4.758 -1,7.2812 0,14.912 12.088,27 27,27 14.912,0 27,-12.088 27,-27 0,-2.2384 -0.26779,-4.4201 -0.78125,-6.5 -2.2106,-0.9694 -4.6503,-1.5 -7.2188,-1.5 -1.923,0 -3.7626,0.2852 -5.5,0.8438 -3.2767,-4.4539 -8.5468,-7.3438 -14.5,-7.3438 z" />
    </g>
    <g
       style="display:inline"
       id="g4191-0"
       transform="matrix(0.94648817,0,0,0.94648817,1.8215427,1.8215429)">
      <g
         transform="matrix(1.0326294,0,0,1.0326294,-1.1107441,-2.1108304)"
         style="display:inline"
         id="g3364-2-8">
        <rect
           style="fill-opacity: 0.72549; stroke-width: 2.55788; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 4; stroke-dasharray: none; stroke-opacity: 0.72549; fill: url(#gradient-8); stroke: url(#gradient-9);"
           id="rect3366-6-4"
           width="30.933"
           height="10.761"
           x="18.398"
           y="44.11" />
        <path
           id="path3368-8-8"
           d="m 41.949219,15.146484 a 2.9878507,2.9878507 0 0 0 -2.988281,2.988282 2.9878507,2.9878507 0 0 0 1.888671,2.77539 L 33.863281,35.181641 27.158203,20.953125 a 2.9878507,2.9878507 0 0 0 1.785156,-2.730469 2.9878507,2.9878507 0 0 0 -2.988281,-2.988281 2.9878507,2.9878507 0 0 0 -2.988281,2.988281 2.9878507,2.9878507 0 0 0 2.703125,2.972656 L 24.109375,36.5 15.853516,30.572266 a 2.9878507,2.9878507 0 0 0 0.611328,-1.804688 2.9878507,2.9878507 0 0 0 -2.988282,-2.988281 2.9878507,2.9878507 0 0 0 -2.988281,2.988281 2.9878507,2.9878507 0 0 0 2.988281,2.988281 2.9878507,2.9878507 0 0 0 0.896485,-0.142578 L 18.75,47.222656 49.242188,47.134766 53.779297,31.636719 a 2.9878507,2.9878507 0 0 0 0.824219,0.11914 2.9878507,2.9878507 0 0 0 2.988281,-2.988281 2.9878507,2.9878507 0 0 0 -2.988281,-2.988281 2.9878507,2.9878507 0 0 0 -2.988282,2.988281 2.9878507,2.9878507 0 0 0 0.673828,1.886719 L 44.058594,36.324219 42.332031,21.09375 A 2.9878507,2.9878507 0 0 0 44.9375,18.134766 2.9878507,2.9878507 0 0 0 41.949219,15.146484 Z"
           style="fill-opacity: 0.72549; stroke-width: 2.55788; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 4; stroke-dasharray: none; stroke-opacity: 0.72549; fill: rgb(46, 129, 226); paint-order: stroke markers; stroke: url(#gradient-10);" />
      </g>
      <g
         transform="matrix(1.032629, 0, 0, 1.036252, -1.110744, -2.165695)"
         style="display: inline;"
         id="g3364-5">
        <rect
           style="fill-opacity: 1; stroke: url(#gradient-4); stroke-width: 0.511576px; stroke-linecap: round; stroke-linejoin: miter; stroke-miterlimit: 1; stroke-dasharray: none; stroke-opacity: 1; paint-order: fill; fill: url(#gradient-11);"
           id="rect3366-4"
           width="30.933"
           height="11.736"
           x="18.398"
           y="43.135" />
        <path
           id="path3368-4"
           d="M 41.949 15.146 C 40.299 15.146 38.961 16.49 38.961 18.148 C 38.962 19.378 39.711 20.483 40.85 20.935 L 33.863 35.269 L 27.158 20.978 C 28.241 20.5 28.942 19.425 28.943 18.236 C 28.944 16.578 27.606 15.235 25.955 15.235 C 24.305 15.235 22.967 16.578 22.967 18.236 C 22.968 19.782 24.138 21.074 25.67 21.222 L 24.109 36.593 L 15.854 30.639 C 16.249 30.118 16.463 29.482 16.465 28.827 C 16.465 27.169 15.127 25.825 13.477 25.825 C 11.826 25.825 10.488 27.169 10.488 28.827 C 10.488 30.484 11.826 31.828 13.477 31.828 C 13.781 31.826 14.083 31.778 14.373 31.685 L 18.75 47.362 L 49.242 47.274 L 53.779 31.708 C 54.047 31.787 54.325 31.827 54.604 31.828 C 56.254 31.828 57.592 30.484 57.592 28.827 C 57.592 27.169 56.254 25.825 54.604 25.825 C 52.953 25.825 51.615 27.169 51.615 28.827 C 51.616 29.517 51.854 30.187 52.289 30.722 L 44.059 36.416 L 42.332 21.12 C 43.82 20.927 44.935 19.655 44.937 18.148 C 44.938 16.49 43.6 15.146 41.949 15.146 Z"
           style="fill: url(#gradient-3); fill-opacity: 1; stroke: url(#gradient-5); stroke-width: 1.02315px; stroke-linecap: round; stroke-linejoin: miter; stroke-miterlimit: 1; stroke-dasharray: none; stroke-opacity: 1; paint-order: fill;" />
        <text
           style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 22.8606px; line-height: 35.3577px; white-space: pre; text-anchor: middle;"
           transform="matrix(0.2327, 0, 0, 0.231887, 34.009094, 53.262566)"
           id="text29497">{shopsi.data.attributes.name}</text>
      </g>
    </g>
  </g>
  <text
     style="font-size:28px;font-family:Arial, sans-serif;white-space:pre;fill:#333333"
     transform="matrix(1.953243,1.70283,-1.702814,1.953243,1083.2059,-1539.2789)"
     id="text29504"><textPath
       xlink:href="#path-0"
       id="textPath29502" /></text>
</svg>

</div>

          <div class="p-4 text-pink-200" style="position:absolute; top: 3%; right: 70%;">
<svg height="500" width="200" id="svg2" viewBox="0 150 206.71 207.49" version="1.0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs id="defs4">
              <linearGradient id="linearGradient10151">
                <stop id="stop10153" style="stop-color:#f6caca" offset="0"/>
                <stop offset="0.498" style="stop-color: rgb(225, 102, 171);"/>
                <stop id="stop10155" style="stop-color: rgb(204, 0, 139);" offset="1"/>
              </linearGradient>
              <filter id="filter9112" height="1.223" width="1.0537" y="-.11149" x="-.026867">
                <feGaussianBlur id="feGaussianBlur9114" stdDeviation="2.9581162"/>
              </filter>
              <filter id="filter9406">
                <feGaussianBlur id="feGaussianBlur9408" stdDeviation="4.2229381"/>
              </filter>
              <filter id="filter10171">
                <feGaussianBlur id="feGaussianBlur10173" stdDeviation="1.8659391"/>
              </filter>
              <filter id="filter10833">
                <feGaussianBlur id="feGaussianBlur10835" stdDeviation="2.1164966"/>
              </filter>
              <filter id="filter11242" height="1.8233" width="1.94" y="-.41165" x="-.47002">
                <feGaussianBlur id="feGaussianBlur11244" stdDeviation="3.8749884"/>
              </filter>
              <filter id="filter11290" height="1.9698" width="1.7732" y="-.48490" x="-.38658">
                <feGaussianBlur id="feGaussianBlur11292" stdDeviation="36.579973"/>
              </filter>
              <filter id="filter11324" height="1.5896" width="1.5704" y="-.29482" x="-.28519">
                <feGaussianBlur id="feGaussianBlur11326" stdDeviation="25.21143"/>
              </filter>
              <radialGradient id="radialGradient12080" gradientUnits="userSpaceOnUse" cy="176.06" cx="689.08" gradientTransform="matrix(1.1198 .44123 -.45776 1.1729 -68.775 -171.47)" r="141.35" xlink:href="#linearGradient10151"/>
              <radialGradient id="radialGradient3266" gradientUnits="userSpaceOnUse" cy="84.843" cx="211.65" gradientTransform="matrix(.83994 .37140 -.52160 1.1796 91.279 -86.002)" r="103.36" xlink:href="#linearGradient10151"/>
              <radialGradient gradientUnits="userSpaceOnUse" cx="177.324" cy="131.072" r="103.356" id="gradient-1">
                <stop offset="0" style="stop-color: rgb(85, 98, 218);"/>
                <stop offset="1" style="stop-color: rgb(41, 134, 141);"/>
              </radialGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="213.786" y1="184.864" x2="213.786" y2="225.86" id="gradient-0">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="202.21" y1="186.54" x2="202.21" y2="227.747" id="gradient-2">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.595" y1="177.321" x2="411.595" y2="241" id="gradient-3">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.89" y1="266.62" x2="411.89" y2="438.69" id="gradient-4">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.595" y1="185.731" x2="411.595" y2="226.41" id="gradient-5">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="142.876" y1="183.552" x2="142.876" y2="223.62" id="gradient-6">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="152.995" y1="185.42" x2="152.995" y2="226.031" id="gradient-7">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.595" y1="177.321" x2="411.595" y2="241" id="gradient-8">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.89" y1="266.62" x2="411.89" y2="438.69" id="gradient-9">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.595" y1="185.731" x2="411.595" y2="226.41" id="gradient-10">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="146.54" y1="171.79" x2="146.54" y2="227.82" id="gradient-11">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.595" y1="177.321" x2="411.595" y2="241" id="gradient-12">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.89" y1="266.62" x2="411.89" y2="438.69" id="gradient-13">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.595" y1="185.731" x2="411.595" y2="226.41" id="gradient-14">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="183.82" y1="215.21" x2="183.82" y2="312.71" id="gradient-15">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="349.595" y1="308.94" x2="349.595" y2="412.22" id="gradient-16">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="0.549" style="stop-color: rgb(249, 255, 72);"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="225.321" y1="171.433" x2="225.321" y2="225.27" id="gradient-17">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="210.06" y1="173.64" x2="210.06" y2="227.749" id="gradient-18">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.595" y1="177.321" x2="411.595" y2="241" id="gradient-19">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.89" y1="266.62" x2="411.89" y2="438.69" id="gradient-20">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="411.595" y1="185.731" x2="411.595" y2="226.41" id="gradient-21">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="342.855" y1="295.215" x2="342.855" y2="326.645" id="gradient-22">
                <stop offset="0" style="stop-color: rgba(255, 128, 204, 1)"/>
                <stop offset="1" style="stop-color: rgba(255, 26, 163, 1)"/>
              </linearGradient>
              <radialGradient gradientUnits="userSpaceOnUse" cx="266.77" cy="408.84" r="12.497" id="gradient-24" gradientTransform="matrix(1.379119, 6.113311, -0.975478, 0.220064, 297.676922, -1311.97884)">
                <stop offset="0" style="stop-color: rgba(248, 139, 233, 1)"/>
                <stop offset="0.526" style="stop-color: rgb(244, 88, 223);"/>
                <stop offset="1" style="stop-color: rgba(242, 43, 216, 1)"/>
              </radialGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="349.595" y1="308.94" x2="349.595" y2="412.22" id="gradient-23">
                <stop offset="0" style="stop-color: rgb(147, 85, 218);"/>
                <stop offset="1" style="stop-color: rgb(41, 123, 141);"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="266.77" y1="247.55" x2="266.77" y2="570.13" id="gradient-26">
                <stop id="stop11648" style="stop-color:#f0b663" offset="0"/>
                <stop id="stop11650" style="stop-color: rgb(35, 178, 255);" offset="1"/>
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" x1="0" y1="-52.436" x2="0" y2="12.205" id="gradient-25">
                <stop offset="0" style="stop-color: rgba(254, 249, 250, 1)"/>
                <stop offset="1" style="stop-color: rgba(239, 161, 177, 1)"/>
              </linearGradient>
            </defs>
            <g id="layer1" transform="translate(-73.969 -36.973)">
              <g id="g3268">
                <path id="path10311" style="opacity: 0.97895; fill: url(#radialGradient3266); stroke: url(#gradient-1);" d="m121.95 36.999c-14.06 0.168-28.608 5.961-40.743 22.836-34.128 47.465 61.623 119.54 96.003 165.02v0.32c0.04-0.06 0.07-0.12 0.11-0.17 0.05 0.05 0.1 0.11 0.14 0.17v-0.32c34.37-45.49 130.11-117.56 95.98-165.02-36.57-50.861-94.86-1.158-96.12-0.026-0.91-0.817-27.11-23.153-55.37-22.815z"/>
                <path id="path10315" style="filter:url(#filter10833);fill:url(#radialGradient12080)" transform="matrix(.68584 0 0 .69493 -190.05 -167.56)" d="m458.78 296.44c-17.33 0.22-34.15 6.62-50.25 30.22-10.29 15.07-10.92 31.04-4.69 50.75 6.24 19.71 20.03 42.03 37.32 64.56 30.69 39.99 71.8 80.2 99.4 114.87 27.6-34.67 74.33-73.56 105.01-113.55 17.28-22.53 28.23-43.54 34.46-63.25 6.24-19.71 6.14-24.14-1.3-41.78-7.08-16.78-29.77-35.32-43.73-38.45-12.81-2.86-26.23-3.17-39 1.16s-24.57 7.47-33.12 13.31c-4.28 2.92-10.56 3.99-12.98 5.95-5.98 5.72-9.82 13.91-17.84 8.39 0.74 0.7-2.39-2.16-6.53-5.34s-10.02-7.36-17-11.44c-13.96-8.14-32.31-15.62-49.75-15.4z"/>
                <path id="path10727" style="filter:url(#filter11290);fill:#e3bbbb" d="m582.86 487.36a66.429 100.72 0 1 1 -7.19 -45.55l-59.24 45.55z" transform="matrix(.15269 -.39155 .44331 .40429 -148.85 151.98)"/>
                <g id="g12014" transform="translate(-89.904 -28.284)">
                  <path id="path11644" style="stroke-width: 7.2496; fill: url(#gradient-24); stroke: url(#gradient-26);" d="m261.86 247.55c32.19 103.08-31.66 117.14 3.14 221.26 29.28 87.62 4.42 101.32 4.42 101.32"/>
                  <path id="path10894" style="fill:#ff8080" d="m195.71 229.14c-2.26 3.08-2.99 7.38-0.46 13.33 1.3 3.04 3.24 5.23 5.66 6.78l8.24 5.25c-2.43-1.55-4.37-3.73-5.66-6.78-7.73-18.16 15.05-20.91 18.31-20.88l0.31 0.2c-1-2.2-6.16-23.13 15.84-22.55 3.63 0.09 6.57 1.01 8.99 2.56l-8.23-5.25c-2.43-1.55-5.37-2.47-8.99-2.56-7.57-0.2-11.92 2.14-14.33 5.39-4.51 6.06-2.28 15.27-1.57 17.03l-0.09-0.06c-1.73-0.08-12.54 0.98-17.54 6.94-0.17 0.19-0.33 0.39-0.48 0.6z"/>
                  <g id="g11868" transform="translate(87.143 30)">
                    <path id="path10870" style="fill: url(#gradient-0);" d="m218.14 188.87c-1.73-2.22-4.86-3.86-10.22-4-2.73-0.07-5 0.49-6.9 1.52l-6.48 3.49c1.91-1.03 4.17-1.58 6.91-1.52 16.35 0.41 11.86 14.89 10.89 16.85l-0.25 0.13c2 0.01 19.75 2.74 12.91 15.82-1.13 2.16-2.7 3.67-4.61 4.7l6.47-3.49c1.91-1.03 3.48-2.55 4.61-4.7 2.35-4.5 1.8-7.77-0.02-10.13-3.4-4.41-11.2-5.63-12.77-5.69l0.08-0.04c0.56-1.02 2.88-7.82-0.29-12.49-0.1-0.15-0.21-0.31-0.33-0.45z"/>
                    <path id="path10872" style="fill: url(#gradient-2);" d="m200.92 186.54l-6.48 3.5c-10.28 5.55-10.07 24.84-16.81 33.97l-0.07 0.04c0.01 0 0.03-0.01 0.04-0.01-0.01 0.01-0.01 0.03-0.02 0.04l0.07-0.04c12.46-1.24 32.46 7.37 42.74 1.83l6.47-3.5c-10.29 5.56-30.33-3.08-42.78-1.82 6.76-9.12 6.54-28.45 16.84-34.01z"/>
                    <path id="path10874" style="filter: url(#filter9112); fill: url(#gradient-3);" d="m338.78 177.34c-15.85 0.49-32.32 7.48-48.22 28.32-7.93 10.39-11.09 20.15-11.09 29.96v4.5c0.83-1.22 1.48-2.47 2.41-3.68 13.31-17.46 28.16-26.95 42.93-30.66 14.78-3.71 29.24-1.68 41.94 2.81s23.76 11.44 32.22 17.88c5.93 4.51 9.95 8.28 13.03 11.47 2.77-2.75 6.24-5.9 10.94-9.56 8.33-6.51 19.41-13.67 32.22-18.41 12.8-4.74 27.44-7.04 42.46-3.47 15.03 3.57 30.15 13.06 43.69 30.81 0.93 1.22 1.58 2.46 2.41 3.69v-4.5c0-9.81-3.17-19.57-11.1-29.97-16.95-22.22-34.56-28.7-51.4-28.28-15.72 0.39-30.94 7.29-42.81 15.03-11.88 7.74-20.64 16.67-22.35 18.84-1.18 1.5-3.06 2.27-4.95 2.03-1.89-0.23-3.52-1.44-4.3-3.18-0.71-0.89-2.8-3.32-6.28-6.47-3.78-3.43-8.9-7.58-14.91-11.56-12-7.97-27.58-15.19-43.65-15.6-1.08-0.02-2.16-0.03-3.19 0z" transform="matrix(.094490 .13047 -.17302 .093386 215.89 128.63)" xlink:href="#path7386"/>
                    <path id="path10876" style="filter: url(#filter9406); fill: url(#gradient-4);" d="m278.59 266.62v7.32c0 27.31 25.6 56.06 55.97 84.59 28.47 26.74 60.38 53.1 77.32 80.16 16.92-27.06 48.86-53.42 77.34-80.16 30.38-28.53 55.97-57.28 55.97-84.59v-7.32c-10.41 20.87-29.75 40.82-50.63 60.41-30.7 28.82-64.81 57.15-79.18 83.69-0.71 1.27-2.05 2.07-3.5 2.07-1.46 0-2.8-0.8-3.5-2.07-14.39-26.54-48.47-54.86-79.16-83.69-20.87-19.6-40.23-39.54-50.63-60.41z" transform="matrix(.094490 .13047 -.17302 .093386 215.89 128.63)" xlink:href="#path7384"/>
                    <path id="path10878" style="filter: url(#filter9112); fill: url(#gradient-5);" d="m339.03 185.75c-12.9 0.4-25.74 5.33-39.65 22.44 7.6-5.07 15.45-8.58 23.37-10.57 16.74-4.2 32.97-1.86 46.81 3.04 12.59 4.44 23.31 10.97 31.91 17.25-0.46-0.52-0.84-1.08-1.22-1.66-0.41-0.51-2.25-2.67-5.37-5.5-3.5-3.16-8.32-7.07-13.91-10.78-11.16-7.41-25.54-13.88-39.22-14.22-0.97-0.02-1.9-0.03-2.72 0zm142.41 0.91c-13.39 0.33-27.41 6.49-38.44 13.68-5.49 3.58-10.34 7.48-13.97 10.72-3.62 3.24-6.33 6.27-6.34 6.28h-0.03c-2.98 3.77-7.76 5.76-12.57 5.16-1.59-0.2-3.07-0.74-4.47-1.44 2.37 1.86 4.63 3.7 6.47 5.35 1.72-1.49 3.53-3.03 5.66-4.69 8.82-6.88 20.55-14.51 34.47-19.66 13.93-5.15 30.33-7.79 47.34-3.75 8.2 1.95 16.37 5.51 24.25 10.75-14.88-18.31-28.5-22.75-42.37-22.4z" transform="matrix(.094490 .13047 -.17302 .093386 215.89 128.63)" xlink:href="#path9078"/>
                    <path id="path10882" style="fill: url(#gradient-6);" d="m124.28 205.24c-1.71 2.23-2.27 5.35-0.35 9.66 0.98 2.21 2.44 3.8 4.28 4.92l6.23 3.8c-1.84-1.12-3.3-2.7-4.28-4.91-5.85-13.17 11.38-15.16 13.85-15.14l0.24 0.15c-0.76-1.6-4.67-16.77 11.98-16.35 2.74 0.07 4.97 0.73 6.8 1.86l-6.23-3.81c-1.83-1.12-4.06-1.79-6.8-1.86-5.72-0.14-9.01 1.55-10.84 3.91-3.41 4.4-1.72 11.07-1.18 12.35l-0.08-0.05c-1.31-0.06-9.48 0.71-13.26 5.03-0.13 0.14-0.25 0.29-0.36 0.44z"/>
                    <path id="path10884" style="fill: url(#gradient-7);" d="m128.41 219.84l6.24 3.81c9.89 6.04 30.47-1.54 42.84 0.31l0.07 0.04c-0.01-0.01-0.02-0.02-0.02-0.03 0.01 0.01 0.03 0 0.04 0.01l-0.07-0.04c-6.11-9.45-4.58-28.67-14.47-34.71l-6.24-3.81c9.91 6.05 8.36 25.32 14.5 34.74-12.36-1.88-32.98 5.73-42.89-0.32z"/>
                    <path id="path10886" style="filter: url(#filter9112); fill: url(#gradient-8);" d="m338.78 177.34c-15.85 0.49-32.32 7.48-48.22 28.32-7.93 10.39-11.09 20.15-11.09 29.96v4.5c0.83-1.22 1.48-2.47 2.41-3.68 13.31-17.46 28.16-26.95 42.93-30.66 14.78-3.71 29.24-1.68 41.94 2.81s23.76 11.44 32.22 17.88c5.93 4.51 9.95 8.28 13.03 11.47 2.77-2.75 6.24-5.9 10.94-9.56 8.33-6.51 19.41-13.67 32.22-18.41 12.8-4.74 27.44-7.04 42.46-3.47 15.03 3.57 30.15 13.06 43.69 30.81 0.93 1.22 1.58 2.46 2.41 3.69v-4.5c0-9.81-3.17-19.57-11.1-29.97-16.95-22.22-34.56-28.7-51.4-28.28-15.72 0.39-30.94 7.29-42.81 15.03-11.88 7.74-20.64 16.67-22.35 18.84-1.18 1.5-3.06 2.27-4.95 2.03-1.89-0.23-3.52-1.44-4.3-3.18-0.71-0.89-2.8-3.32-6.28-6.47-3.78-3.43-8.9-7.58-14.91-11.56-12-7.97-27.58-15.19-43.65-15.6-1.08-0.02-2.16-0.03-3.19 0z" transform="matrix(.10339 -.12535 .16653 .10177 60.637 230.19)" xlink:href="#path7386"/>
                    <path id="path10888" style="filter: url(#filter9406); fill: url(#gradient-9);" d="m278.59 266.62v7.32c0 27.31 25.6 56.06 55.97 84.59 28.47 26.74 60.38 53.1 77.32 80.16 16.92-27.06 48.86-53.42 77.34-80.16 30.38-28.53 55.97-57.28 55.97-84.59v-7.32c-10.41 20.87-29.75 40.82-50.63 60.41-30.7 28.82-64.81 57.15-79.18 83.69-0.71 1.27-2.05 2.07-3.5 2.07-1.46 0-2.8-0.8-3.5-2.07-14.39-26.54-48.47-54.86-79.16-83.69-20.87-19.6-40.23-39.54-50.63-60.41z" transform="matrix(.10339 -.12535 .16653 .10177 60.637 230.19)" xlink:href="#path7384"/>
                    <path id="path10890" style="filter: url(#filter9112); fill: url(#gradient-10);" d="m339.03 185.75c-12.9 0.4-25.74 5.33-39.65 22.44 7.6-5.07 15.45-8.58 23.37-10.57 16.74-4.2 32.97-1.86 46.81 3.04 12.59 4.44 23.31 10.97 31.91 17.25-0.46-0.52-0.84-1.08-1.22-1.66-0.41-0.51-2.25-2.67-5.37-5.5-3.5-3.16-8.32-7.07-13.91-10.78-11.16-7.41-25.54-13.88-39.22-14.22-0.97-0.02-1.9-0.03-2.72 0zm142.41 0.91c-13.39 0.33-27.41 6.49-38.44 13.68-5.49 3.58-10.34 7.48-13.97 10.72-3.62 3.24-6.33 6.27-6.34 6.28h-0.03c-2.98 3.77-7.76 5.76-12.57 5.16-1.59-0.2-3.07-0.74-4.47-1.44 2.37 1.86 4.63 3.7 6.47 5.35 1.72-1.49 3.53-3.03 5.66-4.69 8.82-6.88 20.55-14.51 34.47-19.66 13.93-5.15 30.33-7.79 47.34-3.75 8.2 1.95 16.37 5.51 24.25 10.75-14.88-18.31-28.5-22.75-42.37-22.4z" transform="matrix(.10339 -.12535 .16653 .10177 60.637 230.19)" xlink:href="#path9078"/>
                    <path id="path10896" style="fill: url(#gradient-11);" d="m114.04 219.28l8.24 5.25c13.08 8.34 40.28-2.12 56.64 0.44l0.09 0.06c-0.01-0.02-0.02-0.03-0.03-0.05 0.02 0.01 0.04 0.01 0.06 0.01l-0.09-0.06c-8.08-13.02-6.06-39.54-19.14-47.88l-8.24-5.26c13.1 8.36 11.05 34.93 19.17 47.94-16.35-2.6-43.6 7.9-56.7-0.45z"/>
                    <path id="path10898" style="filter: url(#filter9112); fill: url(#gradient-12);" d="m338.78 177.34c-15.85 0.49-32.32 7.48-48.22 28.32-7.93 10.39-11.09 20.15-11.09 29.96v4.5c0.83-1.22 1.48-2.47 2.41-3.68 13.31-17.46 28.16-26.95 42.93-30.66 14.78-3.71 29.24-1.68 41.94 2.81s23.76 11.44 32.22 17.88c5.93 4.51 9.95 8.28 13.03 11.47 2.77-2.75 6.24-5.9 10.94-9.56 8.33-6.51 19.41-13.67 32.22-18.41 12.8-4.74 27.44-7.04 42.46-3.47 15.03 3.57 30.15 13.06 43.69 30.81 0.93 1.22 1.58 2.46 2.41 3.69v-4.5c0-9.81-3.17-19.57-11.1-29.97-16.95-22.22-34.56-28.7-51.4-28.28-15.72 0.39-30.94 7.29-42.81 15.03-11.88 7.74-20.64 16.67-22.35 18.84-1.18 1.5-3.06 2.27-4.95 2.03-1.89-0.23-3.52-1.44-4.3-3.18-0.71-0.89-2.8-3.32-6.28-6.47-3.78-3.43-8.9-7.58-14.91-11.56-12-7.97-27.58-15.19-43.65-15.6-1.08-0.02-2.16-0.03-3.19 0z" transform="matrix(.13668 -.17291 .22014 .14039 24.443 233.56)" xlink:href="#path7386"/>
                    <path id="path10900" style="filter: url(#filter9406); fill: url(#gradient-13);" d="m278.59 266.62v7.32c0 27.31 25.6 56.06 55.97 84.59 28.47 26.74 60.38 53.1 77.32 80.16 16.92-27.06 48.86-53.42 77.34-80.16 30.38-28.53 55.97-57.28 55.97-84.59v-7.32c-10.41 20.87-29.75 40.82-50.63 60.41-30.7 28.82-64.81 57.15-79.18 83.69-0.71 1.27-2.05 2.07-3.5 2.07-1.46 0-2.8-0.8-3.5-2.07-14.39-26.54-48.47-54.86-79.16-83.69-20.87-19.6-40.23-39.54-50.63-60.41z" transform="matrix(.13668 -.17291 .22014 .14039 24.443 233.56)" xlink:href="#path7384"/>
                    <path id="path10902" style="filter: url(#filter9112); fill: url(#gradient-14);" d="m339.03 185.75c-12.9 0.4-25.74 5.33-39.65 22.44 7.6-5.07 15.45-8.58 23.37-10.57 16.74-4.2 32.97-1.86 46.81 3.04 12.59 4.44 23.31 10.97 31.91 17.25-0.46-0.52-0.84-1.08-1.22-1.66-0.41-0.51-2.25-2.67-5.37-5.5-3.5-3.16-8.32-7.07-13.91-10.78-11.16-7.41-25.54-13.88-39.22-14.22-0.97-0.02-1.9-0.03-2.72 0zm142.41 0.91c-13.39 0.33-27.41 6.49-38.44 13.68-5.49 3.58-10.34 7.48-13.97 10.72-3.62 3.24-6.33 6.27-6.34 6.28h-0.03c-2.98 3.77-7.76 5.76-12.57 5.16-1.59-0.2-3.07-0.74-4.47-1.44 2.37 1.86 4.63 3.7 6.47 5.35 1.72-1.49 3.53-3.03 5.66-4.69 8.82-6.88 20.55-14.51 34.47-19.66 13.93-5.15 30.33-7.79 47.34-3.75 8.2 1.95 16.37 5.51 24.25 10.75-14.88-18.31-28.5-22.75-42.37-22.4z" transform="matrix(.13668 -.17291 .22014 .14039 24.443 233.56)" xlink:href="#path9078"/>
                    <path id="path10904" style="fill: url(#gradient-15);" d="m104.26 312.71c0.81-9.69-0.39-19.39 8.95-29.09l-11.64 4.78c15.06-22.31 61.35-47.19 77.81-73v-0.19c0.01 0.03 0.03 0.06 0.05 0.09 0.02-0.03 0.05-0.06 0.07-0.09v0.19c16.57 25.77 74.31 59.55 86.57 79.39l-10.89-3.11-0.57 21.03c0-27.63-58.7-54.22-75.18-80.02-16.49 25.8-75.17 52.39-75.17 80.02z"/>
                    <path id="path10906" style="filter: url(#filter10171); fill: url(#gradient-16); stroke: url(#gradient-23);" d="m342.75 308.94c-1.57 2.24-3.18 4.48-4.91 6.68 3.29-2.51 7.94-2.09 10.72 0.97-2.08-2.56-3.99-5.1-5.81-7.65zm6.31 8.28c0.22 0.28 0.42 0.57 0.6 0.87 9.96 18.11 35.34 39.24 58.62 60.75 11.65 10.77 23.1 21.73 31.63 33.38 0.67-1.22 1.65-2.25 2.84-2.97-10.97-12.12-26.84-26.89-43.59-42.13-17.98-16.35-36.46-33.23-50.1-49.9zm-13.75 1.53c-11.95 14.58-26.9 28.4-41.56 41.81-13.81 12.64-26.99 24.86-37.31 36.28 0.42 0.33 0.81 0.7 1.15 1.1 6.11-6.49 12.73-12.84 19.5-19.1 23.01-21.25 48.02-42.13 58.22-60.09z" transform="matrix(.72724 0 0 .62687 -69.783 30.871)" xlink:href="#path10000"/>
                    <path id="path10910" style="fill: url(#gradient-17);" d="m231.06 176.69c-2.29-2.92-6.4-5.07-13.47-5.25-3.61-0.09-6.59 0.64-9.11 1.99l-8.53 4.59c2.52-1.35 5.5-2.08 9.11-1.99 21.56 0.54 15.63 19.55 14.35 22.12l-0.32 0.17c2.63 0.02 26.03 3.59 17.01 20.78-1.49 2.83-3.56 4.82-6.07 6.17l8.53-4.59c2.51-1.35 4.58-3.34 6.07-6.17 3.1-5.91 2.38-10.2-0.02-13.3-4.48-5.79-14.76-7.39-16.84-7.47l0.1-0.05c0.75-1.34 3.81-10.28-0.37-16.41-0.14-0.2-0.28-0.4-0.44-0.59z"/>
                    <path id="path10912" style="fill: url(#gradient-18);" d="m208.35 173.64l-8.54 4.59c-13.55 7.29-13.27 32.62-22.16 44.61l-0.09 0.05c0.02 0 0.03-0.01 0.05-0.01-0.01 0.02-0.01 0.03-0.03 0.05l0.1-0.05c16.43-1.62 42.79 9.68 56.34 2.4l8.54-4.59c-13.57 7.29-39.98-4.06-56.41-2.4 8.92-11.97 8.63-37.36 22.2-44.65z"/>
                    <path id="path10914" style="filter: url(#filter9112); fill: url(#gradient-19);" d="m338.78 177.34c-15.85 0.49-32.32 7.48-48.22 28.32-7.93 10.39-11.09 20.15-11.09 29.96v4.5c0.83-1.22 1.48-2.47 2.41-3.68 13.31-17.46 28.16-26.95 42.93-30.66 14.78-3.71 29.24-1.68 41.94 2.81s23.76 11.44 32.22 17.88c5.93 4.51 9.95 8.28 13.03 11.47 2.77-2.75 6.24-5.9 10.94-9.56 8.33-6.51 19.41-13.67 32.22-18.41 12.8-4.74 27.44-7.04 42.46-3.47 15.03 3.57 30.15 13.06 43.69 30.81 0.93 1.22 1.58 2.46 2.41 3.69v-4.5c0-9.81-3.17-19.57-11.1-29.97-16.95-22.22-34.56-28.7-51.4-28.28-15.72 0.39-30.94 7.29-42.81 15.03-11.88 7.74-20.64 16.67-22.35 18.84-1.18 1.5-3.06 2.27-4.95 2.03-1.89-0.23-3.52-1.44-4.3-3.18-0.71-0.89-2.8-3.32-6.28-6.47-3.78-3.43-8.9-7.58-14.91-11.56-12-7.97-27.58-15.19-43.65-15.6-1.08-0.02-2.16-0.03-3.19 0z" transform="matrix(.12457 .17133 -.22810 .12264 228.09 97.586)" xlink:href="#path7386"/>
                    <path id="path10916" style="filter: url(#filter9406); fill: url(#gradient-20);" d="m278.59 266.62v7.32c0 27.31 25.6 56.06 55.97 84.59 28.47 26.74 60.38 53.1 77.32 80.16 16.92-27.06 48.86-53.42 77.34-80.16 30.38-28.53 55.97-57.28 55.97-84.59v-7.32c-10.41 20.87-29.75 40.82-50.63 60.41-30.7 28.82-64.81 57.15-79.18 83.69-0.71 1.27-2.05 2.07-3.5 2.07-1.46 0-2.8-0.8-3.5-2.07-14.39-26.54-48.47-54.86-79.16-83.69-20.87-19.6-40.23-39.54-50.63-60.41z" transform="matrix(.12457 .17133 -.22810 .12264 228.09 97.586)" xlink:href="#path7384"/>
                    <path id="path10918" style="filter: url(#filter9112); fill: url(#gradient-21);" d="m339.03 185.75c-12.9 0.4-25.74 5.33-39.65 22.44 7.6-5.07 15.45-8.58 23.37-10.57 16.74-4.2 32.97-1.86 46.81 3.04 12.59 4.44 23.31 10.97 31.91 17.25-0.46-0.52-0.84-1.08-1.22-1.66-0.41-0.51-2.25-2.67-5.37-5.5-3.5-3.16-8.32-7.07-13.91-10.78-11.16-7.41-25.54-13.88-39.22-14.22-0.97-0.02-1.9-0.03-2.72 0zm142.41 0.91c-13.39 0.33-27.41 6.49-38.44 13.68-5.49 3.58-10.34 7.48-13.97 10.72-3.62 3.24-6.33 6.27-6.34 6.28h-0.03c-2.98 3.77-7.76 5.76-12.57 5.16-1.59-0.2-3.07-0.74-4.47-1.44 2.37 1.86 4.63 3.7 6.47 5.35 1.72-1.49 3.53-3.03 5.66-4.69 8.82-6.88 20.55-14.51 34.47-19.66 13.93-5.15 30.33-7.79 47.34-3.75 8.2 1.95 16.37 5.51 24.25 10.75-14.88-18.31-28.5-22.75-42.37-22.4z" transform="matrix(.12457 .17133 -.22810 .12264 228.09 97.586)" xlink:href="#path9078"/>
                    <path id="path10920" style="fill: url(#gradient-22);" d="m358.57 310.93a15.714 15.714 0 1 1 -31.43 0 15.714 15.714 0 1 1 31.43 0z" transform="matrix(.65712 0 0 .40524 -44.943 95.143)"/>
                  </g>
                </g>
                <path id="path11020" style="filter:url(#filter11242);fill:#ffffff" d="m658.57 338.08a10.714 10 0 1 1 -21.43 0 10.714 10 0 1 1 21.43 0z" transform="matrix(1.251 .82986 -.66688 .95433 -341.89 -789.55)"/>
                <path id="path11294" style="filter:url(#filter11324);fill:#ffffff" d="m582.86 487.36a66.429 100.72 0 1 1 -7.19 -45.55l-59.24 45.55z" transform="matrix(.070581 -.19886 .20492 .20533 2.4922 146.63)"/>
              </g>
            </g>
            <text style="fill: rgb(254, 249, 250); font-family: &quot;Bodoni MT Poster&quot;; font-size: 56.0434px; font-weight: 700; line-height: 71.1809px; stroke: rgb(31, 32, 30); stroke-miterlimit: 45; stroke-width: 0.577769px; text-anchor: middle; white-space: pre; opacity: 0.3;" transform="matrix(1.730788, 0, 0, 1.730801, 102.762741, 108.970848)">{shopsi.data.attributes.price}</text>
            <text style="fill: url(#gradient-25); font-family: &quot;Bodoni MT Poster&quot;; font-size: 56.0434px; font-weight: 700; line-height: 71.1809px; stroke: rgb(8, 33, 20); stroke-miterlimit: 45; stroke-width: 0.577769px; text-anchor: middle; white-space: pre; opacity: 0.3;" transform="matrix(1.673484, 0, 0, 0.795251, 103.355003, 141.6996)">₪</text>
</svg>
</div> 
         
         <p
         style="position:absolute; top: 40%;"
         class="text-sm text-gray-500 p-8 border-2 m-4 ">
           {shopsi.data.attributes.des}
         </p>
    {#if shopsi.data.attributes.kind !== "mydesign"}    
<a
           style="position:absolute; top: 64%; right: 65%;"
            href="{shopsi.data.attributes.url}"><Buy/>
 </a>
         {:else}
         <button
         style="position:absolute; top: 64%; right: 65%;"
          on:click={() => addToCart(shopsi.data.id)}><Buy/>
</button>

         {/if}
      <!--   <button
         style="position:absolute; top: 90%;"

         class="flex-none flex items-center justify-center w-9 h-9 rounded-md text-gray-400 border border-gray-300" type="button" aria-label="like">
           <svg width="20" height="20" fill="currentColor">
             <path fill-rule="evenodd" clip-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
           </svg>
         </button>-->
     </div>
     {/if}
</div>
{/await}
<style>

.slide  {
		max-height: 200px;
		width: auto;
		height: 100%;
		box-sizing: border-box;
		vertical-align: middle;
		object-fit: cover;
		position: relative;
		z-index: 1;
		border-radius: 1rem;
		box-shadow: 0 14px 25px rgba(0, 0, 0, 0.16);
	}
   .fullwidth{
      max-width: 100vw;
      overflow-y: hidden;
   }
   :global([data-svelte-dialog-content].content) {
    width: 66vw;
  /*  background-image: url(https://res.cloudinary.com/barb1/image/upload/v1642276506/KnittedWool_yuokzt.svg);
    background-position: center center;
    background-size: cover;
	*/
    z-index:222;
    }
	:global([data-svelte-dialog-overlay].over) {
		z-index:222;

	}

</style>

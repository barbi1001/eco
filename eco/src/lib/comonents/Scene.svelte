<script>
    //https://res.cloudinary.com/barb1/image/upload/v1676238523/%D7%A4%D7%AA%D7%A6%D7%95%D7%92%D7%94%D7%9C%D7%95%D7%A4%D7%A4%D7%99%D7%95%D7%9F_kkymez.glb

	import { AmbientLight, OrbitControls, PerspectiveCamera } from '@threlte/core'
	import { Environment, GLTF } from '@threlte/extras'
	//const { gltf } = useGltfAnimations<'Take 001'>(({ actions }) => {
	//	actions['Take 001']?.play()
	//})
	import { spring} from 'svelte/motion'
  let rotationt = 5

  const poz = spring({z:0, y:0.5, x:0});
 let boll = false
setInterval(() => {
	console.log("shalom",$poz)
 
  rotationt += 0.002
  if($poz.y < 1 && boll == false){
	poz.set({z:0,y:$poz.y+0.5, x:0})
  } else if ($poz.y > 0){
	boll = true
	poz.set({z:0, y:$poz.y-1, x:0 })
  } else {
	boll = false
	poz.set({z:0, y:$poz.y+0.5, x:0})
  }
/*
  if (boll == false){
  poz.set({z: 2, y:1, x:2})
  } else{
    poz.set({z: 0, y:-1, x:0})

  }*/

}, 1000);
//	const { scene } = useThrelte()
//	scene.background = new Color(0xeae8e2)
</script>
<!----
<PerspectiveCamera position={{ x: 600, y: 200, z: 600 }} near={10} far={10000}>
	<OrbitControls autoRotate autoRotateSpeed={0.2} enableDamping target={{ y: -75, x: -60 }} />
</PerspectiveCamera>

<AmbientLight />
<DirectionalLight position={{ y: 10, z: 5, x: 5 }} />
<Environment path="/hdr/" files="shanghai_riverside_1k.hdr" />

-->

<PerspectiveCamera position={{ x:0, y:0 , z:20}} fov={24}>
	<OrbitControls autoRotateSpeed={2} autoRotate enableDamping />
</PerspectiveCamera>
<!--
<AmbientLight  color={0xE8E8E8} intensity={19}  />
<AmbientLight  color={0x00029E} intensity={82}  rotation={345}/>
-->
<AmbientLight  color={0x2DFF34} intensity={180}  />
<GLTF
rotation={rotationt}
	position={$poz} 
	scale={5} 	
	url="https://res.cloudinary.com/barb1/image/upload/v1676238523/%D7%A4%D7%AA%D7%A6%D7%95%D7%92%D7%94%D7%9C%D7%95%D7%A4%D7%A4%D7%99%D7%95%D7%9F_kkymez.glb"
/>
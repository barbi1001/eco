<script>
    //https://res.cloudinary.com/barb1/image/upload/v1676238523/%D7%A4%D7%AA%D7%A6%D7%95%D7%92%D7%94%D7%9C%D7%95%D7%A4%D7%A4%D7%99%D7%95%D7%9F_kkymez.glb
	import { BoxBufferGeometry, Color, MeshStandardMaterial } from 'three'
	import { SpotLight, useFrame } from '@threlte/core'


	import { AmbientLight, OrbitControls, PerspectiveCamera, DirectionalLight } from '@threlte/core'
	import { Environment, GLTF } from '@threlte/extras'
	//const { gltf } = useGltfAnimations<'Take 001'>(({ actions }) => {
	//	actions['Take 001']?.play()
	//})
	import { spring} from 'svelte/motion'
  let rotationt = 0
		let rotX = 0
  let poz = {z:29, y:-12.5, x:10.5};
  let obPoz = {z:0, y:0, x:0}
 let boll = false
 let bool = false
 useFrame(() => {

   if(rotationt < 1.5 && boll == false){
	rotationt += 0.01
	rotX += 0.04

	obPoz.x += 0.01
} else if(rotationt > -1.5){
	boll = true
	rotX -= 0.04
	rotationt -= 0.01
	obPoz.x -= 0.01

} else{
	boll = false

}
/*
if(rotationt < 0.5 && boll == false){
	rotationt += 0.01
} else if(rotationt > -0.5){
	boll = true
	rotationt -= 0.01
} else{
	boll = false

}*/

console.log(rotationt)
//	poz.y += 1
//	poz.x += 1
  })
  /*
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

  if (boll == false){
  poz.set({z: 2, y:1, x:2})
  } else{
    poz.set({z: 0, y:-1, x:0})

  }

}, 1000);*/
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
	<OrbitControls  enableDamping />
</PerspectiveCamera>
<AmbientLight  color={new Color( 0x2DFF34)}  intensity={0.61} />
<!--
<AmbientLight  color={new Color(0x00029E)}  intensity={1} rotation={345}/>
color={0x2DFF34} intensity={180} $poz
<AmbientLight color={new Color( 0x2DFF34 )} intensity={1} />

-->
<SpotLight position={poz} />

<DirectionalLight color={new Color(0x00029E)} intensity={0.81} position={{ y: 20, z: 5, x: 5 }} />
<DirectionalLight color={new Color(0x137584)} intensity={0.91} position={{ y: 2, z: 5, x: 5 }} />

<GLTF
rotation={{
	y:rotationt,
	z:rotationt,
	x:rotX
	}}
	position={obPoz} 
	scale={9} 	
	url="https://res.cloudinary.com/barb1/image/upload/v1676238523/%D7%A4%D7%AA%D7%A6%D7%95%D7%92%D7%94%D7%9C%D7%95%D7%A4%D7%A4%D7%99%D7%95%D7%9F_kkymez.glb"
/>
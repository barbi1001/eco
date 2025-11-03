<script>
	import { useTask, T } from '@threlte/core';
	import { GLTF } from '@threlte/extras';
	import { tweened } from 'svelte/motion';

	let rotation = $state(0);
	let scale = tweened(2.4);
	let isHovering = $state(false);
	let rotationDirection = 'left';
	let rotationDirectionChangeCounter = 0;
	let rotationChangeThreshold = 300; // adjust this value to change the frequency of direction changes

	useTask(() => {
		if (!isHovering) {
			rotation += rotationDirection === 'left' ? 0.01 : -0.01;
			rotationDirectionChangeCounter++;
			if (rotationDirectionChangeCounter >= rotationChangeThreshold) {
				rotationDirection = rotationDirection === 'left' ? 'right' : 'left';
				rotationDirectionChangeCounter = 0;
			}
		}
	});
</script>

<T.PerspectiveCamera position={[0, 0, 5]} fov={50} />
<T.DirectionalLight position={[3, 3, 3]} intensity={2} />
<T.AmbientLight intensity={1} />

<GLTF
	url="/heart_gold_sparkling__1130230237_texture.glb"
	position={[0, -0.8, 0]}
	scale={$scale}
	rotation={[0, rotation, 0]}
	interactive
	on:pointerenter={() => {
		isHovering = true;
		scale.set(2.8);
	}}
	on:pointerleave={() => {
		isHovering = false;
		scale.set(2.4);
	}}
/>

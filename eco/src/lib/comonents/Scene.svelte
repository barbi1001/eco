<script>
	import { T, useTask } from '@threlte/core'
	import { GLTF } from '@threlte/extras'
	import { spring } from 'svelte/motion'

	let { onclicked } = $props()

	let rotation = $state(0)
	let floatOffset = $state(0)
	let isHovering = false
	let isPointerDown = false

	const scale = spring([4.5, 4.5, 4.5], {
		stiffness: 0.1,
		damping: 0.4
	})

	useTask((state) => {
		if (!isHovering) {
			rotation += 0.01
			const elapsedTime = state?.clock?.elapsedTime || Date.now() * 0.001
			floatOffset = Math.sin(elapsedTime * 0.8) * 0.15
		}
	})

	function handlePointerEnter() {
		isHovering = true
		scale.set([5, 5, 5])
	}

	function handlePointerLeave() {
		isHovering = false
		isPointerDown = false
		scale.set([4.5, 4.5, 4.5])
	}

	function handlePointerDown() {
		isPointerDown = true
	}

	function handlePointerUp() {
		isPointerDown = false
		onclicked?.()
	}
</script>

<T.PerspectiveCamera position={[0, 0, 25]} fov={45} />

<T.DirectionalLight position={[5, 5, 5]} intensity={2.5} />
<T.DirectionalLight position={[-5, 5, -5]} intensity={2} />
<T.AmbientLight intensity={0.8} />

<T.Group position.y={floatOffset} rotation.y={rotation}>
	<GLTF
		url="https://res.cloudinary.com/barb2/image/upload/v1679085889/PAPION_nq7chg.glb"
		scale={$scale}
		position={[0, 0, 0]}
		castShadow
		receiveShadow
		interactive
		on:pointerenter={handlePointerEnter}
		on:pointerleave={handlePointerLeave}
		on:pointerdown={handlePointerDown}
		on:pointerup={handlePointerUp}
		onerror={(e) => console.error('GLTF error:', e)}
	/>
</T.Group>

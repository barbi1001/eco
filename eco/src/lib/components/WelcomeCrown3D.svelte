<script>
    import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
    import { T } from '@threlte/core'
    import { useTask } from '@threlte/core'
    import { GLTF } from '@threlte/extras'
    import { spring } from 'svelte/motion'

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')

    let rotation = $state(0)
    let floatOffset = $state(0)
    let isHovering = false
    let isPointerDown = false

    const scale = spring([1.8, 1.8, 1.8], {
        stiffness: 0.1,
        damping: 0.4
    })
    const hover = spring(0, {
        stiffness: 0.1,
        damping: 0.4
    })

    useTask((state) => {
        if (!isHovering && !isPointerDown) {
            rotation += 0.003
            const elapsedTime = state?.clock?.elapsedTime || Date.now() * 0.001
            floatOffset = Math.sin(elapsedTime * 0.8) * 0.08
        } else if (isPointerDown) {
            const fullRotations = Math.floor(rotation / (Math.PI * 2))
            const targetRotation = fullRotations * Math.PI * 2
            const diff = targetRotation - rotation
            if (Math.abs(diff) > 0.01) {
                rotation += diff * 0.15
            } else {
                rotation = targetRotation
            }
        }
    })

    function handlePointerEnter() {
        isHovering = true
        scale.set([2.1, 2.1, 2.1])
        hover.set(0.08)
    }

    function handlePointerLeave() {
        isHovering = false
        isPointerDown = false
        scale.set([1.8, 1.8, 1.8])
        hover.set(0)
    }

    function handlePointerDown() {
        isPointerDown = true
        scale.set([1.95, 1.95, 1.95])
        hover.set(0.12)
    }

    function handlePointerUp() {
        isPointerDown = false
        if (isHovering) {
            scale.set([2.1, 2.1, 2.1])
            hover.set(0.08)
        }
    }

    function handlePointerCancel() {
        isPointerDown = false
        isHovering = false
        scale.set([1.8, 1.8, 1.8])
        hover.set(0)
    }
</script>

<!-- Camera closer (z=1.8 vs z=3) so the crown fills the canvas -->
<T.PerspectiveCamera
    position={[0, 0.1, 1.8]}
    fov={50}
/>

<T.DirectionalLight position={[5, 5, 5]} intensity={2.5} />
<T.DirectionalLight position={[-5, 5, -5]} intensity={2} />
<T.DirectionalLight position={[0, 5, 0]} intensity={1.5} />
<T.AmbientLight intensity={0.6} />

<T.Group
    position.y={floatOffset + $hover}
    rotation.y={rotation}
>
    <GLTF
        url="/כתר_זהב_עם_ע_1129224434_texture.glb"
        scale={$scale}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        interactive
        on:pointerenter={handlePointerEnter}
        on:pointerleave={handlePointerLeave}
        on:pointerdown={handlePointerDown}
        on:pointerup={handlePointerUp}
        on:pointercancel={handlePointerCancel}
    />
</T.Group>

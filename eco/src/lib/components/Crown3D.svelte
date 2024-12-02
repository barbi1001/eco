<script>
    import { T } from '@threlte/core'
    import { useFrame } from '@threlte/core'
    import { GLTF } from '@threlte/extras'
    import { spring } from 'svelte/motion'

    let rotation = 0
    let floatOffset = 0
    let isHovering = false
    let isPointerDown = false
    
    // Create spring animations for interactive effects
    const scale = spring([8, 8, 8], {
        stiffness: 0.1,
        damping: 0.4
    })
    const hover = spring(0, {
        stiffness: 0.1,
        damping: 0.4
    })
    
    useFrame((state) => {
        if (!isHovering && !isPointerDown) {
            // Normal idle animation
            rotation += 0.003
            floatOffset = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
        } else if (isPointerDown) {
            // Always rotate towards 0
            const fullRotations = Math.floor(rotation / (Math.PI * 2))
            const targetRotation = fullRotations * Math.PI * 2
            const diff = targetRotation - rotation
            
            if (Math.abs(diff) > 0.01) {
                rotation += diff * 0.15 // Increased speed multiplier
            } else {
                rotation = targetRotation // Snap exactly to 0
            }
        }
    })

    // Handle interactions
    function handlePointerEnter() {
        isHovering = true
        scale.set([9, 9, 9])
        hover.set(0.5)
    }

    function handlePointerLeave() {
        isHovering = false
        isPointerDown = false
        scale.set([8, 8, 8])
        hover.set(0)
    }

    function handlePointerDown() {
        isPointerDown = true
        scale.set([8.5, 8.5, 8.5])
        hover.set(1)
    }

    function handlePointerUp() {
        isPointerDown = false
        if (isHovering) {
            scale.set([9, 9, 9])
            hover.set(0.5)
        }
    }

    function handlePointerCancel() {
        isPointerDown = false
        isHovering = false
        scale.set([8, 8, 8])
        hover.set(0)
    }
</script>

<T.PerspectiveCamera
    position={[0, 0, 1.2]}
    fov={65}
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
        position={[0, -0.5, 0]}
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

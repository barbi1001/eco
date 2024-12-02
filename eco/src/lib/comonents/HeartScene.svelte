<script>
    import { AmbientLight, PerspectiveCamera, DirectionalLight, useFrame } from '@threlte/core';
    import { Environment, GLTF } from '@threlte/extras';
    import { tweened } from 'svelte/motion';

    let rotation = 0;
    let scale = tweened(1.2);
    let isHovering = false;

    useFrame(() => {
        if (!isHovering) {
           rotation += 0.01;
        }
    });
</script>

<PerspectiveCamera position={{ x: 0, y: 0, z: 5 }} fov={50} />
<DirectionalLight position={{ x: 3, y: 3, z: 3 }} intensity={2} />
<AmbientLight intensity={1} />

<GLTF 
    url="/heart_gold_sparkling__1130230237_texture.glb"
    position={{ x: 0, y: 0, z: 0 }}
    scale={$scale}
    rotation={{ x: 0, y: rotation, z: 0 }}
    on:pointerenter={() => {
        isHovering = true;
        scale.set(1.4);
    }}
    on:pointerleave={() => {
        isHovering = false;
        scale.set(1.2);
    }}
/>

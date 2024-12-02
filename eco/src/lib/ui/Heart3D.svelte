<script>
    import { T } from '@threlte/core';
    import { Environment, GLTF } from '@threlte/extras';

    export let scale = 1;
    export let position = { x: 0, y: 0, z: 0 };
    export let rotation = { x: 0, y: 0, z: 0 };
</script>

<T.Group {position} {rotation} {scale}>
    <GLTF 
        url="/heart_gold_sparkling__1130230237_texture.glb"
        position={{ x: 0, y: 0, z: 0 }}
        scale={0.5}
    />
</T.Group>

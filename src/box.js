import * as THREE from "three";

export default class Box extends THREE.Mesh {
    constructor(position) {
        const geometry = new THREE.BoxGeometry(20, 20 , 20);
        const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );

        super(geometry, material);

        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }
}
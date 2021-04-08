import * as THREE from "three";

export default class Floor extends THREE.Mesh {
    constructor(position) {
        let geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ color: "#999999" });

        super(geometry, material);
    }
}
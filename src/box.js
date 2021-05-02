import * as THREE from "three";
import { MESH_COLOR, MESH_TRANSPARENCY } from "./app";

export default class Box extends THREE.Mesh {
    constructor(position = new THREE.Vector3(0, 0, 0)) {
        const geometry = new THREE.BoxGeometry(20, 20 , 20);
        const material = new THREE.MeshPhongMaterial( { color: MESH_COLOR } );
        material.transparent = true;
        material.opacity = MESH_TRANSPARENCY;

        super(geometry, material);

        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
    }
}
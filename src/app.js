import * as THREE from "three";
import Box from "./box";
import Floor from "./floor";
import Player from "./player";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import Model from "./model";

export const PLAYER_SPEED = 400.0;
export const PLAYER_COLLISION_DISTANCE = 10;
export const PLAYER_INTERACTIVITY_DISTANCE = 1000;

export const MESH_COLOR = "#fff";
export const MESH_TRANSPARENCY = 0.5;

let camera, scene, renderer, controls;

init();
setupScene();
// setupEventListeners();
animate();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function setupScene() {
  // Create the camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;

  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  // Create lighting
  const light = new THREE.HemisphereLight("0xeeeeff", 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  // const box = new Box();
  // scene.add(box);

  loadModel("https://downloads.ctfassets.net/8r9hib204w0q/3vraaSis3wcvDOhF7J3JXV/a99f2fd8b1130d8580030d74f9999d7d/Buehne_Links_Complete.glb").then(res => scene.add(res))

  // Create the floor
  // const floor = new Floor();
  // scene.add(floor);

  controls = new OrbitControls(camera, renderer.domElement);
  // controls = new Player(camera, document, scene);
}

function loadModel(model, scale, position) {
  return new Promise((resolve, reject) => {
    // Instantiate a loader
    const loader = new GLTFLoader();
    // Load a glTF resource
    loader.load(
      model,
      (gltf) => {
        // gltf.scene.scale.set(scale, scale, scale);
        // gltf.scene.position.set(position.x, position.y, position.z);
        resolve(gltf.scene);
      },
      // called while loading is progressing
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error) {
        console.error("An error happened", error);
        reject();
      }
    );
  });
}

function setupEventListeners() {
  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  instructions.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  });

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

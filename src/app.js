import * as THREE from "three";
import Box from "./box";
import Floor from "./floor";
import Player from "./player";

export const PLAYER_SPEED = 400.0;
export const PLAYER_COLLISION_DISTANCE = 10;
export const PLAYER_INTERACTIVITY_DISTANCE = 1000;

let camera, scene, renderer, player;

init();
setupScene();
setupEventListeners();
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
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  // Create player
  player = new Player(camera, document, scene);
  scene.add(player.getObject());

  // Create the floor
  const floor = new Floor();
  scene.add(floor);

  // Create box environment
  const objects = [];
  for (let i = 0; i < 30; i ++) {
    const cube = new Box(new THREE.Vector3(i * 30, 10, -30));
    scene.add(cube);
    objects.push(cube);
  }

  // Assign collision objects to player
  player.setCollisionObjects(objects);
}

function setupEventListeners() {

  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  instructions.addEventListener("click", function () {
    player.lock();
  });

  player.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  player.addEventListener("unlock", function () {
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
  player.update();
  renderer.render(scene, camera);
}
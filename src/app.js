import * as THREE from "three";

import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

let camera, scene, renderer, controls;

const objects = [];

let raycasterBottom;
let raycasterInfront;
let raycasterBehind;
let raycasterLeft;
let raycasterRight;
let raycasterPointer;

let objectPointerAt;
let followCamera = false;
let isFollowing;
let originalPosition;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  controls = new PointerLockControls(camera, document.body);

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

  scene.add(controls.getObject());

  const onKeyDown = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  };

  const onKeyUp = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  const onMouseDown = function (event) {
    if (controls.isLocked) {
      followCamera = !followCamera;
    }
    // if (objectPointerAt) {
    //   followCamera = true;
    // }
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("mouseup", onMouseDown);

  raycasterBottom = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );
  raycasterInfront = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, 0, -1),
    0,
    10
  );
  raycasterBehind = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(),
    0,
    10
  );
  raycasterLeft = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(),
    0,
    10
  );
  raycasterRight = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(),
    0,
    10
  );
  raycasterPointer = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(),
    0,
    100
  );

  // floor

  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
  floorGeometry.rotateX(-Math.PI / 2);

  let position = floorGeometry.attributes.position;

  const floorMaterial = new THREE.MeshBasicMaterial({ color: "#999999" });
  

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  scene.add(floor);

  // cubes
  for (let i = 0; i < 30; i ++) {
    const geometry = new THREE.BoxGeometry(20, 20 , 20);
    const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = i * 30;
    cube.position.y = 10;
    cube.position.z = -30;
    scene.add( cube );
    objects.push(cube);
  }


  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {
    raycasterBottom.ray.origin.copy(controls.getObject().position);
    raycasterBottom.ray.origin.y -= 10;

    raycasterInfront.ray.origin.copy(controls.getObject().position);
    raycasterInfront.ray.direction.copy(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion));
    raycasterInfront.ray.origin.y -= 5;

    raycasterBehind.ray.origin.copy(controls.getObject().position);
    raycasterBehind.ray.direction.copy(new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion));
    raycasterBehind.ray.origin.y -= 5;
    
    raycasterLeft.ray.origin.copy(controls.getObject().position);
    raycasterLeft.ray.direction.copy(new THREE.Vector3(-1, 0, 0).applyQuaternion(camera.quaternion));
    raycasterLeft.ray.origin.y -= 5;

    raycasterRight.ray.origin.copy(controls.getObject().position);
    raycasterRight.ray.direction.copy(new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion));
    raycasterRight.ray.origin.y -= 5;

    raycasterPointer.ray.origin.copy(controls.getObject().position);
    raycasterPointer.ray.direction.copy(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion));

    const intersections = raycasterBottom.intersectObjects(objects);
    const intersectionsInfront = raycasterInfront.intersectObjects(objects);
    const intersectionsBehind = raycasterBehind.intersectObjects(objects);
    const intersectionsLeft = raycasterLeft.intersectObjects(objects);
    const intersectionsRight = raycasterRight.intersectObjects(objects);
    const intersectionsPointer = raycasterPointer.intersectObjects(objects);

    const onObject = intersections.length > 0;
    const infrontObject = intersectionsInfront.length > 0;
    const behindObject = intersectionsBehind.length > 0;
    const leftObject = intersectionsLeft.length > 0;
    const rightObject = intersectionsRight.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    if (infrontObject === true) {
      velocity.z = Math.max(0, velocity.z);
    }

    if (behindObject === true) {
      velocity.z = Math.min(0, velocity.z);
    }

    if (leftObject === true) {
      velocity.x = Math.min(0, velocity.x);
    }

    if (rightObject === true) {
      velocity.x = Math.max(0, velocity.x);
    }

    if (followCamera && objectPointerAt) {
      if (!isFollowing) {
        isFollowing = true;
        originalPosition = JSON.parse(JSON.stringify(objectPointerAt.position));
        console.log(originalPosition);
      }
      objectPointerAt.material = new THREE.MeshPhongMaterial( { color: "#da431e" } );
      camera.add(objectPointerAt);
      objectPointerAt.position.set(0,0,-30);
      objectPointerAt.scale.x = objectPointerAt.scale.y = objectPointerAt.scale.z = 0.6;
    } else {

      if (isFollowing) {
        camera.remove(objectPointerAt);
        scene.add( objectPointerAt );
        console.log(originalPosition);
        objectPointerAt.position.x = originalPosition.x;
        objectPointerAt.position.y = originalPosition.y;
        objectPointerAt.position.z = originalPosition.z;
        objectPointerAt.scale.x = objectPointerAt.scale.y = objectPointerAt.scale.z = 1;
        objectPointerAt.material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
        isFollowing = false;
        originalPosition = undefined;
      }

      if (intersectionsPointer.length > 0) {
        if (!objectPointerAt || (objectPointerAt.uuid !== intersectionsPointer[0].object.uuid)) {
          if (objectPointerAt) {
            objectPointerAt.material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
            objectPointerAt.scale.x = objectPointerAt.scale.y = objectPointerAt.scale.z = 1;
            console.log(1);
  
          }
          objectPointerAt = intersectionsPointer[0].object;
          objectPointerAt.material = new THREE.MeshPhongMaterial( { color: "#ffab2e" } );
          objectPointerAt.scale.x = objectPointerAt.scale.y = objectPointerAt.scale.z = 1.1;
          console.log(2);
  
        } else {
        }
      } else {
        if (objectPointerAt) {
          objectPointerAt.material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
          objectPointerAt.scale.x = objectPointerAt.scale.y = objectPointerAt.scale.z = 1;
          console.log(3);
          objectPointerAt = undefined;
        }
      }
    }


    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}

import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { PLAYER_COLLISION_DISTANCE, PLAYER_INTERACTIVITY_DISTANCE, PLAYER_SPEED } from "./app";

export default class Player extends PointerLockControls {
  constructor(camera, document, scene) {
    super(camera, document.body);
    this.camera = camera;
    this.scene = scene;

    this.raycasterInfront = undefined;
    this.raycasterBehind = undefined;
    this.raycasterLeft = undefined;
    this.raycasterRight = undefined;
    this.raycasterPointer = undefined;

    this.hoveringItem = undefined;
    this.followCamera = false;
    this.isFollowing = undefined;
    this.originalPosition = undefined;

    this.isMoveForward = false;
    this.isMoveBackward = false;
    this.isMoveLeft = false;
    this.isMoveRight = false;

    this.prevTime = performance.now();
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.setupInputs(document);
    this.setupRays();
  }

  setCollisionObjects(objects) {
    this.objects = objects;
  }

  setupInputs(document) {

    const onKeyDown = (event) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          this.isMoveForward = true;
          break;

        case "ArrowLeft":
        case "KeyA":
          this.isMoveLeft = true;
          break;

        case "ArrowDown":
        case "KeyS":
          this.isMoveBackward = true;
          break;

        case "ArrowRight":
        case "KeyD":
          this.isMoveRight = true;
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          this.isMoveForward = false;
          break;

        case "ArrowLeft":
        case "KeyA":
          this.isMoveLeft = false;
          break;

        case "ArrowDown":
        case "KeyS":
          this.isMoveBackward = false;
          break;

        case "ArrowRight":
        case "KeyD":
          this.isMoveRight = false;
          break;
      }
    };

    const onMouseDown = (event) => {
      if (this.isLocked && this.hoveringItem) {
        if (!this.isFollowing) {
          this.setSelectedEffect(this.hoveringItem);
        } else {
          this.setUnselectedEffect(this.hoveringItem);
        }
      }
    };

    document.body.addEventListener("keydown", onKeyDown);
    document.body.addEventListener("keyup", onKeyUp);
    document.body.addEventListener("mousedown", onMouseDown);
  }

  setupRays() {
    this.raycasterInfront = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, -1),
      0,
      PLAYER_COLLISION_DISTANCE
    );
    this.raycasterBehind = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(),
      0,
      PLAYER_COLLISION_DISTANCE
    );
    this.raycasterLeft = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(),
      0,
      PLAYER_COLLISION_DISTANCE
    );
    this.raycasterRight = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(),
      0,
      PLAYER_COLLISION_DISTANCE
    );
    this.raycasterPointer = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(),
      0,
      PLAYER_INTERACTIVITY_DISTANCE
    );
  }

  update() {
    if (this.isLocked) {
      this.movementWithCollision();
      this.objectInteraction();
    }
  }

  movementWithCollision() {
    const time = performance.now();

    const delta = (time - this.prevTime) / 1000;

    // Reset velocity of previous frame
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    // Assign direction of movement
    this.direction.z = Number(this.isMoveForward) - Number(this.isMoveBackward);
    this.direction.x = Number(this.isMoveRight) - Number(this.isMoveLeft);
    this.direction.normalize(); // this ensures consistent movements in all directions

    // Set velocity based on key input
    // Multiplication of delta (time difference between fames) ensures movement speed is independent of framerate
    if (this.isMoveForward || this.isMoveBackward)
      this.velocity.z -= this.direction.z * PLAYER_SPEED * delta;
    if (this.isMoveLeft || this.isMoveRight)
      this.velocity.x -= this.direction.x * PLAYER_SPEED * delta;

    // Cast rays in direction of movements
    this.raycasterInfront.ray.origin.copy(this.getObject().position);
    this.raycasterInfront.ray.direction.copy(
      new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion)
    );
    this.raycasterInfront.ray.origin.y -= 5;

    this.raycasterBehind.ray.origin.copy(this.getObject().position);
    this.raycasterBehind.ray.direction.copy(
      new THREE.Vector3(0, 0, 1).applyQuaternion(this.camera.quaternion)
    );
    this.raycasterBehind.ray.origin.y -= 5;

    this.raycasterLeft.ray.origin.copy(this.getObject().position);
    this.raycasterLeft.ray.direction.copy(
      new THREE.Vector3(-1, 0, 0).applyQuaternion(this.camera.quaternion)
    );
    this.raycasterLeft.ray.origin.y -= 5;

    this.raycasterRight.ray.origin.copy(this.getObject().position);
    this.raycasterRight.ray.direction.copy(
      new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion)
    );
    this.raycasterRight.ray.origin.y -= 5;

    // Check for collisions in directions of movements
    const intersectionsInfront = this.raycasterInfront.intersectObjects(
      this.objects
    );
    const intersectionsBehind = this.raycasterBehind.intersectObjects(
      this.objects
    );
    const intersectionsLeft = this.raycasterLeft.intersectObjects(this.objects);
    const intersectionsRight = this.raycasterRight.intersectObjects(
      this.objects
    );

    // check for objects in direction of movements
    const infrontObject = intersectionsInfront.length > 0;
    const behindObject = intersectionsBehind.length > 0;
    const leftObject = intersectionsLeft.length > 0;
    const rightObject = intersectionsRight.length > 0;

    // Check for collations in directions of movements and if there is a collision, only allow movement in the opposite direction of the collision
    if (infrontObject) {
      this.velocity.z = Math.max(0, this.velocity.z);
    }

    if (behindObject) {
      this.velocity.z = Math.min(0, this.velocity.z);
    }

    if (leftObject) {
      this.velocity.x = Math.min(0, this.velocity.x);
    }

    if (rightObject) {
      this.velocity.x = Math.max(0, this.velocity.x);
    }

    // Update this with velocity
    this.moveRight(-this.velocity.x * delta);
    this.moveForward(-this.velocity.z * delta);

    this.prevTime = time;
  }

  objectInteraction() {
    this.raycasterPointer.ray.origin.copy(this.getObject().position);
    this.raycasterPointer.ray.direction.copy(
      new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion)
    );

    const intersectionsPointer = this.raycasterPointer.intersectObjects(
      this.objects
    );

    // Check for items over pointer
    if (intersectionsPointer.length > 0) {
      // Check if the hovering item from last frame is different to item at pointer
      if (
        !this.hoveringItem ||
        this.hoveringItem.uuid !== intersectionsPointer[0].object.uuid
      ) {
        // reset the hovering effect of hovering item from last frame if exists
        if (this.hoveringItem) {
          this.resetHoveringEffect(this.hoveringItem);
        }
        // Set new hovering item
        this.hoveringItem = intersectionsPointer[0].object;
        this.setHoveringEffect(this.hoveringItem);
      }
    } else {
      // If pointer is not over any item
      if (this.hoveringItem) {
        // reset hover effect of previous hovering item, if exists
        this.resetHoveringEffect(this.hoveringItem);
        // no item is being hovered
        this.hoveringItem = undefined;
      }
    }
  }

  setHoveringEffect(item) {
    item.material = new THREE.MeshPhongMaterial({
      color: "#ffab2e",
    });
    item.scale.x = item.scale.y = item.scale.z = 1.1;
  }

  resetHoveringEffect(item) {
    item.material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
    });
    item.scale.x = item.scale.y = item.scale.z = 1;
  }

  setSelectedEffect(item) {
    this.originalPosition = JSON.parse(JSON.stringify(this.hoveringItem.position));
    item.material = new THREE.MeshPhongMaterial({
      color: "#e63131",
    });
    this.hoveringItem.scale.x = this.hoveringItem.scale.y = this.hoveringItem.scale.z = 0.1;
    this.camera.add(this.hoveringItem);
    this.hoveringItem.position.set(0, 0, -5);
    this.isFollowing = true;
  }

  setUnselectedEffect(item) {
    this.camera.remove(item);
    this.scene.add(item);
    item.position.x = this.originalPosition.x;
    item.position.y = this.originalPosition.y;
    item.position.z = this.originalPosition.z;
    item.scale.x = item.scale.y = item.scale.z = 1;
    item.material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.isFollowing = false;
    this.originalPosition = undefined;
  }
}

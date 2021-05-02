import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default class Model extends GLTFLoader {
    constructor(modelPath, scaleFactor) {
        super();
        this.modelPath = modelPath;
        this.scaleFactor = scaleFactor;

        // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderConfig({ type: "js" });
        dracoLoader.setDecoderPath(
            "../node_modules/three/examples/js/libs/draco/gltf/"
        );
        this.setDRACOLoader(dracoLoader);
    }

    async init() {
        const model = await this.loadAsync(this.modelPath, this.debugLoadingProgress);
        model.scene.scale.set(this.scaleFactor, this.scaleFactor, this.scaleFactor);
        model.scene.traverse((o) => {
            if (o.isMesh) {
                o.material.transparent = true;
                o.material.opacity = 0.5;
            }
        });
        return model.scene;
    }
    
    debugLoadingProgress(xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    }
}
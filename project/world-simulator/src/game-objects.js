/**
 * @typedef {import('./engine/asset-management/AssetManager').default} AssetManager
 */
import * as THREE from 'three';

import SpaceFighter from "./engine/physics/object/SpaceFighter";
import DirectionalProjectile from "./engine/physics/object/DirectionalProjectile";

/**
 * @param {number} objectId
 * @param {AssetManager} assetManager
 * @returns {SpaceFighter}
 */
export function spaceFighterFactory(objectId, assetManager) {
    const asset = assetManager.get3dAsset('spaceFighter');

    const model = asset.scene.children[0].clone();
    model.matrixAutoUpdate = false;

    return new SpaceFighter(objectId, model);
}

export function gunProjectileFactory(objectId) {
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    geometry.applyMatrix(new THREE.Matrix4().makeScale( 1.0, 1.0, 4.0));

    const model = new THREE.Mesh(geometry);

    return new DirectionalProjectile(objectId, model);
}

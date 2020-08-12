/**
 * @typedef {import('./engine/asset-management/AssetManager').default} AssetManager
 */

import SpaceFighter from "./engine/physics/object/SpaceFighter";

/**
 * @param {number} objectId
 * @param {AssetManager} assetManager
 * @returns {SpaceFighter}
 */
export function spaceFighterFactory(objectId, assetManager) {
    //const asset = assetManager.get3dAsset('smallSpaceFighter');
    //const model = asset.scene.children[0].children[0].clone();
    //model.matrixAutoUpdate = false;

    return new SpaceFighter(objectId);
}

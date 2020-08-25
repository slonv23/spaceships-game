import {diContainer} from "./engine/globals";

import RemoteSpaceFighterController from "./engine/object-control/space-fighter/RemoteSpaceFighterController";
import ProjectileSequenceController from "./engine/object-control/projectile/ProjectileSequenceController";

import {gunProjectileFactory, spaceFighterFactory} from "./game-objects";

export const controllers = Object.freeze({
    REMOTE_SPACE_FIGHTER_CONTROLLER: Symbol(),
    SPACE_FIGHTER_GUN_PROJECTILES: Symbol(),
});

diContainer.registerClass(controllers.REMOTE_SPACE_FIGHTER_CONTROLLER, RemoteSpaceFighterController, {
    gameObjectFactory: spaceFighterFactory,
});
diContainer.registerClass(controllers.SPACE_FIGHTER_GUN_PROJECTILES, ProjectileSequenceController, {
    gameObjectFactory: gunProjectileFactory,
});

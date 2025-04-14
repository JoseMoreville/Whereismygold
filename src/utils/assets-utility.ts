import { Assets } from '@drincs/pixi-vn';

/**
 * Define all the assets that will be used in the game.
 * This function will be called before the game starts.
 * You can read more about assets management in the documentation: https://pixi-vn.web.app/start/assets-management.html
 */
export async function defineAssets() {
    // Character assets
    Assets.add({
        alias: 'background_main_menu',
        src: '/background_main_menu.png',
    });
    Assets.add({
        alias: 'webiem',
        src: '/webio.webp',
    });
    Assets.add({
        alias: 'goblin',
        src: '/goblin.png',
    });
    Assets.add({
        alias: 'storekeeper',
        src: '/shopkeeper.png',
    });

    // Background assets
    Assets.add({
        alias: 'bg-store-with-keeper',
        src: '/bg-store.png',
    });
    Assets.add({
        alias: 'bg-store-empty',
        src: '/bg-store-empty.png',
    });
    Assets.add({
        alias: 'bg-forest',
        src: '/bg-forest.png',
    });
    Assets.add({
        alias: 'bg-cave-entrance',
        src: '/bg-cave-entrance.png',
    });
    Assets.add({
        alias: 'bg-cave-empty',
        src: '/bg-cave-empty.png',
    });
    Assets.add({
        alias: 'bg-cave-gold',
        src: '/bg-cave-gold.png',
    });

    // Load all assets before starting
    try {
        console.log('Loading game assets...');
        await Assets.load([
            'webiem',
            'goblin',
            'storekeeper',
            'bg-store-with-keeper',
            'bg-store-empty',
            'bg-forest',
            'bg-cave-entrance',
            'bg-cave-empty',
            'bg-cave-gold',
        ]);
        console.log('Game assets loaded successfully!');
    } catch (error) {
        console.error('Error loading game assets:', error);
        throw error;
    }
}

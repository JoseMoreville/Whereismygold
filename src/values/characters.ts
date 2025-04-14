import { CharacterBaseModel, saveCharacter } from '@drincs/pixi-vn';

export const webiem = new CharacterBaseModel('webiem', {
    name: 'Webiem',
    color: '#4CAF50',
    icon: '/webio.webp',
});

export const goblin = new CharacterBaseModel('goblin', {
    name: 'Goblin',
    color: '#8BC34A',
    icon: '/goblin.png',
});

export const storekeeper = new CharacterBaseModel('storekeeper', {
    name: 'Storekeeper',
    color: '#795548',
    icon: '/shopkeeper.png',
});

// Save characters in the game
saveCharacter([webiem, goblin, storekeeper]);

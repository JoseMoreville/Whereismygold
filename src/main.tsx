import { canvas, clearAllGameDatas, Container, narration } from '@drincs/pixi-vn';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CANVAS_UI_LAYER_NAME } from './constans';
import './index.css';
import { defineAssets } from './utils/assets-utility';
import './values/characters';

// Canvas setup with PIXI
const body = document.body;
if (!body) {
    throw new Error('body element not found');
}

async function initializeGame() {
    try {
        // Initialize canvas
        await canvas.initialize(body, {
            height: 1080,
            width: 1920,
            backgroundColor: '#303030',
        });

        // Load all game assets
        await defineAssets();

        // Setup UI layer
        canvas.addLayer(CANVAS_UI_LAYER_NAME, new Container());

        // React setup
        const root = document.getElementById('root');
        if (!root) {
            throw new Error('root element not found');
        }

        canvas.initializeHTMLLayout(root);
        if (!canvas.htmlLayout) {
            throw new Error('htmlLayout not found');
        }

        // Clear any previous game data
        clearAllGameDatas();

        // Create and render React root
        const reactRoot = createRoot(canvas.htmlLayout);
        reactRoot.render(<App />);

        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
}

initializeGame();

narration.onGameEnd = async ({ navigate }) => {
    clearAllGameDatas();
    navigate('/');
};

narration.onStepError = async (_error, { notify, t }) => {
    notify(t('allert_error_occurred'), { variant: 'error' });
};

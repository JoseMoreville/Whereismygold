import { Box } from '@mui/joy';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import Routes from './AppRoutes';
import { Terminal } from './components/Terminal';
import useClosePageDetector from './hooks/useClosePageDetector';
import useKeyboardDetector from './hooks/useKeyboardDetector';
import useEventListener from './hooks/useKeyDetector';
import useNetworkDetector from './hooks/useNetworkDetector';
import Imports from './Imports';
import GameSaveScreen from './screens/GameSaveScreen';
import SaveLoadAlert from './screens/modals/SaveLoadAlert';
import OfflineScreen from './screens/OfflineScreen';
import Settings from './screens/Settings';
import useTerminalStore from './stores/useTerminalStore';

function HomeChild() {
    useKeyboardDetector();
    useClosePageDetector();
    useNetworkDetector();
    // Prevent the user from going back to the previous page
    useEventListener({
        type: 'popstate',
        listener: () => {
            window.history.forward();
        },
    });

    // Test button state
    const [showTestPanel, setShowTestPanel] = useState(false);

    // Get terminal store state and actions
    const { isReady } = useTerminalStore();

    // Log information to help debug terminal tab visibility
    useEffect(() => {
        console.log('Home component mounted - Terminal should be available');
    }, [isReady]);

    return (
        <>
            <Routes />
            <Settings />
            <GameSaveScreen />
            <SaveLoadAlert />
            <OfflineScreen />

            <Terminal autoStart={true} floatingTab={true} theme='game' />

            <Box
                sx={{
                    pointerEvents: 'auto',
                }}
            >
                <ReactQueryDevtools initialIsOpen={false} />
            </Box>
        </>
    );
}

export default function Home() {
    return (
        <Imports>
            <HomeChild />
        </Imports>
    );
}

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MAIN_MENU_ROUTE } from '../constans';
import { useMyNavigate } from '../utils/navigate-utility';
import useEventListener from './useKeyDetector';

export default function useClosePageDetector() {
    const navigate = useMyNavigate();
    const queryClient = useQueryClient();
    const location = useLocation();

    useEventListener({
        type: 'beforeunload',
        listener: async () => {
            // State saving disabled
            // if (location.pathname === MAIN_MENU_ROUTE || location.pathname === LOADING_ROUTE) {
            //     return;
            // }
            // await addRefreshSave();
            return;
        },
    });

    useEffect(() => {
        // State loading disabled
        // loadRefreshSave(navigate).then(() =>
        //     queryClient.invalidateQueries({ queryKey: [INTERFACE_DATA_USE_QUEY_KEY] })
        // );

        // Just navigate to main menu instead of loading saved state
        navigate(MAIN_MENU_ROUTE);
    }, []);

    return null;
}

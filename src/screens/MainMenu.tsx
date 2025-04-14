import { canvas, ImageSprite, narration } from '@drincs/pixi-vn';
import Stack from '@mui/joy/Stack';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import MenuButton from '../components/MenuButton';
import { CANVAS_UI_LAYER_NAME, NARRATION_ROUTE } from '../constans';
import useGameProps from '../hooks/useGameProps';
import startLabel from '../labels/startLabel';
import useInterfaceStore from '../stores/useInterfaceStore';
import { INTERFACE_DATA_USE_QUEY_KEY } from '../use_query/useQueryInterface';

export default function MainMenu() {
    const editHideInterface = useInterfaceStore((state) => state.setHidden);

    const queryClient = useQueryClient();
    const gameProps = useGameProps();
    const { uiTransition: t, navigate } = gameProps;

    useEffect(() => {
        editHideInterface(false);
        let bg = new ImageSprite({}, 'background_main_menu');
        bg.load();
        let layer = canvas.getLayer(CANVAS_UI_LAYER_NAME);
        if (layer) {
            layer.addChild(bg);
        }

        return () => {
            canvas.getLayer(CANVAS_UI_LAYER_NAME)?.removeChildren();
        };
    });

    return (
        <Stack
            direction='column'
            justifyContent='center'
            alignItems='flex-start'
            spacing={{ xs: 1, sm: 2, lg: 3 }}
            sx={{
                height: '100%',
                width: '100%',
                paddingLeft: { xs: 1, sm: 2, md: 4, lg: 6, xl: 8 },
            }}
            component={motion.div}
            initial='closed'
            animate={'open'}
            exit='closed'
        >
            <MenuButton
                className='w-64 !bg-black !border-2 !border-white'
                onClick={() => {
                    canvas.removeAll();
                    navigate(NARRATION_ROUTE);
                    narration
                        .callLabel(startLabel, gameProps)
                        .then(() => queryClient.invalidateQueries({ queryKey: [INTERFACE_DATA_USE_QUEY_KEY] }));
                }}
                transitionDelay={0.2}
            >
                {t('start')}
            </MenuButton>
        </Stack>
    );
}

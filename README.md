# Where is my gold: A Linux Adventure - CheerpX Hackathon Submission

## Try demo
https://gold.hadess.dev/

## Project Overview

Where is my gold: A Linux Adventure is an educational game that combines visual novel storytelling with practical Linux command learning through an integrated terminal powered by CheerpX. Players progress through a treasure-hunting adventure story where they must use Linux commands to solve puzzles and advance the narrative as they search for hidden gold. This is a Work in progress, it's planned to add a hard mode where the user will have to use their knowledge of Linux commands to solve puzzles and advance the narrative as they search for hidden gold.

## CheerpX Integration

### Implementation Details

The game incorporates CheerpX in the following ways:

1. **Terminal Emulation**: We use CheerpX to provide a real Linux terminal environment in the browser, allowing players to execute actual Linux commands.

2. **Disk Image Configuration**: We connect to a Debian Linux disk image hosted at `wss://disks.webvm.io/debian_large_20230522_5044875331.ext2`.

3. **Command Execution**: The game uses the `executeGameCommand` function to send commands to the terminal and capture the output, although it's not used in the current version and right now man commands are the ones that are executed, it's planned to be used in the hard mode.

### Core Integration Files

-   `src/hooks/useCheerpx.tsx`: Contains the core CheerpX integration logic
-   `src/components/Terminal.tsx`: UI component for the terminal
-   `src/stores/useTerminalStore.ts`: State management for terminal operations
-   `src/labels/startLabel.ts`: Game logic that interacts with terminal commands

### Technical Challenges Overcome

1. **Security**: Added simulation mode to ensure that on this mode the user can learn the commands without the risk of breaking the system or wasting time by trying to execute commands they don't know.

2. **Terminal Output Capture**: added system to capture and display terminal output in the game interface.

3. **Command Execution Flow**: Used the `executeGameCommand` function to send commands to the terminal and capture the output, although it's not used in the current version, it's planned to be used in the hard mode, right now it's just for testing purposes and to show the user the commands they can use.
4.

## Considerations for future improvements

The project could be improved in the following ways:

-   Adding a hard mode where the user will have to use their knowledge of Linux commands to solve puzzles and advance the narrative as they search for hidden gold.
-   Implement saving mode included on PixiVN.
-   Added a more rich and complex story, with more puzzles and a more complex plot.
-   Learn InkJS to allow contributors to write the story and puzzles, and simplify the development of the story.

## Libraries Used

-   [CheerpX](https://github.com/leaningtech/webvm)
-   [PixiVN](https://github.com/DRincs-Productions/pixi-vn)
-   [PixiVN Template](https://github.com/DRincs-Productions/pixi-vn-react-template)

## Generative AI tools used

-   [Claude](https://www.anthropic.com/claude) - Used to help me generate ideas and write the story.
-   [GPT-4](https://www.openai.com/gpt-4) - Used to help me generate most of the assets of the game.

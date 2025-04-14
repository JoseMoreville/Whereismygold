import { Assets, ChoiceMenuOption, narration, newLabel, showImage } from '@drincs/pixi-vn';
import { executeGameCommand } from '../components/Terminal';
import { goblin, storekeeper, webiem } from '../values/characters';

// Utility function for creating automatic transitions between steps
const createTransition = (labelName: string, nextSteps: (() => void)[]) => {
    const nextLabel = newLabel(labelName, nextSteps);
    return () => {
        narration.choiceMenuOptions = [new ChoiceMenuOption('Continue', nextLabel, {}, { autoSelect: true })];
    };
};

// Function forward declarations
const forestScene = () => {
    console.log('Forest scene started');
    return [
        async () => {
            narration.dialogue = {
                character: webiem,
                text: `Which command should I use to list the contents of my inventory?`,
            };

            const lsLabel = newLabel('ls', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `ls command shows:\n\nbackpack  map  water_flask`,
                    };
                },
                createTransition('check_backpack', checkBackpackLabel()),
            ]);

            const dirLabel = newLabel('dir', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `The dir command works similarly to ls, but is more commonly used in Windows. In Linux, we typically use ls.\n\nbackpack  map  water_flask`,
                    };
                },
                createTransition('check_backpack', checkBackpackLabel()),
            ]);

            const wrongLabel = newLabel('wrong', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `I'm not sure that's the right command to list items... Maybe I should try something else.`,
                    };
                },
                createTransition('try_again', forestScene()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('ls', lsLabel, {}, {}),
                new ChoiceMenuOption('dir', dirLabel, {}, {}),
                new ChoiceMenuOption('find', wrongLabel, {}, {}),
                new ChoiceMenuOption('show', wrongLabel, {}, {}),
            ];
        },
    ];
};

const checkBackpackLabel = () => {
    return [
        () => {
            narration.dialogue = {
                character: webiem,
                text: `I need to check what's in my backpack. What command should I use to enter the backpack directory?`,
            };

            const cdLabel = newLabel('cd_backpack', [
                () => {
                    try {
                        executeGameCommand('cd backpack')
                            .then((result) => {
                                console.log('Successfully changed directory to backpack:', result);
                                // If we get a result with help information, display it
                                if (result && result.includes('DESCRIPTION')) {
                                    narration.dialogue = {
                                        character: webiem,
                                        text: `I've entered my backpack directory.\n\nReminder: ${
                                            result.split('\n')[0]
                                        }`,
                                    };
                                } else {
                                    narration.dialogue = {
                                        character: webiem,
                                        text: `I've entered my backpack directory.`,
                                    };
                                }
                            })
                            .catch((err) => {
                                console.error('Failed to execute command:', err);
                                // Still proceed even if command failed - terminal simulator should handle it
                                narration.dialogue = {
                                    character: webiem,
                                    text: `I've entered my backpack directory. (Note: The command ran in simulation mode.)`,
                                };
                            });
                    } catch (error) {
                        console.error('Error executing command:', error);
                        // Still proceed even if command failed
                        narration.dialogue = {
                            character: webiem,
                            text: `I've entered my backpack directory. (Note: The command ran in simulation mode.)`,
                        };
                    }
                },
                createTransition('list_backpack', listBackpackContents()),
            ]);

            const wrongLabel = newLabel('wrong_cd', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to change directories... The 'cd' command is used to change directories in Linux. Try 'cd backpack'.`,
                    };
                },
                createTransition('try_again_cd', checkBackpackLabel()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('cd backpack', cdLabel, {}, {}),
                new ChoiceMenuOption('goto backpack', wrongLabel, {}, {}),
                new ChoiceMenuOption('enter backpack', wrongLabel, {}, {}),
                new ChoiceMenuOption('open backpack', wrongLabel, {}, {}),
            ];
        },
    ];
};

const listBackpackContents = () => {
    return [
        () => {
            narration.dialogue = {
                character: webiem,
                text: `Now I should list what's in my backpack. What command should I use?`,
            };

            const lsLabel = newLabel('ls_backpack', [
                () => {
                    try {
                        executeGameCommand('ls')
                            .then((result) => {
                                console.log('Successfully listed directory contents:', result);
                                // If we get a result with help information, display it
                                if (result && result.includes('DESCRIPTION')) {
                                    narration.dialogue = {
                                        character: webiem,
                                        text: `I can see:\n\ncompass  dagger  journal  provisions\n\nReminder: ${
                                            result.split('\n')[0]
                                        }`,
                                    };
                                } else {
                                    narration.dialogue = {
                                        character: webiem,
                                        text: `I can see:\n\ncompass  dagger  journal  provisions`,
                                    };
                                }
                            })
                            .catch((err) => {
                                console.error('Failed to execute command:', err);
                                // Still proceed even if command failed
                                narration.dialogue = {
                                    character: webiem,
                                    text: `I can see:\n\ncompass  dagger  journal  provisions\n\n(Note: The command ran in simulation mode.)`,
                                };
                            });
                    } catch (error) {
                        console.error('Error executing command:', error);
                        // Still proceed even if command failed
                        narration.dialogue = {
                            character: webiem,
                            text: `I can see:\n\ncompass  dagger  journal  provisions\n\n(Note: The command ran in simulation mode.)`,
                        };
                    }
                },
                createTransition('return_main', returnToMain()),
            ]);

            const dirLabel = newLabel('dir_backpack', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `The dir command works in Linux too, but ls is more common.\n\ncompass  dagger  journal  provisions`,
                    };
                },
                createTransition('return_main', returnToMain()),
            ]);

            const wrongLabel = newLabel('wrong_ls', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to list directory contents... In Linux, we use 'ls' to list files and directories.`,
                    };
                },
                createTransition('try_again_ls', listBackpackContents()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('ls', lsLabel, {}, {}),
                new ChoiceMenuOption('dir', dirLabel, {}, {}),
                new ChoiceMenuOption('list', wrongLabel, {}, {}),
                new ChoiceMenuOption('show', wrongLabel, {}, {}),
            ];
        },
    ];
};

const returnToMain = () => {
    return [
        () => {
            narration.dialogue = {
                character: webiem,
                text: `I need to go back to my main directory. What command should I use?`,
            };

            const cdParentLabel = newLabel('cd_parent', [
                () => {
                    try {
                        executeGameCommand('cd ..')
                            .then(() => {
                                console.log('Successfully moved up one directory');
                            })
                            .catch((err) => {
                                console.error('Failed to execute command:', err);
                            });
                    } catch (error) {
                        console.error('Error executing command:', error);
                    }

                    narration.dialogue = {
                        character: webiem,
                        text: `I'm back at my main inventory now.`,
                    };
                },
                createTransition('check_map', checkMap()),
            ]);

            const wrongLabel = newLabel('wrong_cd_parent', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to go up a directory...`,
                    };
                },
                createTransition('try_again_cd_parent', returnToMain()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('cd ..', cdParentLabel, {}, {}),
                new ChoiceMenuOption('cd ~', cdParentLabel, {}, {}),
                new ChoiceMenuOption('exit', wrongLabel, {}, {}),
                new ChoiceMenuOption('back', wrongLabel, {}, {}),
            ];
        },
    ];
};

const checkMap = () => {
    return [
        () => {
            narration.dialogue = {
                character: webiem,
                text: `I should check my map to see where the goblin might be hiding. What command would let me read the contents of the map file?`,
            };

            const catMapLabel = newLabel('cat_map', [
                () => {
                    try {
                        executeGameCommand('cat map')
                            .then(() => {
                                console.log('Successfully read map contents');
                            })
                            .catch((err) => {
                                console.error('Failed to execute command:', err);
                            });
                    } catch (error) {
                        console.error('Error executing command:', error);
                    }

                    narration.dialogue = {
                        character: webiem,
                        text: `*The map shows a small cave to the north marked with 'Goblin hideout?'*`,
                    };
                },
                createTransition('find_cave', findGoblinCave()),
            ]);

            const lessMapLabel = newLabel('less_map', [
                () => {
                    try {
                        executeGameCommand('less map || cat map')
                            .then(() => {
                                console.log('Successfully read map contents with less or cat');
                            })
                            .catch((err) => {
                                console.error('Failed to execute command:', err);
                            });
                    } catch (error) {
                        console.error('Error executing command:', error);
                    }

                    narration.dialogue = {
                        character: webiem,
                        text: `*The map shows a small cave to the north marked with 'Goblin hideout?'*\n\nThe less command is great for viewing larger files with scrolling, but for this small map, cat would work too.`,
                    };
                },
                createTransition('find_cave', findGoblinCave()),
            ]);

            const wrongLabel = newLabel('wrong_read_map', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to read the map...`,
                    };
                },
                createTransition('try_again_map', checkMap()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('cat map', catMapLabel, {}, {}),
                new ChoiceMenuOption('less map', lessMapLabel, {}, {}),
                new ChoiceMenuOption('open map', wrongLabel, {}, {}),
                new ChoiceMenuOption('read map', wrongLabel, {}, {}),
            ];
        },
    ];
};

const findGoblinCave = () => {
    return [
        () => {
            // Update background to outside cave entrance
            showImage('bg', 'bg-cave-entrance', {
                scale: 1.5,
            });
            narration.dialogue = {
                character: webiem,
                text: `I need to navigate to the goblin cave. But first, what command would tell me my current location?`,
            };

            const pwdLabel = newLabel('pwd', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `pwd\n\n/forest/clearing\n\nNow I know where I am!`,
                    };
                },
                createTransition('go_to_cave', goToCave()),
            ]);

            const wrongLabel = newLabel('wrong_location', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to show my current directory...`,
                    };
                },
                createTransition('try_again_pwd', findGoblinCave()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('pwd', pwdLabel, {}, {}),
                new ChoiceMenuOption('location', wrongLabel, {}, {}),
                new ChoiceMenuOption('whereami', wrongLabel, {}, {}),
                new ChoiceMenuOption('echo $PWD', pwdLabel, {}, {}),
            ];
        },
    ];
};

const goToCave = () => {
    return [
        () => {
            // Update background to cave entrance
            showImage('bg', 'bg-cave-entrance', {
                scale: 1.5,
            });
            narration.dialogue = {
                character: webiem,
                text: `According to the map, I need to go to /forest/north/cave. What command would take me directly there?`,
            };

            const cdCaveLabel = newLabel('cd_cave', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `cd /forest/north/cave\n\nI've reached the goblin's cave!`,
                    };
                },
                createTransition('confront_goblin', confrontGoblin()),
            ]);

            const cdStepByStepLabel = newLabel('cd_step_by_step', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `I could go step by step:\ncd ..\ncd north\ncd cave\n\nBut using the absolute path is more direct. I've reached the goblin's cave!`,
                    };
                },
                createTransition('confront_goblin', confrontGoblin()),
            ]);

            const wrongLabel = newLabel('wrong_cave', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right way to navigate to the cave...`,
                    };
                },
                createTransition('try_again_cave', goToCave()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('cd /forest/north/cave', cdCaveLabel, {}, {}),
                new ChoiceMenuOption('cd ../north/cave', cdStepByStepLabel, {}, {}),
                new ChoiceMenuOption('goto cave', wrongLabel, {}, {}),
                new ChoiceMenuOption('move to cave', wrongLabel, {}, {}),
            ];
        },
    ];
};

const confrontGoblin = () => {
    return [
        () => {
            // Update background to empty cave
            showImage('bg', 'bg-cave-empty', {
                scale: 1.5,
            });
            narration.dialogue = {
                character: goblin,
                text: `Heheheh! Who dares enter my cave? Your gold is mine now!`,
            };
        },
        () => {
            narration.dialogue = {
                character: webiem,
                text: `Give me back my gold, goblin! I need to see what's in this cave. Which command should I use?`,
            };

            const lsLabel = newLabel('ls_cave', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `ls\n\ngoblin.txt  gold_pouch  trap.sh`,
                    };
                },
                createTransition('check_goblin', checkGoblinOrTrap()),
            ]);

            const lslaLabel = newLabel('ls_la_cave', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `ls -la\n\ntotal 3\ndrwxr-xr-x 1 goblin goblin  0 Apr 11 12:34 .\ndrwxr-xr-x 1 forest forest  0 Apr 11 12:32 ..\n-rw-r--r-- 1 goblin goblin 26 Apr 11 12:33 goblin.txt\n-rw-r--r-- 1 goblin goblin 50 Apr 11 12:30 gold_pouch\n-rwxr-xr-x 1 goblin goblin 42 Apr 11 12:34 trap.sh\n\nThat's more detail than I needed, but it shows that trap.sh is executable!`,
                    };
                },
                createTransition('check_goblin', checkGoblinOrTrap()),
            ]);

            const wrongLabel = newLabel('wrong_ls_cave', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to list the files in the cave...`,
                    };
                },
                createTransition('try_again_ls_cave', confrontGoblin()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('ls', lsLabel, {}, {}),
                new ChoiceMenuOption('ls -la', lslaLabel, {}, {}),
                new ChoiceMenuOption('find', wrongLabel, {}, {}),
                new ChoiceMenuOption('show', wrongLabel, {}, {}),
            ];
        },
    ];
};

const checkGoblinOrTrap = () => {
    return [
        () => {
            // Update background to empty cave
            showImage('bg', 'bg-cave-empty', {
                scale: 1.5,
            });
            narration.dialogue = {
                character: webiem,
                text: `I should check the goblin's information before grabbing my gold. Which command lets me read the goblin.txt file?`,
            };

            const catGoblinLabel = newLabel('cat_goblin', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `cat goblin.txt\n\n"Weakness: afraid of grep command"`,
                    };
                },
                createTransition('defeat_goblin', defeatGoblin()),
            ]);

            const wrongLabel = newLabel('wrong_read_goblin', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to view the file contents...`,
                    };
                },
                createTransition('try_again_cat_goblin', checkGoblinOrTrap()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('cat goblin.txt', catGoblinLabel, {}, {}),
                new ChoiceMenuOption('less goblin.txt', catGoblinLabel, {}, {}),
                new ChoiceMenuOption('open goblin.txt', wrongLabel, {}, {}),
                new ChoiceMenuOption('read goblin.txt', wrongLabel, {}, {}),
            ];
        },
    ];
};

const defeatGoblin = () => {
    return [
        () => {
            narration.dialogue = {
                character: webiem,
                text: `So the goblin is afraid of the grep command! Let me try using it. What should I search for?`,
            };

            const grepGoldLabel = newLabel('grep_gold', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `grep "gold" *\n\n*The goblin screams in terror!*\n\ngold_pouch:50 gold pieces`,
                    };
                },
                createTransition('take_gold', takeGold()),
            ]);

            const wrongLabel = newLabel('wrong_grep', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `The goblin doesn't seem scared by that grep command...`,
                    };
                },
                createTransition('try_again_grep', defeatGoblin()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('grep "gold" *', grepGoldLabel, {}, {}),
                new ChoiceMenuOption('grep -i "GOLD"', grepGoldLabel, {}, {}),
                new ChoiceMenuOption('grep "goblin"', wrongLabel, {}, {}),
                new ChoiceMenuOption('grep "trap"', wrongLabel, {}, {}),
            ];
        },
    ];
};

const takeGold = () => {
    return [
        () => {
            // Update background to cave with gold
            showImage('bg', 'bg-cave-gold', {
                scale: 1.5,
            });
            narration.dialogue = {
                character: goblin,
                text: `Aaaaaah! Not the grep command! Take your gold and leave me alone!`,
            };
        },
        () => {
            narration.dialogue = {
                character: webiem,
                text: `I need to copy my gold pouch to my inventory. Which command should I use?`,
            };

            const cpGoldLabel = newLabel('cp_gold', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `cp gold_pouch ~\n\nI've copied my gold pouch to my home directory!`,
                    };
                },
                createTransition('return_to_armory', returnToArmory()),
            ]);

            const mvGoldLabel = newLabel('mv_gold', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `mv gold_pouch ~\n\nI've moved my gold pouch to my home directory! The goblin no longer has a copy.`,
                    };
                },
                createTransition('return_to_armory', returnToArmory()),
            ]);

            const wrongLabel = newLabel('wrong_take_gold', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to take my gold...`,
                    };
                },
                createTransition('try_again_gold', takeGold()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('cp gold_pouch ~', cpGoldLabel, {}, {}),
                new ChoiceMenuOption('mv gold_pouch ~', mvGoldLabel, {}, {}),
                new ChoiceMenuOption('take gold_pouch', wrongLabel, {}, {}),
                new ChoiceMenuOption('get gold_pouch', wrongLabel, {}, {}),
            ];
        },
    ];
};

const returnToArmory = () => {
    return [
        () => {
            narration.dialogue = {
                character: webiem,
                text: `I have my gold now! I need to get back to the armory. What command could help me find it?`,
            };

            const findArmoryLabel = newLabel('find_armory', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `find / -name armory\n\n/town/market/armory`,
                    };
                },
                createTransition('go_to_armory', goToArmory()),
            ]);

            const lsArmoryLabel = newLabel('ls_armory', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `ls /town/market\n\n./armory:`,
                    };
                },
                createTransition('go_to_armory', goToArmory()),
            ]);

            const wrongLabel = newLabel('wrong_find_armory', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That command won't help me find the armory...`,
                    };
                },
                createTransition('try_again_find_armory', returnToArmory()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('find / -name armory', findArmoryLabel, {}, {}),
                new ChoiceMenuOption('ls /town/market', lsArmoryLabel, {}, {}),
                new ChoiceMenuOption('locate armory', wrongLabel, {}, {}),
                new ChoiceMenuOption('whereis armory', wrongLabel, {}, {}),
            ];
        },
    ];
};

const goToArmory = () => {
    return [
        () => {
            narration.dialogue = {
                character: webiem,
                text: `Now I need to go to the armory. Which command should I use?`,
            };

            const cdArmoryLabel = newLabel('cd_armory', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `cd /town/market/armory\n\nI've made it back to the armory!`,
                    };
                },
                createTransition('check_gold', checkGold()),
            ]);

            const wrongLabel = newLabel('wrong_cd_armory', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to go to the armory...`,
                    };
                },
                createTransition('try_again_cd_armory', goToArmory()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('cd /town/market/armory', cdArmoryLabel, {}, {}),
                new ChoiceMenuOption('goto /town/market/armory', wrongLabel, {}, {}),
                new ChoiceMenuOption('move /town/market/armory', wrongLabel, {}, {}),
                new ChoiceMenuOption('navigate /town/market/armory', wrongLabel, {}, {}),
            ];
        },
    ];
};

const checkGold = () => {
    return [
        async () => {
            await showImage('bg', 'bg-store-with-keeper', {
                scale: 1.5,
                xAlign: 0.5,
                yAlign: 0.5,
            });
            await showImage('webiem', 'webiem', {
                scale: 0.8,
                xAlign: 1,
                yAlign: 0,
            });
            narration.dialogue = {
                character: storekeeper,
                text: `Welcome back! Do you have the 50 gold pieces for the sword now?`,
            };
        },
        () => {
            narration.dialogue = {
                character: webiem,
                text: `Let me check. What command should I use to view the contents of my gold pouch?`,
            };

            const catGoldLabel = newLabel('cat_gold', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `cat ~/gold_pouch\n\n50 gold pieces`,
                    };
                },
                createTransition('buy_sword', buySword()),
            ]);

            const checkWrongLabel = newLabel('wrong_check_gold', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to check my gold...`,
                    };
                },
                createTransition('try_again_check_gold', checkGold()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('cat ~/gold_pouch', catGoldLabel, {}, {}),
                new ChoiceMenuOption('less ~/gold_pouch', catGoldLabel, {}, {}),
                new ChoiceMenuOption('open ~/gold_pouch', checkWrongLabel, {}, {}),
                new ChoiceMenuOption('read ~/gold_pouch', checkWrongLabel, {}, {}),
            ];
        },
    ];
};

const buySword = () => {
    return [
        () => {
            narration.dialogue = {
                character: storekeeper,
                text: `Perfect! That's exactly 50 gold pieces. The sword is yours! Let me add it to your inventory.`,
            };
        },
        () => {
            narration.dialogue = {
                character: webiem,
                text: `Which command would create a new file "sword" in my home directory?`,
            };

            const touchSwordLabel = newLabel('touch_sword', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `touch ~/sword\n\nI've created a new file representing the sword in my inventory!`,
                    };
                },
                createTransition('complete_purchase', completePurchase()),
            ]);

            const mvSwordLabel = newLabel('mv_sword', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `mv sword ~\n\nI've moved the sword to my inventory!`,
                    };
                },
                createTransition('complete_purchase', completePurchase()),
            ]);

            const wrongLabel = newLabel('wrong_sword', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to create a new file...`,
                    };
                },
                createTransition('try_again_sword', buySword()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('touch ~/sword', touchSwordLabel, {}, {}),
                new ChoiceMenuOption('echo "Sword" > ~/sword', touchSwordLabel, {}, {}),
                new ChoiceMenuOption('mv sword ~', mvSwordLabel, {}, {}),
                new ChoiceMenuOption('create ~/sword', wrongLabel, {}, {}),
            ];
        },
    ];
};

const completePurchase = () => {
    return [
        () => {
            narration.dialogue = {
                character: storekeeper,
                text: `Excellent! The sword is now in your inventory. Now you're ready for more adventures!`,
            };
        },
        () => {
            narration.dialogue = {
                character: webiem,
                text: `Let's see what items I have now. Which command should I use?`,
            };

            const lsLabel = newLabel('final_ls', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `ls ~\n\nbackpack  compass  dagger  gold_pouch  map  sword  water_flask\n\nPerfect! The sword is now mine.`,
                    };
                },
                createTransition('end_game', endGame()),
            ]);

            const wrongLabel = newLabel('wrong_final_ls', [
                () => {
                    narration.dialogue = {
                        character: webiem,
                        text: `That's not the right command to list my inventory...`,
                    };
                },
                createTransition('try_again_final_ls', completePurchase()),
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('ls ~', lsLabel, {}, {}),
                new ChoiceMenuOption('ls -la ~', lsLabel, {}, {}),
                new ChoiceMenuOption('show inventory', wrongLabel, {}, {}),
                new ChoiceMenuOption('list items', wrongLabel, {}, {}),
            ];
        },
    ];
};

const endGame = () => {
    return [
        () => {
            narration.dialogue = {
                character: webiem,
                text: `Congratulations! You've completed this Linux adventure!\n\nYou've learned several important Linux commands:\n\n- ls: List directory contents\n- cd: Change directory\n- pwd: Print working directory\n- cat: Display file contents\n- grep: Search text\n- cp/mv: Copy/move files\n- touch: Create files\n\nNow you're ready for more Linux adventures!`,
            };
        },
        () => {
            // Add a choice to end game instead of directly closing all labels
            const endGameLabel = newLabel('end_game_final', [
                () => {
                    console.log('Ending game properly');
                    narration.closeAllLabels();
                },
            ]);

            narration.choiceMenuOptions = [
                new ChoiceMenuOption('Finish Adventure', endGameLabel, {}, { autoSelect: true }),
            ];
        },
    ];
};

// Main startLabel definition
const startLabel = newLabel(
    'start',
    [
        // Introduction scene at the armory
        async () => {
            try {
                // Use the clear command directly to reset the terminal
                await executeGameCommand('clear');
                console.log('Terminal cleared successfully');
            } catch (error) {
                console.error('Error clearing terminal:', error);
            }
            console.log('Starting game - Introduction scene');
            await showImage('bg', 'bg-forest', {
                scale: 1.5,
                xAlign: 0.5,
                yAlign: 0.5,
            });
            await showImage('webiem', 'webiem', {
                scale: 0.8,
                xAlign: 1,
                yAlign: 0,
            });

            // First show a help message about the terminal
            narration.dialogue = {
                character: webiem,
                text: `Welcome to the Linux Adventure Game! This game teaches you Linux commands through an interactive story.
                
The terminal panel on the right side of the screen will show you the output of Linux commands as you make choices in the game. You don't need to type any commands - just select the correct command option when prompted, and you'll see what happens in the terminal window.

Each command's output will help you understand how Linux commands work in a real system.

Let's begin our adventure!`,
            };
        },
        async () => {
            await showImage('bg', 'bg-store-empty', {
                scale: 1.5,
                xAlign: 0.5,
                yAlign: 0.5,
            });
            narration.dialogue = {
                character: webiem,
                text: `That sword looks nice. And it's on sale! I need to get it before someone else does.`,
            };
        },
        async () => {
            // Show the store with the storekeeper
            await showImage('bg', 'bg-store-with-keeper', {
                scale: 1.5,
                xAlign: 0.5,
                yAlign: 0.5,
            });
            narration.dialogue = {
                character: storekeeper,
                text: `That'll be 50 gold pieces, friend.`,
            };
        },
        async () => {
            console.log('Webiem discovers gold is missing');
            narration.dialogue = {
                character: webiem,
                text: `Let me check my... Wait, where is my gold pouch?!`,
            };
        },
        async () => {
            console.log('Transition to empty store');
            // Hide the storekeeper

            await showImage('bg', 'bg-store-empty', {
                scale: 1.5,
                xAlign: 0.5,
                yAlign: 0.5,
            });
            narration.dialogue = {
                character: webiem,
                text: `I must have lost it in the forest on my way here. I need to find it!`,
            };
        },
        // Forest scene - beginning of the Linux learning journey
        async () => {
            console.log('Transition to forest scene');
            await showImage('bg', 'bg-forest', {
                scale: 1.5,
                xAlign: 0.5,
                yAlign: 0.5,
            });
            await showImage('webiem', 'webiem', {
                scale: 0.8,
                xAlign: 1,
                yAlign: 0,
            });
            narration.dialogue = {
                character: webiem,
                text: `Here I am back in the forest. First, I should check what I still have with me. 
                
Notice the terminal panel on the right side. It will show you the output of any Linux commands I run. The commands themselves will be selected through the choices you make for me.`,
            };
        },
        createTransition('forest_scene', forestScene()),
    ],
    {
        onLoadingLabel: () => {
            console.log('Loading game assets...');
            Assets.load([
                'background_main_menu',
                'webiem',
                'goblin',
                'storekeeper',
                'bg-store-with-keeper',
                'bg-store-empty',
                'bg-forest',
                'bg-cave-entrance',
                'bg-cave-empty',
                'bg-cave-gold',
            ])
                .then(() => {
                    console.log('Game assets loaded successfully!');
                })
                .catch((error) => {
                    console.error('Error loading game assets:', error);
                });
        },
    }
);

export default startLabel;

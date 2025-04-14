import * as CheerpX from '@leaningtech/cheerpx';
import { useCallback, useEffect, useRef, useState } from 'react';
import useTerminalStore from '../stores/useTerminalStore';

// For backward compatibility during the transition
declare global {
    interface Window {
        gameTerminal: {
            runCommand: (command: string) => Promise<string>;
            clear: () => void;
            isReady: boolean;
        };
        cheerpxInstance: CheerpX.Linux | null; // Expose CheerpX instance globally
    }
}

interface UseCheerpxOptions {
    consoleElementId?: string;
    autoStart?: boolean;
    captureOutput?: boolean;
    readOnly?: boolean;
}

interface UseCheerpxReturn {
    isReady: boolean;
    isLoading: boolean;
    error: Error | null;
    init: () => Promise<void>;
    runCommand: (command: string, args?: string[]) => Promise<string>;
    terminalOutput: string;
    clearOutput: () => void;
    isTerminalVisible: boolean;
    toggleTerminal: () => void;
}

// Create a single CheerpX instance that can be shared
let cxInstance: CheerpX.Linux | null = null;
let outputBufferText = '';
let isSimulating = false;

// Simple command simulator for when CheerpX is not available
const simulateCommand = (command: string): string => {
    // Special case for clear command
    if (command === 'clear') {
        return '[Terminal Cleared]';
    }

    // Extract command and arguments
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    // Basic command simulations
    switch (cmd) {
        case 'ls':
            return 'backpack  map  water_flask\n';
        case 'cd':
            return '';
        case 'pwd':
            return '/forest/clearing\n';
        case 'cat':
            if (args[0] === 'map') {
                return "*The map shows a small cave to the north marked with 'Goblin hideout?'*\n";
            } else if (args[0] === 'goblin.txt') {
                return '"Weakness: afraid of grep command"\n';
            } else if (args[0] && args[0].includes('gold_pouch')) {
                return '50 gold pieces\n';
            }
            return `cat: ${args[0] || 'missing operand'}: No such file or directory\n`;
        case 'grep':
            if (args[0] === '"gold"' || args[0] === '"GOLD"') {
                return 'gold_pouch:50 gold pieces\n';
            }
            return '';
        case 'find':
            if (args[0] === '/' && args[1] === '-name' && args[2] === 'armory') {
                return '/town/market/armory\n';
            }
            return '';
        case 'man':
            return `Manual page for ${args[0] || 'command'}\n`;
        default:
            return `Command '${cmd}' not found\n`;
    }
};

export function useCheerpx(options: UseCheerpxOptions = {}): UseCheerpxReturn {
    const { consoleElementId, autoStart = false, captureOutput = true, readOnly = true } = options;

    // Local state
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [terminalOutput, setTerminalOutput] = useState<string>('');
    const [isTerminalVisible, setIsTerminalVisible] = useState(false);

    // Access Zustand store
    const {
        setReady: setStoreReady,
        setLoading: setStoreLoading,
        setError: setStoreError,
        appendOutput: appendStoreOutput,
        clearOutput: clearStoreOutput,
        toggleVisibility: toggleStoreVisibility,
        isVisible: storeIsVisible,
    } = useTerminalStore();

    // Refs for maintaining state
    const cxRef = useRef<CheerpX.Linux | null>(null);
    const outputBuffer = useRef<string>('');
    const outputElementRef = useRef<HTMLDivElement | null>(null);
    const isInitializedRef = useRef<boolean>(false);

    // Sync visibility with store
    useEffect(() => {
        setIsTerminalVisible(storeIsVisible);
    }, [storeIsVisible]);

    // Toggle terminal visibility
    const toggleTerminal = useCallback(() => {
        setIsTerminalVisible((prev) => !prev);
        toggleStoreVisibility();
    }, [toggleStoreVisibility]);

    // Clear terminal output
    const clearOutput = useCallback(() => {
        setTerminalOutput('');
        outputBuffer.current = '';
        outputBufferText = '';
        clearStoreOutput();
        if (outputElementRef.current) {
            outputElementRef.current.textContent = '';
        }
    }, [clearStoreOutput]);

    // Capture terminal output
    const captureOutputHandler = useCallback(
        (output: string) => {
            if (captureOutput) {
                outputBuffer.current += output;
                outputBufferText += output;
                setTerminalOutput(outputBuffer.current);
                appendStoreOutput(output);
            }
        },
        [captureOutput, appendStoreOutput]
    );

    // Initialize CheerpX or set up simulation mode
    const init = useCallback(async () => {
        // If already initialized
        if (cxInstance || isInitializedRef.current || isReady || isLoading) {
            if (cxInstance) {
                cxRef.current = cxInstance;
                setIsReady(true);
                setStoreReady(true);
                window.cheerpxInstance = cxInstance;
            }
            return;
        }

        try {
            setIsLoading(true);
            setStoreLoading(true);
            setError(null);
            setStoreError(null);

            // If read-only mode, use simulation
            if (readOnly) {
                isSimulating = true;
                setupSimulationMode();
                return;
            }

            // Set up output capture
            setupOutputCapture();

            // Try to initialize CheerpX
            try {
                // Create cloud device with the specified image
                const cloudDevice = await CheerpX.CloudDevice.create(
                    'wss://disks.webvm.io/debian_large_20230522_5044875331.ext2'
                );
                const idbDevice = await CheerpX.IDBDevice.create('block1');
                const overlayDevice = await CheerpX.OverlayDevice.create(cloudDevice, idbDevice);

                // Create Linux instance
                const cx = await CheerpX.Linux.create({
                    mounts: [{ type: 'ext2', path: '/', dev: overlayDevice }],
                });

                // Set console element
                const consoleEl = consoleElementId
                    ? document.getElementById(consoleElementId) || outputElementRef.current
                    : outputElementRef.current;

                if (consoleEl) {
                    cx.setConsole(consoleEl);
                }

                // Store the instance
                cxInstance = cx;
                cxRef.current = cx;
                window.cheerpxInstance = cx;

                // Update state
                setIsReady(true);
                setStoreReady(true);
                isInitializedRef.current = true;

                // Set up command handling
                setupCommandHandling();

                // Start bash if needed
                if (autoStart) {
                    startBash();
                }
            } catch (err) {
                // Fall back to simulation mode
                console.error('CheerpX initialization failed, using simulation mode:', err);
                isSimulating = true;
                setupSimulationMode();
            }
        } finally {
            setIsLoading(false);
            setStoreLoading(false);
        }
    }, [
        isReady,
        isLoading,
        captureOutput,
        consoleElementId,
        autoStart,
        readOnly,
        captureOutputHandler,
        setStoreReady,
        setStoreError,
        setStoreLoading,
        clearOutput,
    ]);

    // Helper to set up output capture
    const setupOutputCapture = useCallback(() => {
        if (!captureOutput || outputElementRef.current) return;

        // Create element to capture output
        const hiddenOutputElement = document.createElement('div');
        hiddenOutputElement.id = 'cheerpx-output-capture';
        hiddenOutputElement.style.position = 'absolute';
        hiddenOutputElement.style.left = '0';
        hiddenOutputElement.style.top = '0';
        hiddenOutputElement.style.width = '1px';
        hiddenOutputElement.style.height = '1px';
        hiddenOutputElement.style.overflow = 'hidden';
        hiddenOutputElement.style.opacity = '0.01';
        document.body.appendChild(hiddenOutputElement);
        outputElementRef.current = hiddenOutputElement;

        // Create a MutationObserver to watch for changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    Array.from(mutation.addedNodes).forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE || node.textContent) {
                            captureOutputHandler(node.textContent || '');
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    captureOutputHandler(mutation.target.textContent || '');
                }
            });
        });

        // Start observing
        observer.observe(hiddenOutputElement, {
            childList: true,
            subtree: true,
            characterData: true,
            characterDataOldValue: true,
        });
    }, [captureOutput, captureOutputHandler]);

    // Set up command handling
    const setupCommandHandling = useCallback(() => {
        // Create command handling function
        const runCmd = async (cmd: string) => {
            captureOutputHandler(`$ ${cmd}\n`);

            try {
                if (cmd === 'clear') {
                    clearOutput();
                    return 'Terminal cleared';
                }

                if (isSimulating) {
                    const result = simulateCommand(cmd);
                    captureOutputHandler(result);
                    return result;
                }

                if (cxRef.current) {
                    await cxRef.current.run('/bin/bash', ['-c', cmd], {
                        env: ['HOME=/home/user', 'USER=user', 'SHELL=/bin/bash'],
                        cwd: '/home/user',
                    });

                    // If no output was captured, return a success message
                    if (!outputBuffer.current) {
                        return 'Command executed successfully';
                    }

                    // Return the output
                    return outputBuffer.current;
                } else {
                    throw new Error('CheerpX not initialized');
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                captureOutputHandler(`Error: ${errorMsg}\n`);
                throw err;
            }
        };

        // Update the store
        useTerminalStore.setState({
            runCommand: runCmd,
            clearOutput: clearOutput,
            initTerminal: init,
        });
    }, [captureOutputHandler, clearOutput, init]);

    // Set up simulation mode
    const setupSimulationMode = useCallback(() => {
        captureOutputHandler('Terminal initialized in simulation mode.\n');

        // Create simulation command function
        const runCmd = async (cmd: string) => {
            captureOutputHandler(`$ ${cmd}\n`);

            if (cmd === 'clear') {
                clearOutput();
                return 'Terminal cleared';
            }

            const result = simulateCommand(cmd);
            captureOutputHandler(result);
            return result;
        };

        // Update state
        setIsReady(true);
        setStoreReady(true);

        // Update the store
        useTerminalStore.setState({
            runCommand: runCmd,
            clearOutput: clearOutput,
            initTerminal: init,
        });
    }, [captureOutputHandler, clearOutput, init, setStoreReady]);

    // Start bash
    const startBash = useCallback(() => {
        if (!cxRef.current || isSimulating) return;

        try {
            cxRef.current
                .run('/bin/bash', ['--login'], {
                    env: ['HOME=/home/user', 'USER=user', 'SHELL=/bin/bash'],
                    cwd: '/home/user',
                })
                .catch((err) => {
                    console.error('Failed to start bash:', err);
                });
        } catch (err) {
            console.error('Error starting bash:', err);
        }
    }, []);

    // Run command
    const runCommand = useCallback(
        async (command: string, args: string[] = []) => {
            try {
                // If no CheerpX instance, use simulation
                if (!cxRef.current || isSimulating) {
                    if (command === '/bin/bash' && args[0] === '-c' && args.length === 2) {
                        return simulateCommand(args[1]);
                    }
                    return simulateCommand(`${command} ${args.join(' ')}`);
                }

                // Clear output buffer for new command
                outputBuffer.current = '';

                // Show terminal when running commands
                if (!isTerminalVisible) {
                    toggleTerminal();
                }

                // Run the command
                await cxRef.current.run(command, args, {
                    env: ['HOME=/home/user', 'USER=user', 'SHELL=/bin/bash'],
                    cwd: '/home/user',
                });

                // Return output or success message
                return outputBuffer.current || 'Command executed successfully';
            } catch (err) {
                // If first error, try simulation
                if (!isSimulating) {
                    isSimulating = true;
                    if (command === '/bin/bash' && args[0] === '-c' && args.length === 2) {
                        return simulateCommand(args[1]);
                    }
                    return simulateCommand(`${command} ${args.join(' ')}`);
                }

                // Otherwise, throw the error
                throw err;
            }
        },
        [isTerminalVisible, toggleTerminal]
    );

    // Auto-start if needed
    useEffect(() => {
        if (autoStart) {
            init().catch((err) => {
                console.error('Auto-start initialization failed:', err);
            });
        }
    }, [autoStart, init]);

    // Set up global terminal object
    useEffect(() => {
        window.gameTerminal = {
            runCommand: async (command: string) => {
                if (!isReady) await init();
                try {
                    return await runCommand('/bin/bash', ['-c', command]);
                } catch (err) {
                    console.error('Error running command from game:', err);
                    return `Error: ${err}`;
                }
            },
            clear: clearOutput,
            isReady,
        };

        return () => {
            if (outputElementRef.current) {
                document.body.removeChild(outputElementRef.current);
                outputElementRef.current = null;
            }
        };
    }, [isReady, init, runCommand, clearOutput]);

    return {
        isReady,
        isLoading,
        error,
        init,
        runCommand: (cmd: string) => runCommand('/bin/bash', ['-c', cmd]),
        terminalOutput,
        clearOutput,
        isTerminalVisible,
        toggleTerminal,
    };
}

// Export commands for direct access
export const LinuxCommands = {
    ls: async (path: string = '.') => {
        if (isSimulating) return simulateCommand(`ls ${path}`);
        if (!cxInstance) return 'Error: Terminal not initialized';
        try {
            return await cxInstance.run('/bin/bash', ['-c', `ls ${path}`], {
                env: ['HOME=/home/user', 'USER=user', 'SHELL=/bin/bash'],
                cwd: '/home/user',
            });
        } catch (e) {
            return `Error: ${e}`;
        }
    },

    cat: async (filePath: string) => {
        if (isSimulating) return simulateCommand(`cat ${filePath}`);
        if (!cxInstance) return 'Error: Terminal not initialized';
        try {
            return await cxInstance.run('/bin/bash', ['-c', `cat ${filePath}`], {
                env: ['HOME=/home/user', 'USER=user', 'SHELL=/bin/bash'],
                cwd: '/home/user',
            });
        } catch (e) {
            return `Error: ${e}`;
        }
    },

    isAvailable: () => cxInstance !== null && !isSimulating,
    forceSimulation: (force: boolean = true) => {
        isSimulating = force;
    },
};

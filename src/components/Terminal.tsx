import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCheerpx } from '../hooks/useCheerpx';
import useTerminalStore from '../stores/useTerminalStore';

interface TerminalProps {
    autoStart?: boolean;
    floatingTab?: boolean;
    theme?: 'dark' | 'light' | 'game';
    readOnly?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
    autoStart = true,
    floatingTab = true,
    theme = 'game',
    readOnly = true,
}) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const terminalId = 'cheerpx-terminal';
    const [isInitialized, setIsInitialized] = useState(false);
    const [localOutput, setLocalOutput] = useState<string>('');

    // Initialize the CheerpX hook (which will connect to our store)
    const { init, terminalOutput: hookOutput } = useCheerpx({
        consoleElementId: terminalId,
        autoStart,
        captureOutput: true,
        readOnly: readOnly,
    });

    // Get state and actions from the Zustand store
    const {
        isReady,
        isLoading,
        error,
        terminalOutput,
        isVisible,
        clearOutput,
        toggleVisibility,
        runCommand: storeRunCommand,
        appendOutput,
    } = useTerminalStore();

    // Initialize terminal only once
    useEffect(() => {
        if (!isInitialized && autoStart) {
            // Mark as initialized to prevent multiple init calls
            setIsInitialized(true);

            // Do the initialization after a small delay to allow React to stabilize
            const timer = setTimeout(() => {
                init().catch((err) => {
                    console.error('Terminal initialization error:', err);
                });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [autoStart, init, isInitialized]);

    // Sync local output with store output
    useEffect(() => {
        if (hookOutput && hookOutput !== localOutput) {
            setLocalOutput(hookOutput);
            // Also ensure the store is updated
            appendOutput(hookOutput);
        }
    }, [hookOutput, localOutput, appendOutput]);

    // Scroll to bottom when output changes - enhanced to ensure latest content is visible
    useEffect(() => {
        if (outputRef.current) {
            // Use requestAnimationFrame to ensure DOM has updated before scrolling
            requestAnimationFrame(() => {
                if (outputRef.current) {
                    outputRef.current.scrollTop = outputRef.current.scrollHeight;
                }
            });
        }
    }, [terminalOutput, localOutput]);

    // Add function to handle auto-scrolling on new content
    const scrollToBottom = useCallback(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, []);

    // Setup MutationObserver to catch all content changes and auto-scroll
    useEffect(() => {
        if (!outputRef.current) return;

        // Create observer to watch for content changes
        const observer = new MutationObserver(() => {
            if (outputRef.current) {
                outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
        });

        // Start observing
        observer.observe(outputRef.current, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        // Cleanup
        return () => observer.disconnect();
    }, []);

    // Create a combined output from both sources
    const displayOutput = terminalOutput || localOutput || '';

    const handleToggleTerminal = () => {
        toggleVisibility();
    };

    // Set up color schemes based on theme
    const getThemeClasses = () => {
        switch (theme) {
            case 'light':
                return {
                    tabButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
                    panel: 'bg-gray-100',
                    header: 'text-gray-800',
                    terminal: 'bg-white text-gray-800 border-gray-300',
                };
            case 'game':
                return {
                    tabButton: 'bg-blue-900 hover:bg-blue-800 text-white',
                    panel: 'bg-black bg-opacity-90 backdrop-blur-sm drop-shadow-lg',
                    header: 'text-blue-200',
                    terminal: 'bg-black text-green-500 border-black',
                };
            case 'dark':
            default:
                return {
                    tabButton: 'bg-gray-800 hover:bg-gray-700 text-white',
                    panel: 'bg-gray-900',
                    header: 'text-white',
                    terminal: 'bg-black text-green-400 border-gray-700',
                };
        }
    };

    const themeClasses = getThemeClasses();

    if (floatingTab) {
        return (
            <>
                {/* Tab button with improved click handling */}
                <div className='fixed right-0 top-1/2 transform -translate-y-1/2 z-[999999] pointer-events-auto'>
                    <button
                        className={`${themeClasses.tabButton} py-4 px-4 rounded-l-md cursor-pointer shadow-lg border-none outline-none min-w-[120px] text-lg font-medium`}
                        onClick={handleToggleTerminal}
                        style={{ touchAction: 'manipulation' }}
                    >
                        {isVisible ? '>' : '<'} Terminal
                    </button>
                </div>

                {/* Terminal panel */}
                {isVisible && (
                    <div
                        className={`fixed right-0 top-0 bottom-0 w-96 ${themeClasses.panel} shadow-lg z-[999998] flex flex-col p-3 pointer-events-auto transition-all duration-300 ease-in-out overflow-y-auto`}
                    >
                        <div className='flex-1 flex flex-col'>
                            {/* Display title for the read-only terminal */}
                            {readOnly && (
                                <div
                                    className={`${themeClasses.header} mb-2 font-medium px-2 py-1 text-center border-b border-gray-700 flex justify-between items-center`}
                                >
                                    <span>Linux Command Output</span>
                                    <button
                                        onClick={scrollToBottom}
                                        className='text-xs bg-blue-800 hover:bg-blue-700 px-2 py-1 rounded'
                                        title='Scroll to latest output'
                                    >
                                        Latest
                                    </button>
                                </div>
                            )}

                            {/* Terminal output display - enhanced for better scrolling */}
                            <div
                                ref={outputRef}
                                className={`flex-1 ${themeClasses.terminal} font-mono p-3 overflow-y-auto border whitespace-pre-wrap text-sm leading-relaxed rounded-md scroll-smooth`}
                                style={{ scrollBehavior: 'smooth', maxHeight: '100%', overscrollBehavior: 'contain' }}
                            >
                                {displayOutput || (
                                    <div className='text-gray-400 italic'>
                                        {readOnly
                                            ? 'Command output will appear here as you progress through the game.'
                                            : 'Terminal ready. Type a command to begin.'}
                                    </div>
                                )}
                                {/* Invisible element to help with auto-scrolling */}
                                <div id='terminal-bottom-anchor'></div>
                            </div>

                            {/* Hidden actual terminal for CheerpX */}
                            <div
                                id={terminalId}
                                ref={terminalRef}
                                className='h-[1px] w-[1px] overflow-hidden opacity-0'
                                style={{ position: 'absolute', left: '-1px', top: '-1px' }}
                            ></div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Regular non-floating terminal
    return (
        <div className='terminal-container p-3 rounded-md border border-gray-700'>
            <div className='flex justify-between items-center mb-3'>
                <h3 className='text-lg font-medium'>{readOnly ? 'Command Output' : 'Terminal'}</h3>
                <div className='flex gap-2'>
                    {isReady && (
                        <>
                            <button
                                onClick={scrollToBottom}
                                className='text-xs bg-blue-800 hover:bg-blue-700 px-2 py-1 rounded'
                                title='Scroll to latest output'
                            >
                                Latest
                            </button>
                            <button
                                onClick={clearOutput}
                                className='px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded'
                            >
                                Clear
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isLoading && <div className='text-yellow-500 p-2'>Initializing terminal...</div>}
            {error && <div className='text-red-500 p-2'>Error: {error.message}</div>}

            <div
                ref={outputRef}
                className={`${themeClasses.terminal} font-mono p-3 overflow-y-auto border whitespace-pre-wrap mb-3 h-[300px] rounded-md scroll-smooth`}
                style={{ scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}
            >
                {displayOutput || (
                    <div className='text-gray-400 italic'>
                        {readOnly
                            ? 'Command output will appear here as you progress through the game.'
                            : 'Terminal ready. Type a command to begin.'}
                    </div>
                )}
                {/* Invisible element to help with auto-scrolling */}
                <div id='terminal-bottom-anchor'></div>
            </div>

            <div
                id={terminalId}
                ref={terminalRef}
                className='h-[1px] w-[1px] overflow-hidden opacity-0'
                style={{ position: 'absolute', left: '-1px', top: '-1px' }}
            ></div>
        </div>
    );
};

// Export a helper function that can be called from game components
export const executeGameCommand = async (command: string): Promise<string | null> => {
    try {
        console.log(`Executing game command: ${command}`);

        // Special handling for clear command
        if (command.trim() === 'clear') {
            console.log('Clearing terminal output');
            useTerminalStore.getState().clearOutput();
            return 'Terminal cleared';
        }

        // Ensure terminal is visible when commands are executed from the game
        if (!useTerminalStore.getState().isVisible) {
            useTerminalStore.getState().toggleVisibility();
        }

        // Format command with a visible separator for better readability
        useTerminalStore.getState().appendOutput(`\n$ ${command}\n`);

        // Force scroll to bottom after command is entered
        forceScrollTerminals();

        // Attempt to execute the command
        const result = await useTerminalStore.getState().runCommand(command);
        console.log(`Command result: ${result}`);

        // Check if this was a simulated clear command
        if (result && result.includes('[Terminal Cleared]')) {
            console.log('Clear command was simulated, clearing terminal output');
            useTerminalStore.getState().clearOutput();
            return 'Terminal cleared';
        }

        // If there's no meaningful result, provide helpful information
        if (!result || result.trim() === 'Command executed successfully (no output).') {
            const helpInfo = getCommandHelp(command);
            if (helpInfo) {
                useTerminalStore.getState().appendOutput(`\n${helpInfo}\n`);
                // Force scroll after help info is added
                forceScrollTerminals();
                return helpInfo;
            }
        }

        // Ensure terminal scrolls to show the result
        forceScrollTerminals();
        return result;
    } catch (err) {
        console.error('Error executing game command:', err);

        // Extract just the command name for help lookup
        const commandName = command.split(' ')[0];
        const helpInfo = getCommandHelp(commandName);

        // Show the error and help information in the terminal
        useTerminalStore.getState().appendOutput(`\nError: ${err}\n`);

        if (helpInfo) {
            useTerminalStore.getState().appendOutput(`\nHelpful information about '${commandName}':\n${helpInfo}\n`);
        }

        // Force scroll to show the error
        forceScrollTerminals();
        return null;
    }
};

// Helper function to force all terminal outputs to scroll to bottom
const forceScrollTerminals = () => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
        const terminalElements = document.querySelectorAll('[id^="terminal-bottom-anchor"]');
        terminalElements.forEach((element) => {
            const container = element.parentElement;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        });
    }, 50);
};

// Function to provide simplified man-page-like information about common commands
const getCommandHelp = (command: string): string | null => {
    // Extract just the command without arguments
    const cmd = command.split(' ')[0];

    const helpInfo: Record<string, string> = {
        clear: `clear - clear the terminal screen
        
DESCRIPTION
    Clear the terminal screen. This command clears all previously displayed output from view.`,

        ls: `ls - list directory contents
        
DESCRIPTION
    List information about files and directories.
    
COMMON OPTIONS
    -l    use a long listing format
    -a    do not ignore entries starting with .
    -h    with -l, print sizes in human readable format`,

        cd: `cd - change the working directory
        
DESCRIPTION
    Change the current directory to the specified directory.
    
EXAMPLES
    cd ..           # move to parent directory
    cd /path/to/dir # move to absolute path
    cd ~            # move to home directory`,

        pwd: `pwd - print working directory
        
DESCRIPTION
    Print the full filename of the current working directory.`,

        cat: `cat - concatenate and print files
        
DESCRIPTION
    Concatenate FILE(s) to standard output.
    
EXAMPLE
    cat file.txt    # display contents of file.txt`,

        grep: `grep - print lines matching a pattern
        
DESCRIPTION
    Search for PATTERN in each FILE or standard input.
    
EXAMPLES
    grep "pattern" file.txt   # find "pattern" in file.txt
    grep -i "pattern" *       # find "pattern" case-insensitive in all files`,

        cp: `cp - copy files and directories
        
DESCRIPTION
    Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY.
    
EXAMPLES
    cp file1 file2       # copy file1 to file2
    cp file1 file2 dir1  # copy file1 and file2 to directory dir1`,

        mv: `mv - move (rename) files
        
DESCRIPTION
    Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.
    
EXAMPLES
    mv file1 file2     # rename file1 to file2
    mv file1 file2 dir # move file1 and file2 to directory dir`,

        touch: `touch - change file timestamps or create empty files
        
DESCRIPTION
    Update the access and modification times of each FILE to the current time.
    A FILE argument that does not exist is created empty.
    
EXAMPLE
    touch file.txt    # create empty file.txt or update its timestamp`,

        find: `find - search for files in a directory hierarchy
        
DESCRIPTION
    Search for files in a directory hierarchy.
    
EXAMPLE
    find / -name "pattern"    # search files named "pattern" from root`,
    };

    return helpInfo[cmd] || null;
};

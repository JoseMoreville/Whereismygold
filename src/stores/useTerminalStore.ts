import { create } from 'zustand';

/**
 * Terminal store type definition
 */
type TerminalStoreType = {
    /**
     * Whether the terminal is ready to accept commands
     */
    isReady: boolean;

    /**
     * Whether the terminal is currently loading
     */
    isLoading: boolean;

    /**
     * Output from terminal commands
     */
    terminalOutput: string;

    /**
     * Terminal visibility state
     */
    isVisible: boolean;

    /**
     * Any error that occurred during terminal operations
     */
    error: Error | null;

    /**
     * Initialize the terminal
     */
    initTerminal: () => Promise<void>;

    /**
     * Run a command in the terminal
     */
    runCommand: (command: string) => Promise<string>;

    /**
     * Clear the terminal output
     */
    clearOutput: () => void;

    /**
     * Toggle terminal visibility
     */
    toggleVisibility: () => void;

    /**
     * Set terminal visibility
     */
    setVisible: (visible: boolean) => void;

    /**
     * Set terminal ready state
     */
    setReady: (ready: boolean) => void;

    /**
     * Set terminal loading state
     */
    setLoading: (loading: boolean) => void;

    /**
     * Set terminal error
     */
    setError: (error: Error | null) => void;

    /**
     * Append to terminal output
     */
    appendOutput: (output: string) => void;
};

/**
 * Create a store for managing terminal state
 */
const useTerminalStore = create<TerminalStoreType>((set, get) => ({
    isReady: false,
    isLoading: false,
    terminalOutput: '',
    isVisible: false,
    error: null,

    initTerminal: async () => {
        // This function will be replaced by a proper implementation after hook setup
        set({ isLoading: true, error: null });
        try {
            // Placeholder - will be implemented
            set({ isReady: true });
        } catch (error) {
            set({ error: error instanceof Error ? error : new Error(String(error)) });
        } finally {
            set({ isLoading: false });
        }
    },

    runCommand: async (command: string) => {
        // This function will be replaced by a proper implementation after hook setup
        const { isReady, initTerminal, setVisible } = get();

        if (!isReady) {
            await initTerminal();
        }

        // Auto-show terminal when running commands
        if (!get().isVisible) {
            setVisible(true);
        }

        // Placeholder - will be implemented
        const output = `$ ${command}\nCommand executed (placeholder)`;
        set((state) => ({ terminalOutput: state.terminalOutput + '\n' + output }));
        return output;
    },

    clearOutput: () => {
        set({ terminalOutput: '' });
    },

    toggleVisibility: () => {
        set((state) => ({ isVisible: !state.isVisible }));
    },

    setVisible: (visible: boolean) => {
        set({ isVisible: visible });
    },

    setReady: (ready: boolean) => {
        set({ isReady: ready });
    },

    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },

    setError: (error: Error | null) => {
        set({ error });
    },

    appendOutput: (output: string) => {
        set((state) => ({ terminalOutput: state.terminalOutput + output }));
    },
}));

export default useTerminalStore;

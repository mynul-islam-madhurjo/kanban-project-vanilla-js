import { createColumn } from './components/Column.js';
import { setupStorage } from './services/StorageService.js';

/**
 * Initializes the Kanban board application
 * Creates the main board structure and sets up event handlers
 * Returns an object with public methods for board manipulation
 */
const initializeBoard = () => {
    // Initialize state object to hold main DOM references and storage
    const state = {
        boardColumns: document.getElementById('boardColumns'),
        addColumnBtn: document.getElementById('addColumnBtn'),
        storage: setupStorage()
    };

    /**
     * Creates and adds a new column to the board
     * @param {string} title - Column title (defaults to 'New Column')
     * @param {Array} tasks - Initial tasks for the column
     */
    const addColumn = (title = 'New Column', tasks = []) => {
        const column = createColumn({
            title,
            tasks,
            // Callback when column is deleted
            onDelete: () => state.storage.saveBoard(),
            // Callback when column or its tasks are updated
            onUpdate: () => state.storage.saveBoard()
        });
        state.boardColumns.appendChild(column);
        state.storage.saveBoard();
    };

    /**
     * Loads the saved state from localStorage and recreates the board
     */
    const loadInitialState = () => {
        const savedColumns = state.storage.getColumns();
        if (savedColumns?.length) {
            savedColumns.forEach(columnData => {
                addColumn(columnData.title, columnData.tasks);
            });
        }
    };

    /**
     * Sets up event listeners for the main board functionality
     */
    const setupEventListeners = () => {
        state.addColumnBtn.addEventListener('click', () => addColumn());
    };

    // Initialize the board
    setupEventListeners();
    loadInitialState();

    // Return public methods
    return {
        addColumn
    };
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanBoard = initializeBoard();
});
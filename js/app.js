import { createColumn } from './components/Column.js';
import { setupStorage } from './services/StorageService.js';
import { setupDragAndDrop } from './services/DragDropService.js';
import { setupModal } from './services/ModalService.js';

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
        storage: setupStorage(),
        modal: setupModal()
    };

    // Initialize drag and drop
    const dragDrop = setupDragAndDrop({
        onDragComplete: (element, oldColumn, newColumn) => {
            // Save board state after drag and drop
            state.storage.saveBoard();
        }
    });

    // Initialize drag and drop after DOM is ready
    dragDrop.initialize(state.boardColumns);

    /**
     * Creates and adds a new column to the board
     * @param {string} title - Column title
     */
    const addColumn = (title = null) => {
        if (!title) {
            // Show modal for column creation
            state.modal.showModal({
                title: 'Create New Column',
                content: `
                    <div class="form-group">
                        <label for="columnTitle">Column Title</label>
                        <input type="text" id="columnTitle" class="form-control">
                    </div>
                `,
                buttons: {
                    'Create': () => {
                        const titleInput = document.getElementById('columnTitle');
                        if (titleInput.value.trim()) {
                            createNewColumn(titleInput.value.trim());
                        }
                    },
                    'Cancel': () => {}
                }
            });
        } else {
            createNewColumn(title);
        }
    };

    const createNewColumn = (title, tasks = []) => {
        const column = createColumn({
            title,
            tasks,
            onDelete: () => state.storage.saveBoard(),
            onUpdate: () => state.storage.saveBoard(),
            modal: state.modal
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
/**
 * Sets up storage management for the Kanban board
 * Handles saving and retrieving board state from localStorage
 * @returns {Object} Storage management methods
 */
export const setupStorage = () => {
    const storageKey = 'kanbanBoard';

    /**
     * Saves the current state of the board to localStorage
     * Collects all column and task data from the DOM
     */
    const saveBoard = () => {
        // Get all columns and map them to a data structure
        const columns = Array.from(document.querySelectorAll('.column')).map(column => {
            return {
                title: column.querySelector('.column-title').textContent,
                // Map all tasks in the column
                tasks: Array.from(column.querySelectorAll('.task-card')).map(task => ({
                    id: task.dataset.taskId,
                    title: task.querySelector('.task-title').textContent,
                    description: task.dataset.description || ''
                }))
            };
        });

        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(columns));
    };

    /**
     * Retrieves the saved board state from localStorage
     * @returns {Array|null} Array of column data or null if no data exists
     */
    const getColumns = () => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : null;
    };

    return {
        saveBoard,
        getColumns
    };
};
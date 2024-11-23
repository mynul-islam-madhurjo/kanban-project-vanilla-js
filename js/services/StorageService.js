/**
 * Sets up unified storage management
 */
export const setupStorage = () => {
    const STORAGE_KEYS = {
        BOARD: 'kanbanBoard',
        USERS: 'kanbanUsers',
        CURRENT_USER: 'currentUser'
    };

    /**
     * Saves board data
     */
    const saveBoard = () => {
        const columns = Array.from(document.querySelectorAll('.column')).map(column => ({
            title: column.querySelector('.column-title').textContent,
            tasks: Array.from(column.querySelectorAll('.task-card')).map(task => ({
                id: task.dataset.taskId,
                title: task.querySelector('.task-title').textContent,
                description: task.querySelector('.task-description').innerHTML,
                assignedTo: task.dataset.assignedTo || null,
                createdBy: task.dataset.createdBy || null,
                createdAt: task.dataset.createdAt || null
            }))
        }));

        localStorage.setItem(STORAGE_KEYS.BOARD, JSON.stringify(columns));
    };

    /**
     * Gets board data
     */
    const getColumns = () => {
        const saved = localStorage.getItem(STORAGE_KEYS.BOARD);
        return saved ? JSON.parse(saved) : null;
    };

    /**
     * Saves users data
     */
    const saveUsers = (users) => {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    };

    /**
     * Gets users data
     */
    const getUsers = () => {
        const saved = localStorage.getItem(STORAGE_KEYS.USERS);
        return saved ? JSON.parse(saved) : [];
    };

    /**
     * Saves current user
     */
    const saveCurrentUser = (userId) => {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    };

    /**
     * Gets current user
     */
    const getCurrentUser = () => {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    };

    return {
        saveBoard,
        getColumns,
        saveUsers,
        getUsers,
        saveCurrentUser,
        getCurrentUser
    };
};
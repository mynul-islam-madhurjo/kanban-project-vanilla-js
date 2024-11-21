/**
 * Creates a new column element with all necessary functionality
 * @param {Object} config - Column configuration object
 * @param {string} config.title - Column title
 * @param {Array} config.tasks - Initial tasks
 * @param {Function} config.onDelete - Callback for deletion
 * @param {Function} config.onUpdate - Callback for updates
 * @returns {HTMLElement} The created column element
 */
export const createColumn = ({ title, tasks = [], onDelete, onUpdate }) => {
    /**
     * Creates HTML for a task card
     * @param {Object} task - Task data
     * @returns {string} HTML string for the task card
     */
    const createTaskCard = (task) => {
        return `
            <div class="task-card" data-task-id="${task.id}">
                <div class="task-title">${task.title}</div>
            </div>
        `;
    };

    /**
     * Handles adding a new task to the column
     * @param {HTMLElement} columnElement - The column DOM element
     */
    const addTask = (columnElement) => {
        const taskTitle = prompt('Enter task title:');
        if (taskTitle) {
            const task = {
                id: Date.now(),
                title: taskTitle,
                description: ''
            };

            const taskElement = createTaskCard(task);
            const columnContent = columnElement.querySelector('.column-content');
            columnContent.insertAdjacentHTML('beforeend', taskElement);
            tasks.push(task);
            onUpdate();
        }
    };

    /**
     * Handles column deletion with confirmation
     * @param {HTMLElement} columnElement - The column to delete
     */
    const deleteColumn = (columnElement) => {
        if (confirm('Are you sure you want to delete this column?')) {
            columnElement.remove();
            onDelete();
        }
    };

    /**
     * Updates column title and triggers update callback
     * @param {string} newTitle - New title for the column
     */
    const updateTitle = (newTitle) => {
        title = newTitle;
        onUpdate();
    };

    /**
     * Sets up all event listeners for the column
     * @param {HTMLElement} columnElement - The column DOM element
     */
    const setupColumnEventListeners = (columnElement) => {
        const deleteBtn = columnElement.querySelector('.delete-column');
        const addTaskBtn = columnElement.querySelector('.add-task');
        const titleElement = columnElement.querySelector('.column-title');

        deleteBtn.addEventListener('click', () => deleteColumn(columnElement));
        addTaskBtn.addEventListener('click', () => addTask(columnElement));
        titleElement.addEventListener('blur', (e) => updateTitle(e.target.textContent));
    };

    // Create the column DOM structure
    const column = document.createElement('div');
    column.className = 'column';
    column.innerHTML = `
        <div class="column-header">
            <div class="column-title" contenteditable="true">${title}</div>
            <button class="btn delete-column">×</button>
        </div>
        <div class="column-content">
            ${tasks.map(task => createTaskCard(task)).join('')}
            <button class="btn btn-primary add-task">Add Task</button>
        </div>
    `;

    setupColumnEventListeners(column);
    return column;
};
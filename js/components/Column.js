/**
 * Creates a new column element with all necessary functionality
 * @param {Object} config - Column configuration object
 */
export const createColumn = ({ title, tasks = [], onDelete, onUpdate, modal }) => {
    /**
     * Creates HTML for a task card
     * @param {Object} task - Task data
     */
    const createTaskCard = (task) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;
        taskElement.innerHTML = `
            <div class="task-title">${task.title}</div>
        `;
        return taskElement;
    };

    /**
     * Handles adding a new task to the column
     */
    const addTask = (columnElement) => {
        modal.showModal({
            title: 'Add New Task',
            content: `
                <div class="form-group">
                    <label for="taskTitle">Task Title</label>
                    <input type="text" id="taskTitle" class="form-control">
                </div>
            `,
            buttons: {
                'Add': () => {
                    const taskTitle = document.getElementById('taskTitle').value.trim();
                    if (taskTitle) {
                        const task = {
                            id: Date.now().toString(),
                            title: taskTitle,
                            description: ''
                        };

                        const taskElement = createTaskCard(task);
                        const columnContent = columnElement.querySelector('.column-content');
                        columnContent.insertBefore(taskElement, columnContent.lastElementChild);
                        tasks.push(task);
                        onUpdate();
                    }
                },
                'Cancel': () => {}
            }
        });
    };

    // Create the column DOM structure
    const column = document.createElement('div');
    column.className = 'column';
    column.draggable = true;

    // Create column header
    const header = document.createElement('div');
    header.className = 'column-header';
    header.innerHTML = `
        <div class="column-title" contenteditable="true">${title}</div>
        <button class="btn delete-column">×</button>
    `;

    // Create column content
    const content = document.createElement('div');
    content.className = 'column-content';

    // Add existing tasks
    tasks.forEach(task => {
        content.appendChild(createTaskCard(task));
    });

    // Add "Add Task" button
    const addTaskBtn = document.createElement('button');
    addTaskBtn.className = 'btn btn-primary add-task';
    addTaskBtn.textContent = 'Add Task';
    content.appendChild(addTaskBtn);

    // Append header and content to column
    column.appendChild(header);
    column.appendChild(content);

    // Setup event listeners
    const setupColumnEventListeners = () => {
        const deleteBtn = column.querySelector('.delete-column');
        const addTaskBtn = column.querySelector('.add-task');
        const titleElement = column.querySelector('.column-title');

        deleteBtn.addEventListener('click', () => {
            modal.showModal({
                title: 'Delete Column',
                content: 'Are you sure you want to delete this column?',
                buttons: {
                    'Delete': () => {
                        column.remove();
                        onDelete();
                    },
                    'Cancel': () => {}
                }
            });
        });

        addTaskBtn.addEventListener('click', () => addTask(column));

        titleElement.addEventListener('blur', (e) => {
            const newTitle = e.target.textContent.trim();
            if (newTitle) {
                title = newTitle;
                onUpdate();
            } else {
                e.target.textContent = title;
            }
        });
    };

    setupColumnEventListeners();
    return column;
};
import {setupRichTextEditor} from '../services/RichTextService.js';

/**
 * Creates a new column element with all necessary functionality
 * @param {Object} config - Column configuration object
 */
export const createColumn = ({title, tasks = [], onDelete, onUpdate, modal}) => {

    const richTextEditor = setupRichTextEditor();

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
            <div class="task-description">${task.description || ''}</div>
        `;

        // Click handler for editing
        taskElement.addEventListener('click', (e) => {
            // Don't open editor if dragging
            if (!e.target.closest('.task-handle')) {
                showTaskDetails(task, taskElement);
            }
        });

        return taskElement;
    };

    /**
     * Shows task details modal with rich text editor
     */
    const showTaskDetails = (task, taskElement) => {
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="form-group">
                <label for="taskTitle">Title</label>
                <input type="text" id="taskTitle" class="form-control" value="${task.title}">
            </div>
            <div class="form-group">
                <label for="taskDescription">Description</label>
                <div id="taskDescription" class="task-editor"></div>
            </div>
        `;

        let editorInstance = null;

        modal.showModal({
            title: 'Task Details',
            content: content,
            buttons: {
                'Save': () => {
                    const newTitle = document.getElementById('taskTitle').value.trim();
                    // Get formatted content from editor
                    const newDescription = editorInstance ?
                        editorInstance.quill.root.innerHTML : '';

                    if (newTitle) {
                        // Update task data
                        task.title = newTitle;
                        task.description = newDescription;

                        // Update DOM
                        taskElement.querySelector('.task-title').textContent = newTitle;
                        taskElement.querySelector('.task-description').innerHTML = newDescription;

                        onUpdate();
                    }
                },
                'Cancel': () => {
                }
            },

            onShow: (modalElement) => {
                editorInstance = richTextEditor.createEditor(
                    modalElement.querySelector('#taskDescription'),
                    task.description || ''
                );
            }
        });
    };

    /**
     * Handles adding a new task
     */
    const addTask = () => {
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="form-group">
                <label for="newTaskTitle">Title</label>
                <input type="text" id="newTaskTitle" class="form-control">
            </div>
            <div class="form-group">
                <label for="newTaskDescription">Description</label>
                <div id="newTaskDescription" class="task-editor"></div>
            </div>
        `;

        let editorInstance = null;

        modal.showModal({
            title: 'Create New Task',
            content: content,
            buttons: {
                'Create': () => {
                    const taskTitle = document.getElementById('newTaskTitle').value.trim();
                    const description = editorInstance ?
                        editorInstance.quill.root.innerHTML : '';

                    if (taskTitle) {
                        const task = {
                            id: Date.now().toString(),
                            title: taskTitle,
                            description: description
                        };

                        const taskElement = createTaskCard(task);
                        const columnContent = column.querySelector('.column-content');
                        columnContent.insertBefore(taskElement, columnContent.lastElementChild);

                        tasks.push(task);
                        onUpdate();
                    }
                },
                'Cancel': () => {
                }
            },
            onShow: (modalElement) => {
                editorInstance = richTextEditor.createEditor(
                    modalElement.querySelector('#newTaskDescription')
                );
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
                    'Cancel': () => {
                    }
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
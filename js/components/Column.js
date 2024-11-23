import { setupRichTextEditor } from '../services/RichTextService.js';

/**
 * Creates a new column element with all necessary functionality
 */
export const createColumn = ({ title, tasks = [], onDelete, onUpdate, modal, userService }) => {
    const richTextEditor = setupRichTextEditor();

    /**
     * Creates HTML for a task card
     */
    const createTaskCard = (task) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;
        taskElement.dataset.createdBy = task.createdBy || '';
        taskElement.dataset.assignedTo = task.assignedTo || '';

        const assignedUser = task.assignedTo ?
            userService.getUsers().find(u => u.id === task.assignedTo) : null;

        taskElement.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-description">${task.description || ''}</div>
            ${assignedUser ? `
                <div class="task-assigned-to">
                    Assigned to: ${assignedUser.name}
                </div>
            ` : ''}
        `;

        // Handle click for editing
        taskElement.addEventListener('click', (e) => {
            if (!e.target.closest('.task-handle')) {
                const currentUser = userService.getCurrentUser();
                if (!currentUser) {
                    modal.showModal({
                        title: 'Login Required',
                        content: 'Please log in to edit tasks',
                        buttons: { 'OK': () => {} }
                    });
                    return;
                }
                showTaskDetails(task, taskElement);
            }
        });

        return taskElement;
    };

    /**
     * Shows task details modal with rich text editor
     */
    const showTaskDetails = (task, taskElement) => {
        const users = userService.getUsers();

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
            <div class="form-group">
                <label for="assignedTo">Assign To</label>
                <select id="assignedTo" class="form-control">
                    <option value="">Unassigned</option>
                    ${users.map(user => `
                        <option value="${user.id}" 
                            ${task.assignedTo === user.id ? 'selected' : ''}>
                            ${user.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            ${task.createdBy ? `
                <div class="task-metadata">
                    Created by: ${users.find(u => u.id === task.createdBy)?.name || 'Unknown'}
                </div>
            ` : ''}
        `;

        let editorInstance = null;

        modal.showModal({
            title: 'Task Details',
            content,
            buttons: {
                'Save': () => {
                    const newTitle = document.getElementById('taskTitle').value.trim();
                    const newDescription = editorInstance ?
                        editorInstance.quill.root.innerHTML : '';
                    const assignedTo = document.getElementById('assignedTo').value;

                    if (newTitle) {
                        task.title = newTitle;
                        task.description = newDescription;
                        task.assignedTo = assignedTo;
                        task.updatedAt = new Date().toISOString();

                        const updatedElement = createTaskCard(task);
                        taskElement.replaceWith(updatedElement);
                        onUpdate();
                    }
                    return true;
                },
                'Cancel': () => {}
            },
            onShow: (modalElement) => {
                // Initialize rich text editor
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
        const currentUser = userService.getCurrentUser();
        if (!currentUser) {
            modal.showModal({
                title: 'Login Required',
                content: 'Please log in to create tasks',
                buttons: { 'OK': () => {} }
            });
            return;
        }

        const users = userService.getUsers();
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
            <div class="form-group">
                <label for="assignedTo">Assign To</label>
                <select id="assignedTo" class="form-control">
                    <option value="">Unassigned</option>
                    ${users.map(user => `
                        <option value="${user.id}">${user.name}</option>
                    `).join('')}
                </select>
            </div>
        `;

        let editorInstance = null;

        modal.showModal({
            title: 'Create New Task',
            content,
            buttons: {
                'Create': () => {
                    const taskTitle = document.getElementById('newTaskTitle').value.trim();
                    const description = editorInstance ?
                        editorInstance.quill.root.innerHTML : '';
                    const assignedTo = document.getElementById('assignedTo').value;

                    if (taskTitle) {
                        const task = {
                            id: Date.now().toString(),
                            title: taskTitle,
                            description: description,
                            createdBy: currentUser.id,
                            assignedTo: assignedTo,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        const taskElement = createTaskCard(task);
                        const columnContent = column.querySelector('.column-content');
                        columnContent.insertBefore(taskElement, columnContent.lastElementChild);

                        tasks.push(task);
                        onUpdate();
                        return true;
                    }
                    return false;
                },
                'Cancel': () => {}
            },
            onShow: (modalElement) => {
                // Initialize rich text editor
                editorInstance = richTextEditor.createEditor(
                    modalElement.querySelector('#newTaskDescription')
                );
            }
        });
    };

    // Create the column structure
    const column = document.createElement('div');
    column.className = 'column';
    column.draggable = true;

    // Create header
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
            const currentUser = userService.getCurrentUser();
            if (!currentUser) {
                modal.showModal({
                    title: 'Login Required',
                    content: 'Please log in to delete columns',
                    buttons: { 'OK': () => {} }
                });
                return;
            }

            if (!userService.isAdmin()) {
                modal.showModal({
                    title: 'Permission Denied',
                    content: 'Only administrators can delete columns',
                    buttons: { 'OK': () => {} }
                });
                return;
            }

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

        addTaskBtn.addEventListener('click', () => addTask());

        titleElement.addEventListener('blur', (e) => {
            const currentUser = userService.getCurrentUser();
            if (!currentUser) {
                e.target.textContent = title;
                modal.showModal({
                    title: 'Login Required',
                    content: 'Please log in to edit column titles',
                    buttons: { 'OK': () => {} }
                });
                return;
            }

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
/**
 * Sets up drag and drop functionality for tasks and columns
 */
export const setupDragAndDrop = ({ onDragComplete }) => {

    // Tracks the element currently being dragged
    let draggedElement = null;
    // Tracks the column from which a task was dragged
    let originalColumn = null;

    const initialize = (boardElement) => {
        // Handle dragstart
        boardElement.addEventListener('dragstart', (e) => {
            draggedElement = e.target.closest('.task-card, .column');
            if (draggedElement) {
                draggedElement.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';

                // Stores the originating column
                if (draggedElement.classList.contains('task-card')) {
                    originalColumn = draggedElement.closest('.column');
                }
            }
        });

        // Handle dragover
        boardElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedElement) return;

            // Calculate position and show drop indicators
            if (draggedElement.classList.contains('column')) {
                handleColumnDragOver(e, boardElement);
            } else if (draggedElement.classList.contains('task-card')) {
                handleTaskDragOver(e);
            }
        });

        // Handle dragend
        boardElement.addEventListener('dragend', (e) => {
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
                const newColumn = draggedElement.closest('.column');

                if (draggedElement.classList.contains('task-card') && originalColumn !== newColumn) {
                    onDragComplete(draggedElement, originalColumn, newColumn);
                } else if (draggedElement.classList.contains('column')) {
                    onDragComplete();
                }

                draggedElement = null;
                originalColumn = null;

                // Remove all drag indicators
                document.querySelectorAll('.drag-indicator').forEach(el => el.remove());
            }
        });
    };

    const handleColumnDragOver = (e, boardElement) => {
        const column = e.target.closest('.column');
        if (column && column !== draggedElement) {
            const columns = [...boardElement.querySelectorAll('.column')];
            const draggedIndex = columns.indexOf(draggedElement);
            const dropIndex = columns.indexOf(column);

            if (draggedIndex !== dropIndex) {
                const rect = column.getBoundingClientRect();
                const midX = rect.x + rect.width / 2;

                // Insert before if mouse is on left half
                if (e.clientX < midX && draggedIndex > dropIndex) {
                    column.parentNode.insertBefore(draggedElement, column);
                } else if (e.clientX > midX && draggedIndex < dropIndex) {
                    // Insert after if mouse is on right half
                    column.parentNode.insertBefore(draggedElement, column.nextSibling);
                }
            }
        }
    };

    const handleTaskDragOver = (e) => {
        const column = e.target.closest('.column');
        if (!column) return;

        const taskList = column.querySelector('.column-content');
        const currentTask = e.target.closest('.task-card');

        if (currentTask && currentTask !== draggedElement) {
            const rect = currentTask.getBoundingClientRect();
            const midY = rect.y + rect.height / 2;

            // Insert above or below based on mouse position
            if (e.clientY < midY) {
                taskList.insertBefore(draggedElement, currentTask);
            } else {
                taskList.insertBefore(draggedElement, currentTask.nextSibling);
            }
        } else if (taskList.contains(e.target) && e.target !== draggedElement) {
            const addTaskBtn = taskList.querySelector('.add-task');
            taskList.insertBefore(draggedElement, addTaskBtn);
        }
    };

    return {
        initialize
    };
};
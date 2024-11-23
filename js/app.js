import { createColumn } from './components/Column.js';
import { setupStorage } from './services/StorageService.js';
import { setupDragAndDrop } from './services/DragDropService.js';
import { setupModal } from './services/ModalService.js';
import { setupUserService } from './services/UserService.js';

/**
 * Initializes the Kanban board application
 */
const initializeBoard = () => {
    // Initialize services
    const storage = setupStorage();
    const userService = setupUserService(storage);
    const modalService = setupModal();

    // Initialize state
    const state = {
        boardColumns: document.getElementById('boardColumns'),
        addColumnBtn: document.getElementById('addColumnBtn'),
        storage: storage,
        modal: modalService,
        userService: userService
    };

    /**
     * Resets and updates board state
     */
    const resetBoardState = () => {
        state.boardColumns.innerHTML = '';
        const currentUser = state.userService.getCurrentUser();

        if (currentUser) {
            loadInitialState();
        }
    };

    /**
     * Shows login modal
     */
    const showLoginModal = () => {
        state.modal.showModal({
            title: 'Login',
            content: `
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" class="form-control" value="john@test.com">
                    <div class="form-help">Test users: john@test.com (admin), jane@test.com, test@test.com (password: password123)</div>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" class="form-control" value="password123">
                </div>
                <div class="error-message" id="loginError"></div>
            `,
            buttons: {
                'Login': () => {
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const errorDiv = document.getElementById('loginError');

                    try {
                        state.userService.login(email, password);
                        updateUserUI();
                        return true;
                    } catch (error) {
                        errorDiv.textContent = error.message;
                        return false;
                    }
                },
                'Cancel': () => {}
            }
        });
    };

    /**
     * Shows login required modal
     */
    const showLoginRequiredModal = () => {
        state.modal.showModal({
            title: 'Login Required',
            content: 'Please log in to create columns',
            buttons: {
                'Login': () => {
                    const loginBtn = document.getElementById('loginBtn');
                    if (loginBtn) {
                        loginBtn.click(); // This will trigger showLoginModal
                    }
                },
                'Cancel': () => {}
            }
        });
    };

    /**
     * Updates user interface based on login state
     */
    const updateUserUI = () => {
        const currentUserDiv = document.getElementById('currentUser');
        const loginBtn = document.getElementById('loginBtn');
        const user = state.userService.getCurrentUser();

        if (user) {
            currentUserDiv.innerHTML = `
            <div class="current-user-info">
                <span>Welcome, ${user.name}</span>
                ${user.role === 'admin' ? '<span class="badge">Admin</span>' : ''}
            </div>
        `;
            // Replace login button with logout button if it exists
            if (loginBtn) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logoutBtn'; // Add ID for reference
                logoutBtn.className = 'btn btn-outline-danger';
                logoutBtn.textContent = 'Logout';
                logoutBtn.onclick = () => { // Add click handler directly
                    state.userService.logout();
                    updateUserUI();
                };
                loginBtn.parentNode.replaceChild(logoutBtn, loginBtn);
            }
        } else {
            currentUserDiv.innerHTML = 'Not logged in';
            // Replace logout button with login button if it exists
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                const loginBtn = document.createElement('button');
                loginBtn.id = 'loginBtn';
                loginBtn.className = 'btn btn-primary';
                loginBtn.textContent = 'Login';
                loginBtn.onclick = showLoginModal; // Add click handler directly
                logoutBtn.parentNode.replaceChild(loginBtn, logoutBtn);
            }
        }
        resetBoardState();
    };

    /**
     * Sets up user interface
     */
    const setupUserUI = () => {
        // Only set up initial login button click handler
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', showLoginModal);
        }

        // Initial UI update
        updateUserUI();
    };

    /**
     * Creates a new column
     */
    const createNewColumn = (title, tasks = []) => {
        const currentUser = state.userService.getCurrentUser();
        if (!currentUser) return;

        const column = createColumn({
            title,
            tasks,
            onDelete: () => {
                if (state.userService.isAdmin()) {
                    state.storage.saveBoard();
                }
            },
            onUpdate: () => state.storage.saveBoard(),
            modal: state.modal,
            userService: state.userService
        });
        state.boardColumns.appendChild(column);
        state.storage.saveBoard();
    };

    /**
     * Shows column creation modal or creates column with title
     */
    const addColumn = (title = null) => {
        const currentUser = state.userService.getCurrentUser();
        if (!currentUser) {
            showLoginRequiredModal();
            return;
        }

        if (!title) {
            state.modal.showModal({
                title: 'Create New Column',
                content: `
                    <div class="form-group">
                        <label for="columnTitle">Column Title</label>
                        <input type="text" id="columnTitle" class="form-control">
                        <div class="error-message" id="titleError"></div>
                    </div>
                `,
                buttons: {
                    'Create': () => {
                        const titleInput = document.getElementById('columnTitle');
                        const titleError = document.getElementById('titleError');

                        if (!titleInput.value.trim()) {
                            titleError.textContent = 'Title is required';
                            return false;
                        }

                        createNewColumn(titleInput.value.trim());
                        return true;
                    },
                    'Cancel': () => {}
                }
            });
        } else {
            createNewColumn(title);
        }
    };

    /**
     * Loads saved board state
     */
    const loadInitialState = () => {
        const savedColumns = state.storage.getColumns();
        if (savedColumns?.length) {
            savedColumns.forEach(columnData => {
                createNewColumn(columnData.title, columnData.tasks);
            });
        }
    };

    /**
     * Sets up event listeners
     */
    const setupEventListeners = () => {
        state.addColumnBtn.addEventListener('click', () => {
            const currentUser = state.userService.getCurrentUser();
            if (!currentUser) {
                showLoginRequiredModal();
                return;
            }
            addColumn();
        });
    };

    // Initialize drag and drop
    const dragDrop = setupDragAndDrop({
        onDragComplete: (element, oldColumn, newColumn) => {
            state.storage.saveBoard();
        },
        canDrag: (element) => {
            const currentUser = state.userService.getCurrentUser();
            return !!currentUser;
        }
    });

    // Initialize everything
    setupUserUI();
    setupEventListeners();
    dragDrop.initialize(state.boardColumns);
    resetBoardState();

    // Return public methods
    return {
        addColumn,
        getCurrentUser: () => state.userService.getCurrentUser(),
        isAdmin: () => state.userService.isAdmin(),
        resetBoardState
    };
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanBoard = initializeBoard();
});
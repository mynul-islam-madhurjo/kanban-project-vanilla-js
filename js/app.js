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
        const registerBtn = document.getElementById('registerBtn');
        const user = state.userService.getCurrentUser();

        if (user) {
            currentUserDiv.innerHTML = `
            <div class="current-user-info">
                <span>Welcome, ${user.name}</span>
                ${user.role === 'admin' ? '<span class="badge">Admin</span>' : ''}
            </div>
        `;
            // Replace login/register buttons with logout button
            if (loginBtn && registerBtn) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logoutBtn';
                logoutBtn.className = 'btn btn-outline-danger';
                logoutBtn.textContent = 'Logout';
                logoutBtn.onclick = () => {
                    state.userService.logout();
                    updateUserUI();
                };
                loginBtn.parentNode.removeChild(registerBtn);
                loginBtn.parentNode.replaceChild(logoutBtn, loginBtn);
            }
        } else {
            currentUserDiv.innerHTML = 'Not logged in';
            // Restore login and register buttons
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                const newLoginBtn = document.createElement('button');
                const newRegisterBtn = document.createElement('button');

                newRegisterBtn.id = 'registerBtn';
                newRegisterBtn.className = 'btn btn-outline-primary';
                newRegisterBtn.textContent = 'Register';
                newRegisterBtn.onclick = showRegisterModal;

                newLoginBtn.id = 'loginBtn';
                newLoginBtn.className = 'btn btn-primary';
                newLoginBtn.textContent = 'Login';
                newLoginBtn.onclick = showLoginModal;

                const parent = logoutBtn.parentNode;
                parent.insertBefore(newRegisterBtn, logoutBtn);
                parent.replaceChild(newLoginBtn, logoutBtn);
            }
        }
        resetBoardState();
    };

    /**
     * Shows registration modal
     */
    const showRegisterModal = () => {
        state.modal.showModal({
            title: 'Register New User',
            content: `
            <div class="form-group">
                <label for="registerName">Full Name</label>
                <input type="text" id="registerName" class="form-control" placeholder="John Doe">
            </div>
            <div class="form-group">
                <label for="registerEmail">Email</label>
                <input type="email" id="registerEmail" class="form-control" placeholder="john@example.com">
            </div>
            <div class="form-group">
                <label for="registerPassword">Password</label>
                <input type="password" id="registerPassword" class="form-control">
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" class="form-control">
            </div>
            <div class="error-message" id="registerError"></div>
        `,
            buttons: {
                'Register': () => {
                    const name = document.getElementById('registerName').value.trim();
                    const email = document.getElementById('registerEmail').value.trim();
                    const password = document.getElementById('registerPassword').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    const errorDiv = document.getElementById('registerError');

                    // Validation
                    if (!name || !email || !password) {
                        errorDiv.textContent = 'All fields are required';
                        return false;
                    }

                    if (password !== confirmPassword) {
                        errorDiv.textContent = 'Passwords do not match';
                        return false;
                    }

                    try {
                        state.userService.createUser({ name, email, password });
                        // Auto login after registration
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
     * Sets up user interface
     */
    const setupUserUI = () => {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', showLoginModal);
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', showRegisterModal);
        }

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
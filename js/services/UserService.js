/**
 * Sets up user management with static test users
 */
export const setupUserService = (storage) => {
    // Static test users
    const DEFAULT_USERS = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@test.com',
            password: 'password123',
            role: 'admin',
            createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@test.com',
            password: 'password123',
            role: 'user',
            createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
            id: '3',
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123',
            role: 'user',
            createdAt: '2024-01-01T00:00:00.000Z'
        }
    ];

    let currentUser = null;
    let users = [];

    /**
     * Initialize with default users if none exist
     */
    const initialize = () => {
        users = storage.getUsers();
        if (users.length === 0) {
            users = DEFAULT_USERS;
            storage.saveUsers(users);
        }

        const currentUserId = storage.getCurrentUser();
        if (currentUserId) {
            currentUser = users.find(u => u.id === currentUserId);
        }
    };

    /**
     * Authenticate user
     */
    const login = (email, password) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        currentUser = user;
        storage.saveCurrentUser(user.id);
        return user;
    };

    /**
     * Log out current user
     */
    const logout = () => {
        currentUser = null;
        storage.saveCurrentUser(null);
    };

    /**
     * Get current user
     */
    const getCurrentUser = () => currentUser;

    /**
     * Get all users
     */
    const getUsers = () => users;

    /**
     * Check if user has admin role
     */
    const isAdmin = () => currentUser?.role === 'admin';

    // Initialize the service
    initialize();

    return {
        login,
        logout,
        getCurrentUser,
        getUsers,
        isAdmin
    };
};
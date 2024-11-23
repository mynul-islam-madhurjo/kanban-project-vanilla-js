/**
 * Creates and manages modal dialogs
 * @returns {Object} Modal management methods
 */
export const setupModal = () => {
    let activeModal = null;

    /**
     * Creates a modal dialog
     * @param {Object} config - Modal configuration
     * @param {string} config.title - Modal title
     * @param {string|HTMLElement} config.content - Modal content
     * @param {Object} config.buttons - Modal action buttons
     * @param {Function} config.onShow - Callback after modal is shown
     * @returns {HTMLElement} Modal element
     */
    const createModal = ({ title, content, buttons = {}, onShow }) => {
        const modal = document.createElement('div');
        modal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
        `;

        // Add content
        const modalBody = modalContent.querySelector('.modal-body');
        if (typeof content === 'string') {
            modalBody.innerHTML = content;
        } else {
            modalBody.appendChild(content);
        }

        // Add buttons
        const modalFooter = modalContent.querySelector('.modal-footer');
        Object.entries(buttons).forEach(([label, callback]) => {
            const button = document.createElement('button');
            button.className = 'btn';
            // Add primary style to first button
            if (label === Object.keys(buttons)[0]) {
                button.classList.add('btn-primary');
            }
            button.textContent = label;
            button.addEventListener('click', () => {
                if (callback) callback();
                closeModal(modal);
            });
            modalFooter.appendChild(button);
        });

        // Close button functionality
        const closeBtn = modalContent.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => closeModal(modal));

        modal.appendChild(modalContent);

        // Call onShow callback after a short delay to ensure DOM is ready
        if (onShow) {
            setTimeout(() => onShow(modal), 0);
        }

        return modal;
    };

    /**
     * Shows a modal dialog
     * @param {Object} modalConfig - Modal configuration
     */
    const showModal = (modalConfig) => {
        if (activeModal) {
            closeModal(activeModal);
        }

        const modal = createModal(modalConfig);
        document.body.appendChild(modal);
        activeModal = modal;

        // Animation frame for smooth transition
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // Add keyboard support (ESC to close)
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeModal(modal);
            }
        };
        document.addEventListener('keydown', handleKeyPress);

        // Clean up event listener when modal closes
        modal.addEventListener('close', () => {
            document.removeEventListener('keydown', handleKeyPress);
        });
    };

    /**
     * Closes the modal dialog
     * @param {HTMLElement} modal - Modal element to close
     */
    const closeModal = (modal) => {
        // Get Quill instance if it exists
        const quillEditor = modal.querySelector('.ql-editor');
        if (quillEditor) {
            // Clean up Quill instance to prevent memory leaks
            const quill = modal.quill;
            if (quill) {
                quill = null;
            }
        }

        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (activeModal === modal) {
                activeModal = null;
            }
        }, 200);
    };

    return {
        showModal
    };
};
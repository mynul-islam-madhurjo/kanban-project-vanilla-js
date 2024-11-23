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
     * @returns {HTMLElement} Modal element
     */
    const createModal = ({ title, content, buttons = {} }) => {
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
            button.textContent = label;
            button.addEventListener('click', () => {
                callback();
                closeModal(modal);
            });
            modalFooter.appendChild(button);
        });

        // Close button functionality
        const closeBtn = modalContent.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => closeModal(modal));

        modal.appendChild(modalContent);
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
    };

    /**
     * Closes the modal dialog
     * @param {HTMLElement} modal - Modal element to close
     */
    const closeModal = (modal) => {
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
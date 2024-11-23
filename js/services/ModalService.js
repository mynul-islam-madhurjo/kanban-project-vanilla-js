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
            if (label === Object.keys(buttons)[0]) {
                button.classList.add('btn-primary');
            }
            button.textContent = label;
            button.addEventListener('click', async () => {
                const result = await callback();
                if (result !== false) {
                    closeModal(modal);
                }
            });
            modalFooter.appendChild(button);
        });

        const closeBtn = modalContent.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => closeModal(modal));

        modal.appendChild(modalContent);

        // Store callback to call after modal is shown
        if (onShow) {
            modal.onShowCallback = onShow;
        }

        return modal;
    };

    const showModal = (modalConfig) => {
        if (activeModal) {
            closeModal(activeModal);
        }

        const modal = createModal(modalConfig);
        document.body.appendChild(modal);
        activeModal = modal;

        // Call onShow callback after modal is in DOM
        if (modal.onShowCallback) {
            setTimeout(() => modal.onShowCallback(modal), 0);
        }

        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeModal(modal);
            }
        };
        document.addEventListener('keydown', handleKeyPress);

        modal.addEventListener('close', () => {
            document.removeEventListener('keydown', handleKeyPress);
        });
    };

    const closeModal = (modal) => {
        if (!modal) return;

        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (activeModal === modal) {
                activeModal = null;
            }
        }, 200);
    };

    return {
        showModal,
        closeModal
    };
};
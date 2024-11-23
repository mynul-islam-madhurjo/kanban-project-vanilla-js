/**
 * Sets up and manages Quill rich text editors
 */
export const setupRichTextEditor = () => {

    // // These are the formatting options available to users
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
    ];

    /**
     * Creates a new Quill editor instance
     * @param {HTMLElement} container Container element for the editor
     * @param {string} initialContent Initial HTML content
     * @returns {Object} Quill editor instance and container element
     */
    const createEditor = (container, initialContent = '') => {
        // Create editor container
        const editorContainer = document.createElement('div');
        editorContainer.className = 'quill-editor';
        container.appendChild(editorContainer);

        // Initialize Quill
        const quill = new Quill(editorContainer, {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            }
        });

        // Set initial content
        quill.root.innerHTML = initialContent;

        return {
            quill,
            container: editorContainer
        };
    };

    /**
     * Gets the HTML content from a Quill editor
     * @param {Object} quill Quill editor instance
     * @returns {string} HTML content
     */
    const getContent = (quill) => {
        return quill.root.innerHTML;
    };

    return {
        createEditor,
        getContent
    };
};
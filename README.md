# Kanban Board | Vanilla JavaScript

A dynamic Kanban board application built with vanilla JavaScript, featuring user authentication, rich text editing, and drag-and-drop functionality.

🔗 [Live Demo](https://kanban-project-vanilla-js.netlify.app/)

## Features

### Core Functionality
- Create, edit, and delete columns
- Add tasks with rich text descriptions
- Drag and drop tasks between columns
- Column reordering
- Data persistence using localStorage

### User Management
- User authentication system
- Role-based permissions (Admin/User)
- Task assignment to users

### Rich Text Editing
- Quill.js integration for task descriptions
- Formatting options (bold, italic, lists, etc.)
- Preview formatted content in cards

## Test Users

```
Admin User:
Email: john@test.com
Password: password123

Regular Users:
Email: jane@test.com
Password: password123

Email: test@test.com
Password: password123
```

## Permissions

### Admin Users
- Create/Edit/Delete columns
- Assign tasks
- Drag and drop functionality
- View all content

### Regular Users
- Create/Edit tasks
- View all content
- Drag and drop functionality
- Task assignment

### Non-Logged In Users
- View only access
- Login required for actions

## Technical Stack

- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- QuillJS (Rich Text Editor)
- LocalStorage (Data Persistence)
- Modular Architecture

## Project Structure
```
project/
├── index.html
├── css/
│   ├── styles.css
│   ├── board.css
│   ├── components.css
│   └── modal.css
├── js/
│   ├── app.js
│   ├── components/
│   │   └── Column.js
│   └── services/
│       ├── StorageService.js
│       ├── UserService.js
│       ├── ModalService.js
│       ├── DragDropService.js
│       └── RichTextService.js
```

## Local Development

1. Clone the repository
2. Open index.html in a modern browser
3. Use test credentials or register new account

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Author
[Mynul Islam]

## License
MIT License
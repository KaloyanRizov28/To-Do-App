import { project, task } from "./tasks";

const projects = [];
let currentProject;

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function saveToLocalStorage() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function loadFromLocalStorage() {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        parsedProjects.forEach(proj => {
            const newProject = project(proj.titleProject);
            proj.tasks.forEach(t => {
                newProject.addTask(task(t.title, t.description, t.dueDate, t.priority, t.checkbox));
            });
            projects.push(newProject);
        });
    }
}

function createTaskUi(task, currentProject) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');
    taskDiv.dataset.title = task.title;
    taskDiv.dataset.dueDate = task.dueDate;
    taskDiv.dataset.priority = task.priority;
    taskDiv.dataset.checkbox = task.checkbox;

    const formattedDueDate = formatDate(task.dueDate);
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    let dueDateClass = '';

    if (dueDate < today) {
        dueDateClass = 'overdue';
    } else if (dueDate.toDateString() === today.toDateString()) {
        dueDateClass = 'due-today';
    }

    taskDiv.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        <div class="task-dueDate ${dueDateClass}">Due: ${formattedDueDate}</div>
        <div class="task-priority">Priority: ${task.priority}</div>
        <div class="task-checkbox">
            <input type="checkbox" id="task-${task.title}" ${task.checkbox ? 'checked' : ''}>
            <label for="task-${task.title}">Complete</label>
        </div>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
    `;

    // Add event listeners
    taskDiv.querySelector('.task-checkbox input').addEventListener('change', (e) => {
        task.editCheckbox(e.target.checked);
        saveToLocalStorage(); // Save state after checkbox change
        renderCurrentProject(currentProject);
    });
    taskDiv.querySelector('.edit').addEventListener('click', () => {
        editTaskInDom(task, currentProject);
    });
    taskDiv.querySelector('.delete').addEventListener('click', () => {
        currentProject.removeTask(task.id);
        saveToLocalStorage(); // Save state after task deletion
        renderCurrentProject(currentProject);
    });

    return taskDiv;
}

function appendTaskToDom(task, currentProject) {
    const taskUi = createTaskUi(task, currentProject);
    document.querySelector('.tasks').appendChild(taskUi);
}

function editTaskInDom(task, currentProject) {
    const modal = document.getElementById("editTaskModal");
    const span = modal.getElementsByClassName("close")[0];

    // Populate modal with task data
    document.getElementById("editTitle").value = task.title;
    document.getElementById("editDescription").value = task.description;
    document.getElementById("editDueDate").value = task.dueDate;
    document.getElementById("editPriority").value = task.priority;
    document.getElementById("editCheckbox").checked = task.checkbox;

    modal.style.display = "block";

    // Close modal functionality
    span.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };

    // Handle form submission
    document.getElementById("editTaskForm").onsubmit = function(event) {
        event.preventDefault();

        const updatedTask = {
            title: document.getElementById("editTitle").value,
            description: document.getElementById("editDescription").value,
            dueDate: document.getElementById("editDueDate").value,
            priority: document.getElementById("editPriority").value,
            checkbox: document.getElementById("editCheckbox").checked
        };

        task.editTitle(updatedTask.title);
        task.editDescription(updatedTask.description);
        task.editDueDate(updatedTask.dueDate);
        task.editPriority(updatedTask.priority);
        task.editCheckbox(updatedTask.checkbox);

        modal.style.display = "none";
        saveToLocalStorage(); // Save state after editing
        renderCurrentProject(currentProject);
    };
}

function renderCurrentProject(project) {
    const tasksDiv = document.querySelector('.tasks');
    tasksDiv.innerHTML = '';
    project.tasks.forEach(task => appendTaskToDom(task, project));
}

function renderSideBar(projects) {
    const sideBar = document.querySelector('.project-list');
    sideBar.innerHTML = '';
    projects.forEach(project => {
        const projectDiv = document.createElement('li');
        projectDiv.classList.add('project');
        projectDiv.textContent = project.titleProject;
        
        // Create delete button for project
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-project');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent project selection when clicking delete
            deleteProject(project);
        });
        
        projectDiv.appendChild(deleteButton);
        
        projectDiv.addEventListener('click', () => {
            currentProject = project;
            renderCurrentProject(currentProject);
        });
        sideBar.appendChild(projectDiv);
    });
}

function deleteProject(projectToDelete) {
    const index = projects.findIndex(p => p === projectToDelete);
    if (index !== -1) {
        projects.splice(index, 1);
        saveToLocalStorage();
        
        // If the deleted project was the current project, select a new one
        if (currentProject === projectToDelete) {
            currentProject = projects.length ? projects[0] : null;
        }
        
        renderSideBar(projects);
        if (currentProject) {
            renderCurrentProject(currentProject);
        } else {
            // Clear tasks if no projects remain
            document.querySelector('.tasks').innerHTML = '';
        }
    }
}

export function init() {
    loadFromLocalStorage(); // Load projects from localStorage
    currentProject = projects.length ? projects[0] : project('First Project');
    renderSideBar(projects);
    renderCurrentProject(currentProject);

    const addTaskButton = document.getElementById('taskButton');
    addTaskButton.addEventListener('click', () => {
        const title = document.getElementById('taskName').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('taskDate').value;
        const priority = document.getElementById('taskPriority').value;

        const newTask = task(title, description, dueDate, priority, false);
        currentProject.addTask(newTask);
        saveToLocalStorage(); // Save state after adding task
        renderCurrentProject(currentProject);
    });

    const addProjectButton = document.getElementById('add-project');
    addProjectButton.addEventListener('click', () => {
        const modal = document.getElementById("createProjectModal");
        const span = modal.getElementsByClassName("close")[0];
        modal.style.display = "block";

        span.onclick = () => modal.style.display = "none";
        window.onclick = (event) => {
            if (event.target == modal) modal.style.display = "none";
        };

        // Handle form submission
        document.getElementById("createProjectForm").onsubmit = function(event) {
            event.preventDefault();
            const projectTitle = document.getElementById("projectTitle").value;
            const newProject = project(projectTitle);
            projects.push(newProject);
            saveToLocalStorage(); // Save state after adding project
            modal.style.display = "none";
            renderSideBar(projects);
        }
    });
}
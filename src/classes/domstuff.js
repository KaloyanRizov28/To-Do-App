// task-management.js

import { project, task } from "./tasks";

const projects = [];
let currentProject;

function createTaskUi(task, currentProject) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');
    taskDiv.dataset.title = task.title;
    taskDiv.dataset.dueDate = task.dueDate;
    taskDiv.dataset.priority = task.priority;
    taskDiv.dataset.checkbox = task.checkbox;
    taskDiv.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        <div class="task-dueDate">${task.dueDate}</div>
        <div class="task-priority">${task.priority}</div>
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
        renderCurrentProject(currentProject);
    });
    taskDiv.querySelector('.edit').addEventListener('click', () => {
        editTaskInDom(task, currentProject);
        renderCurrentProject(currentProject);
    });
    taskDiv.querySelector('.delete').addEventListener('click', () => {
        currentProject.removeTask(task.id);
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
        projectDiv.addEventListener('click', () => {
            currentProject = project;
            renderCurrentProject(currentProject);
        });
        sideBar.appendChild(projectDiv);
    });
}

export function init() {
    currentProject = project('First Project');
    projects.push(currentProject);
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
            modal.style.display = "none";
            renderSideBar(projects);
        }
    });
}
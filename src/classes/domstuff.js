import { project, task } from "./tasks";

const projects = [];
let currentProject;

// Form validation elements
const addTaskForm = document.getElementById('add-task-form');
const taskButton = document.getElementById('taskButton');
const taskName = document.getElementById('taskName');
const taskDescription = document.getElementById('taskDescription');
const taskDate = document.getElementById('taskDate');
const taskPriority = document.getElementById('taskPriority');

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Form Validation Functions
function validateForm() {
    let isValid = true;
    removeErrorStyles();

    if (!taskName.value.trim()) {
        showError(taskName);
        isValid = false;
    } else if (taskName.value.trim().length < 3) {
        showError(taskName, 'Task name must be at least 3 characters');
        isValid = false;
    }

    if (!taskDescription.value.trim()) {
        showError(taskDescription);
        isValid = false;
    } else if (taskDescription.value.trim().length < 10) {
        showError(taskDescription, 'Description must be at least 10 characters');
        isValid = false;
    }

    if (!taskDate.value) {
        showError(taskDate);
        isValid = false;
    } else {
        const selectedDate = new Date(taskDate.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showError(taskDate, 'Date cannot be in the past');
            isValid = false;
        }
    }

    if (!taskPriority.value) {
        showError(taskPriority);
        isValid = false;
    }

    return isValid;
}

function showError(element, customMessage) {
    element.classList.add('error');
    const errorSpan = element.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.style.display = 'block';
        if (customMessage) {
            errorSpan.textContent = customMessage;
        }
    }
}

function removeErrorStyles() {
    const inputs = [taskName, taskDescription, taskDate, taskPriority];
    inputs.forEach(input => {
        input.classList.remove('error');
        const errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.style.display = 'none';
        }
    });
}

function validateField(element) {
    switch(element.id) {
        case 'taskName':
            if (element.value.trim().length < 3) {
                showError(element, 'Task name must be at least 3 characters');
                return false;
            }
            break;
            
        case 'taskDescription':
            if (element.value.trim().length < 10) {
                showError(element, 'Description must be at least 10 characters');
                return false;
            }
            break;
            
        case 'taskDate':
            const selectedDate = new Date(element.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showError(element, 'Date cannot be in the past');
                return false;
            }
            break;
            
        case 'taskPriority':
            if (!element.value) {
                showError(element, 'Please select a priority');
                return false;
            }
            break;
    }
    return true;
}

// Storage Functions
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

// UI Creation Functions
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
  let priorityClass = '';

  // Determine date status
  if (dueDate < today) {
      dueDateClass = 'overdue';
  } else if (dueDate.toDateString() === today.toDateString()) {
      dueDateClass = 'due-today';
  }

  // Set priority class
  switch(task.priority.toLowerCase()) {
      case 'high':
          priorityClass = 'priority-high';
          break;
      case 'medium':
          priorityClass = 'priority-medium';
          break;
      case 'low':
          priorityClass = 'priority-low';
          break;
  }

  taskDiv.innerHTML = `
      <div class="task-content ${task.checkbox ? 'completed' : ''}">
          <div class="task-header">
              <div class="task-main-info">
                  <div class="checkbox-wrapper">
                      <input type="checkbox" 
                             id="task-${task.title}" 
                             ${task.checkbox ? 'checked' : ''}>
                      <label for="task-${task.title}" class="custom-checkbox"></label>
                  </div>
                  <div class="task-title-section">
                      <h3 class="task-title ${task.checkbox ? 'completed-text' : ''}">${task.title}</h3>
                      <p class="task-description">${task.description}</p>
                  </div>
              </div>
              <div class="task-badges">
                  <span class="priority-badge ${priorityClass}">
                      ${task.priority}
                  </span>
                  <span class="date-badge ${dueDateClass}">
                      <i class="far fa-calendar"></i>
                      ${formattedDueDate}
                  </span>
              </div>
          </div>
          <div class="task-actions">
              <button class="edit-btn">
                  <i class="fas fa-edit"></i>
                  Edit
              </button>
              <button class="delete-btn">
                  <i class="fas fa-trash-alt"></i>
                  Delete
              </button>
          </div>
      </div>
  `;

  // Add event listeners
  taskDiv.querySelector('.checkbox-wrapper input').addEventListener('change', (e) => {
      const titleElement = taskDiv.querySelector('.task-title');
      const contentElement = taskDiv.querySelector('.task-content');
      
      if (e.target.checked) {
          titleElement.classList.add('completed-text');
          contentElement.classList.add('completed');
      } else {
          titleElement.classList.remove('completed-text');
          contentElement.classList.remove('completed');
      }
      
      task.editCheckbox(e.target.checked);
      saveToLocalStorage();
      renderCurrentProject(currentProject);
  });

  taskDiv.querySelector('.edit-btn').addEventListener('click', () => {
      editTaskInDom(task, currentProject);
  });

  taskDiv.querySelector('.delete-btn').addEventListener('click', (e) => {
      const deleteBtn = e.currentTarget;
      deleteBtn.disabled = true;
      
      // Add confirmation animation
      taskDiv.classList.add('deleting');
      
      setTimeout(() => {
          currentProject.removeTask(task.id);
          saveToLocalStorage();
          renderCurrentProject(currentProject);
      }, 300);
  });

  return taskDiv;
}
function appendTaskToDom(task, currentProject) {
    const taskUi = createTaskUi(task, currentProject);
    document.querySelector('.tasks').appendChild(taskUi);
}
function validateEditTask(task) {
  // Add your validation logic here
  return true; // Return false if validation fails
}

function showNotification(message, type) {
  // Add your notification logic here
  console.log(message); // Placeholder
}

function editTaskInDom(task, currentProject) {
  const modal = document.getElementById("editTaskModal");
  const form = document.getElementById("editTaskForm");
  
  // Set form values
  document.getElementById("editTitle").value = task.title;
  document.getElementById("editDescription").value = task.description;
  document.getElementById("editDueDate").value = task.dueDate;
  document.getElementById("editPriority").value = task.priority;
  document.getElementById("editCheckbox").checked = task.checkbox;

  // Open modal
  modal.style.display = "block";

  // Remove existing event listeners by cloning
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  document.getElementById("editPriority").value = task.priority;
  // Add submit handler to new form
  newForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const updatedTask = {
          title: document.getElementById("editTitle").value,
          description: document.getElementById("editDescription").value,
          dueDate: document.getElementById("editDueDate").value,
          priority: document.getElementById("editPriority").value,
          checkbox: document.getElementById("editCheckbox").checked
      };

      if (validateEditTask(updatedTask)) {
          // Update task
          task.editTitle(updatedTask.title);
          task.editDescription(updatedTask.description);
          task.editDueDate(updatedTask.dueDate);
          task.editPriority(updatedTask.priority);
          task.editCheckbox(updatedTask.checkbox);

          // Close modal
          modal.style.display = "none";
          
          // Save and update UI
          saveToLocalStorage();
          renderCurrentProject(currentProject);
          
          // Show success notification
          showNotification('Task updated successfully', 'success');
      }
  });

  // Close modal handlers
  const closeModal = () => {
      modal.style.display = "none";
  };

  // Close button handler
  modal.querySelector('.close-btn').addEventListener('click', closeModal);
  modal.querySelector('.close-modal').addEventListener('click', closeModal);

  // Click outside modal handler
  modal.addEventListener('click', (event) => {
      if (event.target === modal) {
          closeModal();
      }
  });
}
// Helper function to validate individual fields

function renderCurrentProject(project) {
    if (!project) return;
    
    const tasksDiv = document.querySelector('.tasks');
    const nameProject = document.getElementById('current-project-title');
    nameProject.innerHTML = `${project.titleProject}`;
    
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
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-project');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
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
        
        if (currentProject === projectToDelete) {
            currentProject = projects.length ? projects[0] : null;
        }
        
        renderSideBar(projects);
        if (currentProject) {
            renderCurrentProject(currentProject);
        } else {
            const nameProject = document.getElementById('current-project-title');
            nameProject.innerHTML = "";
            document.querySelector('.tasks').innerHTML = '';
        }
    }
}

// Initialize form validation listeners
function initFormValidation() {
    [taskName, taskDescription, taskDate, taskPriority].forEach(element => {
        element.addEventListener('input', () => {
            element.classList.remove('error');
            const errorSpan = element.nextElementSibling;
            if (errorSpan && errorSpan.classList.contains('error-message')) {
                errorSpan.style.display = 'none';
            }
        });

        element.addEventListener('blur', () => {
            if (element.value) {
                validateField(element);
            }
        });
    });
}

export function init() {
    loadFromLocalStorage();
    
      // If no projects exist, create a default one
      if (projects.length === 0) {
          const defaultProject = project('My Tasks');
          projects.push(defaultProject);
          saveToLocalStorage();
      }
      
      // Set current project to first project
      currentProject = projects[0];
      renderSideBar(projects);
      renderCurrentProject(currentProject);
      initFormValidation();
  
      // Rest of your init code remains the same...
    currentProject = projects.length ? projects[0] : project('First Project');
    renderSideBar(projects);
    renderCurrentProject(currentProject);
    initFormValidation();

    const addTaskButton = document.getElementById('taskButton');
    addTaskButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            const title = taskName.value;
            const description = taskDescription.value;
            const dueDate = taskDate.value;
            const priority = taskPriority.value;

            const newTask = task(title, description, dueDate, priority, false);
            currentProject.addTask(newTask);
            saveToLocalStorage();
            renderCurrentProject(currentProject);
            
            // Reset form
            addTaskForm.reset();
            removeErrorStyles();
        }
    });

    const addProjectButton = document.getElementById('add-project');
    addProjectButton.addEventListener('click', () => {
        const modal = document.getElementById("createProjectModal");
        const closeButtons = modal.querySelectorAll('.close-btn, .close-modal');
        const projectForm = document.getElementById("createProjectForm");
        const projectTitleInput = document.getElementById("projectTitle");
        const errorMessage = projectTitleInput.nextElementSibling;
    
        // Show modal
        modal.style.display = "block";
        projectTitleInput.focus();
    
        // Clear previous input and errors
        projectForm.reset();
        errorMessage.style.display = 'none';
        projectTitleInput.classList.remove('error');
    
        // Close modal functionality for all close buttons
        closeButtons.forEach(button => {
            button.onclick = () => {
                closeModalWithAnimation(modal);
            };
        });
    
        // Close on outside click
        window.onclick = (event) => {
            if (event.target == modal) {
                closeModalWithAnimation(modal);
            }
        };
    
        // Real-time validation
        projectTitleInput.addEventListener('input', () => {
            validateProjectTitle(projectTitleInput, errorMessage);
        });
    
        // Form submission
        projectForm.onsubmit = function(event) {
            event.preventDefault();
            const projectTitle = projectTitleInput.value;
    
            if (validateProjectTitle(projectTitleInput, errorMessage)) {
                // Create new project
                const newProject = project(projectTitle);
                projects.push(newProject);
                
                // Save and update UI
                saveToLocalStorage();
                
                // Close modal with animation
                closeModalWithAnimation(modal, () => {
                    renderSideBar(projects);
                    
                    // Show success notification
                    showNotification('Project created successfully!', 'success');
                });
            }
        };
    });
    
    // Helper Functions
    function validateProjectTitle(input, errorSpan) {
        const value = input.value.trim();
        
        if (value.length < 3) {
            showError(input, errorSpan, 'Project title must be at least 3 characters');
            return false;
        } else if (value.length > 50) {
            showError(input, errorSpan, 'Project title must be less than 50 characters');
            return false;
        } else if (projects.some(p => p.titleProject.toLowerCase() === value.toLowerCase())) {
            showError(input, errorSpan, 'A project with this name already exists');
            return false;
        }
    
        // Clear error if validation passes
        input.classList.remove('error');
        errorSpan.style.display = 'none';
        return true;
    }
    
    function showError(input, errorSpan, message) {
        input.classList.add('error');
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
    
    function closeModalWithAnimation(modal, callback) {
        const modalContent = modal.querySelector('.modal-content');
        
        // Add closing animations
        modal.style.animation = 'fadeOut 0.3s ease-out forwards';
        modalContent.style.animation = 'slideOut 0.3s ease-out forwards';
    
        // Wait for animation to complete
        setTimeout(() => {
            modal.style.display = 'none';
            // Reset animations for next time
            modal.style.animation = '';
            modalContent.style.animation = '';
            
            if (callback) callback();
        }, 300);
    }
    
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✓' : 'ℹ'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
        `;
    
        // Add to document
        document.body.appendChild(notification);
    
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}
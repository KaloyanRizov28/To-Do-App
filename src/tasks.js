//factory function to create task objects
export function task(title, description, dueDate, priority, checkbox) {
    return { title, description, dueDate, priority, checkbox,
        editTitle(newTitle) {
            this.title = newTitle;
        },
        editDescription(newDescription) {
            this.description = newDescription;
        },
        editDueDate(newDueDate) {
            this.dueDate = newDueDate;
        },
        editPriority(newPriority) {
            this.priority = newPriority;
        },
        editCheckbox(newCheckbox) {
            this.checkbox = newCheckbox;
        }
    };
}
export function project(titleProject) {
    const tasks = [];
    return { titleProject, tasks 
        addTask(project, task) {
            project.tasks.push(task);
        },
        removeTask(project, title) {
            project.tasks = project.tasks.filter(t => t.title !== title);
        }
    };
}

var projectActions = {
   
    
    
}



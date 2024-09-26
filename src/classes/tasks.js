export function task(title, description, dueDate, priority, checkbox) {
    return {
        id: Date.now().toString(), // Generate a unique id
        title,
        description,
        dueDate,
        priority,
        checkbox,
        
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
    return {
        titleProject,
        tasks: [],
        addTask(task) {
            this.tasks.push(task);
        },
        removeTask(id) {
            this.tasks = this.tasks.filter(t => t.id !== id);
        },
        findTask(id) {
            return this.tasks.find(t => t.id === id);
        }
    };
}




"use strict";

/*
 * =========================================================
 * TASKFLOW - FRONTEND APPLICATION
 * =========================================================
 *
 * Frontend:
 *     HTML + CSS + JavaScript
 *
 * Backend:
 *     FastAPI
 *
 * Backend Base URL:
 *     http://127.0.0.1:8000
 *
 * This file handles:
 *     - Task loading
 *     - Task rendering
 *     - Add task
 *     - Edit task
 *     - Delete task
 *     - Search
 *     - Sorting
 *     - Quick Add
 *     - Client-side validation
 *     - localStorage caching
 *
 * =========================================================
 */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";

const TASKS_ENDPOINT = `${API_BASE_URL}/tasks/`;

const QUICK_ADD_ENDPOINT =
    `${API_BASE_URL}/tasks/quick-add`;

const SEARCH_ENDPOINT =
    `${API_BASE_URL}/tasks/search`;

const CACHE_KEY = "taskflow_tasks";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const taskForm =
    document.getElementById("taskForm");

const taskTitle =
    document.getElementById("taskTitle");

const taskDescription =
    document.getElementById("taskDescription");

const taskPriority =
    document.getElementById("taskPriority");

const taskDueDate =
    document.getElementById("taskDueDate");

const taskProject =
    document.getElementById("taskProject");

const titleError =
    document.getElementById("titleError");

const submitTaskButton =
    document.getElementById("submitTaskButton");

const cancelEditButton =
    document.getElementById("cancelEditButton");

const formMessage =
    document.getElementById("formMessage");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const loadingState =
    document.getElementById("loadingState");

const taskListStatus =
    document.getElementById("taskListStatus");

const totalTasks =
    document.getElementById("totalTasks");

const refreshTasksButton =
    document.getElementById("refreshTasksButton");

const searchInput =
    document.getElementById("searchInput");

const searchAlgorithm =
    document.getElementById("searchAlgorithm");

const searchButton =
    document.getElementById("searchButton");

const sortSelect =
    document.getElementById("sortSelect");

const quickAddForm =
    document.getElementById("quickAddForm");

const quickAddDescription =
    document.getElementById("quickAddDescription");

const quickAddProject =
    document.getElementById("quickAddProject");

const quickAddMessage =
    document.getElementById("quickAddMessage");

const connectionStatus =
    document.getElementById("connectionStatus");

const applicationMessage =
    document.getElementById("applicationMessage");


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let tasks = [];

let editingTaskId = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


async function initializeApplication() {

    loadCachedTasks();

    renderTasks();

    await loadTasks();

    registerEventListeners();
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function registerEventListeners() {

    taskForm.addEventListener(
        "submit",
        handleTaskFormSubmit
    );


    cancelEditButton.addEventListener(
        "click",
        cancelEdit
    );


    refreshTasksButton.addEventListener(
        "click",
        async function () {

            await loadTasks();

        }
    );


    searchButton.addEventListener(
        "click",
        handleSearch
    );


    sortSelect.addEventListener(
        "change",
        handleSort
    );


    quickAddForm.addEventListener(
        "submit",
        handleQuickAdd
    );


    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                handleSearch();

            }

        }
    );

}


/* =========================================================
   LOAD TASKS FROM BACKEND
   ========================================================= */

async function loadTasks() {

    showLoading(true);

    setTaskListStatus(
        "Loading tasks..."
    );

    try {

        const response = await fetch(
            TASKS_ENDPOINT
        );


        if (!response.ok) {

            throw new Error(
                `Failed to load tasks. HTTP ${response.status}`
            );

        }


        const data = await response.json();


        tasks = Array.isArray(data)
            ? data
            : [];


        saveTasksToCache();


        renderTasks();


        setConnectionStatus(
            true
        );


        setTaskListStatus(
            `${tasks.length} task(s) loaded`
        );


    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );


        setConnectionStatus(
            false
        );


        /*
         * If backend is unavailable,
         * cached real backend data is used.
         */

        if (tasks.length > 0) {

            renderTasks();

            setTaskListStatus(
                "Showing cached tasks. Backend unavailable."
            );

        } else {

            renderTasks();

            setTaskListStatus(
                "Unable to connect to backend."
            );

        }


        showApplicationMessage(
            "Unable to connect to the TaskFlow backend.",
            "error"
        );

    } finally {

        showLoading(false);

    }

}


/* =========================================================
   LOAD CACHE
   ========================================================= */

function loadCachedTasks() {

    try {

        const cachedData =
            localStorage.getItem(
                CACHE_KEY
            );


        if (!cachedData) {

            tasks = [];

            return;

        }


        const parsedData =
            JSON.parse(cachedData);


        if (Array.isArray(parsedData)) {

            tasks = parsedData;

        } else {

            tasks = [];

        }


    } catch (error) {

        console.error(
            "Unable to read task cache:",
            error
        );

        tasks = [];

    }

}


/* =========================================================
   SAVE CACHE
   ========================================================= */

function saveTasksToCache() {

    try {

        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify(tasks)
        );

    } catch (error) {

        console.error(
            "Unable to save task cache:",
            error
        );

    }

}


/* =========================================================
   RENDER TASKS
   ========================================================= */

function renderTasks(taskRecords = tasks) {

    /*
     * Remove existing task cards.
     */

    taskList.innerHTML = "";


    totalTasks.textContent =
        taskRecords.length;


    if (taskRecords.length === 0) {

        emptyState.hidden = false;

        return;

    }


    emptyState.hidden = true;


    /*
     * Create every task card dynamically.
     *
     * Requirement:
     *     document.createElement()
     *     appendChild()
     *     textContent
     */

    taskRecords.forEach(
        function (task) {

            const taskCard =
                createTaskCard(task);


            taskList.appendChild(
                taskCard
            );

        }
    );

}


/* =========================================================
   CREATE TASK CARD
   ========================================================= */

function createTaskCard(task) {

    const card =
        document.createElement("article");

    card.className =
        "task-card";


    /* -----------------------------------------------------
       CONTENT
       ----------------------------------------------------- */

    const content =
        document.createElement("div");

    content.className =
        "task-content";


    /* -----------------------------------------------------
       TITLE
       ----------------------------------------------------- */

    const title =
        document.createElement("h3");

    title.className =
        "task-title";

    /*
     * IMPORTANT:
     * textContent is intentionally used.
     * Never use innerHTML for user-provided values.
     */

    title.textContent =
        task.title || "Untitled task";


    content.appendChild(title);


    /* -----------------------------------------------------
       DESCRIPTION
       ----------------------------------------------------- */

    if (task.description) {

        const description =
            document.createElement("p");

        description.className =
            "task-description";

        description.textContent =
            task.description;

        content.appendChild(
            description
        );

    }


    /* -----------------------------------------------------
       META
       ----------------------------------------------------- */

    const meta =
        document.createElement("div");

    meta.className =
        "task-meta";


    /* Priority */

    const priority =
        document.createElement("span");

    priority.className =
        `priority-badge priority-${getPriorityValue(task.priority)}`;

    priority.textContent =
        `Priority: ${getPriorityValue(task.priority)}`;

    meta.appendChild(priority);


    /* Due Date */

    if (task.due_date) {

        const dueDate =
            document.createElement("span");

        dueDate.textContent =
            `Due: ${task.due_date}`;

        meta.appendChild(
            dueDate
        );

    }


    /* Project */

    const project =
        document.createElement("span");

    project.textContent =
        `Project: ${task.project_id}`;

    meta.appendChild(
        project
    );


    content.appendChild(meta);


    /* -----------------------------------------------------
       ACTIONS
       ----------------------------------------------------- */

    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";


    /* Edit */

    const editButton =
        document.createElement("button");

    editButton.type =
        "button";

    editButton.className =
        "edit-task-button";

    editButton.textContent =
        "Edit";

    editButton.addEventListener(
        "click",
        function () {

            startEditTask(task);

        }
    );


    /* Delete */

    const deleteButton =
        document.createElement("button");

    deleteButton.type =
        "button";

    deleteButton.className =
        "delete-task-button";

    deleteButton.textContent =
        "Delete";

    deleteButton.addEventListener(
        "click",
        function () {

            deleteTask(task.id);

        }
    );


    actions.appendChild(
        editButton
    );

    actions.appendChild(
        deleteButton
    );


    /* -----------------------------------------------------
       COMPLETE CARD
       ----------------------------------------------------- */

    card.appendChild(
        content
    );

    card.appendChild(
        actions
    );


    return card;

}


/* =========================================================
   GET PRIORITY VALUE
   ========================================================= */

function getPriorityValue(priority) {

    if (
        priority &&
        typeof priority === "object" &&
        priority.value
    ) {

        return priority.value;

    }


    return String(
        priority || "medium"
    ).toLowerCase();

}


/* =========================================================
   ADD / UPDATE TASK
   ========================================================= */

async function handleTaskFormSubmit(event) {

    event.preventDefault();


    clearTitleError();

    clearFormMessage();


    /*
     * Client-side title validation.
     */

    const title =
        taskTitle.value.trim();


    if (title.length < 2) {

        showTitleError(
            "Task title must contain at least 2 characters."
        );

        taskTitle.focus();

        return;

    }


    if (title.length > 200) {

        showTitleError(
            "Task title cannot exceed 200 characters."
        );

        taskTitle.focus();

        return;

    }


    const projectId =
        Number(
            taskProject.value
        );


    if (!projectId || projectId < 1) {

        showFormMessage(
            "Please enter a valid project ID.",
            "error"
        );

        taskProject.focus();

        return;

    }


    const payload = {

        title: title,

        description:
            taskDescription.value.trim(),

        priority:
            taskPriority.value,

        due_date:
            taskDueDate.value.trim() || null,

        project_id:
            projectId

    };


    submitTaskButton.disabled = true;


    try {

        if (editingTaskId !== null) {

            await updateTask(
                editingTaskId,
                payload
            );

        } else {

            await createTask(
                payload
            );

        }


    } finally {

        submitTaskButton.disabled = false;

    }

}


/* =========================================================
   CREATE TASK
   ========================================================= */

async function createTask(payload) {

    try {

        const response =
            await fetch(
                TASKS_ENDPOINT,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            const errorMessage =
                await getApiErrorMessage(
                    response
                );

            throw new Error(
                errorMessage
            );

        }


        const createdTask =
            await response.json();


        /*
         * Update local state without page reload.
         */

        tasks.push(
            createdTask
        );


        saveTasksToCache();

        renderTasks();


        resetTaskForm();


        showFormMessage(
            "Task created successfully.",
            "success"
        );


        setTaskListStatus(
            `${tasks.length} task(s) loaded`
        );


    } catch (error) {

        console.error(
            "Create task error:",
            error
        );


        showFormMessage(
            error.message ||
                "Unable to create task.",
            "error"
        );

    }

}


/* =========================================================
   START EDIT
   ========================================================= */

function startEditTask(task) {

    editingTaskId =
        task.id;


    taskTitle.value =
        task.title || "";


    taskDescription.value =
        task.description || "";


    taskPriority.value =
        getPriorityValue(
            task.priority
        );


    taskDueDate.value =
        task.due_date || "";


    taskProject.value =
        task.project_id || "";


    submitTaskButton.textContent =
        "Update Task";


    cancelEditButton.hidden =
        false;


    showFormMessage(
        `Editing task #${task.id}`,
        "info"
    );


    taskTitle.focus();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   UPDATE TASK
   ========================================================= */

async function updateTask(
    taskId,
    payload
) {

    try {

        const response =
            await fetch(
                `${TASKS_ENDPOINT}${taskId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            const errorMessage =
                await getApiErrorMessage(
                    response
                );

            throw new Error(
                errorMessage
            );

        }


        const updatedTask =
            await response.json();


        /*
         * Replace old task in local state.
         */

        const index =
            tasks.findIndex(
                function (task) {

                    return task.id === taskId;

                }
            );


        if (index !== -1) {

            tasks[index] =
                updatedTask;

        }


        saveTasksToCache();

        renderTasks();


        resetTaskForm();


        showFormMessage(
            "Task updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Update task error:",
            error
        );


        showFormMessage(
            error.message ||
                "Unable to update task.",
            "error"
        );

    }

}


/* =========================================================
   CANCEL EDIT
   ========================================================= */

function cancelEdit() {

    resetTaskForm();


    showFormMessage(
        "Edit cancelled.",
        "info"
    );

}


/* =========================================================
   RESET TASK FORM
   ========================================================= */

function resetTaskForm() {

    editingTaskId =
        null;


    taskForm.reset();


    taskPriority.value =
        "medium";


    submitTaskButton.textContent =
        "Add Task";


    cancelEditButton.hidden =
        true;


    clearTitleError();

}


/* =========================================================
   DELETE TASK
   ========================================================= */

async function deleteTask(taskId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${TASKS_ENDPOINT}${taskId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const errorMessage =
                await getApiErrorMessage(
                    response
                );

            throw new Error(
                errorMessage
            );

        }


        /*
         * Remove task from local state.
         */

        tasks =
            tasks.filter(
                function (task) {

                    return task.id !== taskId;

                }
            );


        saveTasksToCache();

        renderTasks();


        setTaskListStatus(
            `${tasks.length} task(s) loaded`
        );


        showApplicationMessage(
            "Task deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );


        showApplicationMessage(
            error.message ||
                "Unable to delete task.",
            "error"
        );

    }

}


/* =========================================================
   SEARCH TASK
   ========================================================= */

async function handleSearch() {

    const title =
        searchInput.value.trim();


    /*
     * If search is empty,
     * restore complete task list.
     */

    if (!title) {

        renderTasks(tasks);

        setTaskListStatus(
            `${tasks.length} task(s) loaded`
        );

        return;

    }


    const algorithm =
        searchAlgorithm.value;


    try {

        showLoading(true);


        const url =
            `${SEARCH_ENDPOINT}?title=${encodeURIComponent(title)}&algo=${encodeURIComponent(algorithm)}`;


        const response =
            await fetch(url);


        if (response.status === 404) {

            renderTasks([]);

            setTaskListStatus(
                "No matching task found."
            );

            return;

        }


        if (!response.ok) {

            const errorMessage =
                await getApiErrorMessage(
                    response
                );

            throw new Error(
                errorMessage
            );

        }


        const result =
            await response.json();


        /*
         * Search endpoint returns
         * a matching task.
         */

        renderTasks(
            [result]
        );


        setTaskListStatus(
            `Search completed using ${algorithm} search.`
        );


    } catch (error) {

        console.error(
            "Search error:",
            error
        );


        showApplicationMessage(
            error.message ||
                "Unable to search tasks.",
            "error"
        );


    } finally {

        showLoading(false);

    }

}


/* =========================================================
   SORT TASKS
   ========================================================= */

async function handleSort() {

    const sortValue =
        sortSelect.value;


    /*
     * Default sorting.
     */

    if (!sortValue) {

        renderTasks(tasks);

        setTaskListStatus(
            `${tasks.length} task(s) loaded`
        );

        return;

    }


    try {

        showLoading(true);


        const url =
            `${TASKS_ENDPOINT}?sort=${encodeURIComponent(sortValue)}`;


        const response =
            await fetch(url);


        if (!response.ok) {

            const errorMessage =
                await getApiErrorMessage(
                    response
                );

            throw new Error(
                errorMessage
            );

        }


        const sortedTasks =
            await response.json();


        /*
         * Keep backend sorting result
         * in frontend state.
         */

        renderTasks(
            sortedTasks
        );


        setTaskListStatus(
            `Tasks sorted by ${sortValue}.`
        );


    } catch (error) {

        console.error(
            "Sort error:",
            error
        );


        showApplicationMessage(
            error.message ||
                "Unable to sort tasks.",
            "error"
        );


    } finally {

        showLoading(false);

    }

}


/* =========================================================
   QUICK ADD
   ========================================================= */

async function handleQuickAdd(event) {

    event.preventDefault();


    const description =
        quickAddDescription.value.trim();


    const projectId =
        Number(
            quickAddProject.value
        );


    if (!description) {

        showQuickAddMessage(
            "Please enter a task description.",
            "error"
        );

        quickAddDescription.focus();

        return;

    }


    if (!projectId || projectId < 1) {

        showQuickAddMessage(
            "Please enter a valid project ID.",
            "error"
        );

        quickAddProject.focus();

        return;

    }


    const payload = {

        description:
            description,

        project_id:
            projectId

    };


    const quickAddButton =
        document.getElementById(
            "quickAddButton"
        );


    quickAddButton.disabled =
        true;


    try {

        const response =
            await fetch(
                QUICK_ADD_ENDPOINT,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            const errorMessage =
                await getApiErrorMessage(
                    response
                );

            throw new Error(
                errorMessage
            );

        }


        const createdTask =
            await response.json();


        /*
         * Add real backend response
         * to local state.
         */

        tasks.push(
            createdTask
        );


        saveTasksToCache();

        renderTasks();


        quickAddForm.reset();


        showQuickAddMessage(
            "Task added successfully using Quick Add.",
            "success"
        );


        setTaskListStatus(
            `${tasks.length} task(s) loaded`
        );


    } catch (error) {

        console.error(
            "Quick Add error:",
            error
        );


        showQuickAddMessage(
            error.message ||
                "Unable to create Quick Add task.",
            "error"
        );


    } finally {

        quickAddButton.disabled =
            false;

    }

}


/* =========================================================
   API ERROR HANDLER
   ========================================================= */

async function getApiErrorMessage(
    response
) {

    try {

        const data =
            await response.json();


        if (data.detail) {

            if (Array.isArray(data.detail)) {

                return data.detail
                    .map(
                        function (item) {

                            return item.msg ||
                                "Validation error.";

                        }
                    )
                    .join(", ");

            }


            return String(
                data.detail
            );

        }


    } catch (error) {

        console.error(
            "Unable to parse API error:",
            error
        );

    }


    return `Request failed with HTTP ${response.status}.`;

}


/* =========================================================
   TITLE ERROR
   ========================================================= */

function showTitleError(message) {

    titleError.textContent =
        message;

}


function clearTitleError() {

    titleError.textContent =
        "";

}


/* =========================================================
   FORM MESSAGE
   ========================================================= */

function showFormMessage(
    message,
    type
) {

    formMessage.textContent =
        message;


    if (type === "error") {

        formMessage.style.color =
            "#dc2626";

    } else if (type === "success") {

        formMessage.style.color =
            "#15803d";

    } else {

        formMessage.style.color =
            "#64748b";

    }

}


/* =========================================================
   CLEAR FORM MESSAGE
   ========================================================= */

function clearFormMessage() {

    formMessage.textContent =
        "";

}


/* =========================================================
   QUICK ADD MESSAGE
   ========================================================= */

function showQuickAddMessage(
    message,
    type
) {

    quickAddMessage.textContent =
        message;


    if (type === "error") {

        quickAddMessage.style.color =
            "#dc2626";

    } else {

        quickAddMessage.style.color =
            "#15803d";

    }

}


/* =========================================================
   APPLICATION MESSAGE
   ========================================================= */

function showApplicationMessage(
    message,
    type
) {

    applicationMessage.textContent =
        message;


    applicationMessage.style.display =
        "block";


    if (type === "error") {

        applicationMessage.style.background =
            "#dc2626";

    } else {

        applicationMessage.style.background =
            "#172033";

    }


    window.setTimeout(
        function () {

            applicationMessage.style.display =
                "none";

        },
        3000
    );

}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function setConnectionStatus(
    connected
) {

    if (connected) {

        connectionStatus.textContent =
            "Backend: Connected";

        connectionStatus.style.background =
            "#f0fdf4";

        connectionStatus.style.color =
            "#15803d";

    } else {

        connectionStatus.textContent =
            "Backend: Offline";

        connectionStatus.style.background =
            "#fef2f2";

        connectionStatus.style.color =
            "#dc2626";

    }

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function showLoading(isLoading) {

    loadingState.hidden =
        !isLoading;

}


/* =========================================================
   TASK LIST STATUS
   ========================================================= */

function setTaskListStatus(
    message
) {

    taskListStatus.textContent =
        message;

}
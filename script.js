
let selectedDate = new Date().toISOString().split("T")[0];
let editIndex = null;


function login()
{
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const error = document.getElementById("loginError");

    error.style.display = "none";
    error.textContent = "";

    if (!username || !password)
    {
        error.textContent = "Please fill in all fields";
        error.style.display = "block";
        return;
    }

    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser)
    {
        error.textContent = "No account found. Please sign up";
        error.style.display = "block";
        return;
    }

    if (username !== savedUser.username ||
        password !== savedUser.password)
    {
        error.textContent = "Incorrect username or password";
        error.style.display = "block";
        return;
    }

    window.location.href = "dashboard.html";
}

function signup() {
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirm_password = document.getElementById("confirm_password").value.trim();
    const error = document.getElementById("signupError");

    error.style.display = "none";
    error.textContent = "";


    if (password !== confirm_password)
    {
        error.textContent = "Passwords do not match";
        error.style.display = "block";
        return;
    }

    if (!username || !password || !confirm_password) 
    {
        error.textContent = "Please fill in all fields";
        error.style.display = "block";
        return;
    }

    if (localStorage.getItem("user")) {
        error.textContent = "Account already exists. Please login.";
        error.style.display = "block";
        return;
    }


    localStorage.setItem(
        "user",
        JSON.stringify({username, password})
    );

    window.location.href = "index.html";

}

function saveTasks() {
    const allTasks = JSON.parse(localStorage.getItem("tasksByDate")) || {};
    allTasks[selectedDate] = tasks;
    localStorage.setItem("tasksByDate", JSON.stringify(allTasks));
}

function loadTasksForDate() {
    const allTasks = JSON.parse(localStorage.getItem("tasksByDate")) || {};
    tasks = allTasks[selectedDate] || [];
    renderTasks();
}

function renderTasks(){
    const taskList = document.getElementById("taskList");
    if (!taskList) return;

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = "<p>No tasks for this day</p>";
        return;
    }

    tasks.forEach((tasks, index) => {
        const card = document.createElement("div");
        card.className = "task-card";

        card.innerHTML = `
            <input type="checkbox" ${tasks.completed ? "checked" : ""} onchange="toggleComplete(${index})">
            <div class="task-info">
                <h4>${tasks.name}</h4>
                <p>${tasks.desc}</p>
                <span> ${tasks.time || "No time"}</span>
            </div>

            <div class="task-actions">
                <button onclick="editTask(${index})">
                    <i class="fa-solid fa-pen-to-square fa-sm"></i>
                </button>
                <button onclick="deleteTask(${index})">
                    <i class="fa-solid fa-trash fa-sm"></i>
                </button>
            </div>
        `;

        taskList.appendChild(card);

    });
}

const daysToShow = 7; 
const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

function createDateBoxes() {
    const today = new Date();

    for (let i = 0; i < daysToShow; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);

        const dayNumber = date.getDate();
        const weekDay = weekdays[date.getDay()];

        const box = document.createElement("div");
        box.classList.add("date-box");

        if (i === 0) box.classList.add("active");

        box.setAttribute("data-date", date.toISOString().split("T")[0]);

        box.innerHTML = `
            <span class="day">${dayNumber}</span>
            <span class="week">${weekDay}</span>
        `;

        box.addEventListener("click", () => {
            document
                .querySelectorAll(".date-box")
                .forEach(b => b.classList.remove("active"));

            box.classList.add("active");

            selectedDate = box.getAttribute("data-date");
            loadTasksForDate();
        });

        dateStrip.appendChild(box);
    }
}

function openModal(){
    document.getElementById("taskModal").style.display = "flex";
}

function closeModal(){
    document.getElementById("taskModal").style.display = "none";
}

function clearForm(){
    document.getElementById("taskName").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskTime").value = "";
}

function createTask(){

    const name = document.getElementById("taskName").value.trim();
    const desc = document.getElementById("taskDesc").value.trim();
    const time = document.getElementById("taskTime").value.trim();

    if(!name) return;

    if (editIndex !== null) {
        
        tasks[editIndex] = {
            ...tasks[editIndex],
            name,
            desc,
            time
        };
        editIndex = null;
    } else {

        tasks.push({
            name,
            desc,
            time,
            completed: false
        });

}

    closeModal();
    renderTasks();
    clearForm();
    saveTasks();
}

function deleteTask(index) {
    if (!confirm("Delete this task?")) return;

    tasks.splice(index, 1);
    renderTasks();
    saveTasks();
}

function editTask(index) {
    const task = tasks[index];

    document.getElementById("taskName").value = task.name;
    document.getElementById("taskDesc").value = task.desc;
    document.getElementById("taskTime").value = task.time;

    editIndex = index;
    openModal();
    
}

function renderCompletedTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    const allTasks = JSON.parse(localStorage.getItem("tasksByDate")) || {};
    const todayTasks = allTasks[selectedDate] || [];

    const completedToday = todayTasks.filter(task => task.completed === true);

    if (completedToday.length === 0) {
        taskList.innerHTML = "<p>No completed tasks for today</p>";
        return;
    }

    completedToday.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card completed";

        card.innerHTML = `
            <input type="checkbox" checked disabled>
            <div class="task-info">
                <h4>${task.name}</h4>
                <p>${task.desc}</p>
                <span>${task.time || "No time"}</span>
            </div>
        `;

        taskList.appendChild(card);
    });
}

function toggleComplete(index) {
    const allTasks = JSON.parse(localStorage.getItem("tasksByDate")) || {};

    const dayTasks = allTasks[selectedDate] || [];

    dayTasks[index].completed = !dayTasks[index].completed;

    allTasks[selectedDate] = dayTasks;

    localStorage.setItem("tasksByDate", JSON.stringify(allTasks));

    tasks = dayTasks; 
}

document.addEventListener("DOMContentLoaded", () => {
    const dateStrip = document.getElementById("dateStrip");

    selectedDate = new Date().toISOString().split("T")[0];

    createDateBoxes();
    loadTasksForDate();

    const myTasksLink = document.getElementById("my-tasks-link");
    const dashboardLink = document.getElementById("my-dashboard-link");
    const completedLink = document.getElementById("completed-link");

    myTasksLink.addEventListener("click", (e) => {
        e.preventDefault();

        document
        .querySelectorAll(".sidebar a")
        .forEach(a => a.classList.remove("active"));

        myTasksLink.classList.add("active");

        const mainContent = document.getElementById("main-content"); 
        mainContent.innerHTML = ` 
            <h5 id="mainTitle">My Tasks</h5> 
            <div id="taskList"></div> 
        `;

        const activeBox = document.querySelector(".date-box.active"); 
        selectedDate = activeBox 
        ? activeBox.getAttribute("data-date") 
        : new Date().toISOString().split("T")[0]; 
        
        loadTasksForDate();
       
    });

    const mainContent = document.querySelector(".main-content");
    const dashboardHTML = mainContent.innerHTML;
    const completedHTML = `
    <h5>Completed Tasks</h5>
    <div id="taskList"></div>
    `;

    dashboardLink.addEventListener("click", (e) => {
        e.preventDefault();

        document
        .querySelectorAll(".sidebar a")
        .forEach(a => a.classList.remove("active"));

        dashboardLink.classList.add("active");

        mainContent.innerHTML = dashboardHTML;
    })

    
    completedLink.addEventListener("click", (e) => {
        e.preventDefault();

        document
        .querySelectorAll(".sidebar a")
        .forEach(a => a.classList.remove("active"));

        completedLink.classList.add("active");

        mainContent.innerHTML = completedHTML;

        renderCompletedTasks();
    });
    
});







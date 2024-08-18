// Retrieve tasks and nextId from localStorage
let tasks = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
  const id = nextId;
  nextId += 1;
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return id;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  task.preventDefault;
  const taskCard = $("<div>")
    .addClass("card task-card draggable my-3")
    .attr("data-id", task.id);
  const taskTitle = $("<h5>").addClass("card-title").text(task.title);
  const cardBody = $("<div>").addClass("card-body");
  const taskDescription = $("<p>").addClass("card-text").text(task.type);
  const taskDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const cardDeleteBtn = $("<delete-button>")
    .addClass("btn btn-danger delete ")
    .text("Delete")
    .attr("data-task-id", task.id);

  // ? Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  // ? Gather all the elements created above and append them to the correct elements.
  cardBody.append(taskDescription, taskDueDate, cardDeleteBtn);
  taskCard.append(taskTitle, cardBody);

  // ? Return the card so it can be appended to the correct lane.
  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  if (tasks) {
    tasks.forEach((task) => {
      const taskCard = createTaskCard(task);
      if (task.status === "todo") {
        $("#todo-cards").append(taskCard);
      } else if (task.status === "in-progress") {
        $("#in-progress-cards").append(taskCard);
      } else if (task.status === "done") {
        $("#done-cards").append(taskCard);
      }
    });

    // Make cards draggable
    $(".card").draggable({
      revert: "invalid",
      helper: "clone",
      start: function (event, ui) {
        ui.helper.width($(this).width()); // Maintain width of the dragged item
      },
    });

    // Make lanes droppable
    $(".lane").droppable({
      accept: ".card",
      drop: handleDrop,
    });
  }
}

function handleAddTask(event) {
  event.preventDefault();

  const title = $("#task-title").val();
  const description = $("#task-description").val();
  const dueDate = $("#datepicker").val();

  if (!title || !dueDate) {
    alert("Title and Due Date are required");
    return;
  }

  const newTask = {
    id: generateTaskId(),
    title: title,
    description: description,
    dueDate: dueDate,
    status: "todo",
  };

  tasks = tasks || [];
  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  $("#formModal").modal("hide");
  renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask() {
  const cardDeleteBtn = $("<delete-button>");
  const card = $(task.target).closest(".card");
  const taskId = card.data("id");

  tasks = tasks.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  cardDeleteBtn.on("click", handleDeletetask);
}
// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskCard = $(ui.helper);
  const taskId = taskCard.data("id");
  const newStatus = $(event.target).attr("id").replace("-cards", "");

  tasks.forEach((task) => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $(".btn-primary").click(handleAddTask);
  $(document).on("click", ".delete-task", handleDeleteTask);
});

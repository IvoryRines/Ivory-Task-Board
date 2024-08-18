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
  const taskCard = $("<div>")
    .addClass("card task-card draggable my-3")
    .attr("data-id", task.id);
  const taskTitle = $("<h5>").addClass("card-title").text(task.title);
  const cardBody = $("<div>").addClass("card-body");
  const taskDescription = $("<p>").addClass("card-text").text(task.description);
  const taskDueDate = $("<p>").addClass("due-date").text(task.dueDate);

  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete-task ")
    .text("Delete")
    .attr("data-id", task.id);

  // ? Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const dueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(dueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(dueDate)) {
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
      if (task.status === "to-do") {
        $("#todo-cards").append(taskCard);
      } else if (task.status === "in-progress") {
        $("#in-progress-cards").append(taskCard);
      } else if (task.status === "done") {
        $("#done-cards").append(taskCard);
      }
    });

    // Make cards draggable
    $(".draggable").draggable({
      revert: "invalid",
      helper: "clone",
      start: function (event, ui) {
        ui.helper.width($(this).width());
        $(this).css("z-index", 1000); // Bring the dragged card to the front
      },
      stop: function (event, ui) {
        $(this).css("z-index", ""); // Reset the z-index after dragging
      },
    });

    // Make lanes droppable
    $(".lane").droppable({
      accept: ".draggable",
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
    status: "to-do",
  };

  tasks = tasks || [];
  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  //Clear Input Fields
  $('input[type="text"]').val("");
  $('input[type="date"]').val("");
  $('textarea[type="textarea"]').val("");

  $("#formModal").modal("hide");
  renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask() {
  const taskId = $(this).data("id");

  tasks = tasks.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  $(`.card[data-id="${taskId}"]`).remove();
}
// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskCard = $(ui.helper).clone(); // Clone the helper to get the correct task ID
  const taskId = taskCard.data("id");
  const newStatus = $(event.target).attr("id").replace("-cards", "");

  // Ensure the new status is valid
  if (!["to-do", "in-progress", "done"].includes(newStatus)) {
    console.error("Invalid status:", newStatus);
    return;
  }

  // Update the task's status
  const task = tasks.find((task) => task.id === taskId);
  if (task) {
    task.status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } else {
    console.error("Task not found:", taskId);
  }

  // Re-render the task list to reflect the changes
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#submit-button").click(handleAddTask); // Ensure correct button ID is used
  $(document).on("click", ".delete-task", handleDeleteTask);
});

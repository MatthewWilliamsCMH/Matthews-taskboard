// 1. Open page task board showing task-status lanes and add-task button
// 2. Read from local storage
// 3. Render data (if any) to task-status lanes
// 4. When form add-task button clicked, open modal dialog with add-task button
// 5. When dialog add-task button clicked, save task name, task due date, 
// task description, task-status of "to-do," and app-generated ID to task array
// 6. Write task array to local storage
// 7. Close dialog.
// 8. Read data from local storage (necessary? parsed data from step 2 still
// available?)
// 9. Add data to card(s)
// 10. Add delete button to card(s)
// 11. Set color of card based on proximity of due date
// 12. Append cards to task-status lanes
// 13. Render task-status lanes
// 14. On drag, update card status based on where it is dropped
// 15. Read data from local storage (necessary? parsed data from step 2 still
// available?)
// 16. Write amended data to local storage
// 17. Read data from local storage (necessary? updated data from step 14 still
// available?)
// 18. When delete button clicked, read from local storage (if not read in 16)
// 19. Delete task with unique id (not index?)
// 20. Write amended data to local storage
// 21. Render lanes

//connect variables to input elements on html form
// const taskDisplayEl = $("")
const taskFormEL = $("#task-form");
const taskTitleInputEl = $("#task-title-input");
const taskDueDateInputEl = $("#task-due-date-input");
const taskDescriptionInputEl = $("#task-description-input");
// let dialog = $("add-task");

// create variable to hold uuid for use later as taskID (can we just make this taskID?)
let uuid = "";

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

// not sure why this is necessary
let nextId = JSON.parse(localStorage.getItem("nextId"));

// --------- main ---------- //
// Todo: when the page loads, render the task list, add event listeners, 
// make lanes droppable, and make the due date field a date picker
$(document).ready(function() {
    if (taskList.length !== 0) {
        renderTaskList();
    };

    // create the dialog box using the jQuery UI dialog widget but don't show it yet
    dialog = $("#task-form").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Save Task": function() {
                $(this).dialog("close");
                handleAddTask();
            }
        }
    });

    // show the dialog box when the add-task button on the main page is clicked
    // HERE. THE LINE BELOW IS THROWING THE ERROR
    // something wrong with the way the input dialog is being generated
    $("#add-task").on("click", function() {
        dialog.dialog("open");
    })
    
    //make lanes droppable
    $('.lane').droppable({
        accept: ".draggable",
        drop: handleDrop(),
    });

    //make date input datepicker
    $("#taskDueDate").datepicker ({
        changeMonth: true,
        changeYear: true,
    });
});

// ---------- first-level functions (called by main) ---------- //
// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const tasks = readTasksFromStorage();
    // clear current data in card lanes
    const todoList = $("#todo-cards");
    todoList.empty();

    const inProgressList = $("in-progress-cards");
    inProgressList.empty();

    const doneList = $("done-cards");
    doneList.empty();

    // assign card to correct lane depending on status
    for (let task of taskList) {
        const taskCard = createTaskCard(task);

        if (task.status === "to-do") {
            todoList.append(taskCard);
        } else if (task.status === "in-progress") {
            inProgressList.append(taskCard);
        } else if (task.status === "done") {
            doneList.append(taskCard);
        }
    };

    $(".draggable").draggable({
        opacity:0.7,
        zIndex:100,
        helper: function (event) {
            const original = $(event.target).hasClass("ui-draggable")
                ? $(event.target)
                : $(event.target).closest(".ui-draggable");
                return original.clone().css({
                width:original.outerWidth(),
            });
        },
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(){
    // assign task-value inputs to task-value variables
    const taskTitle = taskTitleInputEl.val();
    const taskDueDate = taskDueDateInputEl.val();
    const taskDescription = taskDescriptionInputEl.val();

    // write task-value variables to new task array
    const myTask = {
        id: generateTaskId(),
        title: taskTitle,
        dueDate: taskDueDate,
        description: taskDescription,
        status: "to-do",
    };

    // retrive localStorage, push new task to the array, and save new tasks string
    const tasks = readTasksFromStorage();
    tasks.unshift(myTask);
    saveTasksToStorage(tasks);

    renderTaskList();

    // Clear inputs. necessary?
    taskTitleInputEl.val("")
    taskDueDateInputEl.val("")
    taskDescriptionInputEl.val("")

    // $("submit").on("submit", function() {
    //     if (taskTitleInputEl.val() === "" || taskDueDateInputEl.val() === "" || taskDescriptionInputEl.val() ===""){
    //         alert("Please complete all fields.")
    //         return;
    //     }
    //  }) 
}

// Todo: create a function to generate a unique task id
function generateTaskId() {
    uuid = crypto.randomUUID();
    return uuid;
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    $( function() {
        $( "#draggable" ).draggable();
        $( "#droppable" ).droppable({
          drop: function( event, ui ) {
            $( this )
              .addClass( "ui-state-highlight" )
              .find( "p" )
                .html( "Dropped!" );
          }
        });
      } );
}

// ---------- second-level functions (called by other functions) ---------- //
// Todo: create a function to create a task card
function createTaskCard(task) { 
    // create the elements of the card: task name, due date, and description
    const taskCard = $("<div>");
    taskCard.addClass("task-card task-card:hover draggable my-3");
    taskCard.attr("data-task-id", task.id);
    const cardHeader = $("<div>").addClass("card-header h4").text(task.title);
    const cardBody = $("<div>").addClass("card-body");
    const cardDueDate = $("<p>").addClass("card-text").text(task.dueDate);
    const cardDescription = $("<p>").addClass("card-text").text(task.description);
    // why do we assign the id to the button in the line below?
    const cardDeleteBtn = $("<button>").addClass("btn btn-outline-danger").text("Delete").attr("data-task-id", task.id);
        
        // set card background color based on date
        if (task.dueDate && task.status !== 'done') {
            const now = dayjs();
            const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

            // If the task is due today, make the card yellow. If it is overdue, make it red.
            if (now.isSame(taskDueDate, 'day')) {
                taskCard.addClass('bg-warning text-black');
            } else if (now.isAfter(taskDueDate)) {
                taskCard.addClass('bg-danger text-white');
                cardDeleteBtn.addClass('border-light text-white');
            }
        }

    cardBody.append(cardDueDate, cardDescription, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);
    return taskCard;
}
// ---------- utility functions (called repeatedly ---------- //
// read from localStorage
function readTasksFromStorage() {
    taskList = JSON.parse(localStorage.getItem("tasks")) || [];
    return taskList;
}

// save to localStorage
function saveTasksToStorage(tasks) {
    const tasksStr = JSON.stringify(tasks)
    localStorage.setItem("tasks", tasksStr)
}









// Todo: create a function to handle deleting a task
 function handleDeleteTask(event){

}
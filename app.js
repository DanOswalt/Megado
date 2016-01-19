(function(){

    console.log('jquery loaded');

    var data;
    var $activeCategoryCard = null;
    var $newTaskBtn = $('.new-task-btn');
    var $newCategoryBtn = $('#new-cat-btn');
    var $categoryCard = $('.category-card');
    var $cardBucket = $('.card-bucket');
    // var $taskSubmitBtn = $('.taskSubmitBtn');
    var $daysSubmitBtn = $('.daysSubmitBtn');
    var $taskField = $('.taskField');
    var $daysField = $('.daysField');
    var taskName = "";
    var taskDays = 0;
    var activeCategoryIndex = null;

    //UI functions////////////////////////////////////////////////////////////////////////////////////////

    //new category listener:
    $newCategoryBtn.on('click', function(){
        var name = promptNewCategory();
        var category = newCategory(name);
        displayNewCard(category);
    })

    //cardbucket listeners:
    $cardBucket.on('click', '.new-task-btn', function() {
        //target .new-task-btn clicks from cardBucket
        $('.new-task-btn').hide();
        displayNewTaskForm($activeCategoryCard);
        $('.taskField').focus();
    });

    $cardBucket.on('click', '.category-card', function() {
        //target .category-card clicks from cardBucket
        activeCategoryIndex = $(this).index();
        $activeCategoryCard = $('.category-card').eq(activeCategoryIndex);
        $cardBucket.children().removeClass('active-category');
        $(this).addClass('active-category');
        $newTaskBtn.removeClass('hidden');
        $('.new-task-btn').addClass('hidden');
        $activeCategoryCard.find('.new-task-btn').removeClass('hidden');
    });

    //newTaskForm listeners:

    $cardBucket.on('keyup', '.taskField', function(){
        //log the value and enable button if there's something typed
        var $taskSubmitBtn = $('.taskSubmitBtn');
        taskName = $(this).val();
        if(taskName.length > 0) {
            $taskSubmitBtn.removeClass('disabled');
        } else {
            $taskSubmitBtn.addClass('disabled');
        };       
    });

    //submit task name on submit arrow click

    $cardBucket.on('click', '.taskSubmitBtn', function(){
        submitTaskName();
    });

    //submit task name enter key press

    $cardBucket.on('keyup', function(e){
        if (e.which === 13) {
            submitTaskName();
        }
    });

    $cardBucket.on('click', '.daysSubmitBtn', function(){
        submitTaskDay();
    });

    $cardBucket.on('keyup', function(e){
        if (e.which === 13) {
            submitTaskDay();
        }
    });

    $cardBucket.on('change', '.daysField', function(){
        //log the value and enable button if there's something typed
        var $daysSubmitBtn = $('.daysSubmitBtn');
        taskDays = parseInt($(this).val());
        console.log(taskName);
        if(taskDays > 0) {
            $daysSubmitBtn.removeClass('disabled');
        } else {
            $daysSubmitBtn.addClass('disabled');
        };       
    });

    function submitTaskName() {
        if($('.taskSubmitBtn').hasClass('disabled')) {return};
        $('.taskFieldContainer')
            .addClass('hidden') //hide task input
            .next() //traverse to days input div
            .removeClass('hidden'); //show days input
        $('.daysField').focus();
    }

    function submitTaskDay() {
        //create new task, display new task, and reset variables
        if($('.daysSubmitBtn').hasClass('disabled')) {return};
        //add and display the new task
        newTask(taskName, taskDays);
        refreshTaskDisplay($activeCategoryCard, data.categories[activeCategoryIndex].tasks);
        //reset name and days vars (make this its own function?)
        taskName = "";
        taskDays = 0;
        //disable buttons
        $('.taskSubmitBtn').addClass('disabled');
        $('.daysSubmitBtn').addClass('disabled');
        //reset the fields
        $('.taskField').val("");
        $('.daysField').val(0);
        //hide the container, reset display for next new task
        $('.daysFieldContainer').addClass('hidden') //hide day container
        $('.newTaskFormCell').addClass('hidden'); //hide entire form container
        $('.taskFieldContainer').removeClass('hidden'); //show the task container for next time
        $('.new-task-btn').show(); //show the new task button
    }

    function displayNewTaskForm($card) {
        $card.find('.newTaskFormCell').removeClass('hidden');
    }

    function displayNewCard(category) {
        var newTaskBtnHTML = "<div class='new-task-btn cell-style hidden'><span class='glyphicon glyphicon-plus-sign'></span></div>";
        var card =  "<div class='category-card'>";
            card += "<h2 class='category-header cell-style'>";
            card += category.name;
            card += "</h2>";
            card += createNewTaskFormCell();
            card += newTaskBtnHTML;
            card += "</div>";
        $cardBucket.append(card);
    }

    function createNewTaskFormCell() {
        var newTaskFormHTML =  "<div class='newTaskFormCell cell-style hidden'>";

            //taskFieldContainer
            newTaskFormHTML += "<div class='taskFieldContainer'>"//hide
            newTaskFormHTML += "<input class='taskField taskInputStyle' type='text' name='name' placeholder='Task Name'>";
            newTaskFormHTML += "<div class='taskSubmit'><span class='glyphicon taskSubmitBtn glyphicon-circle-arrow-right disabled'></span></div>";
            newTaskFormHTML += "</div>";

            //daysFieldContainer
            newTaskFormHTML += "<div class='daysFieldContainer hidden'>"//hide
            newTaskFormHTML += "<div class='daysLabel'><span>Days:</span></div>"
            newTaskFormHTML += "<input class='daysField taskInputStyle' type='number' name='days' placeholder='0'>";
            newTaskFormHTML += "<div class='daysSubmit'><span class='glyphicon daysSubmitBtn glyphicon-plus-sign disabled'></span></div>";
            newTaskFormHTML += "</div>";

            newTaskFormHTML += "</div>";

            return newTaskFormHTML;
    }

    function refreshTaskDisplay($card, tasks) {
        console.log($card);
        $card.children('.task-list').remove();
        $card.find('.category-header').after("<ul class='task-list'></ul>");
        for(var i = 0; i < tasks.length; i++) {
            var deadline;
            //check if the date has been turned into a moment(), after loading it needs to go through this step
            if(moment.isMoment(tasks[i].deadline) === false) {
                deadline = moment(tasks[i].deadline);
            } else { //if was made during this session, it will be a moment();
                deadline = tasks[i].deadline;
            }
            var hrs_left = getHrsRemaining(moment(), deadline);
            var color = getColor(hrs_left);
            var name = tasks[i].name;
            var cell =  '<li>';
                cell += '<div class="task-cell cell-style" style="background-color:';
                cell += color + '">';
                cell += name;
                cell += '</div>';
                cell += '</li>';
            $card.find('.task-list').append(cell);
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////
    //data functions

    //save and load

    function save(JSONobj) {
        //save the entire data model as a JSON object string
        console.log('save data');
        localStorage.setItem('data', JSON.stringify(JSONobj));
    }

    function load(username) {
        //retrieve the JSON object from 'data' and return the parsed object
        console.log('load data');
        return JSON.parse(localStorage.getItem('data'));
    }

    function render() {
        for (var categoryIndex = 0; categoryIndex < data.categories.length; categoryIndex += 1) {
            var category = data.categories[categoryIndex];
            displayNewCard(category);
            var $card = $('.category-card').eq(categoryIndex);
            var tasks = category.tasks;
            refreshTaskDisplay($card, tasks);
        }
    }

    //classes Category and Task

    function Category(name) {
        this.name = name;
        this.tasks = [];
    }

    function Task(name, days) {

        this.name = name;
        this.days = days;
        var deadline_date = moment().date() + this.days; 
        this.deadline = moment().date(deadline_date).hour(23).minute(59).second(59);
        this.hrsRemaining = getHrsRemaining(moment(), this.deadline);
        this.color = getColor(this.hrsRemaining);
    }

    function getHrsRemaining(now, deadline) {
        return deadline.diff(now, 'hours');
    };

    function getColor(hrs) {
        if(hrs < 0) {
                return '#fc0025';
            } else if(hrs < 3) {
                return '#f995c4';
            } else if(hrs < 6) {
                return '#fcccd3';
            } else if(hrs < 12) {
                return 'white';
            } else if(hrs < 24) {
                return '#b9fc83';
            } else if(hrs < 72) {
                return '#71f902';
            } else {
                return '#16bc00';
            }
    };

    function promptNewCategory() {
        while(true) {
            var name = prompt("What's the category called?");
            if(name === 'cancel') return;
            if(name !== '' && name !== 'undefined') break;
        }
        return name;
    }

    //save data whenever new category or task is added

    function newCategory(name) {
        var category = new Category(name);
        data.categories.push(category);
        save(data);
        return category;
    }

    function newTask(name, days) {
        var task = new Task(name, days);
        data.categories[activeCategoryIndex].tasks.push(task);
        save(data);
    }

    if(!window.localStorage) {
        console.log('no localStorage support');
    } else {
        console.log('localStorage supported');
        data = load();
        console.log('data from localStorage:');
        console.log(data)
        if(data.categories) {
            render(data.categories);
        } else {
            data = {categories : []};
        }
    }

    save({});

})();





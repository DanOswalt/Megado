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
        //reset name and days vars
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
        console.log(tasks);
        $card.children('.task-list').remove();
        $card.find('.category-header').after("<ul class='task-list'></ul>");
        for(var i = 0; i < tasks.length; i++) {
            var hrs_left = tasks[i].getHrsRemaining(moment(), tasks[i].deadline);
            var color = tasks[i].getColor(hrs_left);
            var name = tasks[i].name;
            var cell =  '<li>';
                cell += '<div class="task-cell cell-style" style="background-color:';
                cell += color + '">';
                cell += name;
                cell += '</div>';
                cell += '</li>';
            $card.find('.task-list').append(cell);
            console.log(hrs_left)
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
            var $card = $('.category-card').eq(categoryIndex);
            var tasks = category.tasks;
            displayNewCard(category);
            refreshTaskDisplay($card, tasks);
        }
    }

    // function clearData() {
    //     save({});
    // };
    // clearData();

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
        this.countdown = {
            level0 : {
                     hours : 0,
                     color : '#fc0025'
                     },
            level1 : {
                     hours : 3,
                     color : '#f995c4'
                     },   
            level2 : {
                     hours : 6,
                     color : '#fcccd3'
                     },
            level3 : {
                     hours : 12,
                     color : 'white'
                     },  
            level4 : {
                     hours : 24,
                     color : '#b9fc83'
                     },
            level5 : {
                     hours : 72,
                     color : '#71f902'
                     },
            level6 : {
                     hours : 1000,
                     color : '#16bc00'
                     }    
        }
        this.hrsRemaining = this.getHrsRemaining(moment(), this.deadline);
        this.color = this.getColor(this.hrsRemaining);
    }

    Task.prototype.getHrsRemaining = function(now, deadline) {
        return deadline.diff(now, 'hours');
    };

    Task.prototype.getColor = function(hrs) {
        if(hrs < this.countdown.level0.hours) {
                return this.countdown.level0.color;
            } else if(hrs < this.countdown.level1.hours) {
                return this.countdown.level1.color;
            } else if(hrs < this.countdown.level2.hours) {
                return this.countdown.level2.color;
            } else if(hrs < this.countdown.level3.hours) {
                return this.countdown.level3.color;
            } else if(hrs < this.countdown.level4.hours) {
                return this.countdown.level4.color;
            } else if(hrs < this.countdown.level5.hours) {
                return this.countdown.level5.color;
            } else if(hrs < this.countdown.level6.hours) {
                return this.countdown.level6.color;
            } else
                return 'black';
    };

    function promptNewCategory() {
        while(true) {
            var name = prompt("What's the category called?");
            if(name === 'cancel') return;
            if(name !== '' && name !== 'undefined') break;
        }
        return name;
    }

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

    function printTasks(tasks) {
        for(var i = 0; i < tasks.length; i++) {
            console.log('*************************');
            console.log('Name:' + tasks[i].name);
            console.log('Days:' + tasks[i].days);
            console.log('Deadline Date:' + tasks[i].deadline_date);
            console.log('Deadline String:' + tasks[i].deadline_string);
            console.log('Deadline:' + tasks[i].deadline);
            tasks[i].hrsRemaining = tasks[i].getHrsRemaining(moment(), tasks[i].deadline);
            console.log('Hrs Left:' + tasks[i].hrsRemaining);
            // console.log('Time remaining: ' + tasks[i].hrs_left(moment(),tasks[i].deadline));
            tasks[i].color = tasks[i].getColor(tasks[i].hrsRemaining);
            console.log('Color:' + tasks[i].color);
            console.log('*************************');
        }
    }

    if(!window.localStorage) {
        console.log('no localStorage support');
    } else {
        console.log('localStorage supported');
        data = load();
        console.log(data);
        if(data.categories) {
            render(data.categories);
        } else {
            data = {
                        categories : []
                    };
        }
    }

})();





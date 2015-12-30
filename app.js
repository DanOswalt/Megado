
(function(){

    console.log('jquery loaded');

    //UI functions

    var categories = [];
    var activeCategoryIndex = null;
    var $activeCategoryCard = null;

    var $newTaskBtn = $('.new-task-btn');//testing this
    var $newCategoryBtn = $('#new-cat-btn');
    var $categoryCard = $('.category-card');
    var $cardBucket = $('.card-bucket');

    $newCategoryBtn.on('click', function(){
        var category = newCategory();
        categories.push(category);
        displayNewCard(category);
    })

    $cardBucket.on('click', '.new-task-btn', function() {
        var task = newTask();
        categories[activeCategoryIndex].tasks.push(task);
        refreshTaskDisplay($activeCategoryCard, categories[activeCategoryIndex].tasks);
        console.log($activeCategoryCard);
    });

    //when click is detected in .card-bucket, target the .category-card that was clicked,
    //appended .category-cards won't work if the event is bound to the .category-card

    $cardBucket.on('click', '.category-card', function() {
        activeCategoryIndex = $(this).index();
        $activeCategoryCard = $('.category-card').eq(activeCategoryIndex);
        $cardBucket.children().removeClass('active-category');
        $(this).addClass('active-category');
        $newTaskBtn.removeClass('hidden');

        //test new task button
        $('.new-task-btn').addClass('hidden');
        $activeCategoryCard.find('.new-task-btn').removeClass('hidden');
    });

    function displayNewCard(category) {

        var card =  "<div class='category-card'>";
            card += "<h2 class='category-header cell-style'>";
            card += category.name;
            card += "</h2>";
            card += "<span class='glyphicon glyphicon-plus-sign new-task-btn cell-style hidden'></span>"
            card += "</div>";
        $cardBucket.append(card);
    }

    function refreshTaskDisplay($card, tasks) {

        console.log("tasks:" + tasks[0]);

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

        }

    }

    //data functions

    function Category(name) {
        this.name = name;
        this.tasks = [];
    }

    function Task(name, days) {

        this.name = name;
        this.days = days;
        this.deadline_date = moment().date() + this.days; 
        this.deadline = moment().date(this.deadline_date).hour(23).minute(59).second(59);
        this.deadline_string = moment().endOf('day').add(this.days, 'days').calendar();
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

        this.getHrsRemaining = function(now, deadline) {
        	//now must be a moment()
        	return deadline.diff(now, 'hours');
        };

        this.hrsRemaining = this.getHrsRemaining(moment(), this.deadline);

        this.getColor = function(hrs) {
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
        }

        this.color = this.getColor(this.hrsRemaining);

    }

    function newCategory() {
        while(true) {
            var name = prompt("What's the category called?");
            if(name === 'cancel') return;
            if(name !== '' && name !== 'undefined') break;
        }

        return new Category(name);
    }

    function newTask() {

        var name = "",
            days = 0,
            task;

        while(true) {
            name = prompt("What's the task called?");
            if(name === 'cancel') return;
            if(name !== '' && name !== 'undefined') break;
        }

        while(true) {
            days = prompt("Repeat every how many days?");
            if(days === 'cancel') return;
            days = parseInt(days);
            if(days > 0 && isNaN(days) === false) break;
        }

        return new Task(name, days);
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

    function isInt(n){
        return Number(n) === n && n % 1 === 0;
    }

    function isFloat(n){
        return n === Number(n) && n % 1 !== 0;
    }

})();





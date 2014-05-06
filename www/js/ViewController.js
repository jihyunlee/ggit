function strcmp(str1, str2) {
  return ((str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1));
}


function ViewController(app) {
  this.app = app;
  this.goalStatus = false;
  this.goalString = '';
  this.goalSteps = '';
  this.goalPeriod = '';
  this.boxUUID = '';
  this.status = '';

  this.todaySteps = '';
  this.weeklySteps = [];

  this.test = false;
  this.debug = false;
  return this;
}


/**
    p1: Welcome screen
  */

ViewController.prototype.welcome = function(id) {

  console.log('\n\nwelcome\n\n');

  if(this.debug) {
    this.status = 'welcome';
    document.getElementById('status').innerHTML = this.status;
  }

<<<<<<< HEAD
=======
  this.clear();
  $('h2').html("Hold your phone</br>near the GGIT box</br>to connect");
>>>>>>> d594fadd3b643009a7ec51899a0c3e625b016597
  var parentElement = document.getElementById(id);
  var listeningElement = parentElement.querySelector('.listening');
  var receivedElement = parentElement.querySelector('.received');

  listeningElement.setAttribute('style','display:none;');
  receivedElement.setAttribute('style','display:block;');
  $('.app').css('display','none');
}


/**
    p2: GGIT Connection / Box connection status here Change Page
  */

ViewController.prototype.scan = function() {

  console.log("\n\nViewController::scan\n\n");

  if(this.debug) {
    this.status = 'scanning';
    document.getElementById('status').innerHTML = this.status;
  }

<<<<<<< HEAD
=======
  this.clear();  
>>>>>>> d594fadd3b643009a7ec51899a0c3e625b016597
  $('#page1').css('display','block');
}


/**
    when the box is connected -- connected
  */

ViewController.prototype.didConnect = function() {

  console.log("\n\nViewController::didConnect\n\n");
<<<<<<< HEAD

  if(this.debug) {
    this.status = 'connected';
    document.getElementById('status').innerHTML = this.status;
  }

  $('#page1').css('display','none');
  $('#page2').css('display','block');
  $('#page2').toggleClass("scansucceed");

  var that = this;
  setTimeout(function(){ that.hasGoal(); }, 2000);
=======
  
  this.clear();
  this.hasGoal();  
>>>>>>> d594fadd3b643009a7ec51899a0c3e625b016597
}


/**
    when the box is not connected
  */

ViewController.prototype.didFailToConnect = function() {

  console.log("\n\nViewController::didFailToConnect\n\n");

  if(this.debug) {
    this.status = 'fail to connect';
    document.getElementById('status').innerHTML = this.status;
  }
<<<<<<< HEAD

  $('#page1').css('display','none');
=======
    
  this.clear();
>>>>>>> d594fadd3b643009a7ec51899a0c3e625b016597
  $('#page2').css('display','block');
  if(!$('#page2').hasClass('scanfailed'))
    $('#page2').toggleClass("scanfailed");
}


/**
    Check if a goal has been set up
  */

ViewController.prototype.hasGoal = function() {
<<<<<<< HEAD

  console.log("\n\nViewController::hasGoal \n\n");

  if(this.goal == '') this.fillBox();
  else this.dashBoard();
=======
  console.log("\n\nViewController::hasGoal " + this.goalStatus.toString() +"\n\n");
  if(!strcmp(this.goalStatus.toString(), 'true')) this.app.fetch();
  else this.fillBox();
>>>>>>> d594fadd3b643009a7ec51899a0c3e625b016597
}


/**
    if the goal hasn't been set up in the box,
    ask a user to put some treats in the box
  */

ViewController.prototype.fillBox = function() {

  console.log("\n\nViewController::fillBox\n\n");

  this.clear();
  $('#page3').css('display','block');

  function animation(){
    $('#boxAnimation').toggleClass('changeImage');
    $('#boxAnimation').toggleClass('originalImage');
  }

  setInterval(animation, 1000);

  var that = this;
  $('#fillboxsubmit').click(function() {
    clearInterval(animation);
    that.setupGoal();
  });
}


/**
    set up the goal -- steps and period
  */

ViewController.prototype.setupGoal = function() {

  console.log("\n\nViewController::setupGoal\n\n");

  this.clear();
  $('#page4').css('display','block');

  var that = this;
  $('#goalsubmit').click(function() {
    var steps = $('#form-steps').val();
    var period = $('#form-freq').val();
    if(!steps) {
      navigator.notification.alert('How steps a day?', null, 'Go Get It!', 'Ok');
    } else if(!period) {
      navigator.notification.alert('How many days a week?', null, 'Go Get It!', 'Ok');
    } else {
      this.goalSteps = steps;
      this.goalPeriod = period;
      that.confirmGoal();  
    }
  });
}


/**
    Review the goal and confirm it
  */

ViewController.prototype.confirmGoal = function() {

  console.log("\n\nViewController::confirmGoal\n\n");

  var steps = $('#form-steps').val();
  var period = $('#form-freq').val();
<<<<<<< HEAD
  //console.log(steps + ","+ period);

  this.goalString = +steps+" steps for "+period+" days a week";
  console.log(this.goalString);
=======
  this.goalString = +steps+" steps for "+period+" days a week";
>>>>>>> d594fadd3b643009a7ec51899a0c3e625b016597

  var that = this;
  this.clear();
  $('#page5').css('display','block');
  $('h2').html("You set up a goal: </br>"+this.goalString+ ".</br></br> If you press 'confirm', </br>the box will be locked.");

  $('#goNext').click(function() {
    // console.log('lock the box');
    that.app.setupGoal(steps, period);
    that.app.lock();
    that.checkToJoin();
  });

  $('#resetGoal').click(function() {
    $('#page4').css('display','block');
    $('#page5').css('display','none');
    $('h2').html("What's your goal?");
  });
}


/**
    Ask the user if want to join this goal
  */

ViewController.prototype.checkToJoin = function() {

  console.log('\n\nViewController::checkToJoin\n\n');

  this.clear();
  $('#page6').css('display','block');
  $('h2').html(" Successfully locked!</br>Now, you are the owner of the BOX! </br></br>Do you want to be a challenger to win the box too?</br>");

  var that = this;
  $('#join').click(function() {
<<<<<<< HEAD
    //console.log("clicked");
    //Lock the box!!!!!!!!
=======
>>>>>>> d594fadd3b643009a7ec51899a0c3e625b016597
    $('h2').html("Great! Go out to run! </br>You need "+that.goalString+" to win the box.");
    $('#lockillust').toggleClass('lockImage');
    $('#lockillust').toggleClass('runImage');
    $('.buttonPair').css('display','none');
    that.app.fetch();
  });

  $('#notJoin').click(function() {
    $('#lockillust').toggleClass('lockImage');
    $('#lockillust').toggleClass('sendImage');

    $('.buttonPair').css('display','none');
    $('h2').html("Send this box </br>to your friends </br>and motivate them!");
  });
}


/**
    Fetch data
  */

// ViewController.prototype.fetch = function() {

//   console.log('\n\nViewController::fetch\n\n');

//   app.getWeeklySteps();
//   this.app.getGoal(this.dashBoard);
// }

/**
    Dashboard -- M7StepCounter
  */

ViewController.prototype.dashBoard = function() {

  console.log('\n\nViewController::dashBoard\n\n');

  if(this.debug) {
    this.status = 'dashboard';
    document.getElementById('status').innerHTML = this.status;
    document.getElementById('today-steps').innerHTML = this.todaySteps;
    document.getElementById('weekly-steps').innerHTML = this.weeklySteps;
  }

  this.clear();
  $('#dashboard').css('display','block');
  $('#title-today').html('TODAY');
  $('#title-goalstatement').html('Your goal is to have</br>'+this.goalSteps+' steps for '+this.goalPeriod+' days a week');
  $('#title-thisweek').html('THIS WEEK');

  this.drawTodayRing();
  this.setDateGap();
  this.weekStatusDot();
}


/**
    drawTodayRing
  */

ViewController.prototype.drawTodayRing = function() {

  console.log('ViewController::drawTodayRing');

  // Update the wheel giving to it a value in degrees,
  // getted from the percentage of the input value
  // a.k.a. (value * 360) / 100
  //current steps / goal steps *360;

  var degrees;
  var document = window.document,
      ring = document.getElementsByTagName('path')[0],
      text = document.getElementsByTagName('text')[1],
      Math = window.Math,
      toRadians = Math.PI / 180,
      r = 79;

  // Translate the center axis to a half of total size
  ring.setAttribute('transform', 'translate(' + r + ', ' + (r+10) + ')');

  console.log('todaySteps', this.todaySteps, parseInt(this.todaySteps));
  console.log('goalSteps', this.goalSteps, parseInt(this.goalSteps));

  var todaySteps = parseInt(this.todaySteps);
  var goalSteps = parseInt(this.goalSteps);
  if(todaySteps >= goalSteps){
    degrees = 359.98;
    ring.setAttribute('fill','#f06060');
    text.setAttribute('fill','#f06060');
  }else{
    degrees = ( todaySteps * 360 ) / goalSteps;
  }

  console.log("degrees: "+degrees);
      // Convert the degrees value to radians
  var rad = degrees * toRadians,
      // Determine X and cut to 2 decimals
      x = (Math.sin(rad) * r).toFixed(2),
      // Determine Y and cut to 2 decimals
      y = -(Math.cos(rad) * r).toFixed(2),
      // The another half ring. Same as (deg > 180) ? 1 : 0
      lenghty = window.Number(degrees > 180),
      // Moveto + Arcto
      descriptions = ['M', 0, 0, 'v', -r, 'A', r, r, 1, lenghty, 1, x, y, 'z'];
  // Apply changes to the path
  ring.setAttribute('d', descriptions.join(' '));
  // Update the numeric display
  text.textContent = todaySteps.toString();
}


/**
    setDateGap
  */

ViewController.prototype.setDateGap = function() {

  console.log('ViewController::setDateGap');

  var passedDays = 24;  // fake data for data gap
  var startingDate = "04/30/2014"; // fake data for starting date

  $('#dateGap').html(passedDays);
  $('#startingDate').html(startingDate);
}


/**
    weekStatusDot
  */

<<<<<<< HEAD
ViewController.prototype.setupBleAgain = function() {

  console.log("\n\nViewController::setupBleAgain\n\n");
=======
ViewController.prototype.weekStatusDot = function() {

  console.log('ViewController::weekStatusDot');

  var successDays = 0;

  var document = window.document;
  for(var i = 0; i < this.weeklySteps.length; i++){
    var weekStatus = document.getElementsByTagName('li')[i];
        weekStatus.innerHTML = "";
    var dot = document.createElement("div");
    if(parseInt(this.weeklySteps[i]) >= parseInt(this.goalSteps)){
      successDays++;
      dot.setAttribute("class","circle color-1 color1-box-shadow");
    }else{
      dot.setAttribute("class","circle color-2 color2-box-shadow");
    }
    weekStatus.appendChild(dot);
  }

  var goalPeriod = parseInt(this.goalPeriod);
  $('.goal-progress').val(Math.floor(successDays/goalPeriod*100));

  if(goalPeriod-successDays == 1)
    $('#goal-progress-text').html(goalPeriod-successDays+' more day to go!');
  else
    $('#goal-progress-text').html(goalPeriod-successDays+' more days to go!');
}
>>>>>>> d594fadd3b643009a7ec51899a0c3e625b016597


/**
    Clear display
  */

ViewController.prototype.clear = function() {    
  $('#page1').css('display','none');
  $('#page2').css('display','none');
<<<<<<< HEAD
  $('#page1').css('display','block');
  $('#page2').toggleClass("scanfailed");
  //console.log("setup Ble again!");
  var that = this;
  setTimeout(function(){ that.didConnect(); }, 5000);
}

var fakeGoalSteps = 5000;
var fakeStepArray = [2820,5105,2003,2366,5890,4105,2810];

var passedDays; //Needs to get date gap from starting date from today
var startingDate;

ViewController.prototype.displayDashboard = function() {

    $('#dashboard').css('display','block');

    var document = window.document,
    ring = document.getElementsByTagName('path')[0],
    range = document.getElementsByTagName('input')[0],
    text = document.getElementsByTagName('text')[1],
    Math = window.Math,
    toRadians = Math.PI / 180,
    r = 79,
    goalSteps = fakeGoalSteps,
    currentSteps = fakeStepArray[0];


    function setDateGap(){
        passedDays = 24;  // fake data for data gap
        startingDate = "2014/04/30"; // fake data for starting date
        $('#dateGap').html(passedDays);
        $('#startingDate').html(startingDate);
    }

    function drawTodayRing() {
        // Update the wheel giving to it a value in degrees,
        // getted from the percentage of the input value
        // a.k.a. (value * 360) / 100
        //current steps / goal steps *360;
        var degrees;

        if(currentSteps >= goalSteps){
          degrees = 359.98;
          ring.setAttribute('fill','#f06060');
          text.setAttribute('fill','#f06060');
        }else{
          degrees = ( currentSteps*360 ) / goalSteps;
        }

        console.log("degrees: "+degrees);
            // Convert the degrees value to radians
        var rad = degrees * toRadians,
            // Determine X and cut to 2 decimals
            x = (Math.sin(rad) * r).toFixed(2),
            // Determine Y and cut to 2 decimals
            y = -(Math.cos(rad) * r).toFixed(2),
            // The another half ring. Same as (deg > 180) ? 1 : 0
            lenghty = window.Number(degrees > 180),
            // Moveto + Arcto
            descriptions = ['M', 0, 0, 'v', -r, 'A', r, r, 1, lenghty, 1, x, y, 'z'];
        // Apply changes to the path
        ring.setAttribute('d', descriptions.join(' '));
        // Update the numeric display
        text.textContent = currentSteps;

    }

    function weekStatusDot(){

      for(var i = 1; i < fakeStepArray.length; i++){
        var document = window.document,
        weekStatus = document.getElementsByTagName('li')[i-1];
        weekStatus.innerHTML = "";
        var dot = document.createElement("div");
        if(fakeStepArray[i] >= goalSteps){
            dot.setAttribute("class","circle color-1 color1-box-shadow");
        }else{
            dot.setAttribute("class","circle color-2 color2-box-shadow");
        }
        weekStatus.appendChild(dot);

      }

    }
    // Translate the center axis to a half of total size
    ring.setAttribute('transform', 'translate(' + r + ', ' + (r+10) + ')');
    // Bind the change event to the input
    //range.addEventListener('change', draw);
    // Force to init the first time
    drawTodayRing();
    setDateGap();
    weekStatusDot();

  }
=======
  $('#page3').css('display','none');
  $('#page4').css('display','none');
  $('#page5').css('display','none');
  $('#page6').css('display','none');
}


ViewController.prototype.getGoalStatus = function() {
  return this.goalStatus;
}

ViewController.prototype.setGoalStatus = function(goalStatus) {
  this.goalStatus = goalStatus;
}

ViewController.prototype.getGoalSteps = function() {
  return this.goalSteps;
}

ViewController.prototype.setGoalSteps = function(steps) {
  console.log('ViewController::setGoalSteps', steps);
  this.goalSteps = steps;
}

ViewController.prototype.getGoalPeriod = function() {
  return this.goalPeriod;
}

ViewController.prototype.setGoalPeriod = function(period) {
  console.log('ViewController::setGoalPeriod', period);
  this.goalPeriod = period;
}

ViewController.prototype.getTodaySteps = function() {
  return this.todaySteps;
}

ViewController.prototype.setTodaySteps = function(steps) {
  this.todaySteps = steps;
}

ViewController.prototype.getWeeklySteps = function() {
  return this.weeklySteps;
}

ViewController.prototype.setWeeklySteps = function(steps) {
  this.weeklySteps = steps;
}

ViewController.prototype.getDate = function(dayBefore) {
  var date = new Date();
  date.setDate(date.getDate() - dayBefore);
      
  var dd = date.getDate();
  var mm = date.getMonth()+1;
      
  if(dd < 10) dd='0'+dd;
  if(mm < 10) mm='0'+mm;
  return mm+'/'+dd;
}
>>>>>>> d594fadd3b643009a7ec51899a0c3e625b016597

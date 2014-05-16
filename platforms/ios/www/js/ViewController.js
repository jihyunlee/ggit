function strcmp(str1, str2) {
  return ((str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1));
}


function ViewController(app) {
  this.app = app;
  this.goalStatus = '';
  this.lockStatus = false;
  this.goalString = '';
  this.goalSteps = '';
  this.goalPeriod = '';
  this.boxUUID = '';
  this.status = '';

  this.todaySteps = 0;
  this.weeklySteps = [];

  this.congratsAnimationId = '';

  this.debug = false;
}


/**
    M7 not supported
  */

ViewController.prototype.notSupportedDevice = function() {

  console.log('\n\notSupportedDevice\n\n');

  this.clear();
  $('#page-notSupported').css('display','block');
  if(!$('#page-notSupported').hasClass('notSupported'))
    $('#page-notSupported').toggleClass('notSupported');
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

  this.clear();  
  $('h2').html('Hold your phone</br>near the GGIT box</br>to connect');
  $('#page-scanning').css('display','block');
}


/**
    when the box is connected -- connected
  */

ViewController.prototype.didConnect = function() {

  console.log("\n\nViewController::didConnect\n\n");
  
  this.clear();
  this.hasGoal();  
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
    
  this.clear();
  $('#page-failToConnect').css('display','block');
  if(!$('#page-failToConnect').hasClass('scanfailed'))
    $('#page-failToConnect').toggleClass("scanfailed");
}


/**
    Check if a goal has been set up
  */

ViewController.prototype.hasGoal = function() {
  console.log("\n\nViewController::hasGoal " + this.goalStatus.toString() +"\n\n");
  // if(!strcmp(this.goalStatus.toString(), 'true')) {
  var that = this;
  if(this.goalStatus === 'true') {
    // this.app.fetch();
    this.goalSteps = window.localStorage.getItem('goalSteps');
    this.goalPeriod = window.localStorage.getItem('goalPeriod');
    console.log('steps', this.goalSteps, 'period', this.goalPeriod);
    this.app.dashBoardIntervalId = setInterval(function(){that.dashBoard();},500);
  }
  else this.fillBox();
}


/**
    if the goal hasn't been set up in the box, 
    ask a user to put some treats in the box
  */

ViewController.prototype.fillBox = function() {

  console.log("\n\nViewController::fillBox\n\n");

  this.clear();
  $('h2').html('Box is empty.</br>Put a treat in the box!</br>');
  $('#page-fillBox').css('display','block');

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
  $('h2').html('Now you can set up a goal</br>to get thing in a box!</br>');
  $('#page-setupGoal').css('display','block');
  
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
  this.goalString = +steps+" steps for "+period+" days a week";

  var that = this;
  this.clear();
  $('#page-confirmGoal').css('display','block');
  $('h2').html("You set up a goal: </br>"+this.goalString+ ".</br></br> If you press 'confirm', </br>the box will be locked.");
  
  $('#goNext').click(function() {
    that.app.setupGoal(steps, period);
//    that.app.lock();
  });
  
  $('#resetGoal').click(function() {
    $('#page-setupGoal').css('display','block');
    $('#page-confirmGoal').css('display','none');
    $('h2').html("What's your goal?");
  });
}


/**
    Ask the user if want to join this goal
  */

ViewController.prototype.checkToJoin = function() {

  console.log('\n\nViewController::checkToJoin\n\n');

  this.clear();
  $('#page-checkToJoin').css('display','block');
  $('h2').html(" Successfully locked!</br>Now, you are the owner of the BOX! </br></br>Do you want to be a challenger to win the box too?</br>");
  
  var that = this;
  $('#join').click(function() {
    $('h2').html("Great! Go out to run! </br>You need "+that.goalString+" to win the box.");
    $('#lockillust').toggleClass('lockImage');
    $('#lockillust').toggleClass('runImage');
    $('.buttonPair').css('display','none');
    // that.app.fetch();
    // that.goalSteps = window.localStorage.getItem('goalSteps');
    // that.goalPeriod = window.localStorage.getItem('goalPeriod');
    // console.log('steps', that.goalSteps, 'period', that.goalPeriod);
    this.app.dashBoardIntervalId = setInterval(function(){that.dashBoard();},500);
  });
  
  $('#notJoin').click(function() {
    $('#lockillust').toggleClass('lockImage');
    $('#lockillust').toggleClass('sendImage');
    
    $('.buttonPair').css('display','none');
    $('h2').html("Send this box </br>to your friends </br>and motivate them!");
  });
}


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
  $('#title-thisweek').html('LAST WEEK');

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

  // console.log("degrees: "+degrees);
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
    var date = document.createElement("div");
    date.setAttribute('class','date-disc');
    date.innerHTML = this.getDate(i+1);

    weekStatus.appendChild(dot);
    weekStatus.appendChild(date);
  }
  if(parseInt(this.todaySteps) >= parseInt(this.goalSteps)) successDays++;

  var goalPeriod = parseInt(this.goalPeriod);
  $('.goal-progress').val(Math.floor(successDays/goalPeriod*100));

  if(goalPeriod-successDays == 0) {
    this.congrats();
  } else {
    if(goalPeriod-successDays == 1) {
      if(parseInt(this.todaySteps) >= parseInt(this.goalSteps)) {
        $('#goal-progress-text').html('You will get it if you make '+this.goalSteps+' steps tomorrow!');
      } else {
        var needSteps = parseInt(this.goalSteps) - parseInt(this.todaySteps);
        $('#goal-progress-text').html('You will get it if you have '+needSteps+' more steps today!');        
      }
    }
    else
      $('#goal-progress-text').html(goalPeriod-successDays+' more days to go!');    
  }
}


/**
    achievedGoal
  */

ViewController.prototype.congrats = function() {

  console.log('ViewController::congrats');

  this.clear();
  $('#page-congrats').css('display','block');

  var counter = 0;
  function animation() {
    counter %= 3; 
    $("#congratAnimation").removeClass('congrat'+counter++);
    $("#congratAnimation").addClass('congrat'+counter%3);
  }

  this.congratsAnimationId = setInterval(animation, 700);
}


/**
    Clear display
  */

ViewController.prototype.clear = function() {
  $('#page-notSupported').css('display','none');    
  $('#page-scanning').css('display','none');
  $('#page-failToConnect').css('display','none');
  $('#page-fillBox').css('display','none');
  $('#page-setupGoal').css('display','none');
  $('#page-confirmGoal').css('display','none');
  $('#page-checkToJoin').css('display','none');
  $('#dashboard').css('display','none');
  $('#page-congrats').css('display','none');
  clearInterval(this.congratsAnimationId);
}


ViewController.prototype.getGoalStatus = function() {
  return this.goalStatus;
}

ViewController.prototype.setGoalStatus = function(goalStatus) {
  console.log('ViewController::setGoalStatus', goalStatus);
  this.goalStatus = goalStatus;
}

ViewController.prototype.getLockStatus = function() {
  return this.lockStatus;
}

ViewController.prototype.setGoalStatus = function(lockStatus) {
  this.lockStatus = lockStatus;
}

ViewController.prototype.getGoalSteps = function() {
  return this.goalSteps;
}

ViewController.prototype.setGoalSteps = function(steps) {
  this.goalSteps = steps;
}

ViewController.prototype.getGoalPeriod = function() {
  return this.goalPeriod;
}

ViewController.prototype.setGoalPeriod = function(period) {
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
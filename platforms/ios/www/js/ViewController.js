function strcmp(str1, str2) {
  return ((str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1));
}


function ViewController(app) {
  console.log('ViewController');
  this.app = app;
  this.goalStatus = false;
  this.goalString = '';
  this.goalSteps = '';
  this.goalPeriod = '';
  this.boxUUID = '';
  this.status = '';

  this.test = false;
  this.debug = true;
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

  this.clear();
  $('h2').html("Hold your phone</br>near the GGIT box</br>to connect");
//  $('h2').css('display','none');
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

  this.clear();  
  $('#page1').css('display','block');
}


/**
    when the box is connected -- connected
  */

ViewController.prototype.didConnect = function() {

  console.log("\n\nViewController::didConnect\n\n");
  
  // if(this.debug) {
  //   this.status = 'connected';
  //   document.getElementById('status').innerHTML = this.status;
  // }

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
  $('#page2').css('display','block');
  if(!$('#page2').hasClass('scanfailed'))
    $('#page2').toggleClass("scanfailed");

  if(this.test) {
    var that = this;
    setTimeout(function(){ that.setupBleAgain(); }, 7000);
  }
}


/**

  */

ViewController.prototype.hasGoal = function() {
  console.log("\n\nViewController::hasGoal " + this.goalStatus.toString() +"\n\n");
  if(!strcmp(this.goalStatus.toString(), 'true')) this.dashBoard();
  else this.fillBox();
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
    that.confirmGoal();
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
  $('#page5').css('display','block');
  $('h2').html("You set up a goal: </br>"+this.goalString+ ".</br></br> If you press 'confirm', </br>the box will be locked.");
  
  $('#goNext').click(function() {
    console.log('lock the box');
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

  */

ViewController.prototype.checkToJoin = function() {

  console.log('\n\nViewController::checkToJoin\n\n');

  this.clear();
  $('#page6').css('display','block');
  $('h2').html(" Successfully locked!</br>Now, you are the owner of the BOX! </br></br>Do you want to be a challenger to win the box too?</br>");
  
  var that = this;
  $('#join').click(function() {   
    //console.log("clicked");
    //Lock the box!!!!!!!!
    $('h2').html("Great! Go out to run! </br>You need "+that.goalString+" to win the box.");
    $('#lockillust').toggleClass('lockImage');
    $('#lockillust').toggleClass('runImage');
    $('.buttonPair').css('display','none');
    that.dashBoard();
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
  }
  this.app.getGoal();
  console.log('dashBoard end----');
}


/**
    Clear display
  */

ViewController.prototype.clear = function() {    
  $('#page1').css('display','none');
  $('#page2').css('display','none');
  $('#page3').css('display','none');
  $('#page4').css('display','none');
  $('#page5').css('display','none');
  $('#page6').css('display','none');
//  $('h2').css('display','block');
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


/**
    temporary function
  */

ViewController.prototype.setupBleAgain = function() {
  
  console.log("\n\nViewController::setupBleAgain\n\n");

  $('#page2').css('display','none');
  $('#page1').css('display','block');
  $('#page2').toggleClass("scanfailed");
  //console.log("setup Ble again!");
  var that = this;
  setTimeout(function(){ that.didConnect(); }, 5000);
}
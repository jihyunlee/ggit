
function ViewController() {
  this.goal = 'this is the goal';
  this.goalString = '';
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

  $('#page1').css('display','block');
}


/**
    when the box is connected -- connected
  */

ViewController.prototype.didConnect = function() {

  console.log("\n\nViewController::didConnect\n\n");

  if(this.debug) {
    this.status = 'connected';
    document.getElementById('status').innerHTML = this.status;
  }

  $('#page1').css('display','none');
  $('#page2').css('display','block');
  $('#page2').toggleClass("scansucceed");

  var that = this;
  setTimeout(function(){ that.hasGoal(); }, 2000);
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

  $('#page1').css('display','none');
  $('#page2').css('display','block');
  $('#page2').toggleClass("scanfailed");

  if(this.test) {
    var that = this;
    setTimeout(function(){ that.setupBleAgain(); }, 7000);
  }
}


/**

  */

ViewController.prototype.hasGoal = function() {

  console.log("\n\nViewController::hasGoal \n\n");

  if(this.goal == '') this.fillBox();
  else this.dashBoard();
}


/**
    if the goal hasn't been set up in the box,
    ask a user to put some treats in the box
  */

ViewController.prototype.fillBox = function() {

  console.log("\n\nViewController::fillBox\n\n");

  $('#page2').css('display','none');
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

  $('#page3').css('display','none');
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
  //console.log(steps + ","+ period);

  this.goalString = +steps+" steps for "+period+" days a week";
  console.log(this.goalString);

  var that = this;
  $('#page4').css('display','none');
  $('#page5').css('display','block');
  $('h2').html("You set up a goal: </br>"+this.goalString+ ".</br></br> If you press 'confirm', </br>the box will be locked.");

  $('#goNext').click(function() {
    console.log("clicked");
    //Lock the box!!!!!!!!
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

  $('#page5').css('display','none');
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
}



ViewController.prototype.getGoal = function() {
  return this.goal;
}

ViewController.prototype.setGoal = function(goal) {
  this.goal = goal;
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

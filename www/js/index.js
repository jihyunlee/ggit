var stepCounter;
var bleManager;
var view;
var locker;

var demo = true; // use Accelerometer

var app = {
  
  GGIT_BOX_NAME: 'GoGetIt',
  GGIT_SERVICE_UUID: '474f',
  GGIT_CHARACTERISTIC_GOAL_UUID: '4954',
  GGIT_CHARACTERISTIC_LOCK_STATUS_UUID: '4c6b',
  GGIT_CHARACTERISTIC_STEPS_UUID: '5374',
  GGIT_CHARACTERISTIC_PERIOD_UUID: '5072',

  isSuccess: false,
  dashBoardIntervalId: '',

  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    document.addEventListener("pause", this.onPause, false);
    document.addEventListener('resume', this.onResume, false);
  },
  onDeviceReady: function() {
    if(window.cordova.logger) window.cordova.logger.__onDeviceReady();

    console.log('GGIT::onDeviceReady');

    window.localStorage.removeItem('isM7Available');
    window.localStorage.removeItem('goalStatus');

    view = new ViewController(app);

    if(demo) {
      console.log('\n\n\nthis is demo mode\n\n\n');
      navigator.notification.alert('Shake your phone to win the treat! Go!', null, 'Go Get It!', 'Ok');
      app.watchAcceleration();
      view.setWeeklySteps([2415,2325,4605,6378,8706,2122]);
      app.initBluetooth();
    } else {
      stepCounter = new M7StepCounter();
      app.isM7Available = window.localStorage.getItem('isM7Available');
      if(app.isM7Available == undefined) {
        console.log('localStorage -- isM7Available not set up yet')
        var onAvailable = function(res) {
          console.log('GGIT::onAvailable', res);
          app.isM7Available = res;
          window.localStorage.setItem('isM7Available', res);
          app.onM7Available();
        };
        stepCounter.isAvailable(onAvailable, function(err){ console.log('isAvailable Failed'); });
      } else {
        console.log('localStorage -- isM7Available', app.isM7Available);
        app.onM7Available();        
      }
    }
  },
  onM7Available: function() {
    console.log('GGIT::onM7Available', app.isM7Available);
    if(app.isM7Available) {
      app.startStepCounter();
      app.initBluetooth();
    } else {
      navigator.notification.alert('Your device is not supported for tracking steps. Sorry!', null, 'Go Get It!', 'Ok');
      view.notSupportedDevice();
    }
  },
  initBluetooth: function() {
    console.log('GGIT::initBluetooth');
    bleManager = new BLEManager();
    locker = new Locker(bleManager);
    app.startScan();
  },
  onPause: function() {
    console.log('\n\n\nGGIT::onPause\n\n\n');
    app.isSuccess = false;
    bleManager.disconnect(function(){}, function(err){console.log('pause Failed');});
    // app.stopStepCounter();
  },
  onResume: function() {
    console.log('\n\n\nGGIT::onResume\n\n\n');
    // app.startStepCounter();
    clearInterval(app.dashBoardIntervalId);
    app.startScan();
  },
        
    
/**

    Bluetooth LE

  */

  startScan: function() {
    console.log('\n\nGGIT::startScan ----------\n\n');
    view.scan();

    var didDiscover = function(peripheral) {
      var name = '',
          uuid = '';
      if(peripheral.hasOwnProperty('localname')) name = peripheral.localname;
      if(peripheral.hasOwnProperty('uuid')) uuid = peripheral.uuid;

      console.log('GGIT::didDiscover -- ', name, uuid);
      if(uuid == '') {
        console.log('uuid not found');
      } else {
        if(name == app.GGIT_BOX_NAME) {
          console.log('\n\nGGIT Box Found!!\n\n');
          app.isSuccess = true;
          app.stopScan();
          app.connect(uuid);
        }        
      }
    };

    bleManager.startScan(didDiscover, function(err){console.log('startScan Failed');});
    setTimeout(app.scanTimeout, 4000);
  },
  stopScan: function() {
    console.log('GGIT::stopScan ----------\n\n');
    bleManager.stopScan(function(res){}, function(err){console.log('stopScan Failed');});
  },
  scanTimeout: function() {
    console.log('GGIT::scanTimeout --- ');
    if(app.isSuccess) {
      view.didConnect();
    } else {
      view.didFailToConnect();
      app.stopScan();
      setTimeout(app.startScan, 2000);
    }
  },
  connect: function(uuid) {
    console.log('GGIT::connect --- ');

    var didConnect = function(peripheral) {
      console.log('GGIT::didConnect --- ', peripheral.name, peripheral.uuid);
      if(peripheral.uuid == uuid) {
        console.log('\n\nbox is connected\n\n');
        app.discoverService();
      }
    };

    bleManager.connect(uuid, didConnect, function(err){console.log('connect Failed',uuid);});      
  },
  discoverService: function() {
    console.log('GGIT::discoverService');

    var didDiscoverService = function(res) {
      console.log('GGIT::didDiscoverService --- ');
      
      if (res.hasOwnProperty("data")) {
        if(!strcmp(res.data.toString(),'')) {
          console.log('goal is empty');
          view.goalStatus = false;
        }
        else {
          console.log('goal', res.data);
          view.goalStatus = true;
        }
        app.isSuccess = true;
        view.setGoalStatus(res.data.toString());
      } else {
        console.log('fail to read goal', res);
      }
    };
    bleManager.discoverServicesByUUID(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_GOAL_UUID, didDiscoverService, function(err){console.log('discoverServicesByUUID Failed');});
  },
  setupGoal: function(steps, period) {
    console.log('GGIT::setupGoal', steps, period);   
    app.goalSteps = steps;
    app.goalPeriod = period;
    
    var didWritePeriod = function(res) {
      console.log('GGIT::didWritePeriod', res);
    };

    var didWriteSteps = function(res) {
      console.log('GGIT::didWriteSteps', res);
      bleManager.writeValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_PERIOD_UUID, app.goalPeriod, didWritePeriod, function(err){console.log('writeValueForCharacteristic Failed');});
    };
    
    var didSetupGoals = function(res) {
      console.log('GGIT::didSetupGoals', res);
      bleManager.writeValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_STEPS_UUID, app.goalSteps, didWriteSteps, function(err){console.log('writeValueForCharacteristic Failed');});
    }; 

    var didLock = function(res) {
      console.log('GGIT::didLock', res);
      bleManager.writeValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_GOAL_UUID, 'true', didSetupGoals, function(err){console.log('writeValueForCharacteristic Failed');});
    };

    bleManager.writeValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_LOCK_STATUS_UUID, 'true', didLock, function(err){console.log('writeValueForCharacteristic Failed');});
  },
  fetch: function() {
    console.log('GGIT::fetch');

    var didDisconnect = function() {
      app.dashBoardIntervalId = setInterval(function(){view.dashBoard();},500);
      console.log('dashBoardIntervalId', app.dashBoardIntervalId);
      // app.getLockStatus();
    };

    var didGetGoal = function() {
      console.log('GGIT::didGetGoal');
      bleManager.disconnect(didDisconnect, function(err){console.log('pause Failed');});
    };
    var didGetWeeklySteps = function() {
      app.getGoal(didGetGoal);
    };
    if(app.isM7Available == true) {
      app.getWeeklySteps(didGetWeeklySteps);
    } else {
      didGetWeeklySteps();
    }
  },
  getGoal: function(callback) {
    console.log('GGIT::getGoal');

    var didReadPeriod = function(res) {
      console.log('GGIT::didReadPeriod');
      if (res.hasOwnProperty('data')) {
        console.log('period', res.data);
        app.goalPeriod = res.data;
        view.setGoalPeriod(res.data);
      }
      callback();
    };

    var didReadSteps = function(res) {
      console.log('GGIT::didReadSteps');
      if (res.hasOwnProperty('data')) {
        console.log('steps', res.data);
        app.goalSteps = res.data;
        view.setGoalSteps(res.data);
      }
      bleManager.readValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_PERIOD_UUID, didReadPeriod, function(err){console.log('readValueForCharacteristic Failed');});
    };

    bleManager.readValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_STEPS_UUID, didReadSteps, function(err){console.log('readValueForCharacteristic Failed');});
  },
  getLockStatus: function() {
    var that = this;
    var didGetLockStatus = function(res) {
      console.log('GGIT::didGetLockStatus');
      if (res.hasOwnProperty('data')) {
        console.log('lockstatus', res.data);
        view.setLockStatus(res.data);
      }
      that.getLockStatus();
    };

    bleManager.readValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_LOCK_STATUS_UUID, didReadSteps, function(err){console.log('readValueForCharacteristic Failed');});
  },
  setLockStatus: function(lock) {
    bleManager.writeValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_LOCK_STATUS_UUID, lock, function(){}, function(err){console.log('writeValueForCharacteristic Failed');});
  },


/**

    Step Counter

  */

  startStepCounter: function() {
    console.log('GGIT::startStepCounter');
    stepCounter.start(app.onStartStepCounter, function(err){console.log('startStepCounter Failed');});
  },
  onStartStepCounter: function() {
    console.log('GGIT::onStartStepCounter');
    app.getWeeklySteps(function(){});
  },
  stopStepCounter: function() {
    console.log('GGIT::stopStepCounter');
    stepCounter.stop(app.onStopStepCounter, function(err){console.log('stopStepCounter Failed');});
  },
  onStopStepCounter: function() {
    console.log('GGIT::onStopStepCounter');
  },
  getSteps: function() {
    // console.log('GGIT::getSteps');
    stepCounter.getSteps(0, app.gotSteps, function(err){console.log('getTodaySteps Failed');});
  },
  gotSteps: function(steps) {
    // console.log('GGIT::gotSteps', steps);
    view.setTodaySteps(steps);
  },
  getWeeklySteps: function(callback) {
    console.log('GGIT::getWeeklySteps');
        
    var weeklySteps = [];
    
    var getDaySix = function(steps) {
      weeklySteps.push(steps);
      console.log('weeklySteps',weeklySteps);
      view.setWeeklySteps(weeklySteps);
      setInterval(function(){app.getSteps();},500);
      callback();
    };
    var getDayFive = function(steps) {
      weeklySteps.push(steps);
      stepCounter.getSteps(6, function(steps){ getDaySix(steps) }, function(err){console.log('getDayFive Failed');});
    };
    var getDayFour = function(steps) {
      weeklySteps.push(steps);
      stepCounter.getSteps(5, function(steps){ getDayFive(steps) }, function(err){console.log('getDayFive Failed');});
    };
    var getDayThree = function(steps) {
      weeklySteps.push(steps);
      stepCounter.getSteps(4, function(steps){ getDayFour(steps) }, function(err){console.log('getDayFour Failed');});
    };
    var getDayTwo = function(steps) {
      weeklySteps.push(steps);
      stepCounter.getSteps(3, function(steps){ getDayThree(steps) }, function(err){console.log('getDayThree Failed');});
    };
    var getDayOne = function(steps) {
      weeklySteps.push(steps);
      stepCounter.getSteps(2, function(steps){ getDayTwo(steps) }, function(err){console.log('getDayTwo Failed');});
    };
    
    stepCounter.getSteps(1, function(steps) { getDayOne(steps) }, function(err){console.log('getDayOne Failed');});
  },


/**

    Locker

  */
  
  lock: function() {
    // if(app.isM7Available == true) {
    //   console.log('GGIT::lock');
    //   locker.lock();
    // }
  },
  unlock: function() {
    // if(app.isM7Available == true) {
    //   console.log('GGIT::unlock');
    //   locker.unlock();      
    // }
  },


/**

    Accelerometer (alternative way)

  */

  watchAcceleration: function() {

    console.log('GGIT::watchAcceleration');

    var prevX = undefined,
        prevY = undefined,
        prevZ = undefined;

    var randomMin = 10,
        randomMax = 100,
        threshold = 5;

    function success(acceleration) {
      if(prevX != undefined && prevY != undefined && prevZ != undefined) {
        if(Math.abs(acceleration.x-prevX) > threshold ||
           Math.abs(acceleration.y-prevY) > threshold || 
           Math.abs(acceleration.z-prevZ) > threshold) {
          prevX = acceleration.x;
          prevY = acceleration.y;
          prevZ = acceleration.z;
          view.setTodaySteps(view.getTodaySteps() + Math.floor(Math.random() * (randomMax - randomMin + 1)) + randomMin);

          if(parseInt(view.getTodaySteps()) >= parseInt(view.goalSteps)) {
            app.setLockStatus('false');
            clearInterval(app.dashBoardIntervalId);
            view.congrats();
          } else {
            view.dashBoard();
          }
        }
      }
      
      prevX = acceleration.x;
      prevY = acceleration.y;
      prevZ = acceleration.z;
    }

    navigator.accelerometer.watchAcceleration(success, function(err){console.log('watchAcceleration Failed');}, { frequency: 100 });
  }
};
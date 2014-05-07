/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var stepCounter;
var bleManager;
var view;
var locker;
var tScan, tConnect, tGoal;

var app = {
  
  GGIT_BOX_NAME: 'GoGetIt',//,'LightBlue'
  device_uuid: '',
  GGIT_SERVICE_UUID: '474f',
  GGIT_CHARACTERISTIC_GOAL_UUID: '4954',
  GGIT_CHARACTERISTIC_LOCK_STATUS_UUID: '4c6b',
  GGIT_CHARACTERISTIC_STEPS_UUID: '5374',
  GGIT_CHARACTERISTIC_PERIOD_UUID: '5072',

  isSuccess: false,

  //GGIT_BOX_UUID: 'CAA089E5-7152-14B3-8EF5-173CAB557676', // Liz's Biscuit
  //GGIT_SERVICE_UUID: '713D0000-503E-4C75-BA94-3148F18D941E', // Liz's Biscuit
  //GGIT_CHARACTERISTIC_GOAL: '713D0001-503E-4C75-BA94-3148F18D941E', // Liz's Biscuit

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

    stepCounter = new M7StepCounter();
    stepCounter.isAvailable(app.onAvailable, function(err){ console.log('isAvailable Failed'); });
    bleManager = new BLEManager();
    view = new ViewController(app);
    locker = new Locker(bleManager);

    console.log('plugins initialized');

    view.welcome('deviceready');
    app.startStepCounter();
    app.startScan();   
  },
  onAvailable: function(res) {
    console.log('app.onAvailable', res);
    if(!res) console.log('M7 not available');
  },
  onPause: function() {
    console.log('[index.js] onPause');
    app.isSuccess = false;
    bleManager.disconnect(function(){}, function(err){console.log('pause Failed');});
    app.stopStepCounter();
  },
  onResume: function() {
    console.log('\n\n\n[index.js] onResume\n\n');
    view.welcome('deviceready');
    app.startStepCounter();
    app.startScan();
  },
        
    
/**

    Bluetooth LE

  */

  startScan: function() {
    var d = new Date();
    tScan = d.getTime();
    console.log('[index.js] startScan --- ' + tScan);

    view.scan();
    bleManager.startScan(app.didDiscover, function(err){console.log('startScan Failed');});
    setTimeout(app.scanTimeout, 4000);
  },
  stopScan: function() {
    console.log('[index.js] stopScan');
    bleManager.stopScan(function(res){}, function(err){console.log('stopScan Failed');});
  },
  didDiscover: function(peripheral) {
    console.log('[index.js] didDiscover');
    var name;
    if(peripheral.hasOwnProperty('localname')) {
      name = peripheral.localname;
      console.log('localname',name);
    }
    if(peripheral.hasOwnProperty('uuid')) {
      app.device_uuid = peripheral.uuid;
      console.log('uuid',app.device_uuid);
    }

    if(name == app.GGIT_BOX_NAME) {
      console.log('\n\nggit box found\n\n');
      app.isSuccess = true;
      app.stopScan();
      bleManager.connect(app.device_uuid, app.didConnect, function(err){console.log('connect Failed',app.device_uuid);});      
    }
  },    
  scanTimeout: function() {
    var d = new Date();
    console.log('[index.js] scanTimeout --- ', d.getTime());
    
    if(app.isSuccess) {
      view.didConnect();
    } else {
      view.didFailToConnect();
      app.stopScan();
      setTimeout(app.startScan, 2000);
    }
  },
  didConnect: function(peripheral) {
    var d = new Date();
    tConnect = d.getTime();
    console.log('[index.js] didConnect --- ' + (tConnect-tScan), peripheral.name, peripheral.uuid);
    if(peripheral.uuid == app.device_uuid) {
      console.log('\n\nbox is connected\n\n');
      bleManager.discoverServicesByUUID(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_GOAL_UUID, app.didDiscoverService, function(err){console.log('discoverServicesByUUID Failed');});
    }
  },
  didDiscoverService: function(res) {
    var d = new Date();
    tGoal = d.getTime();
    console.log('[index.js] didDiscoverService --- ');
    
    if (res.hasOwnProperty("data")) {
      if(res.goal == '') console.log('goal is empty');
      else console.log('goal', res.data);

      app.isSuccess = true;
      view.setGoalStatus(res.data);
    } else {
      console.log('fail to read goal', res);
    }  
  },
  setupGoal: function(steps, period) {
    console.log('[index.js] setupGoal', steps, period);   
    app.goalSteps = steps;
    app.goalPeriod = period;
    
    var didWritePeriod = function(res) {
      console.log('[index.js] didWritePeriod', res);
    };

    var didWriteSteps = function(res) {
      console.log('[index.js] didWriteSteps', res);
      bleManager.writeValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_PERIOD_UUID, app.goalPeriod, didWritePeriod, function(err){console.log('writeValueForCharacteristic Failed');});
    };
    
    var didSetupGoals = function(res) {
      console.log('[index.js] didSetupGoals', res);
      bleManager.writeValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_STEPS_UUID, app.goalSteps, didWriteSteps, function(err){console.log('writeValueForCharacteristic Failed');});
    }; 

    bleManager.writeValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_GOAL_UUID, 'true', didSetupGoals, function(err){console.log('writeValueForCharacteristic Failed');});
  },
  fetch: function() {
    console.log('[index.js] fetch');
    var didGetGoal = function() {
      console.log('[index.js] didGetGoal');
      view.dashBoard();
    };
    var didGetWeeklySteps = function() {
      app.getGoal(didGetGoal);
    };
    app.getWeeklySteps(didGetWeeklySteps);
  },
  getGoal: function(callback) {
    console.log('[index.js] getGoal');

    var didReadPeriod = function(res) {
      console.log('[index.js] didReadPeriod');
      if (res.hasOwnProperty('data')) {
        console.log('period', res.data);
        app.goalPeriod = res.data;
        view.setGoalPeriod(res.data);
      }
      callback();
    };

    var didReadSteps = function(res) {
      console.log('[index.js] didReadSteps');
      if (res.hasOwnProperty('data')) {
        console.log('steps', res.data);
        app.goalSteps = res.data;
        view.setGoalSteps(res.data);
      }
      bleManager.readValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_PERIOD_UUID, didReadPeriod, function(err){console.log('readValueForCharacteristic Failed');});
    };

    bleManager.readValueForCharacteristic(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_STEPS_UUID, didReadSteps, function(err){console.log('readValueForCharacteristic Failed');});
  },


/**

    Step Counter

  */

  startStepCounter: function() {
    console.log('[index.js] startStepCounter');
    stepCounter.start(app.onStartStepCounter, function(err){console.log('startStepCounter Failed');});
  },
  onStartStepCounter: function() {
    console.log('[index.js] onStartStepCounter');
    app.getWeeklySteps(function(){});
  },
  stopStepCounter: function() {
    console.log('[index.js] stopStepCounter');
    stepCounter.stop(app.onStopStepCounter, function(err){console.log('stopStepCounter Failed');});
  },
  onStopStepCounter: function() {
    console.log('[index.js] onStopStepCounter');
  },
  getSteps: function() {
    // console.log('[index.js] getSteps');
    stepCounter.getSteps(0, app.gotSteps, function(err){console.log('getTodaySteps Failed');});
  },
  gotSteps: function(steps) {
    // console.log('[index.js] app.gotSteps', steps);
    view.setTodaySteps(steps);
  },
  getWeeklySteps: function(callback) {
    console.log('[index.js] getWeeklySteps');
        
    var weeklySteps = [];
    
    var getDaySix = function(steps) {
      weeklySteps.push(steps);
      console.log('weeklySteps',weeklySteps);
      view.setWeeklySteps(weeklySteps);
      setInterval(function(){app.getSteps();},1000);
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
    locker.lock();
  },
  unlock: function() {
    locker.unlock();
  }

};
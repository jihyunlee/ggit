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

var tScan, tConnect, tGoal;

var view;

var app = {

  GGIT_BOX_UUID: '6001DB1A-1B07-DA19-DC6C-108BAC1FB457',// Production7 // 'ECEB35D1-9CB0-2BEA-2FF9-9882958C7373', // Jess's BLE dongle
  GGIT_SERVICE_UUID: '474f',
  GGIT_CHARACTERISTIC_GOAL_UUID: '4954',

  isSuccess: false,

  //GGIT_BOX_UUID: 'CAA089E5-7152-14B3-8EF5-173CAB557676', // Liz's Biscuit
  //GGIT_SERVICE_UUID: '713D0000-503E-4C75-BA94-3148F18D941E', // Liz's Biscuit
  //GGIT_CHARACTERISTIC_GOAL: '713D0001-503E-4C75-BA94-3148F18D941E', // Liz's Biscuit

  initialize: function() {
     this.bindEvents();

     view = new ViewController();
    //  $('.app').css('display','none');
    //  view.displayDashboard();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onDeviceReady: function() {
    if(window.cordova.logger) window.cordova.logger.__onDeviceReady();

    app.sc = new M7StepCounter();
    app.bm = new BLEManager();

    console.log('\n\n--- plugins initialized ----\n\n');

    view.welcome('deviceready');
    app.list();
  },


/**
    Bluetooth LE

  */


  list: function() {
    var d = new Date();
    tScan = d.getTime();
    console.log('[index.js] list --- ' + tScan);

    view.scan();
    app.bm.list(app.didDiscover, function(err){console.log('list Failed');});
    setTimeout(app.scanTimeout, 4000);
  },
  scanTimeout: function() {
    var d = new Date();
    console.log('[index.js] scanTimeout --- ', d.getTime());

    if(app.isSuccess) {
      view.didConnect();
    } else {
      view.didFailToConnect();
      setTimeout(app.list, 2000);
    }
    app.isSuccess = !app.isSuccess;
  },
  didDiscover: function(devices) {
    console.log('[index.js] didDiscover', devices.length);

    devices.forEach(function(device) {
      var deviceId = undefined;
      if (device.hasOwnProperty("uuid")) {
        deviceId = device.uuid;
      }

      if(deviceId == app.GGIT_BOX_UUID) {
        console.log('\n\nggit box found\n\n');
        app.bm.connect(app.GGIT_BOX_UUID, app.didConnect, function(err){console.log('connect Failed',uuid);});
      }
    });
  },
  didConnect: function(res) {
    var d = new Date();
    tConnect = d.getTime();
    console.log('[index.js] didConnect --- ' + (tConnect-tScan), res.name, res.uuid);
    if(res.uuid == app.GGIT_BOX_UUID) {
        console.log('\n\nbox is connected\n\n');
        app.bm.discoverServicesByUUID(app.GGIT_SERVICE_UUID, app.GGIT_CHARACTERISTIC_GOAL_UUID, app.didDiscoverService, function(err){console.log('discoverServicesByUUID Failed');});
    }
  },
  didDiscoverService: function(res) {
    var d = new Date();
    tGoal = d.getTime();
    console.log('[index.js] didDiscoverService --- ' + (tGoal-tConnect));

    if (res.hasOwnProperty("goal")) {
      if(res.goal == '') console.log('goal is empty');
      else console.log('goal', res.goal);

      app.isSuccess = true;
      document.getElementById('status').innerHTML = "goal: "+res.goal;
      // view.didConnect();
      view.setGoal(res.goal);
    } else {
      console.log('fail to read goal', res);
    }
  }
//,
    //findPeripheralByUUID: function(uuid) {
    //    console.log('[index.js] findPeripheralByUUID', uuid);
    //    app.bm.findPeripheralByUUID(uuid, app.didFindPeripheralByUUID, function(err){console.log('findPeripheralByUUID Failed',uuid);});
    //},
    //didFindPeripheralByUUID: function(peripheral) {
    //    console.log('[index.js] didGetPeripheralByUUID', peripheral.uuid, peripheral.name);
    //
    //    // connect to the box
    //    app.bm.connect(peripheral.uuid, app.didConnect, function(err){console.log('connect Failed',uuid);});
    //}

};

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

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        
        if(window.cordova.logger) {
            window.cordova.logger.__onDeviceReady();
        }
        
        app.bm = new BLEManager();

        // start scanning immediately
        app.list();
    },
    list: function(event) {
        app.bm.list(app.onDeviceList, function(err){console.log('List Failed');});
    },  
    onDeviceList: function(devices) {
        console.log('onDeviceList');
        
        devices.forEach(function(device) {
                        
            var deviceId = undefined;
            var rssi = undefined;
            
            if (device.hasOwnProperty("uuid")) {
                deviceId = device.uuid;
            } else if (device.hasOwnProperty("address")) {
                deviceId = device.address;
            }
            if (device.hasOwnProperty("uuid")) {
                rssi = device.rssi;
            }
        });
        
        setTimeout(app.list, 100);
    }
};
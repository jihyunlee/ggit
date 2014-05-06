/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

// This is installed as a <js-module /> so it doesn't have a cordova.define wrapper

var exec = require('cordova/exec');

var BLEManager = function() {
	this.serviceName = "BLEManager";
};

BLEManager.prototype.startScan = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "startScan", []);
}

BLEManager.prototype.stopScan = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "stopScan", []);
}

BLEManager.prototype.connect = function(macAddress, successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "connect", [macAddress]);
}

BLEManager.prototype.connectInsecure = function(macAddress, successCallback, failureCallback)
{
	// Android only - see http://goo.gl/1mFjZY
	exec(successCallback, failureCallback, this.serviceName, "connectInsecure", [macAddress]);
}

BLEManager.prototype.disconnect = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "disconnect", []);
}

BLEManager.prototype.list = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "list", []);
}

BLEManager.prototype.findPeripheralByUUID = function(uuid, successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "findPeripheralByUUID", [uuid]);
}

BLEManager.prototype.discoverServicesByUUID = function(uuid, chUuid, successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "discoverServicesByUUID", [uuid,chUuid]);
}

BLEManager.prototype.isEnabled = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "isEnabled", []);
}

BLEManager.prototype.isConnected = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "isConnected", []);
}

BLEManager.prototype.available = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "available", []);
}

BLEManager.prototype.read = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "read", []);
}

BLEManager.prototype.readValueForCharacteristic = function(serviceUUID, characteristicUUID, successCallback, failureCallback) {
	exec(successCallback, failureCallback, this.serviceName, "readValueForCharacteristic", [serviceUUID, characteristicUUID]);	
}

BLEManager.prototype.readUntil = function(delimiter, successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "readUntil", [delimiter]);
}

BLEManager.prototype.write = function(data, successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "write", [data]);
}

BLEManager.prototype.writeValueForCharacteristic = function(serviceUUID, characteristicUUID, data, successCallback, failureCallback)
{
    exec(successCallback, failureCallback, this.serviceName, "writeValueForCharacteristic", [serviceUUID,characteristicUUID,data]);
}

BLEManager.prototype.subscribe = function(delimiter, successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "subscribe", [delimiter]);
}

BLEManager.prototype.unsubscribe = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "unsubscribe", []);
}

BLEManager.prototype.clear = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "clear", []);
}

BLEManager.prototype.readRSSI = function(successCallback, failureCallback)
{
	exec(successCallback, failureCallback, this.serviceName, "readRSSI", []);
}

module.exports = BLEManager;
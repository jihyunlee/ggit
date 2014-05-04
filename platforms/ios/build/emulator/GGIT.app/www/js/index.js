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
var dataModule = {
    "serialNum":"1234",
    "sender":"example@ggit.com",
    "recipient":"example@ggit.com",
    "goal":[
            {
            "dataType":"steps"
            },
            {
            "frequency-days":"7"
            },
            {
            "amount":10000
            }
            ],
    "isSucceed":false,
    "command":"lock"
}


var boxUUID;

var appUser;

var goal;
var goalString;

var app = {
    
//GGIT_BOX_UUID: '6001DB1A-1B07-DA19-DC6C-108BAC1FB457', // 'ECEB35D1-9CB0-2BEA-2FF9-9882958C7373', // Jess's BLE dongle
GGIT_BOX_UUID: '00415CB5-D8FE-A85A-C9BB-603F9FF97D7D',
GGIT_SERVICE_UUID: 'ffd4', //'474f',
GGIT_CHARACTERISTIC_GOAL: '4954',
initialize: function() {
//    this.bindEvents();
    $('.app').css('display','none');
    app.fillBox();

},
bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
},
onDeviceReady: function() {
    if(window.cordova.logger) {
        window.cordova.logger.__onDeviceReady();
    }
    app.sc = new M7StepCounter();
    app.bm = new BLEManager();
    
    console.log('[index.js] plugins initialized');
    
    // find the box
//    app.list();

    
    app.welcome('deviceready');
},
    
    
    /*
     
        User Interface
     
     */
    
    
    // Update DOM on a Received Event
    //**********p1: Welcome screen**********//
welcome: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');
    
    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');
    $('.app').css('display','none');
    
    
    console.log('Received Event: ' + id);
    app.bleSetup();
    
},
    
    //**********p2: GGIT Connection / Box connection status here Change Page! **********//
bleSetup: function(){
    
    $('#page1').css('display','block');
    
    // scan BLE devices & get connection
    
    // bLEcallback(param,function(err){
    //   if(err){
    //
    //   }else{
    //     app.selectOne();
    //   }
    // });
    setTimeout(failedConnecetion, 7000); ////temporary function for next page
    
    // display BLE connection results in html
    function displayConnection(){
        $('#page1').css('display','none');
        $('#page2').css('display','block');
        $('#page2').toggleClass("scansucceed");
        
        //setTimeout(app.selectOne, 1000); ////temporary function for next page
        if(goal != null) setTimeout(app.goalCheck, 2000);
        else setTimeout(app.fillBox, 2000);
    }
    
    function failedConnecetion(){
        $('#page1').css('display','none');
        $('#page2').css('display','block');
        $('#page2').toggleClass("scanfailed");
        setTimeout(setupBleAgain, 7000); ////temporary function for next page
        
    }
    
    //temporary
    function setupBleAgain(){
        $('#page2').css('display','none');
        $('#page1').css('display','block');
        $('#page2').toggleClass("scanfailed");
        //console.log("setup Ble again!");
        setTimeout(displayConnection, 5000); ////temporary function for next page
    }
},
    
    //if box has no goal, ask a user to set up one----------//
fillBox: function(){
    
    //console.log("A goal needs to be set up");
    $('#page2').css('display','none');
    $('#page3').css('display','block');
    
    function animation(){
        $('#boxAnimation').toggleClass('changeImage');
        $('#boxAnimation').toggleClass('originalImage');
    }
    
    setInterval(animation, 1000);
    $('#fillboxsubmit').click(function() {
                              //console.log("clicked");
                              clearInterval(animation);
                              app.goalSetup();
                              
                              });
},
goalSetup: function(){
    
    $('#page3').css('display','none');
    $('#page4').css('display','block');
    
    $('#goalsubmit').click(function() {
                           //console.log("clicked");
                           goalConfirm();
                           
                           });
    
    function goalConfirm(){
        var steps = $('#form-steps').val();
        var period = $('#form-freq').val();
        //console.log(steps + ","+ period);
        
        goalString = +steps+" steps for "+period+" days a week";
        console.log(goalString);
        
        $('#page4').css('display','none');
        $('#page5').css('display','block');
        $('h2').html("You set up a goal: </br>"+goalString+ ".</br></br> If you press 'confirm', </br>the box will be locked.");
        
        $('#goNext').click(function() {
                           
                           console.log("clicked");
                           //Lock the box!!!!!!!!
                           app.checkToJoin();
                           
                           });
        
        $('#resetGoal').click(function() {
                              
                              $('#page4').css('display','block');
                              $('#page5').css('display','none');
                              $('h2').html("What's your goal?");
                              });
    }
    
    
},
    
checkToJoin: function(){
    $('#page5').css('display','none');
    $('#page6').css('display','block');
    $('h2').html(" Successfully locked!</br>Now, you are the owner of the BOX! </br></br>Do you want to be a challenger to win the box too?</br>");
    
    $('#join').click(function() {
                     
                     //console.log("clicked");
                     //Lock the box!!!!!!!!
                     $('h2').html("Great! Go out to run! </br>You need "+goalString+" to win the box.");
                     $('#lockillust').toggleClass('lockImage');
                     $('#lockillust').toggleClass('runImage');
                     $('.buttonPair').css('display','none');
                     
                     setTimeout(app.getM7data,3000);
                     
                     });
    
    $('#notJoin').click(function() {
                        
                        $('#lockillust').toggleClass('lockImage');
                        $('#lockillust').toggleClass('sendImage');
                        
                        $('.buttonPair').css('display','none');
                        $('h2').html("Send this box </br>to your friends </br>and motivate them!");
                        });
    
    
    
},
    //if box has a goal, get goal data and display them-----//
goalCheck: function(){
    
    //console.log("A goal is already set up");
    
    
    
},
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    //**********p3: choose status-Sender or Recipient **********//
selectOne: function(){
    console.log('selectOne');
    
    //button display in html
    $('#page2').css('display','none');
    $('#page3').css('display','block');
    
    //if a user chooses 'sender,'
    $('#page3').on('click', '#sender', app.senderConfig);
    //if a user chooses 'recipient,'
    $('#page3').on('click', '#recipient', app.recipientConfig);
},
    
    //**********p4-1: sender configuration- Set up your GGIT box **********//
senderConfig: function() {
    
    var client = new Apigee.Client({
                                   orgName: 'JessJJ', // Your Apigee.com username for App Services
                                   appName: 'sandbox' // Your Apigee App Services app name
                                   });
    
    console.log('Apigee client connected');
    
    var boxes = new Apigee.Collection({
                                      'client': client,
                                      'type': 'devices'
                                      });
    
    //console.log('senderConfig');
    $('#page3').css('display','none');
    $('#page4').css('display','block');
    
    client.getLoggedInUser(function(err, data, user) {
                           if (err) {
                           //error - could not get logged in user
                           window.location = "#";
                           } else {
                           if (client.isLoggedIn()) {
                           appUser = user;
                           //loadItems(myList);
                           console.log(user);
                           }
                           }
                           });
    
    function login(username, password) {
        
        if (username && password) {
            var username = username;
            var password = password;
        } else {
            // var username = $("#form-username").val();
            // var password = $("#form-password").val();
            console.log("no username && password");
        }
        
        client.login(username, password,
                     function(err) {
                     if (err) {
                     console.log(err)
                     } else {
                     //login succeeded
                     client.getLoggedInUser(function(err, data, user) {
                                            if (err) {
                                            //error - could not get logged in user
                                            } else {
                                            if (client.isLoggedIn()) {
                                            appUser = user;
                                            console.log("you're logged in!");
                                            }
                                            }
                                            });
                     }
                     }
                     );
    }
    
    $('#form-sender-config').on('click', '#btn-submit', function() {
                                console.log("sending addBoxRequest..");
                                if ($('#form-serial').val() !== '') {
                                var newBox = {
                                'serialNum': $('#form-serial').val(),
                                'sender': $('#form-sender-email').val(),
                                'recipient': $('#form-recipient-email').val(),
                                }
                                var account = $('#form-sender-email').val();
                                var password = $('#form-serial').val();
                                var role = "sender";
                                
                                boxes.addEntity(newBox, function(error, response) {
                                                if (error) {
                                                alert("write failed");
                                                } else {
                                                alert("You create a new box!");
                                                
                                                boxUUID = response._data.uuid;
                                                /*
                                                 var options = {
                                                 "type": "devices",
                                                 "uuid": response._data.uuid
                                                 }
                                                 client.getEntity(options, function(error, response) {
                                                 if (error) {
                                                 alert("error!");
                                                 } else {
                                                 console.log(options.uuid);
                                                 }
                                                 });
                                                 */
                                                app.senderInit();
                                                }
                                                });
                                
                                // client.signup(account,password,role, function(err, data) {
                                //   if (err) {
                                //       console.log('FAIL')
                                //   } else {
                                //       console.log('SUCCESS');
                                //       login(account, password);
                                //   }
                                // });
                                }
                                $("#form-sender-email").val('');
                                $("#form-recipient-email").val('');
                                $("#form-serial").val('');
                                
                                });
    
    
},
    
    //**********p4-2: welcome sender **********//
senderInit: function() {
    
    //button display in html
    $('#page4').css('display','none');
    $('#page5').css('display','block');
    
    $('#page5').on('click', '#next', function() {
                   
                   app.setGoal();
                   
                   });
},
    
    //**********p4-3: set up a goal for the recipient **********//
setGoal: function() {
    
    var client = new Apigee.Client({
                                   orgName: 'JessJJ', // Your Apigee.com username for App Services
                                   appName: 'sandbox' // Your Apigee App Services app name
                                   });
    
    console.log('Apigee client connected');
    
    var boxes = new Apigee.Collection({
                                      'client': client,
                                      'type': 'devices'
                                      });
    
    //button display in html
    $('#page5').css('display','none');
    $('#page6').css('display','block');
    
    $('#form-set-goal').on('click', '#btn-submit', function() {
                           console.log("sending goalSetupRequest..");
                           if ($('#form-steps').val() !== '' && $('#form-freq').val() !== '') {
                           
                           var amount = $('#form-steps').val();
                           var frequency = $('#form-freq').val();
                           
                           var options = {
                           "type": "devices",
                           "uuid": boxUUID
                           }
                           client.getEntity(options, function(error, response) {
                                            if (error) {
                                            alert("error!");
                                            } else {
                                            //console.log("Success to retrieve entity!");
                                            var properties = {
                                            'client':client, //Required
                                            'data':{'type':'devices',
                                            'uuid':boxUUID, //UUID of the entity to be updated is required
                                            'goal':{
                                            'frequency':frequency,
                                            'amount':amount,
                                            'dataType':'steps'
                                            }
                                            }
                                            };
                                            
                                            //Create a new entity object that contains the updated properties
                                            var entity = new Apigee.Entity(properties);
                                            
                                            //Call Entity.save() to initiate the API PUT request
                                            entity.save(function (error, result) {
                                                        
                                                        if (error) {
                                                        //error
                                                        alert("error!");
                                                        } else {
                                                        //success
                                                        alert("You set up a new goal!");
                                                        app.confirmGoal();
                                                        }
                                                        
                                                        });
                                            }
                                            });
                           }
                           });
},
confirmGoal: function() {
    
    var dataclient = new Apigee.Client({
                                       orgName: 'JessJJ', // Your Apigee.com username for App Services
                                       appName: 'sandbox' // Your Apigee App Services app name
                                       });
    
    console.log('Apigee client connected');
    
    var box = new Apigee.Collection({
                                    'client': dataclient,
                                    'type': 'devices',
                                    });
    
    
    function loadItems(collection) {
        collection.fetch(
                         function(err, data) { // Success
                         if (err) {
                         alert("Read failed - loading offline data");
                         collection = client.restoreCollection(localStorage.getItem(collection));
                         collection.resetEntityPointer();
                         displayData(collection);
                         } else {
                         displayData(collection);
                         localStorage.setItem(collection, collection.serialize());
                         }
                         }
                         );
    }
    
    function displayData(collection) {
        
        $('h1').html("");
        $('form').html("");
        while (collection.hasNextEntity()) {
            var item = collection.getNextEntity();
            var goalobj = item.get('goal');
            var goalStatement = goalobj.amount;
            goalStatement += " ";
            goalStatement += goalobj.dataType;
            goalStatement += " for ";
            goalStatement += goalobj.frequency;
            goalStatement += "days";
            
            $('h1').html(goalStatement);
            // console.log(goalobj.amount);
            // console.log(item.get('goal'));
        }
        
    }
    loadItems(box);
},
    
    
/*
 
 Bluetooth LE
 
 */
    
    
    
list: function() {
    console.log('[index.js] list');
    app.bm.list(app.onDeviceList, function(err){console.log('list Failed');});
},
onDeviceList: function(devices) {
    console.log('[index.js] ondeviceList', devices.length);
    var boxFound = false;
    devices.forEach(function(device) {
                    var deviceId = undefined;
                    
                    if (device.hasOwnProperty("uuid")) {
                    deviceId = device.uuid;
                    } else if (device.hasOwnProperty("address")) {
                    deviceId = device.address;
                    }
                    
                    if(deviceId == app.GGIT_BOX_UUID) {
                    console.log('\n\nggit box found\n\n');
                    boxFound = true;
                    app.bm.connect(app.GGIT_BOX_UUID, app.didConnect, function(err){console.log('connect Failed',uuid);});
                    //            break;
                    }
                    });
    
    if(!boxFound)
        app.list();
},
didConnect: function(res) {
    console.log('[index.js] didConnect', res.name, res.address);
    if(res.address == app.GGIT_BOX_UUID) {
        console.log('\n\nbox is connected\n\n');
        app.bm.discoverServicesByUUID(app.GGIT_SERVICE_UUID, app.didDiscoverService, function(err){console.log('discoverServicesByUUID Failed');});
    }
},
didDiscoverService: function(res) {
    console.log('[index.js] didDiscoverService');
} //,
    //
    //
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
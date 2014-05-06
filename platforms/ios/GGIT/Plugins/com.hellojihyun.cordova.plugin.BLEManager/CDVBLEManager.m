//
//  CDVBLEManager.m
//  Bluetooth Low Energy Cordova Plugin
//
//  Created by jihyun on 3/19/14.
//
//

#import "CDVBLEManager.h"
#import "BLEDefines.h"

@interface CDVBLEManager()
- (NSString *)readUntilDelimiter:(NSString *)delimiter;
- (NSMutableArray *)getPeripheralList;
- (void)sendDataToSubscriber;
//- (void)connectToUUID:(NSString *)uuid;
- (void)listPeripheralsTimer:(NSTimer *)timer;
- (void)getPeripheralByUUIDTimer:(NSTimer *)timer;
@end

@implementation CDVBLEManager

@synthesize delegate;
@synthesize CM;
@synthesize PM;

static bool isConnected = false;


- (void)pluginInitialize {

    NSLog(@"------------------------------");
    NSLog(@"Bluetooth LE Cordova Plugin");
    NSLog(@"(c)2014 Jihyun Lee");
    NSLog(@"------------------------------");

    [super pluginInitialize];
    
    self.CM = [[BLECentral alloc] init];
    self.CM.delegate = self;
    
    self.PM = [[BLEPeripheral alloc] init];
    self.PM.delegate = self;
    
    [self.CM initCentral];
    [self.PM initPeripheral];
    
    _buffer = [[NSMutableString alloc] init];

    NSLog(@"-- end of pluginInitialize --");
}

#pragma mark - Cordova Plugin Methods

- (void)startScan:(CDVInvokedUrlCommand*)command {
    
    NSLog(@"CDVBLEManager::startScan");
    
    _scanCallbackId = [command.callbackId copy];

    [CM startScan];
    
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:TRUE];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)stopScan:(CDVInvokedUrlCommand*)command {
    
    NSLog(@"CDVBLEManager::stopScan");
    
    _scanCallbackId = nil;
    
    [CM stopScan];

    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)connect:(CDVInvokedUrlCommand *)command {
    
    NSString *uuid = [command.arguments objectAtIndex:0];
    NSLog(@"CDVBLEManager::connect -- %@", uuid);
    
    _connectCallbackId = [command.callbackId copy];
    
    // if the uuid is null or blank, scan and
    // connect to the first available device
    
    if (uuid == (NSString*)[NSNull null]) {
        //            [self connectToFirstDevice];
    } else if ([uuid isEqualToString:@""]) {
        //            [self connectToFirstDevice];
    } else {
        CBPeripheral *peripheral = [CM getPeripheralByUUID:uuid];
        if (peripheral) [CM connect:peripheral];
        else {
            _connectCallbackId = nil;
            CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"uuid not found"];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }
    }
}

- (void)disconnect:(CDVInvokedUrlCommand*)command {
    
    NSLog(@"CDVBLEManager::disconnect");
    
    _connectCallbackId = [command.callbackId copy];
    
    [self.CM disconnect];
}







- (void)cleanup:(CDVInvokedUrlCommand *)command {
    
}



- (void)discoverServicesByUUID:(CDVInvokedUrlCommand*)command {
    
    NSString *uuid = [command.arguments objectAtIndex:0];
    NSString *chUUID = [command.arguments objectAtIndex:1];
    
    NSLog(@"CDVBLEManager::discoverServicesByUUID -- %@", uuid);

    _readCallbackId = [command.callbackId copy];
    
    [self.CM doDiscoverServiceByUUID:uuid chUUID:chUUID];
}

- (void)writeValueForCharacteristic:(CDVInvokedUrlCommand*)command {

    NSString *uuid = [command.arguments objectAtIndex:0];
    NSString *chUUID = [command.arguments objectAtIndex:1];
    NSString *value = [command.arguments objectAtIndex:2];
    
    NSLog(@"CDVBLEManager::writeValueForCharacteristic -- service(%@) characteristic(%@) -- %@", uuid, chUUID, value);

    _writeCallbackId = [command.callbackId copy];
    
    NSData* data = [value dataUsingEncoding:NSUTF8StringEncoding];
    
    [self.CM doWriteValueForCharacteristic:uuid characteristicUUID:chUUID data:data];
}

- (void)readValueForCharacteristic:(CDVInvokedUrlCommand*)command {
    
    NSString *uuid = [command.arguments objectAtIndex:0];
    NSString *chUUID = [command.arguments objectAtIndex:1];
    
    NSLog(@"CDVBLEManager::readValueForCharacteristic -- service(%@) characteristic(%@)", uuid, chUUID);
    
    _readCallbackId = [command.callbackId copy];
    
    [self.CM doReadValueForCharacteristic:uuid characteristicUUID:chUUID];
}







- (void)list:(CDVInvokedUrlCommand*)command {
    
    NSLog(@"CDVBLEManager::list");
    
    CDVPluginResult *pluginResult = nil;
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:TRUE];
    
    [self scan:1.5];
    
    [NSTimer scheduledTimerWithTimeInterval:(float)1.5
                                     target:self
                                   selector:@selector(listPeripheralsTimer:)
                                   userInfo:[command.callbackId copy]
                                    repeats:NO];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}




- (void)subscribe:(CDVInvokedUrlCommand*)command {
    NSLog(@"subscribe");
    
    CDVPluginResult *pluginResult = nil;
    NSString *delimiter = [command.arguments objectAtIndex:0];
    
    if (delimiter != nil) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
        [pluginResult setKeepCallbackAsBool:TRUE];
        _subscribeCallbackId = [command.callbackId copy];
        _delimiter = [delimiter copy];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"delimiter was null"];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)write:(CDVInvokedUrlCommand*)command {
    NSLog(@"write");
    
    CDVPluginResult *pluginResult = nil;
    NSString *message = [command.arguments objectAtIndex:0];

    if (message != nil) {
        
        // todo: implement write API
//        NSData *d = [message dataUsingEncoding:NSUTF8StringEncoding];
//        [_bleShield write:d];
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"message was null"];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}



- (void)findPeripheralByUUID:(CDVInvokedUrlCommand*)command {
    NSLog(@"CDVBLEManager -- findPeripheralByUUID");

    CDVPluginResult *pluginResult = nil;
    NSString* uuid = [command.arguments objectAtIndex:0];

    if (uuid == (NSString*)[NSNull null] || [uuid isEqualToString:@""]) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"uuid is null"];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
        [pluginResult setKeepCallbackAsBool:TRUE];

        [self scan:1.5];
        
        NSDictionary *wrapper = [NSDictionary dictionaryWithObjectsAndKeys:command.callbackId, @"commandId", uuid, @"UUID", nil];
        
        [NSTimer scheduledTimerWithTimeInterval:(float)1.5
                                         target:self
                                       selector:@selector(getPeripheralByUUIDTimer:)
                                       userInfo:wrapper
                                        repeats:NO];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)isEnabled:(CDVInvokedUrlCommand*)command {
    NSLog(@"isEnabled");
    
    // short delay so CBCentralManger can spin up bluetooth
    [NSTimer scheduledTimerWithTimeInterval:(float)0.2
                                     target:self
                                   selector:@selector(bluetoothStateTimer:)
                                   userInfo:[command.callbackId copy]
                                    repeats:NO];
    
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:TRUE];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)isConnected:(CDVInvokedUrlCommand*)command {
    NSLog(@"isConnected");
    
    CDVPluginResult *pluginResult = nil;
    
    if (isConnected) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Not connected"];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)available:(CDVInvokedUrlCommand*)command {
    NSLog(@"available");
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:[_buffer length]];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)read:(CDVInvokedUrlCommand*)command {
    NSLog(@"read");
    CDVPluginResult *pluginResult = nil;
    NSString *message = @"";
    
    if ([_buffer length] > 0) {
        int end = [_buffer length] - 1;
        message = [_buffer substringToIndex:end];
        NSRange entireString = NSMakeRange(0, end);
        [_buffer deleteCharactersInRange:entireString];
    }
    
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)readUntil:(CDVInvokedUrlCommand*)command {
    NSLog(@"readUntil");
    NSString *delimiter = [command.arguments objectAtIndex:0];
    NSString *message = [self readUntilDelimiter:delimiter];
    CDVPluginResult *pluginResult = nil;

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:message];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)clear:(CDVInvokedUrlCommand*)command {
    NSLog(@"clear");
    int end = [_buffer length] - 1;
    NSRange truncate = NSMakeRange(0, end);
    [_buffer deleteCharactersInRange:truncate];
}

- (void)readRSSI:(CDVInvokedUrlCommand*)command {
    NSLog(@"readRSSI");
    
    // TODO if callback exists...
    [CM readActiveRSSI];
    
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [pluginResult setKeepCallbackAsBool:TRUE];
    _rssiCallbackId = [command.callbackId copy];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)writePeripheralName {
    
//    [PM startAdvertising:"hello" : "jihyun" ];
}

- (void)writePeripheralName:(CBPeripheral *)peripheral name:(NSString *)serviceName key:(NSString *)characteristicKey value:(NSData *)characteristicValue {
    
    if(!peripheral) {
        return;
    }
    
    CBService * service = [CM doDiscoverServices:peripheral UUID:serviceName];
    if(service) { // existing
        
        CBCharacteristic * characteristic = [CM doDiscoverCharacteristic:service UUID:serviceName];
        if(characteristic) {
            [peripheral writeValue:characteristicValue forCharacteristic:characteristic type:CBCharacteristicWriteWithoutResponse];
        } else {
            // todo: check if need to create new char
            [peripheral writeValue:characteristicValue forCharacteristic:characteristic type:CBCharacteristicWriteWithoutResponse];
        }
        
    } else { // add service
        NSString *strValue = [[NSString alloc] initWithData:characteristicValue encoding:NSUTF8StringEncoding];
        [PM doAddService:serviceName key:characteristicKey value:strValue];
    }
}



#pragma mark - BLEDelegate 

- (void)didDiscoverPeripheral:(NSDictionary *)dic {
    
    NSLog(@"BLEDelegate::didDiscoverPeripheral");
    
    if(_scanCallbackId) {
        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dic];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_scanCallbackId];
    } else {
        NSLog(@"_scanCallbackId not found");
    }
}

- (void)didConnect:(NSDictionary *)dic {

    NSLog(@"BLEDelegate::didConnect");
    
    if (_connectCallbackId) {
        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dic];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_connectCallbackId];
    } else {
        NSLog(@"_connectCallbackId not found");
    }
}

- (void)didDisconnect {
    
    NSLog(@"BLEDelegate::didDisconnect");
    
    if(_connectCallbackId) {
        CDVPluginResult *pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_connectCallbackId];
        
        _connectCallbackId = nil;
    } else {
        NSLog(@"_connectCallbackId not found");
    }
}

- (void)bleDidDiscoverServices {
    
    NSLog(@"BLEDelegate::bleDidDiscoverServices");
    
    if (_serviceCallbackId) {
        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_serviceCallbackId];
    } else {
        NSLog(@"_serviceCallbackId not found");
    }
}

-(void) bleDidDiscoverCharacteristic:(NSDictionary *)dic {
    
    NSLog(@"bleDidDiscoverCharacteristic");
    
    if (_serviceCallbackId) {
        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dic];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_serviceCallbackId];
    } else {
        NSLog(@"_serviceCallbackId not found");
    }
}

-(void) bleDidReadValueForCharacteristic:(NSDictionary *)dic {

    NSLog(@"bleDidReadValueForCharacteristic");
    CDVPluginResult *pluginResult = nil;
    
    if (_readCallbackId) {
        NSString *data = [dic objectForKey:@"data"];
        NSLog(@"data -- %@", data);
        
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:dic];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_readCallbackId];
    } else {
        NSLog(@"_readCallbackId not found");
    }
}

-(void) bleDidWriteValueForCharacteristic {
    NSLog(@"bleDidWriteValueForCharacteristic");
    CDVPluginResult *pluginResult = nil;
    
    if (_writeCallbackId) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_writeCallbackId];
    } else {
        NSLog(@"_writeCallbackId not found");
    }
}








- (void)bleDidReceiveData:(unsigned char *)data length:(int)length {
    NSLog(@"bleDidReceiveData");
    
    // Append to the buffer
    NSData *d = [NSData dataWithBytes:data length:length];
    NSString *s = [[NSString alloc] initWithData:d encoding:NSUTF8StringEncoding];
    NSLog(@"Received %@", s);

    if (s) {
        [_buffer appendString:s];

        if (_subscribeCallbackId) {
            [self sendDataToSubscriber];
        }
    } else {
        NSLog(@"Error converting received data into a String.");
    }
}

- (void)bleDidUpdateRSSI:(NSNumber *)rssi {
    NSLog(@"bleDidUpdateRSSI");
    if (_rssiCallbackId) {
        CDVPluginResult *pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble:[rssi doubleValue]];
        [pluginResult setKeepCallbackAsBool:TRUE]; // TODO let expire, unless watching RSSI        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_rssiCallbackId];
    }
}




#pragma mark - timers

-(void)listPeripheralsTimer:(NSTimer *)timer {
    NSLog(@"listPeripheralsTimer");
    NSString *callbackId = [timer userInfo];
    NSMutableArray *peripherals = [self getPeripheralList];
    
    CDVPluginResult *pluginResult = nil;
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: peripherals];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

-(void)getPeripheralByUUIDTimer:(NSTimer *)timer {
    
    NSLog(@"getPeripheralByUUIDTimer");
    
    NSDictionary *wrapper = (NSDictionary *)[timer userInfo];
    NSString *callbackId = [wrapper objectForKey:@"commandId"];
    NSString *uuid = [wrapper objectForKey:@"UUID"];
    CBPeripheral *peripheral = [CM getPeripheralByUUID:uuid];

    CDVPluginResult *pluginResult = nil;
    
    if (peripheral) {
        NSDictionary* obj = [NSDictionary dictionaryWithObjectsAndKeys:peripheral.identifier.UUIDString, @"uuid", peripheral.name, @"name", nil];
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:obj];
    } else {
        NSString *error = [NSString stringWithFormat:@"Could not find peripheral %@.", uuid];
        NSLog(@"%@", error);
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

- (void)bluetoothStateTimer:(NSTimer *)timer {
    NSLog(@"bluetoothStateTimer");
    NSString *callbackId = [timer userInfo];
    CDVPluginResult *pluginResult = nil;
    
    if ([CM isReady]) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:[CM getState]];
    }
    [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}

#pragma mark - internal implemetation

- (NSString*)readUntilDelimiter: (NSString*) delimiter {
    NSLog(@"readUntilDelimiter");
    
    NSRange range = [_buffer rangeOfString: delimiter];    
    NSString *message = @"";
    
    if (range.location != NSNotFound) {

        int end = range.location + range.length;
        message = [_buffer substringToIndex:end];
        
        NSRange truncate = NSMakeRange(0, end);
        [_buffer deleteCharactersInRange:truncate];
    }
    return message;
}

- (NSMutableArray*) getPeripheralList {
    NSLog(@"getPeripheralList");
    NSMutableArray *peripherals = [NSMutableArray array];
    
    for (int i = 0; i < CM.peripherals.count; i++) {
        NSMutableDictionary *peripheral = [NSMutableDictionary dictionary];
        CBPeripheral *p = [CM.peripherals objectAtIndex:i];
        
        if (p.UUID != NULL) {
            // Seriously WTF?
            CFStringRef s = CFUUIDCreateString(NULL, p.UUID);
            NSString *uuid = [NSString stringWithCString:CFStringGetCStringPtr(s, 0)
                                                encoding:(NSStringEncoding)NSUTF8StringEncoding];
            [peripheral setObject: uuid forKey: @"uuid"];
        }
        else {
            [peripheral setObject: @"" forKey: @"uuid"];
        }
        
        NSString *name = [p name];
        if (!name) {
            name = [peripheral objectForKey:@"uuid"];
        }
        [peripheral setObject: name forKey: @"name"];
        
        NSNumber *rssi = [p advertisementRSSI];
        if (rssi) { // BLEShield doesn't provide advertised RSSI
            [peripheral setObject: rssi forKey:@"rssi"];
        }
        
        [peripherals addObject:peripheral];
    }
    
    return peripherals;
}

// calls the JavaScript subscriber with data if we hit the _delimiter
- (void) sendDataToSubscriber {
    NSLog(@"sendDataToSubscriber");
    NSString *message = [self readUntilDelimiter:_delimiter];

    if ([message length] > 0) {
        CDVPluginResult *pluginResult = nil;
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: message];
        [pluginResult setKeepCallbackAsBool:TRUE];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:_subscribeCallbackId];
        
        [self sendDataToSubscriber];
    }
    
}


//- (void)connectToFirstDevice {
//    NSLog(@"connectToFirstDevice");
//    [self scan:3];
//    
//    [NSTimer scheduledTimerWithTimeInterval:(float)3.0
//                                     target:self
//                                   selector:@selector(connectFirstDeviceTimer:)
//                                   userInfo:nil
//                                    repeats:NO];    
//}


//- (void)connectToUUID:(NSString *)uuid {
//    NSLog(@"connectToUUID");
//    int interval = 0;
//    
//    if (CM.peripherals.count < 1) {
//        interval = 3;
//        [self scan:interval];
//    }
//    
//    [NSTimer scheduledTimerWithTimeInterval:interval
//                                     target:self
//                                   selector:@selector(connectUuidTimer:)
//                                   userInfo:uuid
//                                    repeats:NO];
//}


- (int) scan:(int) timeout {
    
    if (![self.CM isReady]) {
        return -1;
    }
    
    [NSTimer scheduledTimerWithTimeInterval:(float)timeout target:self selector:@selector(scanTimer:) userInfo:nil repeats:NO];
    
    [self.CM startScan];
    
    return 0;
}


- (void) scanTimer:(NSTimer *)timer {
    
    [self.CM stopScan];
    
    [self printKnownPeripherals];
}

- (void) printKnownPeripherals {
    
    NSLog(@"Known peripherals : %lu", (unsigned long)[self.CM.peripherals count]);
    
    for (int i = 0; i < self.CM.peripherals.count; i++) {
        CBPeripheral *p = [self.CM.peripherals objectAtIndex:i];
        NSLog(@"peripheral : %@", p);
        
        if (p.identifier != NULL)
            NSLog(@"%d  |  %@", i, p.identifier.UUIDString);
        else
            NSLog(@"%d  |  NULL", i);
        
        [self printPeripheralInfo:p];
    }
}

- (void) printPeripheralInfo:(CBPeripheral*)peripheral {
    
    NSLog(@"------------------------------------");
    NSLog(@"Peripheral Info :");
    
    if (peripheral.identifier != NULL)
        NSLog(@"UUID : %@", peripheral.identifier.UUIDString);
    else
        NSLog(@"UUID : NULL");
    
    NSLog(@"Name : %@", peripheral.name);
    NSLog(@"RSSI : %@", [peripheral advertisementRSSI]);
    
    NSLog(@"peripheral : %@", peripheral);
    NSLog(@"-------------------------------------");
}

@end
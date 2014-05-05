//
//  CDVBLEManager.h
//  Bluetooth Low Energy Cordova Plugin
//
//  Created by jihyun on 3/19/14.
//
//

#ifndef CDVBLEManager_h
#define CDVBLEManager_h

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import <CoreBluetooth/CoreBluetooth.h>

#import "BLECentral.h"
#import "BLEPeripheral.h"
#import "CBPeripheral+Extensions.h"

@class CDVBLEManager;

@protocol BLEManagerDelegate
@end

@interface CDVBLEManager : CDVPlugin <BLECentralDelegate, BLEPeripheralDelegate> {
    NSString* _connectCallbackId;
    NSString* _serviceCallbackId;
    NSString* _subscribeCallbackId;
    NSString* _readCallbackId;
    NSString* _writeCallbackId;
    NSString* _rssiCallbackId;
    NSMutableString *_buffer;
    NSString *_delimiter;
}

@property (nonatomic,assign) id <BLEManagerDelegate> delegate;
@property (strong, nonatomic) BLECentral *CM;
@property (strong, nonatomic) BLEPeripheral *PM;

-(void) scanTimer:(NSTimer *)timer;
-(void) printKnownPeripherals;
-(void) printPeripheralInfo:(CBPeripheral*)peripheral;

- (void)connect:(CDVInvokedUrlCommand *)command;
- (void)disconnect:(CDVInvokedUrlCommand *)command;

- (void)discoverServicesByUUID:(CDVInvokedUrlCommand*)command;

- (void)readValueForCharacteristic:(CDVInvokedUrlCommand*)command;
- (void)writeValueForCharacteristic:(CDVInvokedUrlCommand*)command;

- (void)subscribe:(CDVInvokedUrlCommand *)command;
- (void)write:(CDVInvokedUrlCommand *)command;

- (void)list:(CDVInvokedUrlCommand *)command;
- (void)findPeripheralByUUID:(CDVInvokedUrlCommand *)command;
- (void)isEnabled:(CDVInvokedUrlCommand *)command;
- (void)isConnected:(CDVInvokedUrlCommand *)command;

- (void)available:(CDVInvokedUrlCommand *)command;
- (void)read:(CDVInvokedUrlCommand *)command;
- (void)readUntil:(CDVInvokedUrlCommand *)command;
- (void)clear:(CDVInvokedUrlCommand *)command;

- (void)readRSSI:(CDVInvokedUrlCommand *)command;

@end

#endif
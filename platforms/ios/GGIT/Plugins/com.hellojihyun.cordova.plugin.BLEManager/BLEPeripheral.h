//
//  BLEPeripheral.h
//
//  Created by jihyun on 3/19/14.
//
//

#import <CoreBluetooth/CoreBluetooth.h>

@class BLEPeripheral;

@protocol BLEPeripheralDelegate
@optional
@required
@end

@interface BLEPeripheral : NSObject <CBPeripheralManagerDelegate> {
}

@property (nonatomic,assign) id <BLEPeripheralDelegate> delegate;
@property (strong, nonatomic) CBPeripheralManager       *peripheralManager;
@property (strong, nonatomic) CBPeripheralManager       *myself;
@property (strong, nonatomic) CBMutableCharacteristic   *transferCharacteristic;
@property (strong, nonatomic) NSData                    *dataToSend;
@property (nonatomic, readwrite) NSInteger              sendDataIndex;

- (void)initPeripheral;
- (void)deinitPeripheral;

- (void)peripheralManagerDidUpdateState:(CBPeripheralManager *)peripheral;

// add service
- (void)doAddService:(NSString *)serviceName key:(NSString *)characteristicKey value:(NSString *)characteristicValue;
- (void)peripheralManager:(CBPeripheralManager *)peripheral didAddService:(NSError *)error;

// advertising
- (void)doStartAdvertising:(NSString *)serviceName;
- (void)doStopAdvertising;
- (void)peripheralManagerDidStartAdvertising:(CBPeripheralManager *)peripheral error:(NSError *)error;

//- (void)doStartAdvertising:(NSString *)UUID identifier:(NSString *)Identifier;

@end
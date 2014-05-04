//
//  BLECentral.h
//
//  Created by jihyun on 3/19/14.
//
//

#import <CoreBluetooth/CoreBluetooth.h>

@class BLECentral;

@protocol BLECentralDelegate
@optional
-(void) bleDidConnect:(NSDictionary *)dic;
-(void) bleDidDisconnect;
-(void) bleDidDiscoverServices;
-(void) bleDidDiscoverCharacteristic:(NSDictionary *)dic;
@required
@end

@interface BLECentral : NSObject <CBCentralManagerDelegate, CBPeripheralDelegate> {
	NSString* connectCallback;
    NSString* _serviceUUID;
    NSString* _characteristicUUID;
}

@property (nonatomic,assign) id <BLECentralDelegate> delegate;
@property (strong, nonatomic) CBCentralManager      *centralManager;
@property (strong, nonatomic) NSMutableArray        *peripherals;
@property (strong, nonatomic) CBPeripheral          *activePeripheral;
//@property (strong, nonatomic) NSMutableData         *data;

- (void)initCentral;
- (void)deinitCentral;


// ready
- (void)centralManagerDidUpdateState:(CBCentralManager *)central;
- (BOOL)isReady;
- (int)getState;


// scan
- (void)startScan;
- (void)stopScan;
- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI;


// peripheral
- (CBPeripheral*)getPeripheralByUUID:(NSString*)uuid;


// connect
- (void)connect:(CBPeripheral *)peripheral id:(NSString *)id;
- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral;
- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error;

// disconnect
- (void)disconnect;
- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error;


// service
- (void)doDiscoverServiceByUUID:(NSString *)UUID chUUID:(NSString *)chUUID;
- (void)doDiscoverServices:(CBPeripheral *)peripheral;
- (CBService *)doDiscoverServices:(CBPeripheral *)peripheral UUID:(NSString *)UUID;
//- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error;

// characteristic
- (void)doDiscoverCharacteristicsForService:(CBPeripheral *)peripheral service:(CBService *)service;
-(CBCharacteristic *) doDiscoverCharacteristic:(CBService*)service UUID:(NSString *)UUID;
- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error;

- (void)doReadValueForCharacteristic:(CBPeripheral *)peripheral characteristic:(CBCharacteristic *)characteristic;
- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error;


// activePeripheral
-(void) readActiveRSSI;

//-(void) writeValue:(CBUUID *)serviceUUID characteristicUUID:(CBUUID *)characteristicUUID p:(CBPeripheral *)p data:(NSData *)data;
//-(void) write:(NSData *)d;

- (void)cleanup;

-(UInt16) swap:(UInt16) s;
-(int) compareCBUUID:(CBUUID *) UUID1 UUID2:(CBUUID *)UUID2;
-(int) compareCBUUIDToInt:(CBUUID *) UUID1 UUID2:(UInt16)UUID2;
-(UInt16) CBUUIDToInt:(CBUUID *) UUID;
-(BOOL) UUIDSAreEqual:(NSUUID *)UUID1 UUID2:(NSUUID *)UUID2;

@end
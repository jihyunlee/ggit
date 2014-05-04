#import "BLEPeripheral.h"
#import "BLEDefines.h"
#import <CoreLocation/CoreLocation.h>

@implementation BLEPeripheral

@synthesize peripheralManager;
@synthesize myself;
@synthesize transferCharacteristic;
@synthesize dataToSend;
@synthesize sendDataIndex;


#define NOTIFY_MTU      20
#define GROCERY_SERVICE_UUID @"11111111-2222-3333-4444-555557777777"

#pragma mark - View Lifecycle



- (void)initPeripheral {

    // Start up the CBPeripheralManager
    self.peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:nil];
}


- (void)deinitPeripheral {
    
    // Don't keep it going while we're not showing.
    [self.peripheralManager stopAdvertising];
}

#pragma mark - Peripheral Methods

/** Required protocol method.  A full app should take care of all the possible states,
 *  but we're just waiting for  to know when the CBPeripheralManager is ready
 */
- (void)peripheralManagerDidUpdateState:(CBPeripheralManager *)peripheral
{
    // Opt out from any other state
    if (peripheral.state != CBPeripheralManagerStatePoweredOn) {
        return;
    }
    
    // We're in CBPeripheralManagerStatePoweredOn state...
    NSLog(@"self.peripheralManager powered on.");
    
    myself = peripheral;

    
    NSString *characteristicUUID = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
    
    self.transferCharacteristic = [[CBMutableCharacteristic alloc] initWithType:[CBUUID UUIDWithString:characteristicUUID] properties:CBCharacteristicPropertyNotify value:nil permissions:CBAttributePermissionsReadable];
    
    CBMutableService *transferService = [[CBMutableService alloc] initWithType:[CBUUID UUIDWithString:GROCERY_SERVICE_UUID] primary:YES];
    
    transferService.characteristics = @[self.transferCharacteristic];
    
    [self.peripheralManager addService:transferService];
    
    [self.peripheralManager startAdvertising:@{ CBAdvertisementDataServiceUUIDsKey : @[[CBUUID UUIDWithString:GROCERY_SERVICE_UUID]], CBAdvertisementDataLocalNameKey : @"milk" }];
    
    
    
    
    
    
    
//    [self doStartAdvertising:@"hello" identifier:@"jihyun"];
//    [self doStartAdvertising:@"hellojihyun"];
//    [self doAddService:@"grocery" key:@"fruit" value:@"banana"];
}


- (void)doAddService:(NSString *)serviceName key:(NSString *)characteristicKey value:(NSString *)characteristicValue{
    
    // If we're already advertising, stop
    if (self.peripheralManager.isAdvertising) {
        [self.peripheralManager stopAdvertising];
    }

    NSData* data = [characteristicValue dataUsingEncoding:NSUTF8StringEncoding];
    
    // Start with the CBMutableCharacteristic
    self.transferCharacteristic = [[CBMutableCharacteristic alloc] initWithType:[CBUUID UUIDWithString:characteristicKey]
                                                                     properties:CBCharacteristicPropertyNotify
                                                                          value:data
                                                                    permissions:CBAttributePermissionsReadable];
    
    // Then the service
    CBMutableService *transferService = [[CBMutableService alloc] initWithType:[CBUUID UUIDWithString:serviceName]
                                                                       primary:YES];
    
    // Add the characteristic to the service
    transferService.characteristics = @[self.transferCharacteristic];
    
    // And add it to the peripheral manager
    [self.peripheralManager addService:transferService];
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didAddService:(NSError *)error {

    if (error) {
        NSLog(@"Error Add service");
        return;
    }
    
    
}

//- (void)doStartAdvertising:(NSString *)UUID identifier:(NSString *)Identifier{
//    
//    NSUUID *proximityUUID = [[NSUUID alloc] initWithUUIDString:UUID];
//    
//    CLBeaconRegion *beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:proximityUUID identifier:Identifier];
//    
//    NSDictionary *beaconPeripheralData = [beaconRegion peripheralDataWithMeasuredPower:nil];
//    
//    NSLog(@"dictionary : %@", beaconPeripheralData);
//    
//    [myself startAdvertising:beaconPeripheralData];
//}

- (void)doStartAdvertising:(NSString *)serviceName {
    [self.peripheralManager startAdvertising:@{ CBAdvertisementDataServiceUUIDsKey : @[[CBUUID UUIDWithString:serviceName]] }];
}

- (void)peripheralManagerDidStartAdvertising:(CBPeripheralManager *)peripheral error:(NSError *)error {
    
    if (error) {
        NSLog(@"Error start advertising");
        return;
    }
    
}

- (void)doStopAdvertising {
    [self.peripheralManager stopAdvertising];
}

@end

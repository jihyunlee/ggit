
#import <Foundation/Foundation.h>

#import "BLECentral.h"
#import "BLEDefines.h"
#import "CBPeripheral+Extensions.h"


@implementation BLECentral

@synthesize delegate;
@synthesize centralManager;
@synthesize peripherals;
@synthesize activePeripheral;
//@synthesize data;

static bool ready = false;
static bool done = false;
static int state = -1;

#pragma mark - init

- (id)init {
    self = [super init];
    return self;
}

- (void)initCentral {
    
    // Start up the CBCentralManager
    self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil];
    
    // And somewhere to store the incoming data
//    self.data = [[NSMutableData alloc] init];
}

- (void)deinitCentral {
    
    // Don't keep it going while we're not showing.
    [self.centralManager stopScan];
}



#pragma mark - Central Methods



/** centralManagerDidUpdateState is a required protocol method.
 *  Usually, you'd check for other states to make sure the current device supports LE, is powered on, etc.
 *  In this instance, we're just using it to wait for CBCentralManagerStatePoweredOn, which indicates
 *  the Central is ready to be used.
 */
- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    
    if (central.state != CBCentralManagerStatePoweredOn) {
        NSLog(@"CoreBluetooth not correctly initialized !");
        NSLog(@"State = %d (%s)\r\n", central.state, [self centralManagerStateToString:central.state]);
        ready = false;
        return;
    }
    
    // The state must be CBCentralManagerStatePoweredOn...
    
#if TARGET_OS_IPHONE
    NSLog(@"Status of CoreBluetooth central manager changed %d (%s)", central.state, [self centralManagerStateToString:central.state]);
#else
    [self isLECapableHardware];
#endif
    state = central.state;
    ready = true;
}


- (const char *) centralManagerStateToString: (int)_state
{
    switch(_state)
    {
        case CBCentralManagerStateUnknown:
            return "State unknown (CBCentralManagerStateUnknown)";
        case CBCentralManagerStateResetting:
            return "State resetting (CBCentralManagerStateUnknown)";
        case CBCentralManagerStateUnsupported:
            return "State BLE unsupported (CBCentralManagerStateResetting)";
        case CBCentralManagerStateUnauthorized:
            return "State unauthorized (CBCentralManagerStateUnauthorized)";
        case CBCentralManagerStatePoweredOff:
            return "State BLE powered off (CBCentralManagerStatePoweredOff)";
        case CBCentralManagerStatePoweredOn:
            return "State powered up and ready (CBCentralManagerStatePoweredOn)";
        default:
            return "State unknown";
    }
    
    return "Unknown state";
}

#if TARGET_OS_IPHONE
//-- no need for iOS
#else
- (BOOL) isLECapableHardware {
    
    NSString * state = nil;
    
    switch ([self.centralManager state])
    {
        case CBCentralManagerStateUnsupported:
            state = @"The platform/hardware doesn't support Bluetooth Low Energy.";
            break;
            
        case CBCentralManagerStateUnauthorized:
            state = @"The app is not authorized to use Bluetooth Low Energy.";
            break;
            
        case CBCentralManagerStatePoweredOff:
            state = @"Bluetooth is currently powered off.";
            break;
            
        case CBCentralManagerStatePoweredOn:
            return TRUE;
            
        case CBCentralManagerStateUnknown:
        default:
            return FALSE;
            
    }
    
    NSLog(@"Central manager state: %@", state);
    
    NSAlert *alert = [[NSAlert alloc] init];
    [alert setMessageText:state];
    [alert addButtonWithTitle:@"OK"];
    [alert setIcon:[[NSImage alloc] initWithContentsOfFile:@"AppIcon"]];
    [alert beginSheetModalForWindow:nil modalDelegate:self didEndSelector:nil contextInfo:nil];
    
    return FALSE;
}
#endif

-(BOOL) isReady {
    return ready;
}

-(int) getState {
    return state;
}

/** Scan for peripherals
 */
- (void)startScan {
    
    NSLog(@"[BLECentral] scan started ----------");
    
    // disconnect
    if (self.activePeripheral) {
        if(self.activePeripheral.isConnected)
        {
            [self.centralManager cancelPeripheralConnection:self.activePeripheral];
            return;
        }
    }
    
    // remove existing peripherals
    if (self.peripherals) {
        self.peripherals = nil;
    }
    
    // todo:
    // idk why it is not working with UUID. weird.

//    [self.centralManager scanForPeripheralsWithServices:@[[CBUUID UUIDWithString:TRANSFER_SERVICE_UUID]]
//                                                options:@{ CBCentralManagerScanOptionAllowDuplicatesKey : @YES }];
    
    [self.centralManager
     scanForPeripheralsWithServices:nil //@[[CBUUID UUIDWithString:@"0x2901"], [CBUUID UUIDWithString:@"0x2A3F"]]
     options:nil];

//    [self.centralManager scanForPeripheralsWithServices:nil options:nil];
}


- (void)stopScan {
    
    NSLog(@"[BLECentral] stop scanning ----------");
    
    [self.centralManager stopScan];
}


/** This callback comes whenever a peripheral is discovered.
 *  the peripheral is added to the list of discovered peripherals with RSSI
 */
- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI {
    
    if (peripheral.identifier == NULL) {
        NSLog(@"--- ERROR --- [BLECentral] didDiscoverPeripheral unknown");
        return;
    }
    
    NSLog(@"[BLECentral] didDiscoverPeripheral -- %@ (%ld)", peripheral.name, (long)RSSI.integerValue);
    
    [peripheral setAdvertisementData:advertisementData RSSI:RSSI];

    if (!self.peripherals) {
        self.peripherals = [[NSMutableArray alloc] initWithObjects:peripheral,nil];
    } else {
        [self.peripherals addObject:peripheral];
    }
}



- (CBPeripheral*)getPeripheralByUUID:(NSString*)uuid {

    CBPeripheral *peripheral = nil;
    
    for (CBPeripheral *p in peripherals) {
        
        NSString *other = p.identifier.UUIDString;
        
        if ([uuid isEqualToString:other]) {
            peripheral = p;
            break;
        }
    }
    return peripheral;
}

// get Peripheral local name
// [advertisementData objectForKey:CBAdvertisementDataLocalNameKey]

- (void)connect:(CBPeripheral *)peripheral id:(NSString *)id{
    
    NSLog(@"[BLECentral] connect ---------- %@", id);
    connectCallback = id;
    [self.centralManager connectPeripheral:peripheral options:nil];
}

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
    NSLog(@"[BLECentral] didConnectPeripheral -- %@ -- %@", peripheral.name, connectCallback);
    
    self.activePeripheral = peripheral;
    [self.activePeripheral setDelegate:self];
    
    NSDictionary* dic = [NSDictionary dictionaryWithObjectsAndKeys: peripheral.name, @"name", [peripheral.identifier UUIDString], @"uuid", nil];
    [[self delegate] bleDidConnect:dic];
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    NSLog(@"[BLECentral] didFailToConnectPeripheral -- %@", peripheral.name);
}

- (void)disconnect {
    NSLog(@"[BLECentral] disconnect ----------");
    [self.centralManager cancelPeripheralConnection:activePeripheral];
    self.activePeripheral = nil;
}

- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    NSLog(@"[BLECentral] didDisconnectPeripheral");
    [[self delegate] bleDidDisconnect];
}

#pragma mark - Peripheral Methods


/** While connected, retrieves the current RSSI of the link.
 */
-(void) doReadRSSI:(CBPeripheral *)peripheral {
    [peripheral readRSSI];
}

- (void)peripheralDidUpdateRSSI:(CBPeripheral *)peripheral error:(NSError *)error {
    
    if(peripheral.state != CBPeripheralStateConnected)
        return;

    // todo: idk what to do with the value..
    
//    if (rssi != peripheral.RSSI.intValue) {
//        rssi = peripheral.RSSI.intValue;
//        [[self delegate] bleDidUpdateRSSI:activePeripheral.RSSI];
//    }
}


/** Discovers available services on the peripheral.
 */
- (void)doDiscoverServiceByUUID:(NSString *)UUID chUUID:(NSString *)chUUID{
    NSLog(@"[BLECentral] doDiscoverServiceByUUID -- %@ -- %@ -- %d", UUID, self.activePeripheral.identifier.UUIDString, self.activePeripheral.state);
    _serviceUUID = UUID;
    _characteristicUUID = chUUID;
    [self.activePeripheral discoverServices:nil];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error
{
    if (error) {
        NSLog(@"[BLECentral] didDiscoverServices -- Error: %@", [error localizedDescription]);
        [self cleanup];
        return;
    }
    
    NSLog(@"[BLECentral] didDiscoverServices -- %@", peripheral.name);

    for (CBService *service in peripheral.services) {
        if ([_serviceUUID isEqualToString:[self CBUUIDToString:service.UUID]]){
            NSLog(@"service found -- %@", [self CBUUIDToString:service.UUID]);
            [peripheral discoverCharacteristics:nil forService:service];
        } else {
            NSLog(@"service not found");
        }
    }
}

- (void)doDiscoverServices:(CBPeripheral *)peripheral {
    // Search only for services that match our UUID
    //    [peripheral discoverServices:@[[CBUUID UUIDWithString:TRANSFER_SERVICE_UUID]]];
    
    // Discover all services without filter
    [peripheral discoverServices:nil];
}
- (CBService *)doDiscoverServices:(CBPeripheral *)peripheral UUID:(NSString *)UUID {

    NSLog(@"[BLECentral] doDiscoverServices -- %@ -- %@", UUID, peripheral.identifier.UUIDString);
    
    // Search only for services that match our UUID
    for (CBService *service in peripheral.services) {
        
        if ([service.UUID isEqual:[CBUUID UUIDWithString:UUID]]) {
            return service;
        }
    }
    
    NSLog(@"Could not find service with UUID %@ on peripheral with UUID %@", UUID, peripheral.identifier.UUIDString);
    return nil;
}





/** Discovers the specified characteristic(s) of service
 */
- (void)doDiscoverCharacteristicsForService:(CBPeripheral *)peripheral service:(CBService *)service {
    
    NSLog(@"[BLECentral] doDiscoverServices -- %@ -- %@", peripheral.identifier.UUIDString, service.UUID);
    
    [peripheral discoverCharacteristics:nil forService:service];
//    [peripheral discoverCharacteristics:@[[CBUUID UUIDWithString:TRANSFER_CHARACTERISTIC_UUID]] forService:service];
}

-(CBCharacteristic *) doDiscoverCharacteristic:(CBService*)service UUID:(NSString *)UUID {

    for (CBCharacteristic *characteristic in service.characteristics) {
        
        if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUID]]) {
            return characteristic;
        }
    }
    
    NSLog(@"Could not find characteristic with UUID %@ on service with UUID %@ on peripheral with UUID %@", UUID, service.UUID, service.peripheral.identifier.UUIDString);
    
    return nil;
}


/** The Transfer characteristic was discovered.
 *  Once this has been found, we want to subscribe to it, which lets the peripheral know we want the data it contains
 */
- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error
{
    if (error) {
        NSLog(@"[BLECentral] didDiscoverCharacteristicsForService -- Error: %@", [error localizedDescription]);
        [self cleanup];
        return;
    }
    
    NSLog(@"[BLECentral] didDiscoverCharacteristicsForService -- service(%@)", [self CBUUIDToString:service.UUID]);
    
    // Again, we loop through the array, just in case.
    for (CBCharacteristic *characteristic in service.characteristics) {
        
        if ([_characteristicUUID isEqualToString:[self CBUUIDToString:characteristic.UUID]]){
            NSLog(@"characteristic found -- %@", [self CBUUIDToString:characteristic.UUID]);

            [self.activePeripheral readValueForCharacteristic:characteristic];
            
//            NSString *str = [NSString stringWithFormat:@"i love you <3\r\n"];
//            NSData *data = [str dataUsingEncoding:NSUTF8StringEncoding];
//            [self.activePeripheral writeValue:data forCharacteristic:characteristic type:CBCharacteristicWriteWithResponse];
        
        } else {
            NSLog(@"characteristic not found");
        }
    }
}


/** Reads the characteristic value for characteristic
 */
-(void) doReadValueForCharacteristic:(NSString *)serviceUUID characteristicUUID:(NSString *)characteristicUUID {
    
    CBService *service = [self doDiscoverServices:activePeripheral UUID:serviceUUID];
    if (!service) return;
    
    CBCharacteristic *characteristic = [self doDiscoverCharacteristic:service UUID:characteristicUUID];
    if (!characteristic) return;
    
    [activePeripheral readValueForCharacteristic:characteristic];
}

- (void)doReadValueForCharacteristic:(CBPeripheral *)peripheral characteristic:(CBCharacteristic *)characteristic {
    
    [peripheral readValueForCharacteristic:characteristic];
}


/** This callback lets us know more data has arrived via notification on the characteristic
 */
- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error
{
    if (error) {
        NSLog(@"Error discovering characteristics: %@", [error localizedDescription]);
        return;
    }
    
    NSString *stringFromData = [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding];
    NSLog(@"didUpdateValueForCharacteristic -- %@", stringFromData);
    
    // Have we got everything we need?
    if ([stringFromData isEqualToString:@"EOM"]) {
        
        // Cancel our subscription to the characteristic
        [peripheral setNotifyValue:NO forCharacteristic:characteristic];
        
        // and disconnect from the peripehral
        [self.centralManager cancelPeripheralConnection:peripheral];
    } else {
        NSDictionary* dic = [NSDictionary dictionaryWithObjectsAndKeys: stringFromData, @"data", nil];
        [[self delegate] bleDidReadValueForCharacteristic:dic];
    }
}

-(void) doWriteValueForCharacteristic:(NSString *)serviceUUID characteristicUUID:(NSString *)characteristicUUID data:(NSData *)d {
    
    CBService *service = [self doDiscoverServices:activePeripheral UUID:serviceUUID];
    if (!service) return;
    
    CBCharacteristic *characteristic = [self doDiscoverCharacteristic:service UUID:characteristicUUID];
    if (!characteristic) return;
    
    [activePeripheral writeValue:d forCharacteristic:characteristic type:CBCharacteristicWriteWithResponse];
}

-(void) doWriteValueForCharacteristic:(CBUUID *)serviceUUID characteristicUUID:(CBUUID *)characteristicUUID p:(CBPeripheral *)p data:(NSData *)d {
    
    CBService *service = [self doDiscoverServices:p UUID:[self CBUUIDToString:serviceUUID]];
    if (!service) return;
        
    CBCharacteristic *characteristic = [self doDiscoverCharacteristic:service UUID:[self CBUUIDToString:characteristicUUID]];
    if (!characteristic) return;
    
    [p writeValue:d forCharacteristic:characteristic type:CBCharacteristicWriteWithoutResponse];
}


- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
    
    if (error) {
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:nil message:@"Connection failed. please try again." delegate:self cancelButtonTitle:@"OK" otherButtonTitles: nil];
        [alert show];
        NSLog(@"didWriteValueForCharacteristic -- error: %@",[error localizedDescription]);
        return;
    }
    
    NSLog(@"didWriteValueForCharacteristic");
    [[self delegate] bleDidWriteValueForCharacteristic];
}

/** The peripheral letting us know whether our subscribe/unsubscribe happened or not
 */
- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error
{
    if (error) {
        NSLog(@"Error changing notification state: %@", error.localizedDescription);
        NSLog(@"Error code was %s", [[error description] cStringUsingEncoding:NSStringEncodingConversionAllowLossy]);

        NSLog(@"Error in setting notification state for characteristic with UUID %@ on service with UUID %@ on peripheral with UUID %@",
              [self CBUUIDToString:characteristic.UUID],
              [self CBUUIDToString:characteristic.service.UUID],
              peripheral.identifier.UUIDString);
    }
    
    // Exit if it's not the transfer characteristic
    if (![characteristic.UUID isEqual:[CBUUID UUIDWithString:TRANSFER_CHARACTERISTIC_UUID]]) {
        return;
    }
    
    // Notification has started
    if (characteristic.isNotifying) {
        NSLog(@"Notification began on %@", characteristic);
    }
    
    // Notification has stopped
    else {
        // so disconnect from the peripheral
        NSLog(@"Notification stopped on %@.  Disconnecting", characteristic);
        [self.centralManager cancelPeripheralConnection:peripheral];
    }
}



-(NSString *) CBUUIDToString:(CBUUID *) cbuuid;
{
    NSData *d = cbuuid.data;
    
    if ([d length] == 2)
    {
        const unsigned char *tokenBytes = [d bytes];
        return [NSString stringWithFormat:@"%02x%02x", tokenBytes[0], tokenBytes[1]];
    }
    else if ([d length] == 16)
    {
        NSUUID* nsuuid = [[NSUUID alloc] initWithUUIDBytes:[d bytes]];
        return [nsuuid UUIDString];
    }
    
    return [cbuuid description];
}





/** Call this when things either go wrong, or you're done with the connection.
 *  This cancels any subscriptions if there are any, or straight disconnects if not.
 *  (didUpdateNotificationStateForCharacteristic will cancel the connection if a subscription is involved)
 */
- (void)cleanup
{
    // Don't do anything if we're not connected
    if (!self.activePeripheral.isConnected) {
        return;
    }
    
    // See if we are subscribed to a characteristic on the peripheral
    if (self.activePeripheral.services != nil) {
        for (CBService *service in self.activePeripheral.services) {
            if (service.characteristics != nil) {
                for (CBCharacteristic *characteristic in service.characteristics) {
                    if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:TRANSFER_CHARACTERISTIC_UUID]]) {
                        if (characteristic.isNotifying) {
                            // It is notifying, so unsubscribe
                            [self.activePeripheral setNotifyValue:NO forCharacteristic:characteristic];
                            
                            // And we're done.
                            return;
                        }
                    }
                }
            }
        }
    }
    
    // If we've got this far, we're connected, but we're not subscribed, so we just disconnect
    [self.centralManager cancelPeripheralConnection:self.activePeripheral];
}




-(UInt16) swap:(UInt16)s
{
    UInt16 temp = s << 8;
    temp |= (s >> 8);
    return temp;
}

-(int) compareCBUUID:(CBUUID *) UUID1 UUID2:(CBUUID *)UUID2 {
    
    char b1[16];
    char b2[16];
    [UUID1.data getBytes:b1];
    [UUID2.data getBytes:b2];
    
    if (memcmp(b1, b2, UUID1.data.length) == 0)
        return 1;
    else
        return 0;
}

-(int) compareCBUUIDToInt:(CBUUID *)UUID1 UUID2:(UInt16)UUID2
{
    char b1[16];
    
    [UUID1.data getBytes:b1];
    UInt16 b2 = [self swap:UUID2];
    
    if (memcmp(b1, (char *)&b2, 2) == 0)
        return 1;
    else
        return 0;
}

-(UInt16) CBUUIDToInt:(CBUUID *) UUID
{
    char b1[16];
    [UUID.data getBytes:b1];
    return ((b1[0] << 8) | b1[1]);
}

-(CBUUID *) IntToCBUUID:(UInt16)UUID
{
    char t[16];
    t[0] = ((UUID >> 8) & 0xff); t[1] = (UUID & 0xff);
    NSData *d = [[NSData alloc] initWithBytes:t length:16];
    return [CBUUID UUIDWithData:d];
}

- (BOOL) UUIDSAreEqual:(NSUUID *)UUID1 UUID2:(NSUUID *)UUID2 {
    
    if ([UUID1.UUIDString isEqualToString:UUID2.UUIDString])
        return TRUE;
    else
        return FALSE;
}

@end

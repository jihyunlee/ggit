cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.console/www/console-via-logger.js",
        "id": "org.apache.cordova.console.console",
        "clobbers": [
            "console"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.console/www/logger.js",
        "id": "org.apache.cordova.console.logger",
        "clobbers": [
            "cordova.logger"
        ]
    },
    {
        "file": "plugins/com.hellojihyun.cordova.plugin.M7StepCounter/www/M7StepCounter.js",
        "id": "com.hellojihyun.cordova.plugin.M7StepCounter.M7StepCounter",
        "clobbers": [
            "window.M7StepCounter"
        ]
    },
    {
        "file": "plugins/com.hellojihyun.cordova.plugin.BLEManager/www/BLEManager.js",
        "id": "com.hellojihyun.cordova.plugin.BLEManager.BLEManager",
        "clobbers": [
            "window.BLEManager"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.dialogs/www/notification.js",
        "id": "org.apache.cordova.dialogs.notification",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/de.appplant.cordova.plugin.local-notification/www/local-notification.js",
        "id": "de.appplant.cordova.plugin.local-notification.LocalNotification",
        "clobbers": [
            "plugin.notification.local"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device-motion/www/Acceleration.js",
        "id": "org.apache.cordova.device-motion.Acceleration",
        "clobbers": [
            "Acceleration"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device-motion/www/accelerometer.js",
        "id": "org.apache.cordova.device-motion.accelerometer",
        "clobbers": [
            "navigator.accelerometer"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.console": "0.2.9-dev",
    "com.hellojihyun.cordova.plugin.M7StepCounter": "1.0.0",
    "com.hellojihyun.cordova.plugin.BLEManager": "1.0.0",
    "org.apache.cordova.dialogs": "0.2.7",
    "de.appplant.cordova.plugin.local-notification": "0.8.0dev",
    "org.apache.cordova.device-motion": "0.2.7",
    "org.apache.cordova.device": "0.2.10-dev"
}
// BOTTOM OF METADATA
});
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
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.console": "0.2.9-dev",
    "com.hellojihyun.cordova.plugin.M7StepCounter": "1.0.0",
    "com.hellojihyun.cordova.plugin.BLEManager": "1.0.0"
}
// BOTTOM OF METADATA
});
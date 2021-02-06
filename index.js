const { CameraEventHandler } = require('./dist/cameraEventHandler');
const http = require('http');
const Events = require("events");

module.exports = function (homebridge) {
  homebridge.registerPlatform("HikvisionCamWebhook", HikvisionCamWebhookPlugin);
}

function HikvisionCamWebhookPlugin(log, config, api) {
    this.log = log;
    this.config = config || {};
    if (api) {
        this.api = api;
        this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
    }
}

HikvisionCamWebhookPlugin.prototype.didFinishLaunching = function () {
	var cameras = this.config.cameras;
	var output = this.log;
	
	cameras.forEach(function (cameraConfig) {
		var event = '' + cameraConfig.eventType + '';
		const cam = new CameraEventHandler(cameraConfig.host,cameraConfig.port, cameraConfig.user, cameraConfig.password);

		cam.on("error", function(err){
			output.error('Hikvision Cam Error: ' + err.message + '/n')
		})
		
		output.info('Shard started on cam ' + cameraConfig.host);
		
		cam.on("alarm", function(code, action, index){ 
			//output.info('\n\nEvent: ' + code + ' ' + action + ' ' + index + ' on cam:' + cameraConfig.host + '\n\n');
			if (code == event && action == 'Start') {
				output.info('Detected event on camera: ' + cameraConfig.host);
				http.get(cameraConfig.rhost).on("error", (err) => {output.error("Hikvision-Webhook Error: " , err.message)});
			}
		})
	})
}

function checkCredentials() {
    var urlAuth = getUrlAuth();
    var url = 'https://my.tado.com/api/v2/me?' + urlAuth;
    var json = httpGetJson(url);
    return json.homes ? true : false;
}

function updateFromTadoServer() {
    var newDevices = [];
    var newIds = [];

    // get devices from tado API
    var urlAuth = getUrlAuth();
    var url = 'https://my.tado.com/api/v2/me?' + urlAuth;
    var json = httpGetJson(url);
    json.homes.forEach(function(home) {
        url = 'https://my.tado.com/api/v2/homes/' + home.id + '/zones?' + urlAuth;
        var zones = httpGetJson(url);
        zones.forEach(function(zone) {
            url = 'https://my.tado.com/api/v2/homes/' + home.id + '/zones/' + zone.id + '/capabilities?' + urlAuth;
            var capabilities = httpGetJson(url);
            capabilities = JSON.stringify(capabilities);
            var _id = home.id + '_' + zone.id;

            newIds.push(_id);
            newDevices.push({
                id: _id,
                name: home.name + ' - ' + zone.name,
                homeId: home.id,
                homeName: home.name,
                zoneId: zone.id,
                zoneName: zone.name,
                zoneType: zone.type,
                zoneCapabilities: capabilities
            });
        });
    });

    // update existing devices
    var oldDevices = [];
    var devicesNode = Property.getNode('devices');
    if (devicesNode) {
        devicesNode.getChildren().forEach(function(deviceNode) {
            var _id = deviceNode.getName();
            var i = newIds.indexOf(_id);
            if (i === -1) {
                oldDevices.push(deviceNode);
                return;
            }

            newIds.splice(i, 1);
            var newDevice = newDevices.splice(i, 1)[0];
            var path = deviceNode.getPath();

            Property.setSavedProperty(path + '/homeName', newDevice.homeName);
            Property.setSavedProperty(path + '/zoneName', newDevice.zoneName);
            Property.setSavedProperty(path + '/zoneType', newDevice.zoneType);
            Property.setSavedProperty(path + '/zoneCapabilities', newDevice.zoneCapabilities);
        });
    }

    // remove old devices
    oldDevices.forEach(function(deviceNode) {
        devicesNode.removeChild(deviceNode);
    });

    // add new devices
    newDevices.forEach(function(newDevice) {
        var _id = newDevice.id;
        Property.setSavedProperty('devices/' + _id + '/id', _id);
        Property.setSavedProperty('devices/' + _id + '/name', newDevice.name);
        Property.setSavedProperty('devices/' + _id + '/homeId', newDevice.homeId);
        Property.setSavedProperty('devices/' + _id + '/homeName', newDevice.homeName);
        Property.setSavedProperty('devices/' + _id + '/zoneId', newDevice.zoneId);
        Property.setSavedProperty('devices/' + _id + '/zoneName', newDevice.zoneName);
        Property.setSavedProperty('devices/' + _id + '/zoneType', newDevice.zoneType);
        Property.setSavedProperty('devices/' + _id + '/zoneCapabilities', newDevice.zoneCapabilities);
    });

    Property.store();
}



var success = false;
var actions = raisedEvent.parameter.actions;
if (actions === 'login') {

    try {
        // save username & password
        var username = raisedEvent.parameter.username;
        var password = raisedEvent.parameter.password;
        var encrypted = XORCipher.encode(CIPHER_KEY, password);
        Property.setSavedProperty('config/username', username);
        Property.setSavedProperty('config/password', encrypted);
        Property.store();

        if (checkCredentials()) {
            updateFromTadoServer();
            success = true;
        }
    } catch (e) {
        Log.logln('Error: ' + e.stack);
    }

    new Event('tado.response', {
        actions: 'config.login',
        ok: success
    }).raise();

} else if (actions === 'update') {

    try {
        updateFromTadoServer();
        success = true;
    } catch (e) {
        Log.logln('Error: ' + e.stack);
    }

    new Event('tado.response', {
        actions: 'config.update',
        ok: success
    }).raise();

} else if (actions === 'isConnected') {

    try {
        success = checkCredentials();
    } catch (e) {
        Log.logln('Error: ' + e.stack);
    }

    new Event('tado.response', {
        actions: 'config.isConnected',
        ok: success
    }).raise();

}

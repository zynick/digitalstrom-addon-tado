var action = raisedEvent.parameter.action;
action = decodeURIComponent(action); // FIXME best if this LOC can be removed. see http://imgur.com/a/MeWOk
action = JSON.parse(action);

var homeId = Property.getProperty('devices/' + action.deviceId + '/homeId');
var zoneId = Property.getProperty('devices/' + action.deviceId + '/zoneId');

var url = 'https://my.tado.com/api/v2/homes/' + homeId + '/zones/' + zoneId + '/overlay?' + getUrlAuth();
var json = {
    type: 'MANUAL',
    setting: action.setting,
    termination: {
        type: 'MANUAL'
    }
};

Log.logln('TADO REQUEST: ' + url + ', "' + JSON.stringify(json) + '"');
json = httpPutJson(url, json);
Log.logln('TADO RESPONSE: ' + JSON.stringify(json));

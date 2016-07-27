var success = false;
var actions = raisedEvent.parameter.actions;
if (actions === 'save') {

    try {
        var id = raisedEvent.parameter.id;
        var name = raisedEvent.parameter.name;
        var deviceNode = Property.getNode('devices/' + id);
        if (deviceNode && name) {
            Property.setSavedProperty('devices/' + id + '/name', name);
            Property.store();
            success = true;
        }
    } catch (e) {
        Log.logln('Error: ' + e.stack);
    }

    new Event('tado.response', {
        actions: 'device.save',
        ok: success
    }).raise();

}

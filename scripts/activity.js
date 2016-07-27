function storeActivity(activity) {
    var id, node;
    try {
        activity = JSON.parse(activity);
        if (activity.id === undefined || activity.id === null) {
            id = getId();
        } else {
            id = activity.id;
            unregisterTrigger('entries/' + id);
        }

        node = Property.getNode('entries');
        if (node) {
            node.removeChild(id);
        }

        Property.setSavedProperty('entries/' + id + '/id', id);
        Property.setSavedProperty('entries/' + id + '/conditions/enabled', true);
        putActionParameter('entries/' + id, activity.action);
        putConditionParameter('entries/' + id, activity.conditions);
        putTriggerParameter('entries/' + id, activity.triggers);

        var action = JSON.stringify(activity.action);
        action = encodeURIComponent(action); // FIXME best if this LOC can be removed. see http://imgur.com/a/MeWOk
        registerTrigger('/scripts/tado/entries/' + id, 'tado.execute', {
            action: action
        });

        Property.store();
        return true;

    } catch (e) {
        Log.logln('Activity Error: ' + e);
        if (e.stack) {
            Log.logln(e.stack);
        }
        node = Property.getNode('entries');
        if (node) {
            node.removeChild(id); // clear insert activity when error happens
        }
        Property.store();
        return false;
    }
}

function getId() {
    var id = 0;
    var entriesNode = Property.getNode('entries');
    if (!entriesNode) {
        return id;
    }

    entriesNode.getChildren().forEach(function(entryNode) {
        if (!entryNode.getChild('id')) {
            return;
        }
        var _id = parseInt(entryNode.getChild('id').getValue());
        if (isNaN(_id) || _id < id) {
            return;
        }
        id = _id + 1;
    });

    return id;
}

function putActionParameter(path, action) {
    var subPath = path + '/action/';
    storeStringParameter(subPath + 'deviceId', action.deviceId);

    var setting = action.setting;
    var settingPath = subPath + 'setting/';
    storeStringParameter(settingPath + 'power', setting.power);
    storeStringParameter(settingPath + 'type', setting.type);
    if (setting.mode) {
        storeStringParameter(settingPath + 'mode', setting.mode);
        if (setting.temperature && setting.temperature.celsius) {
            storeIntParameter(settingPath + 'temperature/celsius', setting.temperature.celsius);
        }
        if (setting.fanSpeed) {
            storeStringParameter(settingPath + 'fanSpeed', setting.fanSpeed);
        }
        if (setting.swing) {
            storeStringParameter(settingPath + 'swing', setting.swing);
        }
    }
}

function putConditionParameter(path, conditions) {
    if (!conditions) {
        return;
    }
    var subPath = path + '/conditions/';
    Property.setSavedProperty(subPath + 'enabled', conditions.enabled === true);
    if (conditions.weekdays) {
        var val = '';
        conditions.weekdays.forEach(function(weekday) {
            switch (weekday) {
                case 'SU':
                    val += '0,';
                    break;
                case 'MO':
                    val += '1,';
                    break;
                case 'TU':
                    val += '2,';
                    break;
                case 'WE':
                    val += '3,';
                    break;
                case 'TH':
                    val += '4,';
                    break;
                case 'FR':
                    val += '5,';
                    break;
                case 'SA':
                    val += '6,';
                    break;
            }
        });
        if (val.length > 0) {
            val = val.substr(0, val.length - 1);
            Property.setSavedProperty(subPath + 'weekdays', val);
        }
    }
    if (conditions.systemState) {
        conditions.systemState.forEach(function(systemState) {
            var name = systemState.name;
            var value = systemState.value;
            if (value === 'true') {
                value = true;
            }
            if (value === 'false') {
                value = false;
            }
            Property.setSavedProperty(subPath + 'states/' + name, value);
        });
    }
    if (conditions.addonStates) {
        for (var addonId in conditions.addonStates) {
            conditions.addonStates[addonId].forEach(function(addonStates) { // jshint ignore:line
                var name = addonStates.name;
                var value = addonStates.value;
                if (value === true || value === 'true') {
                    value = 1;
                }
                if (value === false || value === 'false') {
                    value = 2;
                }
                Property.setSavedProperty(subPath + 'addon-states/' + addonId + '/' + name, value);
            });
        }
    }
    if (conditions.zoneState) {
        conditions.zoneState.forEach(function(zoneState, i) {
            checkAndStoreIntParameter(subPath + 'zone-states/' + i + '/zone', zoneState.zone);
            checkAndStoreIntParameter(subPath + 'zone-states/' + i + '/group', zoneState.group);
            checkAndStoreIntParameter(subPath + 'zone-states/' + i + '/scene', zoneState.scene);
        });
    }
    if (conditions.timeframe) {
        conditions.timeframe.forEach(function(timeframe) {
            var startBase = timeframe.start.timeBase;
            var startOffset = timeframe.start.offset;
            var endBase = timeframe.end.timeBase;
            var endOffset = timeframe.end.offset;
            if (startBase === 'daily' && endBase === 'daily') {
                Property.setSavedProperty(subPath + 'time-start', Math.floor(parseInt('' + startOffset) / 3600) + ':' + Math.floor(parseInt('' + startOffset) / 60) % 60 + ':' + Math.floor(parseInt('' + startOffset) % 60));
                Property.setSavedProperty(subPath + 'time-end', Math.floor(parseInt('' + endOffset) / 3600) + ':' + Math.floor(parseInt('' + endOffset) / 60) % 60 + ':' + Math.floor(parseInt('' + endOffset) % 60));
            }
        });
    }
}

function putTriggerParameter(path, triggers) {
    triggers.forEach(function(trigger, idx) {
        var subPath = path + '/triggers/' + (idx + 1) + '/';
        switch (trigger.type) {
            case 'bus-zone-scene':
            case 'zone-scene':
            case 'undo-zone-scene':
                storeStringParameter(subPath + 'type', trigger.type);
                storeIntParameter(subPath + 'zone', trigger.zone);
                storeIntParameter(subPath + 'group', trigger.group);
                storeIntParameter(subPath + 'scene', trigger.scene);
                if (trigger.forced) {
                    storeBoolParameter(subPath + 'forced', trigger.forced);
                }
                Property.setSavedProperty(subPath + 'dsuid', -1);
                break;
            case 'device-msg':
                storeStringParameter(subPath + 'type', trigger.type);
                storeDSUIDParameter(subPath + 'dsuid', trigger.dsuid, trigger.dsid);
                storeIntParameter(subPath + 'msg', trigger.msg);
                if (trigger.buttonIndex) {
                    storeIntParameter(subPath + 'buttonIndex', trigger.buttonIndex);
                }
                break;
            case 'device-action':
                storeStringParameter(subPath + 'type', trigger.type);
                storeDSUIDParameter(subPath + 'dsuid', trigger.dsuid, trigger.dsid);
                storeIntParameter(subPath + 'action', trigger.action);
                break;
            case 'device-binary-input':
                storeStringParameter(subPath + 'type', trigger.type);
                storeIntParameter(subPath + 'index', trigger.index);
                storeStringParameter(subPath + 'state', trigger.state);
                break;
            case 'device-scene':
                storeStringParameter(subPath + 'type', trigger.type);
                storeDSUIDParameter(subPath + 'dsuid', trigger.dsuid, trigger.dsid);
                storeIntParameter(subPath + 'scene', trigger.scene);
                break;
            case 'custom-event':
                storeStringParameter(subPath + 'type', trigger.type);
                storeIntParameter(subPath + 'event', trigger.event);
                break;
            case 'device-sensor':
                storeStringParameter(subPath + 'type', trigger.type);
                storeDSUIDParameter(subPath + 'dsuid', trigger.dsuid, trigger.dsid);
                storeStringParameter(subPath + 'eventid', trigger.eventid);
                break;
            case 'state-change':
                storeStringParameter(subPath + 'type', trigger.type);
                storeStringParameter(subPath + 'name', trigger.name);
                storeStringParameter(subPath + 'state', trigger.state);
                break;
            case 'addon-state-change':
                storeStringParameter(subPath + 'type', trigger.type);
                storeStringParameter(subPath + 'addon-id', trigger.addonId);
                storeStringParameter(subPath + 'name', trigger.name);
                storeStringParameter(subPath + 'state', trigger.state);
                break;
        }

    });
}

function storeStringParameter(path, value) {
    Property.setSavedProperty(path, '' + value);
}

function storeIntParameter(path, value) {
    if (isNaN(parseInt(value))) {
        throw new Error('wrong argument types. path: ' + path + ', value: ' + value);
    }
    Property.setSavedProperty(path, parseInt(value));
}

function storeBoolParameter(path, value) {
    if (typeof(value) === 'boolean') {
        Property.setSavedProperty(path, value);
    } else if (typeof(value) === 'string') {
        value = value === 'true';
        Property.setSavedProperty(path, value);
    } else {
        throw new Error('wrong argument types. path: ' + path + ', value: ' + value);
    }
}

function storeDSUIDParameter(path, dsuid, dsid) {
    if (typeof(dsuid) === 'string') {
        Property.setSavedProperty(path, dsuid);
    } else if (typeof(dsid) === 'string') {
        Property.setSavedProperty(path, dSID2dSUID(dsid));
    } else {
        throw new Error('wrong argument types. path: ' + path + ', value: ' + value);
    }
}

function dSID2dSUID(dSID) {
    try {
        var dSUID = dSID.slice(0, 12); // copy the first 6 bytes (12 characters to the new dsuid
        dSUID += '00000000'; // insert 4 bytes of 0
        dSUID += dSID.slice(12, 24); // append the remaining 6 bytes (12 chars) of the dsid
        dSUID += '00'; // finaly add 1 byte of 0
        return dSUID;
    } catch (e) {
        throw new Error('invalid dSID ' + dSID);
    }
}

function toggleActivity(ids, enable) {
    var success = false;

    var entriesNode = Property.getNode('entries');
    if (!entriesNode) {
        return success;
    }

    ids = JSON.parse(ids);
    ids.forEach(function(id) {
        var sanityCheck = Property.getNode('entries/' + id);
        if (sanityCheck) {
            Property.setSavedProperty('entries/' + id + '/conditions/enabled', enable);
            success = true;
        }
    });
    Property.store();

    return success;
}



var success = false;
var actions = raisedEvent.parameter.actions;
if (actions === 'save') {

    try {
        success = storeActivity(raisedEvent.parameter.activity);
    } catch (e) {
        Log.logln('Error: ' + e.stack);
    }

    new Event('tado.response', {
        actions: 'activity.save',
        ok: success
    }).raise();

} else if (actions === 'enable') {

    try {
        success = toggleActivity(raisedEvent.parameter.ids, true);
    } catch (e) {
        Log.logln('Error: ' + e.stack);
    }

    new Event('tado.response', {
        actions: 'activity.enable',
        ok: success
    }).raise();

} else if (actions === 'disable') {

    try {
        success = toggleActivity(raisedEvent.parameter.ids, false);
    } catch (e) {
        Log.logln('Error: ' + e.stack);
    }

    new Event('tado.response', {
        actions: 'activity.disable',
        ok: success
    }).raise();

} else if (actions === 'delete') {

    try {
        var entriesNode = Property.getNode('entries');
        if (entriesNode) {
            var ids = JSON.parse(raisedEvent.parameter.ids);
            ids.forEach(function(id) {
                entriesNode.removeChild(id);
                unregisterTrigger(entriesNode.getPath() + '/' + id);
                success = true;
            });
            Property.store();
        } else {
            success = true;
        }
    } catch (e) {
        Log.logln('Error: ' + e.stack);
    }

    new Event('tado.response', {
        actions: 'activity.delete',
        ok: success
    }).raise();

} else if (actions === 'test') {

    try {
        new Event('tado.execute', {
            action: raisedEvent.parameter.action
        }).raise();
        success = true;
    } catch (e) {
        Log.logln('Error: ' + e.stack);
    }

    new Event('tado.response', {
        actions: 'activity.test',
        ok: success
    }).raise();

}

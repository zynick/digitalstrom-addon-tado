try {
    Property.load();

    var entriesNode = Property.getNode('entries');
    if (entriesNode) {
        entriesNode.getChildren().forEach(function(entryNode) {
            var id = entryNode.getChild('id').getValue();
            var actionNode = entryNode.getChild('action');
            if (!actionNode) {
                return;
            }

            var deviceId = actionNode.getChild('deviceId').getValue();

            var setting = {};
            var settingNode = actionNode.getChild('setting');
            setting.power = settingNode.getChild('power').getValue();
            setting.type = settingNode.getChild('type').getValue();
            if (setting.power === 'ON') {
                setting.mode = settingNode.getChild('mode').getValue();

                var temperatureNode = settingNode.getChild('temperature');
                if (temperatureNode) {
                    var celsiusNode = temperatureNode.getChild('celsius');
                    if (celsiusNode) {
                        setting.temperature = {
                            celsius: celsiusNode.getValue()
                        };
                    }
                }

                var fanSpeedNode = settingNode.getChild('fanSpeed');
                if (fanSpeedNode) {
                    setting.fanSpeed = fanSpeedNode.getValue();
                }

                var swingNode = settingNode.getChild('swing');
                if (swingNode) {
                    setting.swing = swingNode.getValue();
                }
            }

            var action = {
                deviceId: deviceId,
                setting: setting
            };
            action = encodeURIComponent(JSON.stringify(action)); // FIXME best if this LOC can be removed. see http://imgur.com/a/MeWOk
            registerTrigger('/scripts/tado/entries/' + id, 'tado.execute', {
                action: action
            });
        });
    }
} catch (e) {
    Log.logln('Error: ' + e.stack);
}

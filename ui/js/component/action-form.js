Ext.define('SMARTBOX.component.TadoActionForm', {
    extend: 'DSS.component.Base',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    deviceBox: null,
    powerBox: null,
    modeBox: null,
    celsiusBox: null,
    fanSpeedBox: null,
    swingBox: null,
    currentCapabilities: null, // store selected device capabilities

    loadActionDeviceStore: function(devices) {
        // console.log('action-form.loadActionDeviceStore()');
        this.deviceBox.getStore().removeAll();
        this.deviceBox.getStore().add(devices);
    },

    constructor: function(root) {
        var me = this;

        this.deviceBox = Ext.create('Ext.form.field.ComboBox', {
            name: 'in-device',
            fieldLabel: _('Device'),
            emptyText: _('No Device Selected'),
            store: Ext.create('Ext.data.Store', {
                fields: ['id', 'name', 'homeId', 'homeName', 'zoneId', 'zoneName', 'zoneType', 'zoneCapabilities'],
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json',
                        root: 'items'
                    }
                },
                sorters: [{
                    property: 'name',
                    direction: 'ASC'
                }]
            }),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name',
            listeners: {
                change: function(field, deviceName, oldDeviceName) {
                    // console.log('control.deviceBox.listener.change()', arguments);

                    me.modeBox.clearValue();
                    var modeStore = me.modeBox.getStore();
                    modeStore.removeAll();
                    me.currentCapabilities = null;

                    var device = this.getStore().findRecord('name', deviceName, null, null, true, true);
                    if (!device) {
                        return;
                    }

                    if (me.powerBox.getValue()) {
                        var capabilities = device.get('zoneCapabilities');
                        me.currentCapabilities = capabilities;
                        if (capabilities.COOL) {
                            modeStore.add({
                                name: 'COOL'
                            });
                        }
                        if (capabilities.DRY) {
                            modeStore.add({
                                name: 'DRY'
                            });
                        }
                        if (capabilities.FAN) {
                            modeStore.add({
                                name: 'FAN'
                            });
                        }
                        if (capabilities.AUTO) {
                            modeStore.add({
                                name: 'AUTO'
                            });
                        }
                        if (capabilities.HEAT) {
                            modeStore.add({
                                name: 'HEAT'
                            });
                        }

                        me.modeBox.setValue(modeStore.first().get('name'));
                    }
                }
            }
        });
        // this.deviceBox.bindStore(deviceStore);

        this.powerBox = Ext.create('Ext.form.field.Checkbox', {
            name: 'in-power',
            fieldLabel: _('Power'),
            boxLabel: _('On'),
            listeners: {
                change: function(field, checked, oldChecked) {
                    // console.log('control.powerBox.listener.change()', arguments);

                    if (checked) {
                        var deviceName = me.deviceBox.getValue();
                        var device = me.deviceBox.getStore().findRecord('name', deviceName, null, null, true, true);
                        if (!device) {
                            return;
                        }

                        var modeStore = me.modeBox.getStore();
                        var capabilities = device.get('zoneCapabilities');
                        me.currentCapabilities = capabilities;
                        if (capabilities.COOL) {
                            modeStore.add({
                                name: 'COOL'
                            });
                        }
                        if (capabilities.DRY) {
                            modeStore.add({
                                name: 'DRY'
                            });
                        }
                        if (capabilities.FAN) {
                            modeStore.add({
                                name: 'FAN'
                            });
                        }
                        if (capabilities.AUTO) {
                            modeStore.add({
                                name: 'AUTO'
                            });
                        }
                        if (capabilities.HEAT) {
                            modeStore.add({
                                name: 'HEAT'
                            });
                        }

                        me.modeBox.setValue(modeStore.first().get('name'));
                    } else {
                        me.modeBox.clearValue();
                        me.modeBox.getStore().removeAll();
                        me.currentCapabilities = null;
                    }
                }
            }
        });

        this.modeBox = Ext.create('Ext.form.field.ComboBox', {
            name: 'in-mode',
            fieldLabel: _('Mode'),
            store: Ext.create('Ext.data.Store', {
                fields: ['name']
            }),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name',
            listeners: {
                change: function(field, mode, oldMode) {
                    // console.log('control.modeBox.listener.change()', arguments);

                    me.celsiusBox.clearValue();
                    me.fanSpeedBox.clearValue();
                    me.swingBox.clearValue();

                    me.celsiusBox.getStore().removeAll();
                    me.fanSpeedBox.getStore().removeAll();
                    me.swingBox.getStore().removeAll();

                    if (!me.currentCapabilities || !me.currentCapabilities[mode]) {
                        return;
                    }

                    var option = me.currentCapabilities[mode];

                    var temperatures = option.temperatures;
                    if (temperatures) {
                        var celsius = temperatures.celsius;
                        var celsiusStore = me.celsiusBox.getStore();
                        for (var i = celsius.min; i <= celsius.max; i += celsius.step) {
                            celsiusStore.add({
                                name: i
                            });
                        }
                        me.celsiusBox.setValue(celsius.min);
                    }

                    var fanSpeeds = option.fanSpeeds;
                    if (fanSpeeds) {
                        var fanSpeedStore = me.fanSpeedBox.getStore();
                        fanSpeeds.forEach(function(fanSpeed) {
                            fanSpeedStore.add({
                                name: fanSpeed
                            });
                        });
                        me.fanSpeedBox.setValue(fanSpeeds[0]);
                    }

                    var swings = option.swings;
                    if (swings) {
                        var swingStore = me.swingBox.getStore();
                        swings.forEach(function(swing) {
                            swingStore.add({
                                name: swing
                            });
                        });
                        me.swingBox.setValue(swings[0]);
                    }
                }
            }
        });

        this.celsiusBox = Ext.create('Ext.form.field.ComboBox', {
            name: 'in-celsius',
            fieldLabel: _('Temperature (°C)'),
            store: Ext.create('Ext.data.Store', {
                fields: ['name']
            }),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name'
        });

        this.fanSpeedBox = Ext.create('Ext.form.field.ComboBox', {
            name: 'in-fan-speed',
            fieldLabel: _('Fan Speed'),
            store: Ext.create('Ext.data.Store', {
                fields: ['name']
            }),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name'
        });

        this.swingBox = Ext.create('Ext.form.field.ComboBox', {
            name: 'in-swing',
            fieldLabel: _('Swing'),
            store: Ext.create('Ext.data.Store', {
                fields: ['name']
            }),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'name'
        });

        var remotePanel = Ext.create('Ext.form.Panel', {
            padding: '5 10 5 10',
            border: 0,
            items: [this.deviceBox, this.powerBox, this.modeBox, this.celsiusBox, this.fanSpeedBox, this.swingBox],
        });

        Ext.apply(this, {
            items: [remotePanel]
        });

        this.callParent(arguments);
    },

    reset: function() {
        // console.log('control.reset()', arguments);
        var first = this.deviceBox.getStore().getCount() ? this.deviceBox.getStore().first().get('name') : '';
        this.deviceBox.setValue(first);
        this.powerBox.setValue(true);
    },

    isValid: function() {
        var deviceName = this.deviceBox.getValue();
        var device = this.deviceBox.getStore().findRecord('name', deviceName, null, null, true, true);
        if (!device) {
            Ext.MessageBox.alert(_('Info'), _('Invalid device.'));
            return false;
        }

        if (!this.powerBox.getValue()) {
            return true;
        }

        var mode = this.modeBox.getValue();
        if (!this.currentCapabilities) {
            Ext.MessageBox.alert(_('Info'), _('Invalid device.'));
            return false;
        }
        var capabilities = this.currentCapabilities[mode];
        if (!capabilities) {
            Ext.MessageBox.alert(_('Info'), _('Invalid control mode.'));
            return false;
        }

        var celsius = this.celsiusBox.getValue();
        var temperatures = capabilities.temperatures;
        if (temperatures) {
            if (!celsius || isNaN(celsius)) {
                Ext.MessageBox.alert(_('Info'), _('Invalid control temperature.'));
                return false;
            }

            celsius = parseInt(celsius);
            if (celsius < temperatures.celsius.min || celsius > temperatures.celsius.max) {
                Ext.MessageBox.alert(_('Info'), _('Invalid control temperature (°C).'));
                return false;
            }
        } else if (celsius) {
            Ext.MessageBox.alert(_('Info'), _('Control temperature should be empty.'));
            return false;
        }

        var fanSpeed = this.fanSpeedBox.getValue();
        var fanSpeeds = capabilities.fanSpeeds;
        if (fanSpeeds) {
            if (fanSpeeds.indexOf(fanSpeed) < 0) {
                Ext.MessageBox.alert(_('Info'), _('Invalid control fan speed.'));
                return false;
            }
        } else if (fanSpeed) {
            Ext.MessageBox.alert(_('Info'), _('Control fan speed should be empty.'));
            return false;
        }

        var swing = this.swingBox.getValue();
        var swings = capabilities.swings;
        if (swings) {
            if (swings.indexOf(swing) < 0) {
                Ext.MessageBox.alert(_('Info'), _('Invalid control swing.'));
                return false;
            }
        } else if (swing) {
            Ext.MessageBox.alert(_('Info'), _('Control swing should be empty.'));
            return false;
        }

        return true;
    },

    getValue: function() {

        var deviceName = this.deviceBox.getValue();
        var device = this.deviceBox
            .getStore()
            .findRecord('name', deviceName, null, null, true, true);
        var deviceId = device.get('id');
        var deviceZoneType = device.get('zoneType');

        var setting = {
            type: deviceZoneType
        };
        var power = this.powerBox.getValue();
        if (power) {
            setting.power = 'ON';
            setting.mode = this.modeBox.getValue();

            var celsius = this.celsiusBox.getValue();
            if (celsius) {
                setting.temperature = {
                    celsius: celsius
                }
            }

            var fanSpeed = this.fanSpeedBox.getValue();
            if (fanSpeed) {
                setting.fanSpeed = fanSpeed;
            }

            var swing = this.swingBox.getValue();
            if (swing) {
                setting.swing = swing;
            }
        } else {
            setting.power = 'OFF';
        }

        var json = {
            deviceId: deviceId,
            setting: setting
        };

        // console.log('control.getValue()', json);
        return json;
    },

    setValue: function(json) {
        // console.log('control.setValue()', arguments);

        // not sure why it's in array, thus convert to object
        if (json instanceof Array) {
            json = json[0];
        }

        var device = this.deviceBox.getStore().findRecord('id', json.deviceId, null, null, true, true);
        if (!device) {
            return;
        }
        this.deviceBox.setValue(device.get('name'));

        var setting = json.setting;
        var power = setting.power === 'ON';
        this.powerBox.setValue(power);

        if (power) {
            this.modeBox.setValue(setting.mode);

            if (setting.temperature && setting.temperature.celsius) {
                this.celsiusBox.setValue(setting.temperature.celsius);
            }

            if (setting.fanSpeed) {
                this.fanSpeedBox.setValue(setting.fanSpeed);
            }

            if (setting.swing) {
                this.swingBox.setValue(setting.swing);
            }
        }
    }
});

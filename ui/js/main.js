/**
 * This code is written by referring to sonos-controller add-on
 * https://git.digitalstrom.org/dss-add-ons/sonos
 * If you can understand sonos-controller code, you can definitely understand this code
 *
 * Quick start reference:
 * http://redmine.digitalstrom.org/projects/dss/wiki/DSS_addon_framework_introduction
 */

Ext.define('SMARTBOX.addon.Tado', {
    extend: 'DSS.addon.Framework',

    config: {
        appName: 'tado°',
        appIcon: 'default_icon.png',
        appVersion: '0.0.1',
        appId: 'tado',
        dSSVersion: '1.11.2.1'
    },

    mainAddonPanel: null,
    activityTab: null,
    deviceTab: null,
    setupTabs: function(status) {
        // console.log('main.setupTabs()');

        if (!this.callbackSetupTabs) {
            var me = this;
            this.callbackSetupTabs = function(response) {
                if (response.actions !== 'config.isConnected') {
                    return;
                }

                if (response.ok === 'true') {
                    me.mainAddonPanel.setActiveTab(1);
                    me.activityTab.setDisabled(false);
                    me.deviceTab.setDisabled(false);
                } else {
                    me.mainAddonPanel.setActiveTab(0);
                    me.activityTab.setDisabled(true);
                    me.deviceTab.setDisabled(true);
                }
            };
            callbackFunctions.push(this.callbackSetupTabs);
        }

        if (status === 'log-in') {
            this.activityTab.setDisabled(false);
            this.deviceTab.setDisabled(false);
            this.mainAddonPanel.setActiveTab(1);
        } else if (status === 'log-out') {
            this.activityTab.setDisabled(true);
            this.deviceTab.setDisabled(true);
            this.mainAddonPanel.setActiveTab(0);
        } else {
            dss.raiseEvent('tado.config', {
                actions: 'isConnected',
            });
        }
    },

    loadDevicePanelParameter: function(grid) {
        // console.log('main.loadDevicePanelParameter()', arguments);

        var me = this;
        grid.setStatus(_('Loading ...'));
        grid.setDisabled(true);

        try {
            var response = dss.ajaxSyncRequest('/json/property/query', {
                'query': '/scripts/tado/devices/*(*)'
            });
            response = Ext.JSON.decode(parseResponseFromBrokenDSFramework(response));
            if (response.result && response.result.devices) {
                var devices = response.result.devices;
                devices.forEach(function(device) {
                    device.zoneCapabilities = JSON.parse(device.zoneCapabilities);
                });
                grid.loadParameter(devices);
            }
        } catch (e) {
            console.error(e);
        }

        grid.setStatus(_('Ready'));
        grid.setDisabled(false);
    },

    loadActivityPanelParameter: function(grid, componentActionForm) {
        // console.log('main.loadActivityPanelParameter()', arguments);

        grid.setStatus(_('Loading ...'));
        grid.setDisabled(true);
        var waitDialog = new Ext.LoadMask(Ext.getBody(), {
            msg: _('Loading...'),
            indicator: false
        });
        waitDialog.show();

        try {
            // get devices
            var response = dss.ajaxSyncRequest('/json/property/query', {
                'query': '/scripts/tado/devices/*(*)'
            });
            response = Ext.JSON.decode(parseResponseFromBrokenDSFramework(response));
            var devices = [];
            if (response.result && response.result.devices) {
                response.result.devices.forEach(function(device) {
                    device.zoneCapabilities = JSON.parse(device.zoneCapabilities);
                });
                devices = response.result.devices;
                componentActionForm.loadActionDeviceStore(devices);
            }

            // get entries
            response = dss.ajaxSyncRequest('/json/property/query2', {
                'query': '/scripts/tado/entries/*(*)/*(*)/*(*)/*(*)'
            });
            response = Ext.JSON.decode(response);

            var rows = [];
            if (response.result) {
                for (var _id in response.result) {
                    var row = {};
                    var item = response.result[_id];

                    row.id = item.id;
                    row.conditions = item.conditions;
                    row.disabled = false;
                    if (item.conditions && item.conditions.enabled !== undefined) {
                        row.disabled = !item.conditions.enabled;
                    }

                    row.triggers = [];
                    for (var key in item.triggers) {
                        row.triggers.push(item.triggers[key]);
                    }
                    for (var i = 0; i < row.triggers.length; i++) {
                        if (row.triggers[i].type === 'bus-zone-scene') {
                            row.triggers[i].type = 'zone-scene';
                        }
                    }

                    row.action = item.action;

                    var deviceId = item.action.deviceId;
                    devices.forEach(function(device) { // jshint ignore:line
                        if (device.id === deviceId) {
                            row.device = device.name;
                        }
                    });

                    if (item.target) {
                        if (item.target.singularyZone) {
                            row.target = {
                                singularyZone: []
                            };
                            for (key in item.target.singularyZone) {
                                row.target.singularyZone.push(item.target.singularyZone[key]);
                            }
                        } else {
                            row.target = {
                                grouped: []
                            };
                            for (key in item.target.grouped) {
                                row.target.grouped.push(item.target.grouped[key]);
                            }
                        }
                    }

                    rows.push(row);
                }

                grid.loadParameter(rows);
            }

        } catch (e) {
            console.error(e);
        }

        grid.setStatus(_('Ready'));
        grid.setDisabled(false);
        waitDialog.hide();
    },

    getContent: function() {
        var configurationTab = Ext.create('Ext.panel.Panel', {
            title: _('Configurations'),
            layout: 'fit',
            items: [getConfigurationPanel(this)]
        });
        this.activityTab = Ext.create('Ext.panel.Panel', {
            title: _('Activities'),
            layout: 'fit',
            items: [getActivityPanel(this)]
        });
        this.deviceTab = Ext.create('Ext.panel.Panel', {
            title: _('Devices'),
            layout: 'fit',
            items: [getDevicePanel(this)]
        });
        this.mainAddonPanel = Ext.create('Ext.tab.Panel', {
            layout: 'fit',
            items: [configurationTab, this.activityTab, this.deviceTab]
        });

        this.setupTabs();

        return this.mainAddonPanel;
    },

    getHelp: function() {
        return Ext.create('Ext.Component', {
            whiteSpace: 'normal',
            padding: '10 10 10 10',
            loader: {
                url: 'locale/' + dss.staticDataModel.activeLanguage + '/help.html',
                autoLoad: true,
                disableCaching: false
            }
        });
    }
});


Ext.onReady(function() {
    startCallbackListener();
    dss.buildUpLang(['locale/{languageSuffix}/tado.po']);
    Ext.create('SMARTBOX.addon.Tado').initPage();
});

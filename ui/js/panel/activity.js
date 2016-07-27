function getActivityPanel(root) {

    var componentActionForm = Ext.create('SMARTBOX.component.TadoActionForm', root);

    var activityPanelConfigs = {
        defaultSortCol: 'roomName',
        disabledProperty: 'disabled',
        inactiveDisabledProperty: 'predefined',
        storeConfig: {
            fields: [{
                name: 'id'
            }, {
                name: 'disabled',
                sortType: 'asBoolean'
            }, {
                name: 'triggers',
                sortType: 'asTrigger'
            }, {
                name: 'device',
                sortType: 'asUCText'
            }, {
                name: 'action',
                sortType: 'asUCText'
            }, {
                name: 'conditions'
            }]
        },
        multiselect: true,
        columns: [{
            header: _('Active'),
            dataIndex: 'disabled',
            resizable: false,
            xtype: 'disabledcolumn',
            width: 50
        }, {
            header: _('Trigger'),
            dataIndex: 'triggers',
            xtype: 'triggercolumn',
            flex: 2
        }, {
            header: _('Device'),
            dataIndex: 'device',
            xtype: 'textcolumn',
            flex: 2
        }, {
            header: _('Action'),
            dataIndex: 'action',
            xtype: 'textcolumn',
            flex: 2,
            customColumnRenderer: function(action, metadata, record, rowIdx, colIdx, store, view) {
                var setting = action.setting;
                if (setting.power === 'OFF') {
                    return _('Power OFF');
                }
                var text = setting.mode + ' ' + _('Mode');
                if (setting.temperature && setting.temperature.celsius) {
                    text += ', ' + setting.temperature.celsius + '°C';
                }
                if (setting.fanSpeed) {
                    text += ', ' + setting.fanSpeed + ' ' + _('Fan Speed');
                }
                if (setting.swing) {
                    text += ', ' + setting.swing + ' ' +  _('swing');
                }
                return text;
            }
        }],
        buttonText: {
            newButton: _('New Activity'),
            editButton: _('Edit Activity'),
            deleteButton: _('Delete Activity'),
            disableButton: _('Deactivate Activity'),
            enableButton: _('Activate Activity'),
            testButton: _('Test Activity'),
        },
        editorConfig: {
            title: _('Manage Activity'),
            staticControls: [{
                type: 'hidden',
                id: 'id'
            }],
            tabControls: [{
                tabLabel: _('Trigger'),
                defaultTabOnNew: true,
                tabDescription: _('Choose the triggering activity for the message. You can choose more than one activity as trigger.'),
                content: [{
                    type: 'TriggerConfigurator',
                    id: 'triggers',
                    flex: true
                }]
            }, {
                tabLabel: _('Action'),
                defaultTabOnEdit: true,
                tabDescription: _('Set the command to be executed.'),
                content: [{
                    type: 'custom',
                    id: 'action',
                    control: componentActionForm
                }]
            }],
        },
        listeners: {
            loadDataStore: function(grid) {
                // console.log('activity.loadDataStore()', arguments);
                root.loadActivityPanelParameter(grid, componentActionForm);
            },
            saveEntry: function(grid, entry) {
                // console.log('activity.saveEntry()', arguments);

                grid.setStatus(_('Saving...'));
                grid.setDisabled(true);
                var waitDialog = new Ext.LoadMask(Ext.getBody(), {
                    msg: _('Saving, please wait...'),
                    indicator: false
                });
                waitDialog.show();

                if (!root.callbackActivitySave) {
                    root.callbackActivitySave = function(response) {
                        if (response.actions !== 'activity.save') {
                            return;
                        }
                        grid.setStatus(_('Ready'));
                        grid.setDisabled(false);
                        root.loadActivityPanelParameter(grid, componentActionForm);
                        waitDialog.hide();

                        // var message = response.ok === 'true' ? _('Saved successfully.') : _('Unable to save.');
                        // Ext.MessageBox.alert(_('Info'), message);
                    };
                    callbackFunctions.push(root.callbackActivitySave);
                }

                dss.raiseEvent('tado.activity', {
                    actions: 'save',
                    activity: Ext.JSON.encode(entry)
                });
            },
            deleteEntry: function(grid, entries) {
                // console.log('activity.deleteEntry()', arguments);

                grid.setStatus(_('Saving...'));
                grid.setDisabled(true);
                var waitDialog = new Ext.LoadMask(Ext.getBody(), {
                    msg: _('Saving, please wait...'),
                    indicator: false
                });
                waitDialog.show();

                var ids = [];
                if (!(entries instanceof Array)) {
                    entries = [entries];
                }
                entries.forEach(function(entry) {
                    ids.push(entry.get('id'));
                });

                if (!root.callbackActivityDelete) {
                    root.callbackActivityDelete = function(response) {
                        if (response.actions !== 'activity.delete') {
                            return;
                        }
                        grid.setStatus(_('Ready'));
                        grid.setDisabled(false);
                        root.loadActivityPanelParameter(grid, componentActionForm);
                        waitDialog.hide();
                    };
                    callbackFunctions.push(root.callbackActivityDelete);
                }

                dss.raiseEvent('tado.activity', {
                    actions: 'delete',
                    ids: Ext.JSON.encode(ids)
                });
            },
            disableEntry: function(grid, entries) {
                // console.log('activity.disableEntry()', arguments);

                grid.setStatus(_('Saving...'));
                grid.setDisabled(true);
                var waitDialog = new Ext.LoadMask(Ext.getBody(), {
                    msg: _('Saving, please wait...'),
                    indicator: false
                });
                waitDialog.show();

                var ids = [];
                if (!(entries instanceof Array)) {
                    entries = [entries];
                }
                entries.forEach(function(entry) {
                    ids.push(entry.get('id'));
                });

                if (!root.callbackActivityDisable) {
                    root.callbackActivityDisable = function(response) {
                        if (response.actions !== 'activity.disable') {
                            return;
                        }
                        grid.setStatus(_('Ready'));
                        grid.setDisabled(false);
                        root.loadActivityPanelParameter(grid, componentActionForm);
                        waitDialog.hide();
                    };
                    callbackFunctions.push(root.callbackActivityDisable);
                }

                dss.raiseEvent('tado.activity', {
                    actions: 'disable',
                    ids: Ext.JSON.encode(ids)
                });
            },
            enableEntry: function(grid, entries) {
                // console.log('activity.enableEntry()', arguments);

                grid.setStatus(_('Saving...'));
                grid.setDisabled(true);
                var waitDialog = new Ext.LoadMask(Ext.getBody(), {
                    msg: _('Saving, please wait...'),
                    indicator: false
                });
                waitDialog.show();

                var ids = [];
                if (!(entries instanceof Array)) {
                    entries = [entries];
                }
                entries.forEach(function(entry) {
                    ids.push(entry.get('id'));
                });

                if (!root.callbackActivityEnable) {
                    root.callbackActivityEnable = function(response) {
                        if (response.actions !== 'activity.enable') {
                            return;
                        }
                        grid.setStatus(_('Ready'));
                        grid.setDisabled(false);
                        root.loadActivityPanelParameter(grid, componentActionForm);
                        waitDialog.hide();
                    };
                    callbackFunctions.push(root.callbackActivityEnable);
                }

                dss.raiseEvent('tado.activity', {
                    actions: 'enable',
                    ids: Ext.JSON.encode(ids)
                });
            },
            testEntry: function(grid, entry) {
                // console.log('activity.testEntry()', arguments);

                var waitDialog = new Ext.LoadMask(Ext.getBody(), {
                    msg: _('Testing activity in progress. Please wait...')
                });
                waitDialog.show();

                var action = entry.get('action');

                if (!root.callbackActivityTest) {
                    root.callbackActivityTest = function(response) {
                        if (response.actions !== 'activity.test') {
                            return;
                        }
                        waitDialog.hide();
                    };
                    callbackFunctions.push(root.callbackActivityTest);
                }

                dss.raiseEvent('tado.activity', {
                    actions: 'test',
                    action: Ext.JSON.encode(action)
                });
            }
        }
    };

    var activityPanel = Ext.create('DSS.gridPanel', activityPanelConfigs);

    return activityPanel;
}

function getDevicePanel(root) {

    var devicePanelConfigs = {
        defaultSortCol: 'name',
        disabledProperty: 'disabled',
        inactiveDisabledProperty: 'checkboxShouldBeEnabled',
        storeConfig: {
            storeId: 'device_store',
            fields: ['id', 'name', 'homeId', 'homeName', 'zoneId', 'zoneName', 'zoneType', 'zoneCapabilities']
        },
        multiselect: true,
        columns: [{
            header: _('Name'),
            dataIndex: 'name',
            xtype: 'textcolumn',
            flex: 2
        }, {
            header: _('Home'),
            dataIndex: 'homeId',
            xtype: 'textcolumn',
            flex: 1,
            customColumnRenderer: function(val, metadata, record, rowIdx, colIdx, store, view) {
                var homeId = val;
                var homeName = record.get('homeName');
                return homeName + ' (' + homeId + ')';
            }
        }, {
            header: _('Zone'),
            dataIndex: 'zoneId',
            xtype: 'textcolumn',
            flex: 1,
            customColumnRenderer: function(val, metadata, record, rowIdx, colIdx, store, view) {
                var zoneId = val;
                var zoneName = record.get('zoneName');
                return zoneName + ' (' + zoneId + ')';
            }
        }, {
            header: _('Type'),
            dataIndex: 'zoneType',
            xtype: 'textcolumn',
            flex: 1
        }],
        buttonText: {
            editButton: _('Edit Name')
        },
        customButtons: [{
            text: _('Update from tado Server'),
            iconCls: 'icon-server-update',
            handler: function(grid, entry) {
                // console.log('device.serverUpdate()', arguments);

                grid.setStatus(_('Saving...'));
                grid.setDisabled(true);
                var waitDialog = new Ext.LoadMask(Ext.getBody(), {
                    msg: _('Getting update from tado server...'),
                    indicator: false
                });
                waitDialog.show();

                if (!root.callbackDeviceServerUpdate) {
                    root.callbackDeviceServerUpdate = function(response) {
                        if (response.actions !== 'config.update') {
                            return;
                        }

                        grid.setStatus(_('Ready'));
                        grid.setDisabled(false);
                        waitDialog.hide();

                        if (response.ok !== 'true') {
                            Ext.MessageBox.alert('Error', 'Unable to login to tado server. Please check your login credentials.');
                            root.setupTabs('log-out');
                            return;
                        }

                        root.loadDevicePanelParameter(grid);
                    };
                    callbackFunctions.push(root.callbackDeviceServerUpdate);
                }

                dss.raiseEvent('tado.config', {
                    actions: 'update'
                });
            }
        }],
        editorConfig: {
            title: _('Device Info'),
            staticControls: [{
                id: 'id',
                type: 'hidden'
            }, {
                id: 'name',
                type: 'custom',
                /**
                 * reference: https://git.digitalstrom.org/dss-add-ons/dss-addon-framework/blob/master/js/dss/dss-edit-dialog.js#L182
                 * not going to use 'DSS.component.Textedit' because of
                 * unnecessary encoding/decoding (see below link), so just copy its settings
                 * https://git.digitalstrom.org/dss-add-ons/dss-addon-framework/blob/master/js/dss/dss-components/dss-textedit-control.js#L18
                 */
                control: Ext.create('Ext.form.field.Text', {
                    name: 'name',
                    fieldLabel: _('Name'),
                    labelWidth: 100,
                    allowBlank: false,
                    blankText: _('This field is required'),
                    invalidText: _('The value in this field is invalid'),
                    width: 345,
                    inputWidth: 245,
                    myID: 'name',
                    valueToRaw: function(value) {
                        return value || '';
                    },
                    rawToValue: function(value) {
                        return value !== '' ? value : null;
                    }
                })
            }, {
                id: 'homeName',
                type: 'custom',
                control: Ext.create('Ext.form.field.Display', {
                    fieldLabel: _('Home'),
                    height: 20
                })
            }, {
                id: 'zoneName',
                type: 'custom',
                control: Ext.create('Ext.form.field.Display', {
                    fieldLabel: _('Zone'),
                    height: 20
                })
            }, {
                id: 'zoneType',
                type: 'custom',
                control: Ext.create('Ext.form.field.Display', {
                    fieldLabel: _('Type'),
                    height: 20,
                    // https://git.digitalstrom.org/dss-add-ons/dss-addon-framework/blob/master/js/dss/dss-edit-dialog.js#L78
                    getHeight: function() {
                        return 40;
                    }
                })
            }],
        },
        listeners: {
            loadDataStore: function(grid) {
                // console.log('device.loadDataStore()', arguments);
                root.loadDevicePanelParameter(grid);
            },
            saveEntry: function(grid, entry) {
                // console.log('device.saveEntry()', arguments);

                grid.setStatus(_('Saving...'));
                grid.setDisabled(true);
                var waitDialog = new Ext.LoadMask(Ext.getBody(), {
                    msg: _('Saving, please wait...'),
                    indicator: false
                });
                waitDialog.show();

                if (!root.callbackDeviceSave) {
                    root.callbackDeviceSave = function(response) {
                        if (response.actions !== 'device.save') {
                            return;
                        }
                        grid.setStatus(_('Ready'));
                        grid.setDisabled(false);

                        dss.staticDataModel.refreshDataModel(); // refresh both device & activity tab

                        waitDialog.hide();
                    };
                    callbackFunctions.push(root.callbackDeviceSave);
                }

                dss.raiseEvent('tado.device', {
                    actions: 'save',
                    id: entry.id,
                    name: entry.name
                });
            }
        }
    };

    var devicePanel = Ext.create('DSS.gridPanel', devicePanelConfigs);
    devicePanel.editorWindow.setWidth(420);

    return devicePanel;
}

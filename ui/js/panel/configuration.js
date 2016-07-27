function getConfigurationPanel(root) {

    var loginField = Ext.create('Ext.form.FieldSet', {
        title: _('Login'),
        padding: '10px',
        defaultType: 'textfield',
        items: [{
            id: 'username',
            name: 'username',
            fieldLabel: _('Username'),
            allowBlank: false,
            blankText: _('Username must be provided'),
            invalidText: _('Username must be provided'),
        }, {
            id: 'password',
            name: 'password',
            fieldLabel: _('Password'),
            allowBlank: false,
            blankText: _('Password must be provided'),
            invalidText: _('Password must be provided'),
            inputType: 'password',
            enableKeyEvents: true,
            listeners: {
                keypress: function(textfield, eventObject) {
                    if (eventObject.getCharCode() === Ext.EventObject.ENTER) {
                        loginField.items.getByKey('btn-save').handler();
                    }
                }
            }
        }, {
            xtype: 'button',
            id: 'btn-save',
            text: _('Save'),
            handler: function() {
                var username = loginField.items.getByKey('username');
                var password = loginField.items.getByKey('password');
                if (!username.isValid() || !password.isValid()) {
                    var msg = username.getErrors()[0] || password.getErrors()[0];
                    return Ext.MessageBox.alert('Error', msg);
                }

                var waitDialog = new Ext.LoadMask(Ext.getBody(), {
                    msg: _('Saved. Getting details from tado server...'),
                    indicator: false
                });
                waitDialog.show();

                if (!root.callbackConfigurationLogin) {
                    root.callbackConfigurationLogin = function(response) {
                        if (response.actions !== 'config.login') {
                            return;
                        }

                        waitDialog.hide();

                        if (response.ok !== 'true') {
                            Ext.MessageBox.alert('Error', 'Invalid credentials.');
                            root.setupTabs('log-out');
                            return;
                        }

                        root.setupTabs('log-in');
                        dss.staticDataModel.refreshDataModel(); // refresh both device & activity tab
                    };
                    callbackFunctions.push(root.callbackConfigurationLogin);
                }

                dss.raiseEvent('tado.config', {
                    actions: 'login',
                    username: username.getValue(),
                    password: password.getValue()
                });
            }
        }]
    });

    /* get username */
    dss.ajaxAssyncRequestWithoutAnswer(
        '/json/property/getString', {
            path: '/scripts/tado/config/username'
        },
        function(json) {
            json = JSON.parse(json);
            json = json.result || {};
            loginField.items.getByKey('username').setValue(json.value);
        }
    );

    var configurationPanel = Ext.create('Ext.panel.Panel', {
        style: {
            padding: '10px'
        },
        border: 0,
        autoScroll: true,
        items: [loginField]
    });

    return configurationPanel;
}

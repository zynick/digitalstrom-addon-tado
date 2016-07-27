// listen to server response
var callbackFunctions = [];

function startCallbackListener() {

    var token = Math.floor(Math.random() * 100000000000);
    dss.ajaxSyncRequest('/json/event/subscribe', {
        subscriptionID: token,
        name: 'tado.response'
    });

    function refresh() {
        dss.ajaxAssyncRequestWithoutAnswer('/json/event/get', {
            subscriptionID: token,
            timeout: 60 * 1000
        }, function(bigFatString) {
            var noError = true;

            try {
                var bigFatResponse = Ext.JSON.decode(bigFatString);
                if (!bigFatResponse.ok) {
                    return startCallbackListener();
                }

                if (bigFatResponse.result) {
                    bigFatResponse.result.events.forEach(function(event) {
                        var response = event.properties;
                        callbackFunctions.forEach(function(listener) {
                            listener(response);
                        });
                    });
                }
            } catch (e) {
                noError = false;
                console.error(e);
            }

            if (noError) {
                refresh();
            } else {
                setTimeout(refresh, 5000); // 5 sec delay when error occurs
            }
        });
    }

    refresh();
}

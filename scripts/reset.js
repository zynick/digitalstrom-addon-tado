/**
 * For development purposes only.
 * to call this:
 * 1. access to tado add on page
 * 2. open browser console
 * 3. dss.raiseEvent('tado.reset');
 */
var tado = Property.getNode('/scripts/tado');
tado.removeChild('config');
tado.removeChild('devices');
tado.removeChild('entries');
Property.store();

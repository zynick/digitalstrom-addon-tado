// override dss.raiseEvent by removing duplicate encodeURIComponent
// https://git.digitalstrom.org/dss-add-ons/dss-addon-framework/merge_requests/41

dss.raiseEvent = function(name, params) {
  var sURL = '/json/event/raise';
  var paramString = '';
  for (var key in params) {
    paramString += key + '=' + params[key] + ';';
  }
  dss.ajaxAssyncRequestWithoutAnswer(sURL, {
    name: name,
    parameter: paramString.substr(0, paramString.length - 1)
  });
};

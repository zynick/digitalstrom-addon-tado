/**
 * sanitize value. this function should not exist if framework process data properly.
 *
 * FIXME best if this function can be removed. similar issue: http://imgur.com/a/MeWOk
 *
 * another similar issue with displaying encoded value in DSS.gridPanel
 * caused by this line:
 * https://git.digitalstrom.org/dss-add-ons/dss-addon-framework/blob/master/js/dss/dss-grid.js#L1681
 * this issue affects all add-ons, can be reproduced in any add-ons that use DSS.gridPanel
 */
function parseResponseFromBrokenDSFramework(response) {
    return decodeURIComponent(response)
        .replace(/&amp;/g, '&')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '\\"') // to separate from json's quotation
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<');
}

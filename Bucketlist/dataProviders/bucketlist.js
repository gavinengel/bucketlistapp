'use strict';

(function() {
    var provider = app.data.bucketlist = new Everlive({
        offlineStorage: true,
        appId: 'vkkvtiw1arg4eyr4',
        scheme: 'https',
        authentication: {
            persist: true
        }
    });

    function _readyTimeout() {
        if (!provider.sbReady) {
            provider.sbReady = true;
            provider._emitter.emit('sbReady');
        }
    }

    provider.sbProviderReady = function sbProviderReady(callback) {
        if (provider.sbReady) {
            return callback();
        } else {
            provider.once('sbReady', callback);
        }
    }

    document.addEventListener('online', function _appOnline() {
        provider.offline(false);
        provider.sync();
        _readyTimeout();
    });

    document.addEventListener('offline', function _appOffline() {
        provider.offline(true);
        _readyTimeout();
    });

    window.setTimeout(_readyTimeout, 2000);

}());

// START_CUSTOM_CODE_bucketlist
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
var scheme = (navigator.platform.indexOf('Linux x86_64') == -1) ? 'https' : 'http';
if (scheme != 'https') {
    app.data.bucketlist.setup.scheme = scheme;
    console.log('modified protocol for: ' + navigator.platform);
}
// END_CUSTOM_CODE_bucketlist

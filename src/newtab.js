function newtabFilesystemCheck(url, warning_el) {
    chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
        if (isAllowedAccess) {
            return document.location = url;
        } else {
            warning_el.style.display = 'block';
        }
    });
} /**/

function newtabOptions(event) {
    chrome.tabs.create({
        url: 'chrome://extensions/?id=' + chrome.runtime.id
    });
} /**/

function newtabDetectURL(url) {
    if (window.XMLHttpRequest) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                return document.location = url;
            } else {
                alert('Destination URL: "'+url+'" not found');
                return chrome.runtime.openOptionsPage();
            }
        }
        request.open('GET', url, true);
    }
} /**/

function newtabInit() {
    chrome.storage.local.get({'url': ''}, function() {
        chrome.storage.sync.get({'url':''}, function(myStorage) {
            if (myStorage.url === '') {
                return chrome.runtime.openOptionsPage();
            }
            if (myStorage.url.trimLeft().startsWith('file://')) {
                // Go straight with 'file://' protocol, no FS checks, it might return a not found page
                return newtabFilesystemCheck(myStorage.url, document.getElementById('warningPermissions'));
            } else {
                // Generic full URL, XMLHttpRequest() might now work as expected
                return newtabDetectURL(myStorage.url);
            }
        });
    });
    let grantPermission_input = document.getElementById('grantPermission');
    grantPermission_input.addEventListener('click', newtabOptions);
} /**/

// Loading DOM
document.addEventListener("DOMContentLoaded", newtabInit);

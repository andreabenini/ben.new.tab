function keyDelay(fn, ms) {
    let timer = 0;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(fn.bind(this, ...args), ms || 0);
    }
} /**/

function newtabExtensionPermissions(event) {
    chrome.tabs.create({
        url: 'chrome://extensions/?id=' + chrome.runtime.id
    });
} /**/

function newtabTestURL(event) {
    let textField = document.getElementById('url');
    window.open(textField.value, '_blank');
} /**/

function newtabInitFilesystemCheck(url, warning_el) {
    if(url.trimLeft().startsWith('file://')) {
        chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
            if (isAllowedAccess) {
                warning_el.style.display = 'none';
            } else {
                warning_el.style.display = 'block';
            }
        });
    } else {
        warning_el.style.display = 'none';
    }
} /**/

function newtabInitSaveURL(event) {
    chrome.storage.local.set({'url': event.target.value});
    chrome.storage.sync.set({'url': event.target.value});
    newtabInitFilesystemCheck(event.target.value, document.getElementById('warningPermissions'));
} /**/

function newtabInit() {
    let url_input_el = document.getElementById('url');
    let grantPermission_input_el = document.getElementById('grantPermission');
    let permissions_warning_el = document.getElementById('warningPermissions');
    let testbutton_el = document.getElementById('test');
    chrome.storage.local.get({'url': ''}, function(local_results) {
        url_input_el.value = local_results.url;
        chrome.storage.sync.get({'url': ''}, function(syncstorage) {
            if (syncstorage.url !== '') {
                url_input_el.value = syncstorage.url;
            }
        });
    });
    grantPermission_input_el.addEventListener('click', newtabExtensionPermissions);
    testbutton_el.addEventListener('click', newtabTestURL);
    newtabInitFilesystemCheck(url_input_el.value, permissions_warning_el);
    url_input_el.addEventListener('keyup', keyDelay(newtabInitSaveURL, 200));           // Autosave info after 200ms
    window.addEventListener("beforeunload", function(e){
        chrome.storage.local.set({ 'url': url_input_el.value });
        chrome.storage.sync.set( { 'url': url_input_el.value });
    }, false);
} /**/

document.addEventListener("DOMContentLoaded", newtabInit);

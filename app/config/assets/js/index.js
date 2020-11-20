'use strict';
/* global odkTables, util, odkCommon, odkData */

function display() {

    doSanityCheck();
    initButtons();
}

function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}

function initButtons() {
    // FU
    var btnFU = $('#btnFU');
    btnFU.on("click", function() {
        odkTables.launchHTML(null, 'config/assets/fu.html');
    });
    // HC
    var btnHC = $('#btnHC');
    btnHC.on("click", function() {
        odkTables.launchHTML(null, 'config/assets/hc.html');
    });
    // Sync
    var btnSync = $('#btnSync');
    btnSync.on("click", function() {
        odkCommon.doAction(null, "org.opendatakit.services.sync.actions.activities.SyncActivity", {"componentPackage": "org.opendatakit.services", "componentActivity": "org.opendatakit.services.sync.actions.activities.SyncActivity"});   
    });
}
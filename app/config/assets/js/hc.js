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
    // New data
    var btnNew = $('#btnNew');
    btnNew.on("click", function() {
        odkTables.addRowWithSurvey(
            null,
            'OPVCOVIDHC',
            'OPVCOVIDHC',
            null,
            null);
    });
    // List
    var btnList = $('#btnList');
    btnList.on("click", function() {
        odkTables.launchHTML(null, 'config/assets/hcList.html');
    });
}
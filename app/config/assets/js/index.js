/**
 * Responsible for rendering the select region screen 
 */
'use strict';
var children;
function display() {
    doSanityCheck();
    getList()
}


function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}

function getList() {
    // SQL to get children
    var sql = "SELECT _savepoint_type, REG FROM ParmaComsup";
    children = [];
    console.log("Querying database for children...");
    console.log(sql);
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " children");
        for (var row = 0; row < result.getCount(); row++) {
            var savepoint = result.getData(row,"_savepoint_type")
            var REG = result.getData(row,"REG");

            var p = { type: 'child', savepoint, REG};
            children.push(p);
        }
        console.log("Children:", children)
        initButtons();
        return;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get children from database: ' + errorMsg);
        console.error('Trying to execute the following SQL:');
        console.error(sql);
        alert("Program error Unable to look up persons.");
    }
    odkData.arbitraryQuery('ParmaComsup', sql, null, null, null, successFn, failureFn);
}

function initButtons() {
    // Region buttons
    var btn01 = $('#btn01');
    btn01.append(" <br />" + getCount(1));
    btn01.on("click", function() {
        var region = 1;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn02 = $('#btn02');
    btn02.append(" <br />" + getCount(2));
    btn02.on("click", function() {
        var region = 2;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn03 = $('#btn03');
    btn03.append(" <br />" + getCount(5));
    btn03.on("click", function() {
        var region = 5;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn04 = $('#btn04');
    btn04.append(" <br />" + getCount(7));
    btn04.on("click", function() {
        var region = 7;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn05 = $('#btn05');
    btn05.append(" <br />" + getCount(8));
    btn05.on("click", function() {
        var region = 8;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn06 = $('#btn06');
    btn06.append(" <br />" + getCount(11));
    btn06.on("click", function() {
        var region = 11;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn07 = $('#btn07');
    btn07.append(" <br />" + getCount(12));
    btn07.on("click", function() {
        var region = 12;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn08 = $('#btn08');
    btn08.append(" <br />" + getCount(13));
    btn08.on("click", function() {
        var region = 13;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn09 = $('#btn09');
    btn09.append(" <br />" + getCount(14));
    btn09.on("click", function() {
        var region = 14;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn10 = $('#btn10');
    btn10.append(" <br />" + getCount(15));
    btn10.on("click", function() {
        var region = 15;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
    var btn11 = $('#btn11');
    btn11.append(" <br />" + getCount(16));
    btn11.on("click", function() {
        var region = 16;
        var queryParams = util.setQuerystringParams(region);
        odkTables.launchHTML(null, 'config/assets/tabancaList.html' + queryParams);
    });
}

function getCount(reg) {
    var total = children.filter(child => child.REG == reg).length;
    var checked = children.filter(x => x.savepoint=="COMPLETE" && x.REG == reg).length;
    var count = "(" + checked + "/" + total + ")";
    return count;
}


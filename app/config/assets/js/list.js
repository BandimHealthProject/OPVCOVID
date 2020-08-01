/**
 * Responsible for rendering children to look up
 */
'use strict';

var children, reg, tab, displayTab;
function display() {
    console.log("List loading");
    reg = util.getQueryParameter('region');
    tab = util.getQueryParameter('tabanca');
    displayTab = util.getQueryParameter('assistant');
    
    console.log("Preparing list whith region = " + reg + " and tabanca = " + displayTab);
    // Set the header to region choosen

    var regionName = {1: "Oio", 2: "Biombo", 5: "Gabu", 7: "Cacheu", 8: "Bafata", 11: "Quinara", 12: "Tombali", 13: "Bubaque", 14: "Bolama", 15: "Sao Domingos", 16: "MSF Bafata"};
    var head = $('#main');
    head.prepend("<h1>" + regionName[reg] + " </br> <h3>" + displayTab);
    // populate list
    loadChildren();
}

function loadChildren() {
    // SQL to get children
    var varNames = "_id, _savepoint_type, DATEX, DATEX_N, DNASC, MOR, MUL, NOC, NOMECRI, NOMEMAE, REG, REGDIA, REGIDC, TAB"
    var sql = "SELECT " + varNames +
        " FROM ParmaComsup" + 
        " WHERE REG = " + reg + " AND TAB = " + tab + 
        " ORDER BY TAB, DATEX_N, MOR, MUL";
    children = [];
    console.log("Querying database for children...");
    console.log(sql);
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " children");
        for (var row = 0; row < result.getCount(); row++) {
            var rowId = result.getData(row,"_id"); // row ID 
            var savepoint = result.getData(row,"_savepoint_type")

            var DATEX = result.getData(row,"DATEX");
            var DATEX_N = result.getData(row,"DATEX_N");
            var DNASC = result.getData(row,"DNASC");
            var MOR = result.getData(row,"MOR");
            var MUL = result.getData(row,"MUL");
            var NOC = result.getData(row,"NOC");
            var NOMECRI = titleCase(result.getData(row,"NOMECRI"));
            var NOMEMAE = titleCase(result.getData(row,"NOMEMAE"));
            var REG = result.getData(row,"REG");
            var REGDIA = result.getData(row,"REGDIA");
            var REGIDC = result.getData(row,"REGIDC");
            var TAB = result.getData(row,"TAB");
            
            var p = { type: 'child', rowId, savepoint, DATEX, DATEX_N, DNASC, MOR, MUL, NOC, NOMECRI, NOMEMAE, REG, REGDIA, REGIDC, TAB};
            children.push(p);
        }
        console.log("Children:", children)
        populateView();
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

function populateView() {
    var ul = $('#li');

    // list
    $.each(children, function() {
        var that = this;      
        
        // Check if already looked up
        var check = '';
        if (this.savepoint == "COMPLETE") {
            check = "checked";
        };
        
        // set text to display
        var displayText = setDisplayText(that);

        // list
        ul.append($("<li />").append($("<button />").attr('id',this.rowId).attr('class', check + ' btn ' + this.type).append(displayText)));

        // Buttons
        var btn = ul.find('#' + this.rowId);
        btn.on("click", function() {
            openForm(that);
        })        
    });
}

function setDisplayText(child) {
    var dob;
    if (child.DNASC == "D:NS,M:NS,Y:NS" | child.DNASC === null) {
        dob = "Não Sabe";
    } else {
        dob = formatDate(child.DNASC);
    }

    var regdate;
    if (child.REGDIA == "D:NS,M:NS,Y:NS" | child.REGDIA === null) {
        regdate = "Não Sabe";
    } else {
        regdate = formatDate(child.REGDIA);
    }

    var visdate;
    if (child.DATEX == "D:NS,M:NS,Y:NS" | child.DATEX === null) {
        visdate = "Não Sabe";
    } else {
        visdate = formatDate(child.DATEX);
    }

    var displayText = "Reg: " + child.REG + "; Tab: " + child.TAB + "; Mor: " + child.MOR + "; Mul: " + child.MUL +  "<br />" + 
        "Datex: " + visdate + "<br />" +
        "Regidc: " + child.REGIDC + "; Regdia: " + regdate + "<br />" +
        "Nomecri: " + child.NOMECRI + "<br />" +
        "Nacimento: " + dob + "<br />" + 
        "Nomemãe: " + child.NOMEMAE;
    return displayText
}

function formatDate(adate) {
    var d = adate.slice(2, adate.search("M")-1);
    var m = adate.slice(adate.search("M")+2, adate.search("Y")-1);
    var y = adate.slice(adate.search("Y")+2);
    var date = d + "/" + m + "/" + y;
    return date;
}

function openForm(child) {
    console.log("Preparing form for ", child);
    var rowId = child.rowId;
    var tableId = 'ParmaComsup';
    var formId = 'ParmaComsup';

    odkTables.editRowWithSurvey(
        null,
        tableId,
        rowId,
        formId,
        null,);
}

function titleCase(str) {
    if (!str) return str;
    return str.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }
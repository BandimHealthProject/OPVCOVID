/**
 * Responsible for rendering the select region screen 
 */
'use strict';

var reg, children, tabancas;
function display() {
    console.log("Tabanca list loading");
    reg = util.getQueryParameter('region');
    
    var regionName = {1: "Oio", 2: "Biombo", 5: "Gabu", 7: "Cacheu", 8: "Bafata", 11: "Quinara", 12: "Tombali", 13: "Bubaque", 14: "Bolama", 15: "Sao Domingos", 16: "MSF Bafata"};
    var head = $('#main');
    head.prepend("<h1>" + regionName[reg] + " </br> <h3> Tabancas");
    
    doSanityCheck();
    getList();
}

function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}

// Get tabancas from CSV
$.ajax({
    url: 'TABANCAS.csv',
    dataType: 'text',
}).done(getTabanca);

function getTabanca(data) {
    tabancas = [];
    var allRows = data.split(/\r?\n|\r/);
    for (var row = 1; row < allRows.length; row++) {  // start at row = 1 to skip header
            var rowValues = allRows[row].split(",");
            var p = {regName: rowValues[0], reg: rowValues[1], tabName: rowValues[2], tab: rowValues[3]};
            tabancas.push(p);
    }
}

function getList() {
    // SQL to get children
    var sql = "SELECT _savepoint_type, REG, TAB FROM ParmaComsup WHERE REG = " + reg;
    children = [];
    console.log("Querying database for children...");
    console.log(sql);
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " children");
        for (var row = 0; row < result.getCount(); row++) {
            var savepoint = result.getData(row,"_savepoint_type")
            var REG = result.getData(row,"REG");
            var TAB = result.getData(row,"TAB");

            var p = { type: 'child', savepoint, REG, TAB};
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
    // Tabanca buttons
    var ul = $('#li');
  
    $.each(tabancas, function() {
        var that = this;      
        if (that.reg == reg) {
            // list
            ul.append($("<li />").append($("<button />").attr('id',this.tab).attr('class','btn' + this.reg).append(this.tabName).append(" " + getCount(this.tab))));
        }
        
        // Buttons
        var btn = ul.find('#' + this.tab);
        btn.on("click", function() {
            var queryParams = util.setQuerystringParams(that.reg, that.tab, that.tabName);
            odkTables.launchHTML(null, 'config/assets/list.html' + queryParams);
        })        
    });
}

function getCount(tab) {
    var total = children.filter(child => child.REG == reg & child.TAB == tab).length;
    var checked = children.filter(child => child.savepoint=="COMPLETE" & child.REG == reg & child.TAB == tab).length;
    var count = "(" + checked + "/" + total + ")";
    return count;
}

function titleCase(str) {
    if (!str) return str;
    return str.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }
/**
 * Responsible for rendering the select region screen 
 */
'use strict';

var participants, bairro, tabz, date;
function display() {
    console.log("TABZ list loading");
    bairro = util.getQueryParameter('region');
    date = util.getQueryParameter('date');
    
    var bairroName = {1: "Bandim I", 2: "Bandim II", 3: "Belem", 4: "Mindara", 7: "Cuntum I", 9: "Cuntum II"};
    var head = $('#main');
    head.prepend("<h1>" + bairroName[bairro] + " </br> <h3> Zonas");
    
    doSanityCheck();
    getList();
}

function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}

// Get tabz from CSV
$.ajax({
    url: 'TABZ.csv',
    dataType: 'text',
}).done(getTabanca);

function getTabanca(data) {
    tabz = [];
    var allRows = data.split(/\r?\n|\r/);
    for (var row = 1; row < allRows.length; row++) {  // start at row = 1 to skip header
            var rowValues = allRows[row].split(",");
            var p = {bairroName: rowValues[0], bairro: rowValues[1], zone: rowValues[2], tabz: rowValues[3]};
            tabz.push(p);
    }
}

function getList() {
    // SQL to get participants
    var sql = "SELECT _savepoint_type, BAIRRO, CALLBACK, COVID, DATINC, DATSEG, ESTADO, FU, LASTINTERVIEW, NOME, POID, TABZ, TESTERESUL " + 
        " FROM OPVCOVID " +
        " WHERE BAIRRO = " + bairro +
        " GROUP BY POID HAVING MAX(FU)"; 
    participants = [];
    console.log("Querying database for participants...");
    console.log(sql);
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " participants");
        for (var row = 0; row < result.getCount(); row++) {
            var savepoint = result.getData(row,"_savepoint_type");

            var BAIRRO = result.getData(row,"BAIRRO");
            var CALLBACK = result.getData(row,"CALLBACK");
            var COVID = result.getData(row,"COVID");
            var DATINC = result.getData(row,"DATINC");
            var DATSEG = result.getData(row,"DATSEG");
            var ESTADO = result.getData(row,"ESTADO");
            var FU = result.getData(row,"FU");
            var LASTINTERVIEW = result.getData(row,"LASTINTERVIEW");
            var NOME = result.getData(row,"NOME");
            var POID = result.getData(row,"POID");
            var TABZ = result.getData(row,"TABZ");
            var TESTERESUL = result.getData(row,"TESTERESUL");

            // generate follow-up date (28 days after last interview with succes follow up)
            if (FU == 1 & (COVID == null | CALLBACK == "1" | TESTERESUL == "3")) {
                var incD = Number(DATINC.slice(2, DATINC.search("M")-1));
                var incM = DATINC.slice(DATINC.search("M")+2, DATINC.search("Y")-1);
                var incY = DATINC.slice(DATINC.search("Y")+2);
                var FUDate = new Date(incY, incM-1, incD + 28);
                var LastFU = new Date(incY, incM-1, incD);
            } else if (COVID == null | CALLBACK == "1" | TESTERESUL == "3") {
                var segD = Number(DATSEG.slice(2, DATSEG.search("M")-1));
                var segM = DATSEG.slice(DATSEG.search("M")+2, DATSEG.search("Y")-1);
                var segY = DATSEG.slice(DATSEG.search("Y")+2);
                var FUDate = new Date(segY, segM-1, segD);
                // set last succes follow up to last interview
                var intD = Number(LASTINTERVIEW.slice(2, LASTINTERVIEW.search("M")-1));
                var intM = LASTINTERVIEW.slice(LASTINTERVIEW.search("M")+2, LASTINTERVIEW.search("Y")-1);
                var intY = LASTINTERVIEW.slice(LASTINTERVIEW.search("Y")+2);
                var LastFU = new Date(intY, intM-1, intD);
            } else {
                var segD = Number(DATSEG.slice(2, DATSEG.search("M")-1));
                var segM = DATSEG.slice(DATSEG.search("M")+2, DATSEG.search("Y")-1);
                var segY = DATSEG.slice(DATSEG.search("Y")+2);
                var FUDate = new Date(segY, segM-1, segD + 28);
                var LastFU = new Date(segY, segM-1, segD);
            }   
            
            // Set 6 month (6*30.4 = 182,4 ~ 183) date for ending FU
            var incD = Number(DATINC.slice(2, DATINC.search("M")-1));
            var incM = DATINC.slice(DATINC.search("M")+2, DATINC.search("Y")-1);
            var incY = DATINC.slice(DATINC.search("Y")+2);
            var FUEnd = new Date(incY, incM-1, incD + 183);

            var p = { type: 'person', savepoint, BAIRRO, CALLBACK, COVID, DATINC, DATSEG, ESTADO, FU, FUDate, FUEnd, LastFU, LASTINTERVIEW, NOME, POID, TABZ, TESTERESUL};
            participants.push(p);
        }
        console.log("Participants:", participants)
        initButtons();
        return;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get participants from database: ' + errorMsg);
        console.error('Trying to execute the following SQL:');
        console.error(sql);
        alert("Program error Unable to look up persons.");
    }
    odkData.arbitraryQuery('OPVCOVID', sql, null, null, null, successFn, failureFn);
}

function initButtons() {
    // Zone buttons
    var ul = $('#li');
    console.log("initB",tabz);

    $.each(tabz, function() {
        var that = this;   
        if (that.bairro == bairro) {
            // list
            ul.append($("<li />").append($("<button />").attr('id',this.tabz).attr('class','btn' + this.bairro).append(this.zone).append(" " + getCount(this.tabz))));
        }
        
        // Buttons
        var btn = ul.find('#' + this.tabz);
        btn.on("click", function() {
            var queryParams = util.setQuerystringParams(that.bairro, that.tabz, that.zone, null, date);
            odkTables.launchHTML(null, 'config/assets/fuList.html' + queryParams);
        })        
    });
}

function getCount(tabz) {
    var today = new Date(date);
    var todayAdate = "D:" + today.getDate() + ",M:" + (Number(today.getMonth()) + 1) + ",Y:" + today.getFullYear();

    var total = participants.filter(person => person.BAIRRO == bairro & person.TABZ == tabz & (person.FUDate <= today & person.LastFU <= person.FUEnd & ((person.ESTADO != "2" & person.ESTADO != "3" & person.ESTADO != "6") | person.CALLBACK == "1" | person.TESTERESUL == "3") | person.DATSEG == todayAdate)).length;
    var checked = participants.filter(person => person.BAIRRO == bairro & person.TABZ == tabz & person.DATSEG == todayAdate & person.savepoint == "COMPLETE").length;
    var count = "(" + checked + "/" + total + ")";
    return count;
}

function titleCase(str) {
    if (!str) return str;
    return str.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }
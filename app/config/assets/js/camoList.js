/**
 * Responsible for rendering the select region screen 
 */
'use strict';

var participants, masterFamList, date, bairro, tabz, zone, houseGroup;
function display() {
    console.log("TABZ list loading");
    date = util.getQueryParameter('date');
    bairro = util.getQueryParameter('bairro');
    tabz = util.getQueryParameter('tabz');
    zone = util.getQueryParameter('zone');
    houseGroup = util.getQueryParameter('houseGroup');
    
    var head = $('#main');
    head.prepend("<h1>" + tabz + " - " + houseGroup + " </br> <h3> Camo");
    
    doSanityCheck();
    getList();
}

function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}

// Get tabz from CSV
$.ajax({
    url: 'masterFamList.csv',
    dataType: 'text',
}).done(getMasterList);

function getMasterList(data) {
    masterFamList = [];
    var allRows = data.split(/\r?\n|\r/);
    for (var row = 1; row < allRows.length; row++) {  // start at row = 1 to skip header
            allRows[row] = allRows[row].replace(/"/g,""); // remove quotes from strings
            var rowValues = allRows[row].split(",");
            var p = {bairro: rowValues[0], tabz: rowValues[1], zone: rowValues[2], houseGroup: rowValues[3], camo: rowValues[4]};
            masterFamList.push(p);
    }
}

function getList() {
    // SQL to get participants
    var varNames = "_id, _savepoint_type, BAIRRO, CALLBACK, CAMO, COVID, DATINC, DATSEG, DOB, ESTADO, FU, GETRESULTS, HOUSEGRP, LASTINTERVIEW, LASTTELSUC, NOME, NUMEST, POID, SEX, TABZ, TELE, TELMTN1, TELMTN2, TELMTN3, TELORA1, TELORA2, TELORA3, TELOU1, TELOU2, TELSUC, TESTERESUL";
    var sql = "SELECT " + varNames +
        " FROM OPVCOVID" + 
        " WHERE BAIRRO = " + bairro + " AND TABZ = " + tabz + " AND HOUSEGRP = '" + houseGroup + "'" +
        " GROUP BY POID HAVING MAX(FU)" +
        " ORDER BY CAMO, POID";
    participants = [];
    console.log("Querying database for participants...");
    console.log(sql);
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " participants");
        for (var row = 0; row < result.getCount(); row++) {
            var rowId = result.getData(row,"_id"); // row ID 
            var savepoint = result.getData(row,"_savepoint_type")

            var BAIRRO = result.getData(row,"BAIRRO");
            var CALLBACK = result.getData(row,"CALLBACK");
            var CAMO = result.getData(row,"CAMO");
            var COVID = result.getData(row,"COVID");
            var DATINC = result.getData(row,"DATINC");
            var DATSEG = result.getData(row,"DATSEG");
            var DOB = result.getData(row,"DOB");
            var ESTADO = result.getData(row,"ESTADO");
            var FU = result.getData(row,"FU");
            var GETRESULTS = result.getData(row,"GETRESULTS");
            var HOUSEGRP = result.getData(row,"HOUSEGRP");
            var LASTINTERVIEW = result.getData(row,"LASTINTERVIEW");
            var LASTTELSUC = result.getData(row,"LASTTELSUC");
            var NOME = titleCase(result.getData(row,"NOME"));
            var NUMEST = result.getData(row,"NUMEST");
            var POID = result.getData(row,"POID");
            var SEX = result.getData(row,"SEX");
            var TABZ = result.getData(row,"TABZ");
            var TELE = result.getData(row,"TELE");
            var TELMTN1 = result.getData(row,"TELMTN1");
            var TELMTN2 = result.getData(row,"TELMTN2");
            var TELMTN3 = result.getData(row,"TELMTN3");
            var TELORA1 = result.getData(row,"TELORA1");
            var TELORA2 = result.getData(row,"TELORA2");
            var TELORA3 = result.getData(row,"TELORA3");
            var TELOU1 = result.getData(row,"TELOU1");
            var TELOU2 = result.getData(row,"TELOU2");
            var TELSUC = result.getData(row,"TELSUC");
            var TESTERESUL = result.getData(row,"TESTERESUL");


            // generate follow-up date (28 days after last interview with succes follow up)
            if (FU == 1 & (COVID == null | CALLBACK == "1" | TESTERESUL == "3")) {
                var incD = Number(DATINC.slice(2, DATINC.search("M")-1));
                var incM = DATINC.slice(DATINC.search("M")+2, DATINC.search("Y")-1);
                var incY = DATINC.slice(DATINC.search("Y")+2);
                var FUDate = new Date(incY, incM-1, incD + 28);
            } else if (COVID == null | CALLBACK == "1" | TESTERESUL == "3") {
                var segD = Number(DATSEG.slice(2, DATSEG.search("M")-1));
                var segM = DATSEG.slice(DATSEG.search("M")+2, DATSEG.search("Y")-1);
                var segY = DATSEG.slice(DATSEG.search("Y")+2);
                var FUDate = new Date(segY, segM-1, segD);
            } else {
                var segD = Number(DATSEG.slice(2, DATSEG.search("M")-1));
                var segM = DATSEG.slice(DATSEG.search("M")+2, DATSEG.search("Y")-1);
                var segY = DATSEG.slice(DATSEG.search("Y")+2);
                var FUDate = new Date(segY, segM-1, segD + 28);
            }   

            var p = {type: 'participant', rowId, savepoint, BAIRRO, CALLBACK, CAMO, COVID, DATINC, DATSEG, DOB, ESTADO, FU, FUDate, GETRESULTS, HOUSEGRP, LASTINTERVIEW, LASTTELSUC, NOME, NUMEST, POID, SEX, TABZ, TELE, TELMTN1, TELMTN2, TELMTN3, TELORA1, TELORA2, TELORA3, TELOU1, TELOU2, TELSUC, TESTERESUL};
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
    console.log("initB",masterFamList);

    const listFromMaster = [];
    const map = new Map();
    for (const item of masterFamList) {
        if (item.bairro == bairro & item.tabz == tabz & item.houseGroup == houseGroup) {
            if(!map.has(item.camo)){
                map.set(item.camo, true);    // set any value to Map
                listFromMaster.push({
                    bairro: item.bairro,
                    tabz: item.tabz,
                    zone: item.zone,
                    houseGroup: item.houseGroup,
                    camo: item.camo
                });
            }
        }
    }

    console.log("test", listFromMaster);

    $.each(listFromMaster, function() {
        var that = this;
        // list
        ul.append($("<li />").append($("<button />").attr('id',this.camo).attr('class','btn' + this.bairro).append(this.camo).append(" " + getCount(this.camo))));
        
        
        // Buttons
        var btn = ul.find('#' + this.camo);
        btn.on("click", function() {
            var queryParams = util.setQuerystringParams(date, that.bairro, that.tabz, that.zone, that.houseGroup, that.camo);
            odkTables.launchHTML(null, 'config/assets/list.html' + queryParams);
        })        
    });
}

function getCount(camo) {
    var today = new Date(date);
    var todayAdate = "D:" + today.getDate() + ",M:" + (Number(today.getMonth()) + 1) + ",Y:" + today.getFullYear();

    var total = participants.filter(person => person.BAIRRO == bairro & person.TABZ == tabz & person.HOUSEGRP == houseGroup & person.CAMO == camo & (person.FUDate <= today & ((person.ESTADO != "2" & person.ESTADO != "3") | person.CALLBACK == "1" | person.TESTERESUL == "3") | person.DATSEG == todayAdate)).length;
    var checked = participants.filter(person => person.BAIRRO == bairro & person.TABZ == tabz & person.HOUSEGRP == houseGroup & person.CAMO == camo & person.DATSEG == todayAdate & person.savepoint == "COMPLETE").length;
    var count = "(" + checked + "/" + total + ")";
    return count;
}

function titleCase(str) {
    if (!str) return str;
    return str.toLowerCase().split(' ').map(function(word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }
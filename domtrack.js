/******************************************************************************
 * debug
 *****************************************************************************/
var g_DEBUG = 1

function debug(msg) {
    if(g_DEBUG) {
        console.log(msg)
    }
}

/******************************************************************************
 * UTILS
 *****************************************************************************/
function ajax(url) {
    var xmlhttp = new XMLHttpRequest()
    debug("AJAX: " + url)
    xmlhttp.open("GET", url, false)
    xmlhttp.send()
    var resp = xmlhttp.responseText
    debug("AJAX: " + resp)
    return resp
}

// stackoverflow, thx Shef!
function zfill(num, len) {
    return (Array(len).join("0") + num).slice(-len)
}

function longAgoStr(epoch) {
    var answer = ''
    var delta = (new Date().getTime() / 1000) - epoch

    if (delta < 60) {
        answer = delta.toFixed(1) + ' seconds'
    }
    else if (delta < 3600) {
        answer = (delta / 60).toFixed(1) + ' minutes'
    }
    else if (delta < 86400) {
        answer = (delta / 3600).toFixed(1) + ' hours'
    }
    else if (delta < 2592000) {
        answer = (delta / 86400).toFixed(0) + ' days'
    }
    else if (delta < 31536000) {
        answer = (delta / 2592000).toFixed(0) + ' months'
    }
    else {
        answer = (delta / 31536000.0).toFixed(0) + ' years'
    }

    return answer
}

function longAgoStrStealth(epoch) {
    var answer = ''
    var delta = (new Date().getTime() / 1000) - epoch
    var wDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    var dateNow = new Date()
    var dateThen = new Date()
    dateThen.setTime(epoch*1000)

    /* if within the last 60 seconds, display "X seconds ago" */
    if (delta < 60) {
        answer = delta.toFixed(1) + ' seconds ago'
    }
    /* if within the last 10 minutes, display "X minutes ago" */
    else if (delta < 10*60) {
        answer = (delta / 60).toFixed(1) + ' minutes ago'
    }
    /* if within the last day, just say "today" */
    else if (delta < 24*60*60) {
        if(dateNow.getDay() != dateThen.getDay()) {
            answer = 'yesterday'
        }
        else {
            answer = 'today'
        }
    }
    /* if within a week */
    else if (delta < 7*24*60*60) {

        if(dateThen.getDay() < dateNow.getDay()) {
            answer = 'this ' + wDays[dateThen.getDay()]
        }
        else {
            answer = 'last ' + wDays[dateThen.getDay()]; 
        }
    }
    /* print the date and the days ago string */
    else {
        answer = dateToStringMini(dateThen)
    }

    return answer
}

function dateToString(d) {
    var wDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    var hours = d.getHours()

    var amPm = 'AM'

    if(hours > 12) {
        amPm = 'PM'
        hours -= 12
    } 

    return wDays[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + (1900+d.getYear()) +
        ' ' + hours + ':' + zfill(d.getMinutes(), 2) + amPm
}

function dateToStringMini(d) {
    var wDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    var hours = d.getHours()

    var amPm = 'AM'

    if(hours > 12) {
        amPm = 'PM'
        hours -= 12
    } 

    return wDays[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + (1900+d.getYear())
}

/******************************************************************************
 * global vars
 *****************************************************************************/

/* overall */
var showElems = []

/* important play elems */
var elem_p1,      elem_p2,      elem_p3,      elem_p4,      elem_p5,      elem_p6
var elem_p1stats, elem_p2stats, elem_p3stats, elem_p4stats, elem_p5stats, elem_p6stats
var score_p1,     score_p2,     score_p3,     score_p4,     score_p5,     score_p6

var playerElems   = []
var scoreElems    = []
var playerStats   = []

var playerNames    = []
var playerToRating = []
var playerToMu     = []
var playerToSigma  = []
var playerToT      = []

/* istats */
var elem_istatsPlayerChoice

/******************************************************************************
 * inner-mode functions
 *****************************************************************************/

/* called when the page loads */
function domtrackInit(x) {

    /* overall modes; play is the default */
    showElems.push(document.getElementById("play"))
    showElems.push(document.getElementById("shuffle"))
    showElems.push(document.getElementById("stats"))
    showElems.push(document.getElementById("istats"))
    showElems.push(document.getElementById("games"))
    showElems.push(document.getElementById("admin"))
    showPlay()

    /* play mode */
    elem_p1 = document.getElementById("p1")
    elem_p2 = document.getElementById("p2")
    elem_p3 = document.getElementById("p3")
    elem_p4 = document.getElementById("p4")
    elem_p5 = document.getElementById("p5")
    elem_p6 = document.getElementById("p6")
    playerElems = [elem_p1, elem_p2, elem_p3, elem_p4, elem_p5, elem_p6]

    elem_p1stats = document.getElementById("p1_stats")
    elem_p2stats = document.getElementById("p2_stats")
    elem_p3stats = document.getElementById("p3_stats")
    elem_p4stats = document.getElementById("p4_stats")
    elem_p5stats = document.getElementById("p5_stats")
    elem_p6stats = document.getElementById("p6_stats")
    
    score_p1 = document.getElementById("p1_vp")
    score_p2 = document.getElementById("p2_vp")
    score_p3 = document.getElementById("p3_vp")
    score_p4 = document.getElementById("p4_vp")
    score_p5 = document.getElementById("p5_vp")
    score_p6 = document.getElementById("p6_vp")
    scoreElems = [score_p1, score_p2, score_p3, score_p4, score_p5, score_p6]
        
    /* individual stats mode */
    elem_istatsPlayerChoice = document.getElementById("istatsPlayerChoice")
    
    /* init global player vars */
    refreshPlayerDataStore()

    /* populate player choice drop-downs */
    playerNames.sort()
    var elems = [elem_p1, elem_p2, elem_p3, elem_p4, elem_p5, elem_p6]
    for(var i in elems) {
        elems[i].value = ''
        elems[i].innerHTML = '<option></option>'
        for(var j in playerNames) {
            elems[i].innerHTML += "<option>" + playerNames[j] + "</option>"
        }
    }

    /* populate the ratings */
    playShowRatings()
}

function refreshPlayerDataStore() {
    var resp = ajax('cgi/jsIface.py?op=getplayers')
    var lines = resp.split("\n")
    for(var j in lines) {
        var m = lines[j].match(/^(.*),(.*),(.*),(.*),(.*)$/)

        if(m) {
            playerName                 = m[1]                        
            playerNames.push(playerName)
            playerToRating[playerName] = parseFloat(m[2])
            playerToMu[playerName]     = parseFloat(m[3])
            playerToSigma[playerName]  = parseFloat(m[4])
            playerToT[playerName]      = parseFloat(m[5])            
        }
    }
}

function hideAllBut(e) {
    for(var i in showElems) {
        if(showElems[i] == e) {
            showElems[i].style.display = 'block'
        }
        else {
            try { 
                showElems[i].style.display = 'none'
            } catch (err) { }            
        }
    }
}

function showPlay() {
    hideAllBut(document.getElementById('play'))
}

function showStats() {
    hideAllBut(document.getElementById('stats'))

    // each graph has a function dedicated to loading it...
    loadLeaderBoard()
    loadAllRatingsVsGamesGraph()
    loadAllRatingsHistoryGraph()
}

function showShuffler() {
    hideAllBut(document.getElementById('shuffler'))
}

function showIStats() {
    hideAllBut(document.getElementById('istats'))

    // graphs don't load until user makes player selection 
}

function showGamesList() {
    hideAllBut(document.getElementById('games'))

    loadGamesList()
}

function showAdmin() {
    hideAllBut(document.getElementById('admin'))
}

/******************************************************************************
 * PLAY MODE stuff
 *****************************************************************************/
function playShowRatings() {

    /* update statistics */
    var enameToElemStats   = []
    enameToElemStats["p1"] = elem_p1stats
    enameToElemStats["p2"] = elem_p2stats
    enameToElemStats["p3"] = elem_p3stats
    enameToElemStats["p4"] = elem_p4stats
    enameToElemStats["p5"] = elem_p5stats
    enameToElemStats["p6"] = elem_p6stats

    for(var i in playerElems) {
        if(playerElems[i].value) {           
            enameToElemStats[playerElems[i].id].innerHTML = 
                playerToRating[playerElems[i].value] + " (" + 
                playerToMu[playerElems[i].value]     + "/"  + 
                playerToSigma[playerElems[i].value]  + ")"
        }

        else {
            /* user chose the initial blank entry */
            enameToElemStats[playerElems[i].id].innerHTML = ""
        }
    }
}

function selChange_cb(elem) {

    /* force other drop downs away from the name we just selected */
    var elems       = [elem_p1, elem_p2, elem_p3, elem_p4, elem_p5, elem_p6]
    var elems_stats = [elem_p1stats, elem_p2stats, elem_p3stats, elem_p4stats, elem_p5stats, elem_p6stats]

    for(var i=0; i<6; ++i) {
        if(elem != elems[i] && elem.value == elems[i].value) {
	        /* this works in chrome, firefox */
            elems[i].value = ""
            /* this works in kindle fire browser */
	        elems[i].options.selectedIndex = 0

            /* clear also the stats */
            elems_stats[i].innerHTML = ""
        }
    }

    /* populate ratings */
    playShowRatings()
}

function disableRecordGame() {
    document.getElementById("Record").disabled = 1
}

function enableRecordGame() {
    document.getElementById("Record").disabled = 0
}

function recordGame(elem) {

    disableRecordGame()

    /* milliseconds before next game records */
    var disabledDelay = 5*1000

    var p = ''
    var s = 0
    var players = []
    var scores  = []

    /* Load all the player names and scores */
    for(var i in playerElems) {
        if (playerElems[i].value == '') { 
            p = 'none' 
        } else {
            p = playerElems[i].value
        }
        if (scoreElems[i].value == '') {
            s = -200
        } else {
            s = scoreElems[i].value
        }        
        players.push(p)
        scores.push(s)
    }
       
    /* warn against dupliate game records * /
    if(a1a2b1b2[0] == lastRecordA1 && a1a2b1b2[1] == lastRecordA2 &&
        a1a2b1b2[2] == lastRecordB1 && a1a2b1b2[3] == lastRecordB2) {
        if(confirm('Possible duplicate game; detected same players as last game! Continue anyways?') == false) {
            return
        }
    }
    
    lastRecordA1 = a1a2b1b2[0]
    lastRecordA2 = a1a2b1b2[1]
    lastRecordB1 = a1a2b1b2[2]
    lastRecordB2 = a1a2b1b2[3]

    /* build the ajax request */
    var req = 'cgi/jsIface.py?op=recordGame'
    
    req += '&p1=' + players[0] + "&p1_vp=" + scores[0]
    req += '&p2=' + players[1] + "&p2_vp=" + scores[1]
    req += '&p3=' + players[2] + "&p3_vp=" + scores[2]
    req += '&p4=' + players[3] + "&p4_vp=" + scores[3]
    req += '&p5=' + players[4] + "&p5_vp=" + scores[4]
    req += '&p6=' + players[5] + "&p6_vp=" + scores[5]

    /* do it! */
    ajax(req)

    /* message * /
    var alertMsg = 'Win for '
    if(elem.id == "TeamAWins") {
        alertMsg += elem_a1.value + " and " + elem_a2.value
    }
    else if(elem.id == "TeamBWins") {
        alertMsg += elem_b1.value + " and " + elem_b2.value
    }

    alertMsg += " recorded!" 
    alert(alertMsg)

    /* refresh */
    refreshPlayerDataStore()
    playShowRatings()

    /* some seconds from now, re-enable */
    setTimeout("enableRecordGame();", disabledDelay)
}

/* Clear all active players and scores. */
function clearPlayers(elem)
{    
    for(var e in playerElems) {
        playerElems[e].value = ''
    }     
    for(var s in scoreElems) {
        scoreElems[s].value = ''
    }   
    
    playShowRatings()
}

/******************************************************************************
 * OVERALL STATS MODE stuff
 *****************************************************************************/
function loadLeaderBoard() {
    document.getElementById("LeaderBoard").innerHTML = "loading..."

    rankedPlayers = playerNames
    rankedPlayers.sort(function(a,b){ return playerToRating[b]-playerToRating[a] })
    
    var html = ''
    html += '<table>'
    html += '<tr><th colspan=3>Leader Board!</th></tr>'

    var place = 1
    for(var i in rankedPlayers) {
        p = rankedPlayers[i]

        // Only add people who have played games to the leaderboard
        if(playerToSigma[p] > 4.0) { 
            continue
        }

        html += "<tr><td>" + place + ")</td><td align=right width=150px><font color=#64788B>" + p +  
        "</font></td><td align=right width=75px><b>" + playerToRating[p] + '</b></td><td align=center width=150px>(' + playerToMu[p] + '/' + playerToSigma[p] + ")</td></tr>\n"

        place++
    }
    html += '</center>'
    document.getElementById("LeaderBoard").innerHTML = html
}

function loadAllRatingsHistoryGraph() {
    /* prepare the user for delay */
    document.getElementById("AllRatingsHistoryGraph_status").innerHTML = "loading..."

    /* get to work */
    var playerList = []
    var playerToObject = {}

    /* each game offers a sample point */
    var resp = ajax("cgi/jsIface.py?op=getGames")
    var lines = resp.split("\n")
    for(var i in lines) {
        var data = lines[i].split(",")
        var t = parseInt(data[0])        
        var p1   = data[1]
        var p1_s = parseInt(data[2])
        var p1_r = parseFloat(data[3])
        var p2   = data[4]
        var p2_s = parseInt(data[5])
        var p2_r = parseFloat(data[6])
        var p3   = data[7]
        var p3_s = parseInt(data[8])
        var p3_r = parseFloat(data[9])
        var p4   = data[10]
        var p4_s = parseInt(data[11])
        var p4_r = parseFloat(data[12])
        var p5   = data[13]
        var p5_s = parseInt(data[14])
        var p5_r = parseFloat(data[15])
        var p6   = data[16]
        var p6_s = parseInt(data[17])
        var p6_r = parseFloat(data[18])        
        if(isNaN(t)) {
            continue
        }

        var players = [p1, p2, p3, p4, p5, p6]
        var ratings = [p1_r, p2_r, p3_r, p4_r, p5_r, p6_r]

        /* update each player's data from the game */
        for(var j in players) {
            var p = players[j]
            var r = ratings[j]

            /* create if not exist yet */
            if(playerToObject[p] == undefined) {
                playerList.push(p)
                playerToObject[p] = { name: p, data: [] }
            }

            /* append this one rating sample */
            /* recall that the 'datetime' type of xAxis in highcharts expects milliseconds */
            playerToObject[p]['data'].push([t*1000, r])
        }
    }

    /* finally, push the current ratings as the last sample point for each present player */
    tNow = (new Date()).getTime()
    for(var i in playerNames) {
        p = playerNames[i]

        if(playerToObject[p] == undefined) {
            continue
        }

        playerToObject[p]['data'].push([tNow, playerToRating[p]])
    }

    /* build the series as an array of player objects */
    var seriesData = []
    for(var i in playerList) {
        seriesData.push(playerToObject[playerList[i]])
    }

    /* finally, render the graph into this div */
    var chart = new Highcharts.Chart(
        {
            chart: {
                renderTo: document.getElementById("AllRatingsHistoryGraph"), 
                zoomType: 'xy', 
                type: 'line'
            },
            plotOptions: {
               series: {
                   marker: {
                       enabled: false,
                       states: {
                           hover: {
                               enabled: true
                           }
                       }
                   }
               }
            },
            title: {
                text: 'Player Rating vs. Time'
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
                    year: '%b'
                }
            },
            yAxis: {
                title: {
                    text: 'Rating'
                },
                min: 0
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.series.name +'</b><br/>'+Highcharts.dateFormat('%e. %b', this.x) +': '+ this.y
                }
            },
            series: seriesData
        }
    )

    /* erase the "loading..." message */
    document.getElementById("AllRatingsHistoryGraph_status").innerHTML = ""
}

function loadAllRatingsVsGamesGraph() {
    /* prepare the user for delay */
    document.getElementById("AllRatingsVsGamesGraph_status").innerHTML = "loading..."

    /* get to work */
    var playerList = []
    var playerToObject = {}

    var resp = ajax("cgi/jsIface.py?op=getGames")
    var lines = resp.split("\n")
    for(var i in lines) {    
        var data = lines[i].split(",")
        var t = parseInt(data[0])        
        var p1   = data[1]
        var p1_s = parseInt(data[2])
        var p1_r = parseFloat(data[3])
        var p2   = data[4]
        var p2_s = parseInt(data[5])
        var p2_r = parseFloat(data[6])
        var p3   = data[7]
        var p3_s = parseInt(data[8])
        var p3_r = parseFloat(data[9])
        var p4   = data[10]
        var p4_s = parseInt(data[11])
        var p4_r = parseFloat(data[12])
        var p5   = data[13]
        var p5_s = parseInt(data[14])
        var p5_r = parseFloat(data[15])
        var p6   = data[16]
        var p6_s = parseInt(data[17])
        var p6_r = parseFloat(data[18])        
        if(isNaN(t)) {
            continue
        }

        var players = [p1, p2, p3, p4, p5, p6]
        var ratings = [p1_r, p2_r, p3_r, p4_r, p5_r, p6_r]
        
        /* update each player's data from the game */
        for(var i in players) {
            var p = players[i]
            var r = ratings[i]

            /* create if not exist yet */
            if(playerToObject[p] == undefined) {
                playerList.push(p)
                playerToObject[p] = { name: p, data: [], nGames: 0 }
            }

            /* append this one rating sample */
            var nGames = playerToObject[p]['nGames']
            playerToObject[p]['data'].push([nGames, r])
            playerToObject[p]['nGames']++
        }
    }

    /* build the series as an array of player objects */
    var seriesData = []
    for(var i in playerList) {
        playerToObject[playerList[i]]['nGames'] = undefined
        seriesData.push(playerToObject[playerList[i]])
    }

    /* finally, render the graph into this div */
    var chart = new Highcharts.Chart(
        {
            chart: {
                renderTo: document.getElementById("AllRatingsVsGamesGraph"), 
                zoomType: 'xy', 
                type: 'line'
            },
            plotOptions: {
               series: {
                   marker: {
                       enabled: false,
                       states: {
                           hover: {
                               enabled: true
                           }
                       }
                   }
               }
            },
            title: {
                text: 'Player Rating vs. Amount Games Played'
            },
            xAxis: {
                title: {
                    text: 'n\'th game'
                },
                min: 0
            },
            yAxis: {
                title: {
                    text: 'Rating'
                },
                min: 0
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.series.name +'</b><br/>'+Highcharts.dateFormat('%e. %b', this.x) +': '+ this.y
                }
            },
            series: seriesData
        }
    )

    /* erase the "loading..." message */
    document.getElementById("AllRatingsVsGamesGraph_status").innerHTML = ""
}

/******************************************************************************
 * INDIVIDUAL STATS MODE stuff
 *****************************************************************************/
function istatsPlayerChoice_cb(elem) {
    if(elem.value != "") {
        loadIStatsExtended(elem.value)
        loadResultsVsPartnersGraph(elem.value)
        loadResultsVsOpponentsGraph(elem.value)
    }
}

function loadIStatsExtended(who) {
    document.getElementById("IStatsExtended").innerHTML = "loading..."

    var html = ''
    html += '<table>'
    var resp = ajax("cgi/jsIface.py?op=getstatsextended&player=" + who)
    var lines = resp.split("\n")

    for(var i in lines) {
        if(!lines[i]) {
            continue
        }

        nameData = lines[i].split(",")
        html += "<tr><td align=right><font color=#64788B>" + nameData[0] + ":</font></td><td>" + nameData[1] + "</td></tr>\n"
    }
    html += '</center>'
    document.getElementById("IStatsExtended").innerHTML = html

}

function loadResultsVsPartnersGraph(who) {
    /* prepare the user for delay */
    document.getElementById("ResultsVsPartnersGraph_status").innerHTML = "loading..."

    /* get to work */

    var partnerList = []
    var partnerToObj = {}

    var resp = ajax("cgi/jsIface.py?op=getGames")
    var lines = resp.split("\n")
    for(var i in lines) {
        var data = lines[i].split(",")
        var t = parseInt(data[0])
        var a1 = data[1]
        var a1_r = parseInt(data[2])
        var a2 = data[4]
        var a2_r = parseInt(data[5])
        var b1 = data[7]
        var b1_r = parseInt(data[8])
        var b2 = data[10]
        var b2_r = parseInt(data[11])
        var partner
        var result

        if(isNaN(t)) {
            continue
        }

        /* can find partner? */
        if(a1 == who) {
            partner = a2
            result = 1
        }
        else if(a2 == who) {
            partner = a1
            result = 1
        }
        else if(b1 == who) {
            partner = b2
            result = 0
        }
        else if(b2 == who) {
            partner = b1
            result = 0
        }
        else {
            continue
        }

        /* create entry if not exist */
        if(partnerToObj[partner] == undefined) {
            partnerList.push(partner)
            partnerToObj[partner] = { name: "Partner: " + partner, data: [0,0] }
        }

        if(result == 1) {
            partnerToObj[partner].data[0]++
        }
        else {
            partnerToObj[partner].data[1]++
        }
    }

    /* build the series as an array of player objects */
    var seriesData = [{name: 'Wins', data:[]}, {name: 'Losses', data:[]}]
    for(var i in partnerList) {
        seriesData[0].data.push(partnerToObj[partnerList[i]].data[0])
        seriesData[1].data.push(partnerToObj[partnerList[i]].data[1])
    }

    /* finally, render the graph into this div */
    var chart = new Highcharts.Chart(
        {
            chart: {
                renderTo: document.getElementById("ResultsVsPartnersGraph"), 
                type: 'bar'
            },
            plotOptions: {
               series: {
                   marker: {
                       enabled: false,
                       states: {
                           hover: {
                               enabled: true
                           }
                       }
                   }
               }
            },
            title: {
                text: 'Player Result vs. Partners'
            },
            xAxis: {
                categories: partnerList,
                title: {
                    text: null
                }
            },
            yAxis: {
                title: {
                    text: 'Wins/Losses',
                    align: 'high'
                },
                min: 0
            },
            series: seriesData
        }
    )

    /* erase the "loading..." message */
    document.getElementById("ResultsVsPartnersGraph_status").innerHTML = ""
}

function loadResultsVsOpponentsGraph(who) {
    /* prepare the user for delay */
    document.getElementById("ResultsVsOpponentsGraph_status").innerHTML = "loading..."

    /* get to work */

    var oppList = []
    var oppToObj = {}

    var resp = ajax("cgi/jsIface.py?op=getGames")
    var lines = resp.split("\n")
    for(var i in lines) {
        var data = lines[i].split(",")
        var t = parseInt(data[0])
        var a1 = data[1]
        var a1_r = parseInt(data[2])
        var a2 = data[4]
        var a2_r = parseInt(data[5])
        var b1 = data[7]
        var b1_r = parseInt(data[8])
        var b2 = data[10]
        var b2_r = parseInt(data[11])
        var opponents = []
        var result

        if(isNaN(t)) {
            continue
        }

        /* can find opponent? */
        if(a1 == who) {
            opponents.push(b1)
            opponents.push(b2)
            result = 1
        }
        else if(a2 == who) {
            opponents.push(b1)
            opponents.push(b2)
            result = 1
        }
        else if(b1 == who) {
            opponents.push(a1)
            opponents.push(a2)
            result = 0
        }
        else if(b2 == who) {
            opponents.push(a1)
            opponents.push(a2)
            result = 0
        }
        else {
            continue
        }

        /* create entry if not exist */
        for(var i in opponents) {
            if(oppToObj[opponents[i]] == undefined) {
                oppList.push(opponents[i])
                oppToObj[opponents[i]] = { name: "Opponent: " + opponents[i], data: [0,0] }
            }
    
            if(result == 1) {
                oppToObj[opponents[i]].data[0]++
            }
            else {
                oppToObj[opponents[i]].data[1]++
            }
        }
    }

    /* build the series as an array of player objects */
    var seriesData = [{name: 'Wins', data:[]}, {name: 'Losses', data:[]}]
    for(var i in oppList) {
        seriesData[0].data.push(oppToObj[oppList[i]].data[0])
        seriesData[1].data.push(oppToObj[oppList[i]].data[1])
    }

    /* finally, render the graph into this div */
    var chart = new Highcharts.Chart(
        {
            chart: {
                renderTo: document.getElementById("ResultsVsOpponentsGraph"), 
                type: 'bar'
            },
            plotOptions: {
               series: {
                   marker: {
                       enabled: false,
                       states: {
                           hover: {
                               enabled: true
                           }
                       }
                   }
               }
            },
            title: {
                text: 'Player Result vs. Opponents (either color)'
            },
            xAxis: {
                categories: oppList,
                title: {
                    text: null
                }
            },
            yAxis: {
                title: {
                    text: 'Wins/Losses',
                    align: 'high'
                },
                min: 0
            },
            series: seriesData
        }
    )

    /* erase the "loading..." message */
    document.getElementById("ResultsVsOpponentsGraph_status").innerHTML = ""
}

/******************************************************************************
 * GAMES LIST MODE
 *****************************************************************************/
function loadGamesList() {
    var date  = new Date()
    var resp  = ajax("cgi/jsIface.py?op=getGames")
    var lines = resp.split("\n")
    lines.reverse()


    var html = ''
    html += '<table cellpadding=0 cellspacing=8px>\n'
    html += '<tr>\n'
    html += '  <th style="text-align:center">Date</th>\n'
    html += '  <th style="text-align:center">Player 1</th>\n'
    html += '  <th style="text-align:center">Player 2</th>\n'
    html += '  <th style="text-align:center">Player 3</th>\n'
    html += '  <th style="text-align:center">Player 4</th>\n'
    html += '  <th style="text-align:center">Player 5</th>\n'
    html += '  <th style="text-align:center">Player 6</th>\n'
    html += '</tr>\n'

    for(var i in lines) {
        if(!lines[i]) {
            continue
        }

        var gameData = lines[i].split(",")
        var t = parseInt(gameData[0])
        var p1   = gameData[1]
        var p1_s = parseInt(gameData[2])
        var p1_r = parseFloat(gameData[3])
        var p2   = gameData[4]
        var p2_s = parseInt(gameData[5])
        var p2_r = parseFloat(gameData[6])
        var p3   = gameData[7]
        var p3_s = parseInt(gameData[8])
        var p3_r = parseFloat(gameData[9])
        var p4   = gameData[10]
        var p4_s = parseInt(gameData[11])
        var p4_r = parseFloat(gameData[12])
        var p5   = gameData[13]
        var p5_s = parseInt(gameData[14])
        var p5_r = parseFloat(gameData[15])
        var p6   = gameData[16]
        var p6_s = parseInt(gameData[17])
        var p6_r = parseFloat(gameData[18])        
        date.setTime(t*1000)
        
        var players = [p1, p2, p3, p4, p5, p6]
        var ratings = [p1_r, p2_r, p3_r, p4_r, p5_r, p6_r]
        var scores  = [p1_s, p2_s, p3_s, p4_s, p5_s, p6_s]
        
        var DivLoser  = 'class=gameLogPlayerEntry'
        var DivWinner = 'class=gameLogPlayerEntryWin'
        var win       = scores.indexOf(Math.max.apply(window,scores))

        html += '<tr>\n'
        html += '  <td width=250px align=center>\n'
        html += longAgoStrStealth(date.getTime() / 1000) + "\n"
        html += '  </td>\n'
        html += '  <td>\n'
        html += '    <div ' + ((p1_s==scores[win]) ? DivWinner : DivLoser) + '><b>' + p1 + '</b> <i>(' + p1_r + ')</i> <b>[' + p1_s + ']</b></div>\n'
        html += '  </td>\n'
        html += '  <td>\n'
        html += '    <div ' + ((p2_s==scores[win]) ? DivWinner : DivLoser) + '><b>' + p2 + '</b> <i>(' + p2_r + ')</i> <b>[' + p2_s + ']</b></div>\n'
        html += '  </td>\n'
        html += '  <td>\n'
        html += '    <div ' + ((p3_s==scores[win]) ? DivWinner : DivLoser) + '><b>' + p3 + '</b> <i>(' + p3_r + ')</i> <b>[' + p3_s + ']</b></div>\n'
        html += '  </td>\n'
        html += '  <td>\n'
        html += '    <div ' + ((p4_s==scores[win]) ? DivWinner : DivLoser) + '><b>' + p4 + '</b> <i>(' + p4_r + ')</i> <b>[' + p4_s + ']</b></div>\n'
        html += '  </td>\n'
        html += '  <td>\n'
        html += '    <div ' + ((p5_s==scores[win]) ? DivWinner : DivLoser) + '><b>' + p5 + '</b> <i>(' + p5_r + ')</i> <b>[' + p5_s + ']</b></div>\n'
        html += '  </td>\n'
        html += '  <td>\n'
        html += '    <div ' + ((p6_s==scores[win]) ? DivWinner : DivLoser) + '><b>' + p6 + '</b> <i>(' + p6_r + ')</i> <b>[' + p6_s + ']</b></div>\n'
        html += '  </td>\n'
        html += '  <td>\n'
        html += '    <input type=submit value="Delete" onClick="deleteGame_cb(this, ' + t + ')">\n'
        html += '  </td>\n'
        html += '</tr>\n'
    }

    html += '</table>\n'

    document.getElementById("games").innerHTML = html
}

/******************************************************************************
 * MISC ADMIN
 *****************************************************************************/
function deleteGame_cb(e, gameId) {
    ajax("cgi/jsIface.py?op=deleteGame&t=" + gameId)
    e.disabled = 1
}

function addPlayer() {
	player = document.getElementById("addPlayerName").value;
	console.log('Adding Player: ' + player)
    ajax("cgi/jsIface.py?op=addPlayer&player=" + player)
}

function deletePlayer() {
	player = document.getElementById("deletePlayerName").value;
	console.log('Deleting Player: ' + player)
    ajax("cgi/jsIface.py?op=deletePlayer&player=" + player)
}

function recalcScores() {
    /* clear players' stats */
    for(var i in playerNames) {
        playerToR[playerNames[i]] = 1000
        playerToRD[playerNames[i]] = 350
        playerToT[playerNames[i]] = 0
    }

    /* get games */
    var resp = ajax("cgi/jsIface.py?op=getGames")
    var lines = resp.split("\n")

    /* for each game */
    for(var i in lines) {
        var gameData = lines[i].split(",")
        var t = parseInt(gameData[0])
        var a1 = gameData[1]
        var a2 = gameData[4]
        var b1 = gameData[7]
        var b2 = gameData[10]

        if(isNaN(t)) {
            continue
        }

        /* prepare parameters to calculate RESULTING game scores */ 
        var players = [a1,a2,b1,b2]
        var ratings = []
        var rds = []
        var rps = []
        for(var j in players) {
            ratings.push(playerToR[players[j]])
            rds.push(playerToRD[players[j]])
            rps.push(secToRatingPeriods(t - playerToT[players[j]]))
        }

        /* calculate new scores for next loop */
        var results = calcGameScores(ratings, rds, rps); 

        /* save them to database */
        var req = 'cgi/jsIface.py?op=recordGame'
        req += '&t=' + t
        req += '&a1=' + a1 + "&a1_r=" + playerToR[a1] + "&a1_rd=" + playerToRD[a1]
        req += '&a2=' + a2 + "&a2_r=" + playerToR[a2] + "&a2_rd=" + playerToRD[a2]
        req += '&b1=' + b1 + "&b1_r=" + playerToR[b1] + "&b1_rd=" + playerToRD[b1]
        req += '&b2=' + b2 + "&b2_r=" + playerToR[b2] + "&b2_rd=" + playerToRD[b2]
        req += "&a1_r_new=" + results[0][0] + "&a1_rd_new=" + results[0][1]
        req += "&a2_r_new=" + results[1][0] + "&a2_rd_new=" + results[1][1]
        req += "&b1_r_new=" + results[2][0] + "&b1_rd_new=" + results[2][1]
        req += "&b2_r_new=" + results[3][0] + "&b2_rd_new=" + results[3][1]
        ajax(req)

        /* save them locally, for next loop */
        playerToR[a1] = results[0][0]
        playerToRD[a1] = results[0][1]
        playerToT[a1] = t
        playerToR[a2] = results[1][0]
        playerToRD[a2] = results[1][1]
        playerToT[a2] = t
        playerToR[b1] = results[2][0]
        playerToRD[b1] = results[2][1]
        playerToT[b1] = t
        playerToR[b2] = results[3][0]
        playerToRD[b2] = results[3][1]
        playerToT[b2] = t
    }

    debug("done")
}

#!/usr/bin/python

#
# this is the interface by which the JavaScript interacts with the "back-end"
# (database, persistent storage) of the rest of the system
#
# the JS makes get/post requests to this CGI, and this prints data (initially
# in CSV format) which the JS parses and presents to the user (via HTML or
# high charts, etc.)
#

import os
import cgi
import DbSqlite

if ('HTTP_HOST' in os.environ) and (os.environ['HTTP_HOST'] == 'localhost'):
    import cgitb
    cgitb.enable()

#------------------------------------------------------------------------------
# MAIN
#------------------------------------------------------------------------------

print "Content-Type: text/html\x0d\x0a\x0d\x0a",

db = DbSqlite.DbSqlite()
playerList = db.getPlayerList()

form = cgi.FieldStorage()

op = 'play'

if 'op' in form:
    op = form['op'].value

if op == 'recordGame':
    db.recordGame([form['p1'].value, form['p2'].value, 
                  form['p3'].value, form['p4'].value, 
                  form['p5'].value, form['p6'].value],
                  [float(form['p1_vp'].value), float(form['p2_vp'].value), 
                   float(form['p3_vp'].value), float(form['p4_vp'].value), 
                   float(form['p5_vp'].value), float(form['p6_vp'].value)]
                );

    print "OK",

if op == 'deleteGame':
    db.deleteGame(form['t'].value)
    print "OK",

if op == 'getplayers':
    pl = db.getPlayerList()
    for p in pl:
        [rating, mu, sigma, t] = db.getPlayerStats(p)
        print "%s,%.2f,%.2f,%.2f,%d" % (p, rating, mu, sigma, t)
        
if op == 'addPlayer':
    player = form['player'].value
    db.addPlayer(player)
    
if op == 'deletePlayer':
    player = form['player'].value
    db.deletePlayer(player)

if op == 'getstats':
    player = form['player'].value
    pl = db.getPlayerList()
    if player in pl:
        [rating, mu, sigma, t] = db.getPlayerStats(player)
        print "%.2f,%.2f,%.2f,%d" % (rating, mu, sigma, t)

# if op == 'getstatsextended':
#     player = form['player'].value
#     estats = db.getPlayerStatsExtended(player)
#     print estats,

if op == 'getGames':
    games = db.getGames()
    for g in games:
        print "%d,%s,%d,%.2f,%s,%d,%.2f,%s,%d,%.2f,%s,%d,%.2f,%s,%d,%.2f,%s,%d,%.2f" % (
                             g[0], 
                             g[1],  g[2],  g[3],
                             g[4],  g[5],  g[6],
                             g[7],  g[8],  g[9],
                             g[10], g[11], g[12],
                             g[13], g[14], g[15],
                             g[16], g[17], g[18])

if op == 'shuffle':
	sets = form['sets'].value
	cards = db.shuffleCards(sets)
	for c in cards:
	    print "%s,%s" % (c[0],c[1])
	

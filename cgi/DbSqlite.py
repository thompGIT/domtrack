#------------------------------------------------------------------------------
# DbSqlite.py
# Database module that uses SQLite for storage.
#------------------------------------------------------------------------------

import sqlite3
import string
import time
import os

dbFile = 'domtrack.db'

class DbSqlite():

    #--------------------------------------------------------------------------
    # database maintenance
    #--------------------------------------------------------------------------
    SCHEMA_GAMES = [
            ['time',    'REAL PRIMARY KEY'],  # Timestamp in epoch seconds
            ['P1',      'TEXT'],     # Player 1
            ['P1Rating','REAL'],     # Player 1 Rating
            ['P2',      'TEXT'],     # Player 2
            ['P2Rating','REAL'],     # Player 2 Rating
            ['P3',      'TEXT'],     # Player 3
            ['P3Rating','REAL'],     # Player 3 Rating
            ['P4',      'TEXT'],     # Player 4
            ['P4Rating','REAL'],     # Player 4 Rating
            ['P5',      'TEXT'],     # Player 5
            ['P5Rating','REAL'],     # Player 5 Rating
            ['P6',      'TEXT'],     # Player 6
            ['P6Rating','REAL'],     # Player 6 Rating
            ['P7',      'TEXT'],     # Player 7
            ['P7Rating','REAL'],     # Player 7 Rating
            ['P8',      'TEXT'],     # Player 8
            ['P8Rating','REAL']]     # Player 8 Rating
    SCHEMA_PLAYERS = [
            ['name',  'TEXT PRIMARY KEY'],  # Player Name
            ['rating','REAL'],              # Rating
            ['mu',    'REAL'],              # Mu
            ['sigma', 'REAL'],              # Sigma
            ['time',  'REAL']]              # Timestamp of last game played

    # Database configuration and initialization ------------------------------
    def createDatabase(self):
        print '\tDropping old tables'
        cmd = 'drop table if exists games'
        print cmd
        self.c.execute(cmd);
        cmd = 'drop table if exists games_trash'
        print cmd
        self.c.execute(cmd);
        cmd = 'drop table if exists players'
        print cmd
        self.c.execute(cmd);

        print '\tCreating new tables'
        cmd = 'CREATE TABLE games (' + ','.join(map(lambda x: ' '.join(x), self.SCHEMA_GAMES)) + ')'
        print cmd
        self.c.execute(cmd)
        cmd = 'CREATE TABLE games_trash (' + ','.join(map(lambda x: ' '.join(x), self.SCHEMA_GAMES)) + ')'
        print cmd
        self.c.execute(cmd)
        cmd = 'CREATE TABLE players (' + ','.join(map(lambda x: ' '.join(x), self.SCHEMA_PLAYERS)) + ')'
        print cmd
        self.c.execute(cmd);

        self.conn.commit()

    # Clear the database of all entries (Yikes!)
    def clear(self):
        self.createDatabase()

    #--------------------------------------------------------------------------
    # general info
    #--------------------------------------------------------------------------
    # return list of players
    def getPlayerList(self):
        self.c.execute('SELECT name from players')
        return zip(*self.c.fetchall())[0]

    #--------------------------------------------------------------------------
    # player stats
    #--------------------------------------------------------------------------
    # get the player's rating
    def getPlayerRating(self, name):
        self.c.execute('SELECT rating from players WHERE name=?', (name,))
        return self.c.fetchone()[0]

    # get the player's mu
    def getPlayerMu(self, name):
        self.c.execute('SELECT mu from players WHERE name=?', (name,))
        return self.c.fetchone()[0]
        
    # get the player's sigma
    def getPlayerSigma(self, name):
        self.c.execute('SELECT sigma from players WHERE name=?', (name,))
        return self.c.fetchone()[0]

    # get the player's T (last time played)
    def getPlayerT(self, name):
        self.c.execute('SELECT time from players WHERE name=?', (name,))
        return self.c.fetchone()[0]

    # return a list [rating, mu, sigma, time]
    def getPlayerStats(self, name):
        self.c.execute('SELECT rating,mu,sigma,time from players WHERE name=?', (name,))
        return self.c.fetchall()[0]

    #--------------------------------------------------------------------------
    # set player stats
    #--------------------------------------------------------------------------
    def addPlayer(self, name, rating=0.0, mu=25.0, sigma=8.33, t=0):
        self.c.execute('INSERT into players values(?,?,?,?,?)', (name, rating, mu, sigma, t))
        self.conn.commit()
        
    def setPlayerRating(self, name, r):
        self.c.execute('UPDATE players SET rating=?', (r,))
        self.conn.commit()

    def setPlayerMu(self, name, mu):
        self.c.execute('UPDATE players SET mu=?', (mu,))
        self.conn.commit()
        
    def setPlayerSigma(self, name, sigma):
        self.c.execute('UPDATE players SET sigma=?', (sigma,))
        self.conn.commit()

    def setPlayerStats(self, name, listStats):
        self.c.execute('UPDATE players SET rating=?, rd=? ,time=? WHERE name=?',
                (listStats[0], listStats[1], listStats[2], name)
            )
        self.conn.commit()

    #--------------------------------------------------------------------------
    # game stats
    #--------------------------------------------------------------------------

    # returns a row from the database - currently we define row as:
    # [date, teamAwhitePlayer, teamAwhitePlayerRating,
    #        teamAblackPlayer, teamAblackPlayerRating,
    #        teamBwhitePlayer, teamBwhitePlayerRating,
    #        teamBblackPlayer, teamBblackPlayerRating]
    #
    # where, by convention, teamA are the winners, teamB are the losers
    #
    # (change this comment if the db schema changes please)
    def getGames(self, since=0):
        self.c.execute('SELECT * from games WHERE time>(?) order by time', (since,))

        games = []
        for x in self.c.fetchall():
            games.append({'t':x[0], \
                          'p1':str(x[1]),  'p1_r':x[2],  \
                          'p2':str(x[3]),  'p2_r':x[4],  \
                          'p3':str(x[5]),  'p3_r':x[6],  \
                          'p4':str(x[7]),  'p4_r':x[8],  \
                          'p5':str(x[9]),  'p5_r':x[10], \
                          'p6':str(x[11]), 'p6_r':x[12], \
                          'p7':str(x[13]), 'p7_r':x[14], \
                          'p8':str(x[15]), 'p8_r':x[16]})
        return games

    # retrieve all games that had player involved in it
    def getGamesByPlayer(self, name, since=0):
        self.c.execute('SELECT * from games WHERE' +
            ' p1=? or p2=? or p3=? or p4=? or p5=? or p6=? or p7=? or p8=?' +
            ' and time>(?)' +
            ' ORDER by time',
            (name, name, name, name, name, name, name, name, since)
        )

        games = []
        for x in self.c.fetchall():
            games.append({'t':x[0], \
                          'p1':str(x[1]),  'p1_r':x[2],  \
                          'p2':str(x[3]),  'p2_r':x[4],  \
                          'p3':str(x[5]),  'p3_r':x[6],  \
                          'p4':str(x[7]),  'p4_r':x[8],  \
                          'p5':str(x[9]),  'p5_r':x[10], \
                          'p6':str(x[11]), 'p6_r':x[12], \
                          'p7':str(x[13]), 'p7_r':x[14], \
                          'p8':str(x[15]), 'p8_r':x[16]})
        return games

    def deleteGame(self, t):
        self.c.execute('INSERT into games_trash SELECT * from games WHERE time=?', (t,));
        self.c.execute('DELETE from games where time=?', (t,));
        self.conn.commit();

    def undeleteGame(self, t):
        self.c.execute('INSERT into games SELECT * from games_trash WHERE time=?', (t,));
        self.c.execute('DELETE from games_trash where time=?', (t,));
        self.conn.commit();

    def recordGame(self, data):
        self.c.execute('INSERT OR REPLACE into games values(?,?,?,?,?,?,?,?,?,?,?,?,?)',
                (data['t'], 
                data['p1'], data['p1_r'],
                data['p2'], data['p2_r'],
                data['p3'], data['p3_r'],
                data['p4'], data['p4_r'],
                data['p5'], data['p5_r'],
                data['p6'], data['p6_r'],
                data['p7'], data['p7_r'],
                data['p8'], data['p8_r'])
            )
        self.conn.commit()

    #--------------------------------------------------------------------------
    # setup/testing stuff
    #--------------------------------------------------------------------------
    #
    def __init__(self):
        # Determine if the database already exists
        createDB = 1
        if ( os.path.exists(dbFile) ):
            createDB = 0

        # Connect to database
        #print 'Connecting to database [' + dbFile + ']...'
        self.conn = sqlite3.connect(dbFile)
        self.c = self.conn.cursor()

        # If the database did not already exist, create it from scratch
        if ( createDB ):
            print '\tInitializing new database...'
            self.createDatabase()

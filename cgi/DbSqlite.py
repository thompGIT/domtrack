#------------------------------------------------------------------------------
# DbSqlite.py
# Database module that uses SQLite for storage.
#------------------------------------------------------------------------------

import sqlite3
import string
import time
import os
import trueskill
from trueskill import Rating

dbFile = 'domtrack.db'
cardsDbFile = 'cards.db'

class DbSqlite():

    #--------------------------------------------------------------------------
    # database maintenance
    #--------------------------------------------------------------------------
    SCHEMA_GAMES = [
            ['time',    'REAL PRIMARY KEY'],  # Timestamp in epoch seconds
            ['P1',      'TEXT'],     # Player 1
            ['P1Rating','REAL'],     # Player 1 Rating
            ['P1Score', 'REAL'],     # Player 1 Score
            ['P2',      'TEXT'],     # Player 2
            ['P2Rating','REAL'],     # Player 2 Rating
            ['P2Score', 'REAL'],     # Player 2 Score
            ['P3',      'TEXT'],     # Player 3
            ['P3Rating','REAL'],     # Player 3 Rating
            ['P3Score', 'REAL'],     # Player 3 Score
            ['P4',      'TEXT'],     # Player 4
            ['P4Rating','REAL'],     # Player 4 Rating
            ['P4Score', 'REAL'],     # Player 4 Score
            ['P5',      'TEXT'],     # Player 5
            ['P5Rating','REAL'],     # Player 5 Rating
            ['P5Score', 'REAL'],     # Player 5 Score
            ['P6',      'TEXT'],     # Player 6
            ['P6Rating','REAL'],     # Player 6 Rating
            ['P6Score', 'REAL']]     # Player 6 Score
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
        try:
            return self.c.fetchone()[0]
        except:
            return -200

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
        
    def deletePlayer(self, name):
        self.c.execute('DELETE from players where name=?', (name,));
        self.conn.commit();
        
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
        self.c.execute('UPDATE players SET rating=?, mu=?, sigma=? ,time=? WHERE name=?',
                (listStats[0], listStats[1], listStats[2], listStats[3], name)
            )
        self.conn.commit()

    #--------------------------------------------------------------------------
    # game stats
    #--------------------------------------------------------------------------
    def getGames(self, since=0):
        sql =  'SELECT ' \
             + 'time' \
             + ',P1,P1Score,P1Rating' \
             + ',P2,P2Score,P2Rating' \
             + ',P3,P3Score,P3Rating' \
             + ',P4,P4Score,P4Rating' \
             + ',P5,P5Score,P5Rating' \
             + ',P6,P6Score,P6Rating' \
             + ' FROM games WHERE time>(?) order by time';
        self.c.execute(sql, (since,))
        games = []
        for x in self.c.fetchall():
            games.append([ x[0],
                           x[1],  x[2],  x[3],   \
                           x[4],  x[5],  x[6],   \
                           x[7],  x[8],  x[9],   \
                           x[10], x[11], x[12],  \
                           x[13], x[14], x[15],  \
                           x[16], x[17], x[18]])
        return games

    # retrieve all games that had player involved in it
    def getGamesByPlayer(self, name, since=0):
        self.c.execute('SELECT * from games WHERE' +
            ' p1=? or p2=? or p3=? or p4=? or p5=? or p6=?' +
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
                          'p6':str(x[11]), 'p6_r':x[12]})
        return games

    def deleteGame(self, t):
        self.c.execute('INSERT into games_trash SELECT * from games WHERE time=?', (t,));
        self.c.execute('DELETE from games where time=?', (t,));
        self.conn.commit();

    def undeleteGame(self, t):
        self.c.execute('INSERT into games SELECT * from games_trash WHERE time=?', (t,));
        self.c.execute('DELETE from games_trash where time=?', (t,));
        self.conn.commit();

    def recordGame(self, players, scores):
    
        # Remove all non-players, and sort based on score (hi to low)
        results_raw = zip(scores,players)
        results = filter(lambda a: a[1] != 'none', results_raw)
        results.sort(reverse=True)
        
        # Calculate all valid sub-games
        for i in range(0,len(results)):
            for j in range(i,len(results)):
                if (i != j):
                    p1Stats = self.getPlayerStats(results[i][1])
                    p2Stats = self.getPlayerStats(results[j][1])
                    p1R = Rating(p1Stats[1],p1Stats[2])
                    p2R = Rating(p2Stats[1],p2Stats[2])
                    new_p1R, new_p2R = trueskill.rate_1vs1(p1R,p2R)
                    p1TS = new_p1R.mu - (3 * new_p1R.sigma)
                    p2TS = new_p2R.mu - (3 * new_p2R.sigma)                              
                    self.setPlayerStats(results[i][1], [p1TS,new_p1R.mu, new_p1R.sigma, p1Stats[3]])
                    self.setPlayerStats(results[j][1], [p2TS,new_p2R.mu, new_p2R.sigma, p2Stats[3]])
                            
        # Store the game        
        self.c.execute('INSERT OR REPLACE into games values(?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?,?)',
                (time.mktime(time.gmtime()), 
                players[0], self.getPlayerRating(players[0]), scores[0], 
                players[1], self.getPlayerRating(players[1]), scores[1], 
                players[2], self.getPlayerRating(players[2]), scores[2], 
                players[3], self.getPlayerRating(players[3]), scores[3], 
                players[4], self.getPlayerRating(players[4]), scores[4], 
                players[5], self.getPlayerRating(players[5]), scores[5])
            )
        self.conn.commit()

    #--------------------------------------------------------------------------
    # shuffler stuff
    #--------------------------------------------------------------------------
    def shuffleCards(self, setsString):
		
        # Tokenize the sets string
        sets = setsString.split(',')		
        
        # Disallowed cards
        excludedCards = ['Platnum','Colony',                # Prosperity
                         'Potion',                          # Alchemy
                         'Spoils','Madman','Mercenary',     # Dark Ages
                         'Trusty Steed','Princess',         # Cornucopia (Prizes)
                         'Followers','Diadem','Bag of Gold']
		
        # Grab the raw cards from the database
        sql  = 'SELECT Expansion,Title,Cost_P FROM cards WHERE'
        sql += ' (Ru = 0) and '                               # Exclude individual Ruins
        sql += ' (Kn = 0 or Title = \'Sir Martin\') and '     # Exclude individual Knights
        for s in sets:
            sql += ' Expansion = \'' + s + '\' or'
        sql = sql[:-2]
        sql += 'ORDER BY RANDOM() LIMIT 10'
        		
        self.cards_c.execute(sql)
		
        # Clean up the results
        cards = []
        for x in self.cards_c.fetchall():
            cards.append([ x[0], x[1], x[2] ])
            	    
        # Add Colonies and Platnum?
        for card in cards:
            if card[0] == 'Prosperity':
                cards.append(['Prosperity','Colony',0])
                cards.append(['Prosperity','Platnum',0])
                break
                
        # Add Shelters?
        for card in cards:
            if card[0] == 'Dark Ages':
                cards.append(['Dark Ages','Shelters*',0])
                break
		
        # Add Potions?
        for card in cards:
            if card[2] == 1:
                cards.append(['Alchemy','Potion',0])
                break
		
        # Add Prizes?
        for card in cards:
            if card[1] == 'Tournament':
                cards.append(['Cornucopia','Prizes*',0])
                break
                
        # Add Knights?
        for card in cards:
            if card[1] == 'Sir Martin':
                cards.append(['Dark Ages','Knights*',0])
                break
		
        # Add Spoils?
        for card in cards:
            if card[1] == 'Marauder' or card[1] == 'Bandit Camp' or card[1] == 'Pillage':
                cards.append(['Dark Ages','Spoils',0])
                break
                
        # Add Madman?
        for card in cards:
            if card[1] == 'Hermit':
                cards.append(['Dark Ages','Madman',0])
                break
		
        # Add Mercenary?
        for card in cards:
            if card[1] == 'Urchin':
                cards.append(['Dark Ages','Mercenary',0])
                break
                
        # Add Ruins?
        for card in cards:
            if card[1] == 'Marauder' or card[1] == 'Cultist' or card[1] == 'Death Cart':
                cards.append(['Dark Ages','Spoils',0])
                break
                
        cards.sort()
		        		          
        return cards
		

    #--------------------------------------------------------------------------
    # setup/testing stuff
    #--------------------------------------------------------------------------
    #
    def __init__(self):
        # Determine if the database already exists
        createDB = 1
        if ( os.path.exists(dbFile) ):
            createDB = 0

        # Connect to players / games database
        self.conn = sqlite3.connect(dbFile)
        self.c = self.conn.cursor()
        
        # Connect to cards database
        self.cards_conn = sqlite3.connect(cardsDbFile)
        self.cards_c = self.cards_conn.cursor()

        # If players / games database did not already exist, create it from scratch
        if ( createDB ):
            print '\tInitializing new database...'
            self.createDatabase()

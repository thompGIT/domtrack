domtrack
========

Dominion (card game) game / player rating tracker.

Detailed usage instructions:

== Requirements ==
- Linux (I'm running on Ubuntu 13.04 Server and Ubuntu 11.10 Desktop)
- python 2.7 (built in to most distros)
- sqlite3 (sudo apt-get install sqlite3)
- (optional) web server (I've used thttpd and lighttpd without issue) (you may also serve it up directly using the 'localsrv.py' python script)
- git (to pull the current source)

NOTE: A LAMP virtual machine has all of this, so just grab a turnkey appliance and VMWare Player for easy setup.

== Setup ==
(Sever) clone the repo located at https://github.com/thompGIT/domtrack.git
(Sever) (Option 1) launch the python web module located at ../domtrack/localsrv.py
(Sever) (Option 2) add the domtrack base folder to your web server's document root (likely '/var/www')
(Client) From any web browser, navigate to your server, port 2048. You should see the default domtrack page staring back at you.

The system should now be up and running. I have used many desktop browsers and smartphones all without issue. Everything is based on HTML 5 and javascript, so pretty much any modern browser should work just fine.

== Usage ==
Add Players - The first step in using domtrack is adding players. Navigate to the Admin page, enter a Player Name and click Submit. Repeat as needed to add all players.

Delete Players - Navigate to the Admin page, enter a Player Name and click Submit. Repeat as needed to add all players.

Shuffle - To generate a randomized kingdom, first navigate to the Shuffler page. Check each expansion set to select from, then click Shuffle. The server will generate a Kingdom Hash that represents the current set of cards, a list of the cards in the random kingdom (sorted by expansion), and images for all cards in the random kingdom.

Connect to a Previous Shuffle - Other users can request the most recently generated random kingdom by using the Get Active Shuffle button on the Shuffler page. This allows all players at the table to have the list of cards, the hash for the kingdom, and the images for all cards. This is handy for those sitting upside down to the cards that need to read.

Record a Game - To record a game, use the Play page (default page on load). Select each players name from the dropdown menu, then enter their final game score in the VP column. When all players have been entered, click the Record button. When scoring games, the final VP total is only used to determine the finishing positions of players in the game (1 VP win counts the same as 100 VP win). NOTE: If two player's scores are the same, the system interprets that as a true tie and scores it as such. If the tie is not true (i.e. same score, but one player had one more turn), then adjust the winning players score by +1. 

Show Game Log - To display a log of all recorded games, navigate to the Games History page. Each box lists the following information: <PlayerName><PlayerRatingAtGameExit><GameVPTotal> Winners are highlighted in green. Use the Delete button to remove a game from the recorded history.

Recalculate Scores - When a game is deleted from the system, scores must be recalculated starting form the first game recorded. To accomplish this, navigate to the Admin page and click the Go button near the Recalculate Scores label.

Nerdy Stats Page - And the reason for all the work involved can be found on the Overall Stats page. The leader board is displayed along with charts of player ratings over time. NOTE: Players are not shown in the leaderboard until they have played 2 (or is it 3?) games.

Here is a gallery of screenshots from our running server (address redacted): http://imgur.com/a/uGvbH

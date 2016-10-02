#!/bin/sh
cntr=1;
while [ "$cntr" -le 1 ]
do
	if pgrep "nodejs" > /dev/null
	then
		echo "Running" >> logfile.txt
	else
		echo "nodejs stopped. Restarting now..." >> logfile.txt
		nodejs app.js >> logfile.txt
	fi
	sleep 1
done

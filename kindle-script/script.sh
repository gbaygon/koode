# prevent screensaver
lipc-set-prop -- com.lab126.powerd preventScreenSaver 1

ADDR=$(ifconfig wlan0 | grep "inet addr")
BATTERY=$(lipc-get-prop -- com.lab126.powerd status | grep "Battery Level")

SERVER="http://192.168.0.138:8080"

update_screen () {
         eips -c
         eips -c
         eips -g status.png
}

trap 'echo "*** EXITING ***"; exit' INT
while true
do
       	status_code=$(curl -m 20 -X GET -G $SERVER --write-out '%{http_code}' --silent -o status.png --data-urlencode "addr=$ADDR" --data-urlencode "battery=$BATTERY")
       	echo "response: $status_code"

       	if [[ "$status_code" -eq 200 ]] ; then
               	echo "** Updating Screen"
               	update_screen
       	else
               	echo "** No Updates Received"
       	fi
       	sleep 2
done
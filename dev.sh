#!/usr/bin/env bash

# ------- Defined config -----------
PROC_EID_NAME=eidifr
PROC_DEMO_NAME=eidSign

SEVSER_BIN="lite-server"
dir=$(cd "$(dirname "$0")";pwd)


function startIfrServer() {
  echo $dir
}


function start(){
  nohup ./node_modules/lite-server/bin/lite-server -c ./ci/bs-eid-config.js $PROC_EID_NAME 2>&1 &
}


function stopIfrServer(){
  echo shutdown $PROC_EID_NAME
  ps aux |grep $PROC_EID_NAME |grep -v grep |awk '{print "kill -9 " $2}'|sh
  return 0
}

function stop(){
  A=`stopIfrServer`
  echo $A
}

case $1 in
"start")
  start
  ;;
"stop")
  stop
  ;;
*)
  echo 'entry start,stop or restart'
  ;;
esac



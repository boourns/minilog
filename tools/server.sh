#!/bin/bash

set -e

cd server
go build
cd ..
./server/minilog

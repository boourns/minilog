#!/bin/bash

set -e

cd js
yarn build
cd ..

cd server
go build
cd ..
./server/minilog

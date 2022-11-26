#!/bin/bash

set -e

echo "Building javascript"
pushd js
yarn install
yarn build
popd

echo "Building server"
pushd server
go build
popd

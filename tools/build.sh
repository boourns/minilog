#!/bin/bash

set -e

echo "Building server"
pushd server
go build
popd

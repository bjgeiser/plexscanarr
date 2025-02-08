#!/bin/sh

# this script requires node be installed first
VERSION=v23.7.0
DISTRO=linux-x64
wget https://nodejs.org/dist/$VERSION/node-$VERSION-$DISTRO.tar.xz
sudo mkdir -p ./nodejs
sudo tar -xJvf node-$VERSION-$DISTRO.tar.xz -C ./nodejs
rm node-$VERSION-$DISTRO.tar.xz
PATH=$PATH:$PWD/nodejs/node-$VERSION-$DISTRO/bin


PATH=$PATH bash -c "npm install"
PATH=$PATH bash -c "npm run build"

rm -rf ./nodejs


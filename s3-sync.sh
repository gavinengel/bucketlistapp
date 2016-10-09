#!/bin/sh
aws s3 sync --delete ./Bucketlist/ s3://bucketlistapp --exclude=.* --acl public-read;

echo "Endpoint: bucketlistapp.s3-website-us-east-1.amazonaws.com";


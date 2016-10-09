#!/bin/sh
aws s3 sync --delete ./Bucketlist/ s3://bucketlistr.engelcloud.com --exclude=.* --acl public-read;

echo "Endpoint: http://bucketlistr.engelcloud.com.s3-website-us-east-1.amazonaws.com/";


import os
import rollbar

try:
    AWS_ACCESS_KEY_DYNAMODB = os.environ['AWS_ACCESS_KEY_DYNAMODB']
    AWS_SECRET_KEY_DYNAMODB = os.environ['AWS_SECRET_KEY_DYNAMODB']
    AWS_REGION = os.environ['AWS_REGION']
    FORMSTACK_TOKENS = os.environ['FORMSTACK_TOKENS']
except KeyError as e:
    rollbar.report_exc_info() 
    print "Environment variable " + e.args[0] +  " doesn't exist"
    raise
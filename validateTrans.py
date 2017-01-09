#!/usr/bin/env python
#*********************************************
# Created by jitender choudhary on 13/12/2016.
# Version 1.0
#*********************************************


import optparse
import subprocess
import os
import simplejson as json
import urllib2
import sys

#Script Constants
url = 'http://slc04kxc.us.oracle.com/api/submit'
headers = {"Accept": "application/json"}
proxies = {
  'http': 'http://www-proxy.us.oracle.com:80',
  'https': 'http://www-proxy.us.oracle.com:80',
}

#Default values for the variables
isInsideView = 'N'
transName = ""
email = ""

parser = optparse.OptionParser()
parser.add_option('-d', '--db', action="store", dest="dbString",help="Database String to run Automated Units test format should be like fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar", default="fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar")
parser.add_option('-t', '--trans', action="store", dest="transName",help="Transaction Name on which you want to run script", default="")
parser.add_option('-e', '--email', action="store", dest="emailID",help="Email ID on which you want to get email", default="")
parser.add_option('-u', '--updatebug', action="store", dest="updateBug",help="Will update bug with the result if value given is Y , default value is N ", default="Y")
parser.add_option('-j', '--junits', action="store", dest="runJunits",help="Should automated unit tests run on this transaction , default value in N", default="Y")

options, args = parser.parse_args()


#Getting the transaction name if not provided as the script arguments
if not options.transName:
    output = subprocess.Popen(["ade", "pwv"], stdout=subprocess.PIPE).communicate()[0]
    #Below Line should be uncommented if the script is running from Windows VM Machines
    #output = subprocess.Popen(['dir'], stdout=subprocess.PIPE,shell=True).communicate()[0]
    list = output.splitlines()
    for x in list:
        if x.startswith('VIEW_TXN_NAME'):
            transdata = x.split(':')
            transName = transdata[1].strip()
            isInsideView = 'Y'
else:
    transName = options.transName

if not transName:
    print ('Not able to verify the transaction name , please run this command inside the view where transaction is open or specify the transaction name')
    parser.print_help()
    sys.exit(0)


#Getting the email id of the user used by default for premerge scirpt

if not options.emailID:
    emailFile = os.path.expanduser('~')+'/.Premerge.cfg'
    try:
        f = open(emailFile, 'r')
        content = f.read()
        parsedContent = content.split(':')
        email = parsedContent[2].strip()
    finally:
        f.close()
else: 
    email = options.emailID

if not email:
    print ('Not able to fetch the email of the user , please check the usage of the script and provide the email for notifications')
    parser.print_help()
    sys.exit(0)


#Setting DB Overrider property if default db is changed
if options.dbString == "fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar":
    allowDBOverride = "N"
else:
    allowDBOverride = "Y"

print ("********************************************")
print ("***********Transaction Properties***********")
print ("Transaction Name        : "+transName)
print ("Email To Notify         : "+email)
print ("Update Bug with result  : "+options.updateBug)
print ("Run Automated Unit Test : "+options.runJunits)
print ("Database Used           : "+options.dbString)
print ("********************************************")
print ("***********Saving the transaction***********")
if isInsideView == 'Y':
    output = subprocess.Popen(["ade", "savetrans"], stdout=subprocess.PIPE).communicate()[0]
    list = output.splitlines()
    for x in list:
        print (x)
    print ("**************transaction Saved************")
else:
    print ("not saving transaction as not inside view  ")
print ("Submiting the transaction for validation")
 

data = {
           "name":transName,
           "email":email,
           "updateBug":options.updateBug,
           "runJunits":options.runJunits,
           "allowDBOverride":allowDBOverride,
           "dbString": options.dbString
}

req = urllib2.Request(url)
req.add_header('Content-Type', 'application/json')
try:
  response = urllib2.urlopen(req, json.dumps(data))
  print ("********************************************")
  print ("****Transaction Submitted for Validation****")
  print ("********************************************")
except: 
  print ('Another request for the same transaction is already submitted')



#sudo pip --proxy http://web-proxy.mydomain.com install somepackage
#python validateTrans.py -t jjikumar_bug-24806188 -e jitender.k.kumar@oracle.com -u N -j N
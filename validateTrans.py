#*********************************************
# Created by jitender choudhary on 13/12/2016.
# Version 1.0
#*********************************************

import requests
import optparse
import subprocess
import os


parser = optparse.OptionParser()
url = 'http://slc04kxc.us.oracle.com/api/submit'
headers = {"Accept": "application/json"}
proxies = {
  'http': 'http://www-proxy.us.oracle.com:80',
  'https': 'http://www-proxy.us.oracle.com:80',
}

parser.add_option('-d', '--db', action="store", dest="dbString",help="Database String to run Automated Units test", default="fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar")
parser.add_option('-t', '--trans', action="store", dest="transName",help="Transaction Name on which you want to run script", default="")
parser.add_option('-e', '--email', action="store", dest="emailID",help="Email ID on which you want to get email", default="")
parser.add_option('-u', '--updatebug', action="store", dest="updateBug",help="will update bug with the output if selected as yes default value is no ", default="N")
parser.add_option('-j', '--junits', action="store", dest="runJunits",help="should automated unit tests run on this transaction", default="N")

options, args = parser.parse_args()


#Getting the transaction name if not provided as the script arguments
if not options.transName:
    output = subprocess.Popen(["ade", "pwv"], stdout=subprocess.PIPE).communicate()[0]
    #output = subprocess.Popen(['dir'], stdout=subprocess.PIPE,shell=True).communicate()[0]
    list = output.splitlines()
    for x in list:
        if x.startswith('VIEW_TXN_NAME'):
            transdata = x.split(':')
            transName = transdata[1].strip()
else:
    transName = options.transName

if not transName:
    print ('Not able to verify the transaction name , please run this command inside the view where transaction is open or specify the transaction name')
    parser.print_help()
    sys.exit(0)


#Getting the email id of the user used by default for premerge scirpt

if not options.emailID:
    emailFile = os.path.expanduser('~')+'/.Premerge.cfg'
    f = open(emailFile, 'r')
    try:
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
output = subprocess.Popen(["ade", "savetrans"], stdout=subprocess.PIPE).communicate()[0]
list = output.splitlines()
print (list)
print ("**************transaction Saved************")

print ("Submiting the transaction for validation")
 
def makeRestRequestOnFusionPreMergeCloud():
 params = {
           "name":transName,
           "email":email,
           "updateBug":options.updateBug,
           "runJunits":options.runJunits,
           "allowDBOverride":allowDBOverride,
           "dbString": options.dbString
}

print ("Going to make rest request")
response = requests.post(url,headers= headers,data = params,proxies=proxies)
print ("code:"+ str(response.status_code))
print ("headers:"+ str(response.headers))
print ("content:"+ str(response.text))

# call
makeRestRequestOnFusionPreMergeCloud()



#sudo pip --proxy http://web-proxy.mydomain.com install somepackage
#python validateTrans.py -t jjikumar_bug-24806188 -e jitender.k.kumar@oracle.com -u N -j N
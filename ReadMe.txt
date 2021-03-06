/**
 * Created by jitender choudhary on 10/28/2016.
 */
 
##Steps to generate public key for the transactin history:
1. from the host : "ssh-keygen -t rsa" and accept all default values
2. "cat ~/.ssh/id_rsa.pub | ssh jjikumar@slc05gsa.us.oracle.com "mkdir -p ~/.ssh && cat >>  ~/.ssh/authorized_keys"" 


##Configure proxy setting for npm 
    npm config set proxy http://www-proxy.us.oracle.com:80
    npm config set https-proxy http://www-proxy.us.oracle.com:80
    npm config set strict_ssl false

##Steps to use MongoDb for the application :
1. Start DB using 'mongod'.
2. Use another shell and give command 'mongo'.
3. 'show dbs' to get list of DB's.
4. 'use fusionTransactions' to use application DB.
5. 'show collections' to get list of all collection in the Current DB.
6. 'db.createCollection('databases')' if we want to create new collection.
7. 'db.projectlists.find({})' is similar to 'select * from projectlists'
8. 'db.projectlists.remove( { _id : { $ne: ObjectId("580f71dee33f1b4704e4fb00")} } )' to delete record wiht give id.
9. To insert DB SeedData :  
        db.databases.insert({
            "release" : "13",
            "alias": "REL13_SMC_JIKUMAR)" ,
            "connectionString":"fusion/fusion@slc09xht.us.oracle.com:1559/jikumar",
            "currentStatus":"UNUSED"
            });

        db.databases.insert({
            "release" : "13",
            "alias": "REL13_SMC_JJIKUMAR" ,
            "connectionString":"fusion/fusion@slcak360.us.oracle.com:1595/jjikumar",
            "currentStatus":"UNUSED"
            });

        db.databases.insert({
            "release" : "13",
            "alias": "REL13(slc09xht)" ,
            "connectionString":"fusion/fusion@slc09xht.us.oracle.com:1563/slc09xht",
            "currentStatus":"UNUSED"
        });

10. db.trans.remove({"name" : "jjikumar_bug-24806188"})
11. db.trans.remove({"currentStatus" : "Running"})
12. db.trans.remove({"premergeOutput" : "Failed"})
13. db.trans.find({ "premergeOutput" : { "$exists" : false } })
14. db.trans.remove({"_id" : ObjectId("587933d5f03c237ae0c547fe")})
15. db.databases.updateOne({"alias" : "REL13_1"},{ $set:{"currentStatus" : "UNUSED"}})

## To Use Monitor RabbingMQ for the application :
1. 'rabbitmqctl.bat stop_app' : to stop message queuing service.
2. 'rabbitmqctl.bat reset' : to reset message queuing service , this will also remove all the messages from the queues.
3. 'rabbitmqctl.bat start_app' : to start message queuing service.


Final Command to be executed :
1. ade useview -silent jjikumar_REL_13 -exec "ade begintrans jjikumar_bug-24806188_123333333 && ade fetchtrans jjikumar_bug-24806188 &&  ade ci -all && ade savetrans && ade settransproperty -p BUG_NUM -v 24806188 && cd /scratch/views/jjikumar_REL_13/fusionapps/ && ade expand -recurse prc && ade mkprivate prc/* && cd .. && yes n | /scratch/views/jjikumar_REL_13/fatools/opensource/jauditFixScripts/FinPreMerge/bin/fin_premerge.ksh -d fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar -DupdateBug=N -DrunJUnits=1 -Dfamily=prc -DjunitBuildFile=/scratch/views/jjikumar_REL_13/fusionapps/prc/build-po.xml"

2. echo "cd /scratch/views/jjikumar_REL_13/fusionapps/ && ade expand -recurse prc && ade mkprivate prc/* && cd .. && yes n | /scratch/views/jjikumar_REL_13/fatools/opensource/jauditFixScripts/FinPreMerge/bin/fin_premerge.ksh -d fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar -DupdateBug=N -DrunJUnits=1 -Dfamily=prc -DjunitBuildFile=/scratch/views/jjikumar_REL_13/fusionapps/prc/build-po.xml" | ade useview jjikumar_REL_13 

3.ade useview -silent jjikumar_REL_13 -exec "cd prc && ant -f build-po.xml -Dtest.lrg=true test test-report -Dlrg=prc_po_lrg -Dtest.project='PrcPoEsignatureProtectedModelTest'  -Ddb.host=slc09xht.us.oracle.com -Ddb.port=1595 -Ddb.sid=jjikumar -Ddb.user=fusion -Ddb.pass=fusion && exit " 
4.ade useview -silent jjikumar_REL_13 -exec "cd /scratch/views/jjikumar_REL_13/fusionapps/ && ade expand -recurse prc && ade mkprivate prc/* && cd .. && yes n | /scratch/views/jjikumar_REL_13/fatools/opensource/jauditFixScripts/FinPreMerge/bin/fin_premerge.ksh -d fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar -DupdateBug=N -DrunJUnits=1 -Dfamily=prc -DjunitBuildFile=/scratch/views/jjikumar_REL_13/fusionapps/prc/build-po.xml"




####################################################################################################################################################################################################################################
Sonar setup
####################################################################################################################################################################################################################################
1. yum update *mysql* 
2. /etc/init.d/mysqld start
3. Change max_allowed_packet for DB 
	SHOW VARIABLES LIKE 'max_allowed_packet';
	SELECT @@global.max_allowed_packet;
	SET @@global.max_allowed_packet =  500 * 1024 * 1024;
	commit;
3. edit /scratch/shared/sonar/sonarqube-6.2/conf/sonar.properties file
   sonar.web.javaAdditionalOpts=-Dhttps.proxyHost=www-proxy.us.oracle.com -Dhttps.proxyPort=80 -Dhttps.proxySet=true -Dhttps.nonProxyHosts=*.oracle.com|*.oraclecorp.com
   sonar.jdbc.url=jdbc:mysql://slc04kxc.us.oracle.com:3306/sonar?useUnicode=true&characterEncoding=utf8&rewriteBatchedStatements=true&useConfigs=maxPerformance&useSSL=false
4. /scratch/shared/sonar/sonarqube-6.2/bin/linux-x86-64/sonar.sh start 
5. login to sonar qube url (http://slc10xjk.us.oracle.com:9007/projects or http://slc10xjk.us.oracle.com:9000/projects) using admin/admin
6. setenv _JAVA_OPTIONS "-Xmx3g"
7. create /scratch/views/jjikumar_REL13/fusionapps/prc/components/procurement/po/sonar-project.properties with below entries :
	sonar.projectKey=Fusion:prc
	# this is the name and version displayed in the SonarQube UI. Was mandatory prior to SonarQube 6.1.
	sonar.projectName=Fusion Prc Po
	sonar.projectVersion=1.0
	# Path is relative to the sonar-project.properties file. Replace "\" by "/" on Windows.
	# This property is optional if sonar.modules is set.
	sonar.sources=.
	sonar.java.binaries=.
8. sonar-scanner


#start mongodb as service
mongod  --logpath=C:\customInstalls\mongoDBLogs\log.txt --install
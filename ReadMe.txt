/**
 * Created by jitender choudhary on 10/28/2016.
 */
 
##Steps to generate public key for the transactin history:
1. from the host : "ssh-keygen -t rsa" and accept all default values
2. "cat ~/.ssh/id_rsa.pub | ssh jjikumar@slc05gsa.us.oracle.com "mkdir -p ~/.ssh && cat >>  ~/.ssh/authorized_keys"" 


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
            "alias": "REL13(jjikumar)" ,
            "connectionString":"fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar",
            "currentStatus":"UNUSED"
            });

        db.databases.insert({
            "release" : "13",
            "alias": "REL13(slc10usm)" ,
            "connectionString":"fusion/fusion@slcak360.us.oracle.com:1543/slc10usm",
            "currentStatus":"UNUSED"
            });

        db.databases.insert({
            "release" : "13",
            "alias": "REL13(slc09xht)" ,
            "connectionString":"fusion/fusion@slc09xht.us.oracle.com:1563/slc09xht",
            "currentStatus":"UNUSED"
        });

10.db.trans.remove({"name" : "jjikumar_bug-24806188"})
11.db.trans.remove({"currentStatus" : "Running"})
12.db.trans.remove({"premergeOutput" : "Failed"})

## To Use Monitor RabbingMQ for the application :
1. 'rabbitmqctl.bat stop_app' : to stop message queuing service.
2. 'rabbitmqctl.bat reset' : to reset message queuing service , this will also remove all the messages from the queues.
3. 'rabbitmqctl.bat start_app' : to start message queuing service.


Final Command to be executed :
1. ade useview -silent jjikumar_REL_13 -exec "ade begintrans jjikumar_bug-24806188_123333333 && ade fetchtrans jjikumar_bug-24806188 &&  ade ci -all && ade savetrans && ade settransproperty -p BUG_NUM -v 24806188 && cd /scratch/views/jjikumar_REL_13/fusionapps/ && ade expand -recurse prc && ade mkprivate prc/* && cd .. && yes n | /scratch/views/jjikumar_REL_13/fatools/opensource/jauditFixScripts/FinPreMerge/bin/fin_premerge.ksh -d fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar -DupdateBug=N -DrunJUnits=1 -Dfamily=prc -DjunitBuildFile=/scratch/views/jjikumar_REL_13/fusionapps/prc/build-po.xml"

2. echo "cd /scratch/views/jjikumar_REL_13/fusionapps/ && ade expand -recurse prc && ade mkprivate prc/* && cd .. && yes n | /scratch/views/jjikumar_REL_13/fatools/opensource/jauditFixScripts/FinPreMerge/bin/fin_premerge.ksh -d fusion/fusion@slc09xht.us.oracle.com:1595/jjikumar -DupdateBug=N -DrunJUnits=1 -Dfamily=prc -DjunitBuildFile=/scratch/views/jjikumar_REL_13/fusionapps/prc/build-po.xml" | ade useview jjikumar_REL_13 
/**
 * Created by jitender choudhary on 10/28/2016.
 */

module.exports = {
	dburl : 'mongodb://localhost/fusionTransactions',
	messageQueueURL : 'amqp://localhost',
	adeServerUrl : 'slc05gsa.us.oracle.com;slc09obh.us.oracle.com;slc01atv.us.oracle.com',
	historyServerUrl : 'slc05gsa.us.oracle.com',
	adeServerUser : 'jjikumar',
	adeServerPass : 'P@ssword01',
	transactionMessageQueue : 'fusionPremerge',
	fetchTrans : 'ade fetchtrans ',
	describeTrans : 'ade describetrans',
	transactionActiveLogLocation:'.\\History\\Current\\',
	transactionArchivedLogLocation:'.\\History\\Archived\\',
	sshPublicKeyLocation : 'C:\\Users\\jjikumar\\.ssh\\id_rsa'
};
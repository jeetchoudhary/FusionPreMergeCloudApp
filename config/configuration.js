module.exports = {
	dburl : 'mongodb://localhost/fusionTransactions',
	messageQueueURL : 'amqp://localhost',
	adeServerUrl : 'indl76040.in.oracle.com',
	historyServerUrl : 'indl76040.in.oracle.com',
	adeServerUser : 'jjikumar',
	adeServerPass : 'P@ssword01',
	transactionMessageQueue : 'fusionPremerge',
	fetchTrans : 'ade fetchtrans ',
	describeTrans : 'ade describetrans',
	transactionActiveLogLocation:'.\\History\\Current\\',
	transactionArchivedLogLocation:'.\\History\\Archived\\',
	sshPublicKeyLocation : 'C:\\.ssh\\id_rsa'
};
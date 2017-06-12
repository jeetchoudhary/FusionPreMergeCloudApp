
var updateTestProjectListHCM = function (workSpaceFileName, projectPrefix) {
	var projectNames = [];
	try {
		var fileData = fs.readFileSync(workSpaceFileName).toString();
		var childrenStartData = fileData.substring(fileData.indexOf('<list n="listOfChildren">'));
		var childrenList = childrenStartData.substring(0, childrenStartData.indexOf('</list>') + 7);
		var aFileNameParts = childrenList.split(".jpr");
		for (var i in aFileNameParts) {
			if (aFileNameParts[i].lastIndexOf('path=') != -1) {
				var projectPath = projectPrefix + aFileNameParts[i].substring(aFileNameParts[i].lastIndexOf('path=') + 6);
				if (projectPath.substring(projectPath.length - 4) == 'Test') {
					projectNames.push(projectPath);
					logger.info('project updated in the db , Family : HCM , Path : ', projectPath);
				}
			}
		}
	} catch (ex) {
		logger.info('Failed to parse projectNames from fileList', ex);
	}
	var query = { "name": "HCM" };
	ProjectList.findOneAndUpdate(query, { "list": projectNames }, { upsert: true }, function (err, doc) {
		if (err) {
			logger.error('failed to save list in db :', err);
		} else {
			logger.info('saved list in db  :');
		}
	});
}

var updateProjectList = function () {
	var projectFilePrefixMap = {};
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmAbsences.jws'] = 'fusionapps/hcm/components/hcmAbsences/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmAnalytics.jws'] = 'fusionapps/hcm/components/hcmAnalytics/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmBenefits.jws'] = 'fusionapps/hcm/components/hcmBenefits/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmCommonSoa.jws'] = 'fusionapps/hcm/components/hcmCommonSoa/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmCompensation.jws'] = 'fusionapps/hcm/components/hcmCompensation/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmConnect.jws'] = 'fusionapps/hcm/components/hcmConnect/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmCore.jws'] = 'fusionapps/hcm/components/hcmCore/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmCoreSetup.jws'] = 'fusionapps/hcm/components/hcmCoreSetup/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmCoreSoa.jws'] = 'fusionapps/hcm/components/hcmCoreSoa/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmEngagement.jws'] = 'fusionapps/hcm/components/hcmEngagement/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmEss.jws'] = 'fusionapps/hcm/components/hcmEss';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmPayroll.jws'] = 'fusionapps/hcm/components/hcmPayroll';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmRecruiting.jws'] = 'fusionapps/hcm/components/hcmRecruiting/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmSchedules.jws'] = 'fusionapps/hcm/components/hcmSchedules/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmSemSearch.jws'] = 'fusionapps/hcm/components/hcmSemSearch/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmTalent.jws'] = 'fusionapps/hcm/components/hcmTalent/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmTalentSoa.jws'] = 'fusionapps/hcm/components/hcmTalentSoa';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmTap.jws'] = 'fusionapps/hcm/components/hcmTap/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmTime.jws'] = 'fusionapps/hcm/components/hcmTime';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmWorkforceMgmt.jws'] = 'fusionapps/hcm/components/hcmWorkforceMgmt/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmWorkforceReputation.jws'] = 'fusionapps/hcm/components/hcmWorkforceReputation/';
	projectFilePrefixMap['\\ProjectList\\HCM\\HcmTablet.jws'] = 'fusionapps/hcm/components/hcmTablet/';

	for(var key in projectFilePrefixMap)
 	{	
		updateTestProjectListHCM(key,projectFilePrefixMap[key]);
	}
}
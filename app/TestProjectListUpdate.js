var logger = require('./LoggingConfig');
var fs = require('fs');
var ProjectList = require('../app/models/ProjectListData');
var updateTestProjectListHCM = function (projectNames, workSpaceFileName, projectPrefix) {
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

}

var saveProjectListHCM = function (projectNames) {
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
    var projectNames = [];
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmAbsences.jws'] = 'fusionapps/hcm/components/hcmAbsences/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmAnalytics.jws'] = 'fusionapps/hcm/components/hcmAnalytics/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmBenefits.jws'] = 'fusionapps/hcm/components/hcmBenefits/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmCommonSoa.jws'] = 'fusionapps/hcm/components/hcmCommonSoa/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmCompensation.jws'] = 'fusionapps/hcm/components/hcmCompensation/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmConnect.jws'] = 'fusionapps/hcm/components/hcmConnect/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmCore.jws'] = 'fusionapps/hcm/components/hcmCore/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmCoreSetup.jws'] = 'fusionapps/hcm/components/hcmCoreSetup/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmCoreSoa.jws'] = 'fusionapps/hcm/components/hcmCoreSoa/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmEngagement.jws'] = 'fusionapps/hcm/components/hcmEngagement/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmEss.jws'] = 'fusionapps/hcm/components/hcmEss/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmPayroll.jws'] = 'fusionapps/hcm/components/hcmPayroll';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmRecruiting.jws'] = 'fusionapps/hcm/components/hcmRecruiting/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmSchedules.jws'] = 'fusionapps/hcm/components/hcmSchedules/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmSemSearch.jws'] = 'fusionapps/hcm/components/hcmSemSearch/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmTalent.jws'] = 'fusionapps/hcm/components/hcmTalent/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmTalentSoa.jws'] = 'fusionapps/hcm/components/hcmTalentSoa';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmTap.jws'] = 'fusionapps/hcm/components/hcmTap/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmTime.jws'] = 'fusionapps/hcm/components/hcmTime/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmWorkforceMgmt.jws'] = 'fusionapps/hcm/components/hcmWorkforceMgmt/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\HcmWorkforceReputation.jws'] = 'fusionapps/hcm/components/hcmWorkforceReputation/';
    projectFilePrefixMap[__dirname + '\\ProjectList\\HCM\\Tablet.jws'] = 'fusionapps/hcm/components/hcmTablet/';

    for (var key in projectFilePrefixMap) {
        updateTestProjectListHCM(projectNames, key, projectFilePrefixMap[key]);
    }
    saveProjectListHCM(projectNames);
}

updateProjectList();
/**
 * Created by jitender choudhary on 10/28/2016.
 */
"use strict";
var fuseConfig = require('../config/configuration');
var ProjectBuildData = require('../app/models/ProductBuildData');
var logger = require('./LoggingConfig');

var saveProcurementFamilyData = function () {
    var data = new ProjectBuildData({
        productName: "Procurement",
        familyName: "PO",
        buildFile: "fusionapps/prc/build-po.xml",
        workspaceFile: "fusionapps/prc/components/procurement/Procurement.jws"
    });

    data.save(function (err) {
        if (err) {
            logger.error('failed to save PO Family data to the database : ', err);
        } else {
            logger.info('PO Family data saved successfully : ');
        }
    });

    data = new ProjectBuildData({
        productName: "Procurement",
        familyName: "PON",
        buildFile: "fusionapps/prc/build-pon.xml",
        workspaceFile: "fusionapps/prc/components/procurement/Procurement.jws"
    });

    data.save(function (err) {
        if (err) {
            logger.error('failed to save PON Family data to the database : ', err);
        } else {
            logger.info('PON Family data saved successfully : ');
        }
    });

    data = new ProjectBuildData({
        productName: "Procurement",
        familyName: "POQ",
        buildFile: "fusionapps/prc/build-poq.xml",
        workspaceFile: "fusionapps/prc/components/procurement/Procurement.jws"
    });

    data.save(function (err) {
        if (err) {
            logger.error('failed to save POQ Family data to the database : ', err);
        } else {
            logger.info('POQ Family data saved successfully : ');
        }
    });

    data = new ProjectBuildData({
        productName: "Procurement",
        familyName: "POR",
        buildFile: "fusionapps/prc/build-por.xml",
        workspaceFile: "fusionapps/prc/components/procurement/Procurement.jws"
    });

    data.save(function (err) {
        if (err) {
            logger.error('failed to save POR Family data to the database : ', err);
        } else {
            logger.info('POR Family data saved successfully : ');
        }
    });

    data = new ProjectBuildData({
        productName: "Procurement",
        familyName: "POS",
        buildFile: "fusionapps/prc/build-poz.xml",
        workspaceFile: "fusionapps/prc/components/procurement/Procurement.jws"
    });

    data.save(function (err) {
        if (err) {
            logger.error('failed to save POS Family data to the database : ', err);
        } else {
            logger.info('POS Family data saved successfully : ');
        }
    });
}

var saveLogisticsData = function () {
    var data = new ProjectBuildData({
        productName: "Logistics",
        familyName: "INV",
        buildFile: "fusionapps/scm/build-log.xml",
        workspaceFile: "fusionapps/scm/components/logistics/Logistics.jws"
    });

    data.save(function (err) {
        if (err) {
            logger.error('failed to save INV Family data to the database : ', err);
        } else {
            logger.info('INV Family data saved successfully : ');
        }
    });

    data = new ProjectBuildData({
        productName: "Logistics",
        familyName: "RCV",
        buildFile: "fusionapps/scm/build-log.xml",
        workspaceFile: "fusionapps/scm/components/logistics/Logistics.jws"
    });

    data.save(function (err) {
        if (err) {
            logger.error('failed to save RCV Family data to the database : ', err);
        } else {
            logger.info('RCV Family data saved successfully : ');
        }
    });

    data = new ProjectBuildData({
        productName: "Logistics",
        familyName: "WSH",
        buildFile: "fusionapps/scm/build-log.xml",
        workspaceFile: "fusionapps/scm/components/logistics/Logistics.jws"
    });

    data.save(function (err) {
        if (err) {
            logger.error('failed to save WSH Family data to the database : ', err);
        } else {
            logger.info('WSH Family data saved successfully : ');
        }
    });
}

saveProcurementFamilyData();
saveLogisticsData();
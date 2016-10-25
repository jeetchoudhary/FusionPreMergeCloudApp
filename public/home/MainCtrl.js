angular.module('MainCtrl', []).controller('MainController', function ($rootScope, $scope, $http) {

    $scope.transaction = {
        name: '',
        email: '',
        updateBug: 'N',
        runJunits: 'N',
        applyFPR: 'N',
        allowDBOverride:'Y',
        errorMsg: {
            transactionError: '',
            DBError: ''
        },
        description: {
            "baseLabel": '{"name":"","value":""}',
            "bugNum": { "name": "", "value": "" },
            "transDesc": { "name": "", "value": "" }
        }
    };
    $scope.errorMsg = "";

    $scope.submitTransaction = function () {
        var trans = $scope.transaction;
        $scope.transaction = {
            name: '',
            email: '',
            updateBug: 'N',
            runJunits: 'N',
            applyFPR: 'N',
            allowDBOverride:'Y',
            errorMsg: {
                transactionError: '',
                DBError: ''
            },
            description: {
                "baseLabel": '{"name":"","value":""}',
                "bugNum": { "name": "", "value": "" },
                "transDesc": { "name": "", "value": "" }
            }
        };
        $scope.errorMsg = "";
       
        $http.post('/api/submit', trans).success(function (response) {
            console.log('Client : Recieved Data from server', response);
        }).error(function (err) {
            console.log('Client : Recieved Data from server', err);
            $scope.errorMsg = err.error;
        });
    };

    $scope.getDBInformation = function () {
        $http.get('/api/info/dbs', $scope.transaction).success(function (response) {
            $scope.dbs = response;
            console.log('Client : Recieved Data from server', response);
        }).error(function (err) {
            console.log('Client : Recieved Data from server', err);
            $scope.transaction.errorMsg.transactionError = err.error;
        });
    };

    $scope.changeDB = function (val) {
        $scope.transaction.dbString = val.connectionString;
         $scope.transactionSubmitform.dbstring.$setDirty();
    };

    $scope.updateProjectList = function (val) {
        $http.get('/api/updateProjectList', val).success(function (response) {
            console.log('Client : ProjectList Updated Successfully', response);
        }).error(function (err) {
            console.log('Client : Failed To update projectlist', err);
        });
    };

    $scope.getDBInformation();

    $('#transactionname').click(function () {
        var value=$('#transactionname').val();
        if(value){
            $scope.transactionSubmitform.transaction.$setDirty();
        }else{
            $scope.transactionSubmitform.$setPristine();
        }
    });
    $('#projectList').multiselect();
});
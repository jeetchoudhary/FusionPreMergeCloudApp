angular.module('MainCtrl', []).controller('MainController', function ($rootScope, $scope, $http) {

    $scope.transaction = {
        name: '',
        email: 'jitender.k.kumar@oracle.com',
        updateBug: 'N',
        runJunits: 'N',
        applyFPR: 'N',
        validationStatus: 'notstarted',
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
            validationStatus: 'notstarted',
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

    $scope.getDBInformation();

    $('#transactionname').click(function () {
        var value=$('#transactionname').val();
        if(value){
            $scope.transactionSubmitform.transaction.$setDirty();
        }else{
            $scope.transactionSubmitform.$setPristine();
        }
    });


    // $scope.submitTransaction = function () {
    //    // $scope.transaction.isValid = true;
    //     console.log($scope.transaction.name);
    //     console.log($scope.transaction.dbString);
    //     console.log($scope.transaction.email);
    //     console.log($scope.transaction.updateBug);
    //     console.log($scope.transaction.runJunits);
    //     console.log($scope.transaction.applyFPR);
    //     console.log($scope.transaction.validationStatus);
    //   //  console.log($scope.transaction.description.baseLabel.value);
    //  //   console.log($scope.transaction.description.bugNum.value);
    //  //   console.log($scope.transaction.description.transDesc.value);

    //     if($scope.transaction.validationStatus==='completed'){
    //         console.log('submit block getting execute');
    //         $http.post('/api/submit', $scope.transaction).success(function (response) {
    //         console.log('Client : Recieved Data from server', response);
    //     }).error(function (err) {
    //         console.log('Client : Recieved Data from server', err);
    //         $scope.transaction.errorMsg.transactionError = err.error;
    //     });
    //     }else if($scope.transaction.validationStatus==='notstarted' && $rootScope.isDesc==='N' && ($scope.transaction.name!=$rootScope.prevTransName)){
    //             console.log('validations block getting execute and validation status',$scope.transaction.validationStatus);
    //             $scope.transaction.validationStatus="inprocess";
    //             $rootScope.isDesc = 'Y';
    //             $rootScope.prevTransName = $scope.transaction.name;
    //     		// $http.post('/api/transactions/describe', $scope.transaction).success(function (response){
    //             //     console.log('Client : Recieved Data from server', response);
    //             //     $scope.transaction.description=response;
    //             //     $scope.transaction.validationStatus="completed";
    //             //     console.log('validations block execution completed and validation status',$scope.transaction.validationStatus);
    //             //     console.log('validations response Recieved',response);
    //             //     $rootScope.isDesc = 'Y';
    //             // }).error(function (err) {
    //             //     console.error('Client : Recieved Data from server', err);
    //             //     $rootScope.isDesc = 'Y';
    //             // });

    //             $http.post('/api/transactions/describe', $scope.transaction).then(function(response){
    //                     console.log('Client : Recieved Data from server', response);
    //                 $scope.transaction.description=response.data;
    //                 $scope.transaction.validationStatus="completed";
    //                 console.log('validations block execution completed and validation status',$scope.transaction.validationStatus);
    //                 console.log('validations response Recieved',response);
    //                 $rootScope.isDesc = 'Y';
    //             }, function(err){
    //                  console.error('Client : Recieved Data from server', err);
    //                 $rootScope.isDesc = 'Y';
    //             });
    //     	}
    // };

 


    /*
          if ($('#transaction-name').val() === '') {
              $('#transaction-name').css("border-color", "red");
              $scope.transaction.errorMsg.transactionError = "Transaction Name is Required";
          } else {
              console.log('$scope.transaction.isDesc :',$rootScope.isDesc);
              if($rootScope.isDesc===''){
                  $rootScope.isDesc='Y';
                  console.log('$scope.transaction.isDesc : Inside ',$rootScope.isDesc);
                  $http.post('/api/transactions/describe', $scope.transaction).success(function (response) {
                      console.log('Client : Recieved Data from server', response);
                      $scope.transaction.description=response;
                      $scope.transaction.description.baseLabel.value;
                      $scope.transaction.description.bugNum.value;
                      $scope.transaction.description.transDesc.value;
                      $rootScope.isDesc='';
                  }).error(function (err) {
                      console.log('Client : Recieved Data from server', err);
                      $scope.transaction.errorMsg.transactionError = err.error;
                      $('#transaction-name').css("border-color", "red");
                      $rootScope.isDesc='';
                  });
              }
          	
      	
          //    $('#transaction-name').css("border-color", "");
          //    $scope.transaction.errorMsg.transactionError = "";
          }
      }); 
      
      $('#transaction-name').click(function () {
          $scope.transaction.isDesc='';
      });
      
  
      $('#dbstring').focusout(function () {
          if ($('#dbstring').val() === '') {
              $('#dbstring').css("border-color", "red");
          } else {
              $('#dbstring').css("border-color", "");
          }
      });
  
      $('#transaction-email').focusout(function () {
          if ($('#transaction-email').val() === '') {
              $('#transaction-email').css("border-color", "red");
          } else {
              var transaction_email = $('#transaction-email').val().trim();
              var emailRegEx = /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4},?)+$/; // validate more than one comma separated emails, no spaces
              if (!emailRegEx.test(transaction_email)) {
                  var errorText = (transaction_email === '' ? 'Email ID cannot be empty\n' : transaction_email + ' is not a valid Oracle email ID\n');
                  $('#transaction-email').css("border-color", "red");
              } else {
                  $('#transaction-email').css("border-color", "");
              }
          }
      });*/
});
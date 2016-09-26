angular.module('HistCtrl', [])
.controller('HistoryController', function ($scope, $http, $sce) {    
     $scope.transactionList = {
         "running":"",
         "queued":"",
         "archived":""
     };
         $scope.getTransactionList = function (transState) {
        console.log('getting list for transactions with state :',transState);
        $http.post('/api/transactions/list',{'transState':transState}).success(function (response) {
            console.log('Client : Recieved Data from server', response);
            if(transState==='Running')
            	$scope.transactionList.running = response;
            else if(transState==='Queued')
            	$scope.transactionList.queued = response;
            else 
            	$scope.transactionList.archived = response;
        }).error(function (err) {
            console.log('Client : Recieved Data from server', err);
            $scope.transaction.errorMsg.transactionError = err.error;
            console.log($scope.transaction.errorMsg.transactionError);
        });
    };

    $scope.transactionList.running =  $scope.getTransactionList("Running");
    $scope.transactionList.queued =  $scope.getTransactionList("Queued");
    $scope.transactionList.archived =  $scope.getTransactionList("Archived");
    
    $scope.displayTransactionProgress = function (name) {
        console.log('Client : Going to display the transaction outcome', name);
        $http.post('/api/transactions/name/output', {name: name}, {
                responseType: 'arraybuffer'})
            .success(function (response) {
                console.log(response);
                var file = new Blob([response], {
                    type: 'text/plain'
                });
                var fileURL = URL.createObjectURL(file);
                $scope.transactionOutput = $sce.trustAsResourceUrl(fileURL);
            }).error(function (err) {
                console.log('Client : Recieved Error Data from server', err);
                $scope.transaction.errorMsg.transactionError = err.error;
                console.log($scope.transaction.errorMsg.transactionError);
            });
    }
}).controller('HistoryProgress', function ($scope,$rootScope, $http, $sce) {   
  $scope.transactionOutput =   $rootScope.transactionOutput;

    $scope.displayTransactionProgress = function (name) {
        console.log('Client : Going to display the transaction outcome', name);
        $http.post('/api/transactions/name/output', {name: name}, {
                responseType: 'arraybuffer'})
            .success(function (response) {
                console.log(response);
                var file = new Blob([response], {
                    type: 'text/plain'
                });
                var fileURL = URL.createObjectURL(file);
                $rootScope.transactionOutput = $sce.trustAsResourceUrl(fileURL);
            }).error(function (err) {
                console.log('Client : Recieved Error Data from server', err);
                $scope.transaction.errorMsg.transactionError = err.error;
                console.log($scope.transaction.errorMsg.transactionError);
            });
    };
    $scope.getProgress = function () {
        $scope.displayTransactionProgress($rootScope.histTrans);
    };
   setTimeout(function(){  $scope.displayTransactionProgress($rootScope.histTrans); }, 1000); 

     
}).directive('historyList', function() {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
                transactionList: '=data'
           },
    link: function(scope, element, attrs, controllers) {},
    templateUrl:  '../history/historyList.html',
    controller : function($scope,$rootScope, $http,$sce){

        $scope.sortType     = 'name'; // set the default sort type
        $scope.sortReverse  = false;  // set the default sort order
        $scope.search   = '';     

         $scope.updateHistTrans = function (name) {
  $rootScope.histTrans = name;
 
        };
        
    }
    
  };
});
/**
 * Created by jitender choudhary on 10/28/2016.
 */

angular.module('HistCtrl', [])
    .controller('HistoryController', function ($scope, $http, $sce) {
        $scope.transactionList = {
            "running": "",
            "queued": "",
            "archived": ""
        };
        $scope.running = "running";
        $scope.queued = "queued";
        $scope.archived = "archived";
        $scope.getTransactionList = function (transState) {
            $scope.tabType = transState;
            $http.post('/api/transactions/list', { 'transState': transState }).success(function (response) {
                for (var i = 0; i < response.length; i++) {
                    var start = response[i].starttime;
                    var end = response[i].endtime;
                    if (start != null && end != null) {
                        var timeTaken = new Date(end).getTime() - new Date(start).getTime();
                        var seconds = Math.floor(timeTaken / 1000);
                        var h = 3600;
                        var m = 60;
                        var hours = Math.floor(seconds / h);
                        var minutes = Math.floor((seconds % h) / m);
                        if (hours < 10) {
                            hours = "0" + hours;
                        }
                        if (minutes < 10){
                            minutes = "0" + minutes;
                        } 
                        var timeString = hours + " hour " + minutes + " minutes";
                        var temp = response[i];
                        temp.totalTimeSpend = timeString;
                        response[i] = temp;
                    }

                }
                if (transState === 'Running') {
                    $scope.transactionList.running = response;
                } else if (transState === 'Queued') {
                    $scope.transactionList.queued = response;
                } else {
                    $scope.transactionList.archived = response;
                }

            }).error(function (err) {
                console.log('Client : Recieved Data from server', err);
                $scope.transaction.errorMsg.transactionError = err.error;
            });
        };

        $scope.transactionList.running = $scope.getTransactionList("Running");
        $scope.transactionList.queued = $scope.getTransactionList("Queued");
        $scope.transactionList.archived = $scope.getTransactionList("Archived");

    }).controller('HistoryProgress', function ($scope, $rootScope, $http, $sce) {
        $scope.transactionOutput = $rootScope.transactionOutput;
        $scope.displayTransactionProgress = function (histTrans) {
            $http.post('/api/transactions/name/output', { histTrans: histTrans }, {
                responseType: 'arraybuffer'
            })
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
                });
        };
        $scope.getProgress = function () {
            $scope.displayTransactionProgress($rootScope.histTrans);
        };
        // setTimeout(function () { $scope.transactionOutput = $scope.getProgress() }, 5000);
        // $scope.transactionOutput = $scope.getProgress();
    }).directive('historyList', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                transactionList: '=data',
                currentTab: '=tab'
            },
            link: function (scope, element, attrs, controllers) { },
            templateUrl: '../history/historyList.html',
            controller: function ($scope, $rootScope, $http, $sce) {
                $scope.sortType = 'starttime'; // set the default sort type
                $scope.sortReverse = true;  // set the default sort order
                $scope.search = '';
                $scope.updateHistTrans = function (histtrans) {
                    $rootScope.histTrans = histtrans;
                };
            }
        };
    });
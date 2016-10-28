/**
 * Created by jitender choudhary on 10/28/2016.
 */
angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			templateUrl: '../home/home.html',
			controller: 'MainController'
		}).when('/history', {
			templateUrl: '../history/history.html',
			controller: 'HistoryController'	
		}).when('/about', {
			templateUrl: '../about/about.html'
		}).when('/history/progress', {
			templateUrl: '../history/historyProgress.html',
			controller : 'HistoryProgress'
		}).otherwise({
        redirectTo: '/'
      });
	$locationProvider.html5Mode(true);
}]);
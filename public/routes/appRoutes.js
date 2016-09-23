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
		}).otherwise({
        redirectTo: '/'
      });
	$locationProvider.html5Mode(true);
}]);
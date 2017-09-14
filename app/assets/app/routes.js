/**
 * @file routes.js
 * @author engineering@fluid.la
 */
/**
 * Establece la configuracion de las rutas para integrates
 * @config {AngularJS} 
 * @param {Object} $stateProvider
 * @param {Object} $urlRouterProvider
 * @return {undefined}
 */
integrates.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('home');
    
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'assets/views/dashboard.html',
            controller: 'dashboardCtrl'
        })
        .state('FindingResume', {
            url: '/FindingResume/:id',
            templateUrl: 'assets/views/search/vuln_resume.html',
            controller: 'FindingResumeController'  
        })
        .state('SearchProject', {
            url: '/SearchProject/:project',
            templateUrl: 'assets/views/search/vulns_by_name.html',
            controller: 'findingController'  
        })
        .state('ProjectSearch', {
            url: '/Project',
            templateUrl: 'assets/views/project/index.html',
            controller: 'projectCtrl'  
        })
        .state('ProjectNamed', {
            url: '/Project/:project',
            templateUrl: 'assets/views/project/index.html',
            controller: 'projectCtrl'  
        })
        .state('ProjectNameById', {
            url: '/Project/:project/:finding',
            templateUrl: 'assets/views/project/index.html',
            controller: 'projectCtrl'  
        })
        .state('VulnerabilitiesByName', {
            url: '/VulnerabilitiesByName',
            templateUrl: 'assets/views/search/vulns_by_name.html',
            controller: 'findingController'  
        })
            .state('UpdateVuln', {
                url: '/vuln/update/?id',
                templateUrl: 'assets/views/search/vulns_update.html',
                controller: 'findingUpdateController'  
            })
            .state('DeleteVuln', {
                url: '/vuln/delete/?id',
                templateUrl: 'assets/views/search/vulns_delete.html',
                controller: 'findingDeleteController'  
            })
            .state('ReadVuln', {
                url: '/vuln/read/?id',
                templateUrl: 'assets/views/search/vulns_read.html',
                controller: 'findingReadController'  
            })
        .state('EventualitiesByName', {
            url: '/EventualitiesByName',
            templateUrl: 'assets/views/search/event_by_name.html',
            controller: 'eventualityController'        
        })
});
integrates.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      '/assets/views/project/eventualityMdl.html',
      'https://fluid.la/**',
    ]);
});
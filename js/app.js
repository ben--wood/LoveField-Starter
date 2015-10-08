'use strict';

angular
  .module('App', ['ionic'])
  .config(function($stateProvider, $urlRouterProvider) {
  
    $stateProvider      
      .state('noteadd', {
        url: '/noteadd',
        templateUrl: 'views/noteAdd.html',
        controller:'noteAddController as vm'
      })
      .state('noteedit', {
        url: '/noteedit/{id}',
        templateUrl: 'views/noteEdit.html',
        controller:'noteEditController as vm'
      })
      .state('notelist', {
        url: '/notelist',
        templateUrl: 'views/noteList.html',
        controller:'noteListController as vm'
      });
      
      $urlRouterProvider.otherwise("/notelist");
  })
  
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  });
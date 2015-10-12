'use strict';

angular
  .module('app', ['ionic'])
  
  .constant('TABLE', {
    Note: 'Note'
  })
    
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    
    $stateProvider      
      .state('noteadd', {
        url: '/noteadd',
        templateUrl: 'views/noteAdd.html',
        controller:'NoteAddController as vm'
      })
      .state('noteedit', {
        url: '/noteedit/{id}',
        templateUrl: 'views/noteEdit.html',
        controller:'NoteEditController as vm'
      })
      .state('notelist', {
        url: '/notelist',
        templateUrl: 'views/noteList.html',
        controller:'NoteListController as vm'
      });
      
    $urlRouterProvider.otherwise("/notelist");
  }])
  
  .run(['$ionicPlatform', function($ionicPlatform) {
  
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }

    });
  }]);
(function () {
    'use strict';

    angular
      .module('app')
      .controller('NoteEditController', NoteEditController);

    NoteEditController.$inject = ['$log', '$scope', '$state', '$stateParams', 'noteService'];

    function NoteEditController($log, $scope, $state, $stateParams, noteService) {
      var vm = this;
      vm.note = {};
      
      vm.editNote = editNote;        
      
      ////////////
      
      function editNote() {          
        if (vm.noteEditForm.$dirty === true && vm.noteEditForm.$valid === true) {
          noteService.edit(vm.note.id, vm.note.text).then(function() {
            vm.noteEditForm.$setPristine();
            $state.go('notelist');
          });
        }
      }
      
      $scope.$on('$ionicView.enter', function () {          
        noteService.getById($stateParams.id).then(function(note) {          
          vm.note = note;
        });
      });
             
    }
})();

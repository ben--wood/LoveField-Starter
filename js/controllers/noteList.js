(function () {
    'use strict';

    angular
      .module('app')
      .controller('NoteListController', NoteListController);

    NoteListController.$inject = ['$log', '$scope', '$state', 'noteService'];

    function NoteListController($log, $scope, $state, noteService) {
      var vm = this;
      vm.notes = [];
      vm.showDelete = false;   
      
      vm.deleteNote = deleteNote;
      vm.getNotes = getNotes;
      vm.goAddNote = goAddNote;
      vm.goEditNote = goEditNote;
      
      ////////////
      
      function deleteNote(id) {        
        noteService.remove(id).then(function() {      
          getNotes();
        });            
      }
      
      function getNotes() {      
        noteService.getAll().then(function(results) {              
          vm.notes = results;
        });        
      }
      
      function goAddNote() {
        $state.go('noteadd');
      }
      
      function goEditNote(id) {
        $state.go('noteedit', { id: id });
      }
      
      $scope.$on('$ionicView.enter', function () {            
        getNotes();            
      });
      
      $scope.$on('lovefield-starter-event:seedDataInserted', function (event, message) {
        getNotes();            
      });
    }
})();
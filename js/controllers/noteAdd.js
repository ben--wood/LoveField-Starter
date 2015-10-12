(function () {
    'use strict';

    angular
      .module('app')
      .controller('NoteAddController', NoteAddController);

    NoteAddController.$inject = ['$log', '$state', 'noteService'];

    function NoteAddController($log, $state, noteService) {
      var vm = this;
      vm.note = {};
      
      vm.addNote = addNote;        
      
      ////////////
      
      function addNote() {          
        if (vm.noteAddForm.$dirty === true && vm.noteAddForm.$valid === true) {            
          noteService.add(vm.note.text).then(function() {              
            vm.noteAddForm.$setPristine();
            $state.go('notelist');          
          });
        }
      }
             
    }
})();
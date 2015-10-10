(function () {
    'use strict';

    angular
      .module('App')
      .controller('NoteEditController', NoteEditController);

    NoteEditController.$inject = ['$log', '$scope', '$state', '$stateParams', 'dbService', 'TABLE'];

    function NoteEditController($log, $scope, $state, $stateParams, dbService, TABLE) {
      var vm = this;
      vm.note = {};
      
      vm.editNote = editNote;        
      
      ////////////
      
      function editNote() {
          
        if (vm.noteEditForm.$dirty === true && vm.noteEditForm.$valid === true) {

          dbService.getDb().then(function(db) {

            var note = db.getSchema().table(TABLE.Note);

            // Update docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#43-update-query-builder
            db.update(note)
              .set(note.text, vm.note.text)
              .where(note.id.eq(vm.note.id))
              .exec()
              .then(
                function() {
                  vm.noteEditForm.$setPristine();
                  $state.go('notelist');
                });	
          });
        }
      }
      
      $scope.$on('$ionicView.enter', function () {
          
        dbService.getDb().then(function(db) {
          
          var note = db.getSchema().table(TABLE.Note);
          
          db.select()
            .from(note)
            .where(note.id.eq($stateParams.id))
            .exec()
            .then(
              function(results) {
                if (angular.isDefined(results) && results.length === 1) {
                  vm.note = results[0];
                  $scope.$apply();
                } else {
                  $log.error('Note not found with id of: ' + $stateParams.id, results);
                }                   
              });
        });
      });       
    }
})();

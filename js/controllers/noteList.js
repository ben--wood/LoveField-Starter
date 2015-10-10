(function () {
    'use strict';

    angular
      .module('App')
      .controller('NoteListController', NoteListController);

    NoteListController.$inject = ['$log', '$scope', '$state', 'dbService', 'TABLE'];

    function NoteListController($log, $scope, $state, dbService, TABLE) {
      var vm = this;
      vm.notes = [];
      vm.showDelete = false;   
      
      vm.deleteNote = deleteNote;
      vm.getNotes = getNotes;
      vm.goAddNote = goAddNote;
      vm.goEditNote = goEditNote;
      
      ////////////
      
      function deleteNote(id) {
        
        dbService.getDb().then(function(db) {
              
          var note = db.getSchema().table(TABLE.Note);
              
          // DELETE docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#44-delete-query-builder
          db.delete()
            .from(note)
            .where(note.id.eq(id))
            .exec()
            .then(
                function() {      
                    getNotes();
                });	
        });            
      }
      
      function getNotes() {
      
        dbService.getDb().then(function(db) {
              
          var note = db.getSchema().table(TABLE.Note);
              
          // SELECT docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#418-retrieval-of-query-results 
          db.select()
            .from(note)
            .exec()
            .then(
            function(rows) {                        
                vm.notes = rows;                                                
                $scope.$apply();
            });
                  
          // TODO: Observe the select query to save having to explicitly call getNotes() after an INSERT/UPDATE or DELETE docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#46-observers
          // db.observe(selectQuery, handler);

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
(function () {
    'use strict';

    angular
        .module('App')
        .controller('noteListController', noteListController);

    noteListController.$inject = ['$log', '$scope', '$state', 'dbService', 'TABLE'];

    function noteListController($log, $scope, $state, dbService, TABLE) {
        var vm = this;
        vm.notes = [];
        vm.observeGetNotesQuery = null;
        vm.showDelete = false;   
        
        vm.deleteNote = deleteNote;
        vm.getNotes = getNotes;
        vm.goAddNote = goAddNote;
        vm.goEditNote = goEditNote;
        
        ////////////
        
        function deleteNote(id) {
        
            // get a database connection
            dbService.getDb().then((function(db) {
                
                // reference the Notes table 
                var note = db.getSchema().table(TABLE.Note);
                
                // Delete docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#44-delete-query-builder
                db.delete()
                    .from(note)
                    .where(note.id.eq(id))
                    .exec()
                    .then(
                        function() {      
                            getNotes();
                        });	
            }));            
        }
        
        function getNotes() {

            try 
            {
                // get a database connection
                dbService.getDb().then((function(db) {
                    
                    // reference the Notes table 
                    var note = db.getSchema().table(TABLE.Note);
                    
                    // get all incomplete Notes
                    // Select docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#418-retrieval-of-query-results
                    vm.observeGetNotesQuery = db.select()
                                                .from(note)
                                                .exec()
                                                .then(
                                                function(rows) {                        
                                                    vm.notes = rows;                                                
                                                    $scope.$apply();
                                                });	
                
                    // Observe the get notes select query
                    // whenever there is a change to the results of the above select the notelistChangeHandler function will get called
                    
                    //$log.debug(vm.observeGetNotesQuery, notelistChangeHandler);
                    
                    //db.observe(vm.observeGetNotesQuery, notelistChangeHandler);
                        
                }));
            } 
            catch(err) {
                console.log(err);    
            }
        }
        
        function goAddNote() {
            // NOTE: I'm thick and I can't get ui-sref to work in the header
            $state.go('noteadd');
        }
        
        function goEditNote(id) {
            $state.go('noteedit', { id: id });
        }
        
        function notelistChangeHandler(changes) {
            // whenever there is a             
        }

        $scope.$on('$ionicView.enter', function () {
            
            // TODO: for the demo insert some initial data into the db 
            dbService.getDb().then((function(db) {
                  
                  var note = db.getSchema().table(TABLE.Note);
                  
                  db.select()
                        .from(note)
                        .exec()
                        .then(
                              function(rows) {                  
                                    if (rows.length === 0){
                                          dbService.insertSeedData().then(
                                            function() {
                                                getNotes();        
                                            });                        
                                    } else {
                                        getNotes();
                                    }
                              });
            }));
        });

        $scope.$on('$destroy', function () {
            // release the observer
            dbService.getDb().then((function(db) {
                //db.unobserve(vm.observeGetNotesQuery, notelistChangeHandler);
            }));
        });
    }
})();
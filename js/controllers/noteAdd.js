(function () {
    'use strict';

    angular
        .module('App')
        .controller('noteAddController', noteAddController);

    noteAddController.$inject = ['$log', '$state', 'dbService'];

    function noteAddController($log, $state, dbService) {
        var vm = this;
        vm.note = {};
        
        vm.addNote = addNote;        
        
        ////////////
        
        function addNote() {
            
            if (vm.noteAddForm.$dirty === true && vm.noteAddForm.$valid === true) {
                
                // get a database connection
                dbService.getDb().then((function(db) {
                    
                    // reference the Notes table 
                    var note = db.getSchema().table('Note');

                    var row = note.createRow({
                        'id': dbService.guid(),
                        'text': vm.note.text
                    });

                    // https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#42-insert-query-builder
                    db.insertOrReplace()
                        .into(note)
                        .values([row])
                        .exec()
                        .then(
                            function() {
                                vm.noteAddForm.$setPristine();
                                $state.go('notelist');
                            });	
                }));
            }
        }       
    }
})();
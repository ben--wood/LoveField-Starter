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
            
            console.log('add note 1');
            
            if (vm.noteAddForm.$dirty === true && vm.noteAddForm.$valid === true) {
                
                console.log('add note 2');
                
                // get a database connection
                dbService.getDb().then((function(db) {
                    
                    // reference the Notes table 
                    var note = db.getSchema().table('Note');

                    var row = note.createRow({
                        'id': guid(),
                        'text': vm.note.text
                    });
console.log('add note 3');

                    // https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#42-insert-query-builder
                    db.insertOrReplace()
                        .into(note)
                        .values([row])
                        .exec()
                        .then(
                            function() {
                                console.log('add note 4');
                                vm.noteAddForm.$setPristine();
                                $state.go('notelist');
                            });	
                }));
            }
        }
        
        // copy/paste - thank you: http://stackoverflow.com/a/105074/2652910
        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }        
    }
})();
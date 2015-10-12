(function () {
    'use strict';

    angular
      .module('app')
      .factory('noteService', noteService);

    noteService.$inject = ['$log', '$q', 'dbService'];

    function noteService($log, $q, dbService) {
    
      var service = {
        add: add,
        edit: edit,
        getAll: getAll,
        getById: getById,
        remove: remove
      };

      return service;

      ////////////


      function add(text) {         
        var deferred = $q.defer();        
        
        dbService.connect().then(function() {
            
          var row = dbService.noteTable_.createRow({
            'id': guid(),
            'text': text
          });

          // Insert docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#42-insert-query-builder
          dbService.db_.insertOrReplace()
            .into(dbService.noteTable_)
            .values([row])
            .exec()
            .then(
              function() {
                deferred.resolve();
              });	
        });
                
        return deferred.promise; 
      }
      
      function edit(id, text) {         
        var deferred = $q.defer();        
        
        dbService.connect().then(function() {

          // Update docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#43-update-query-builder
          dbService.db_.update(dbService.noteTable_)
            .set(dbService.noteTable_.text, text)
            .where(dbService.noteTable_.id.eq(id))
            .exec()
            .then(
              function() {
                deferred.resolve();
              });	
        });
                
        return deferred.promise; 
      }
      
      function getById(id) {         
        var deferred = $q.defer();        
        
        dbService.connect().then(function() {
          
          dbService.db_.select()
            .from(dbService.noteTable_)
            .where(dbService.noteTable_.id.eq(id))
            .exec()
            .then(
              function(results) {
                if (angular.isDefined(results) && results.length === 1) {
                  deferred.resolve(results[0]);                  
                } else {
                  $log.error('Note not found with id of: ' + id, results);
                  deferred.reject();
                }                   
              });
        });
                
        return deferred.promise; 
      }
      
      function getAll() {         
        var deferred = $q.defer();        
        
        dbService.connect().then(function() {
          
          // TODO: Observe the select query to save having to explicitly call getNotes() after an INSERT/UPDATE or DELETE docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#46-observers
          // db.observe(selectQuery, handler);
          
          // SELECT docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#418-retrieval-of-query-results 
          dbService.db_.select()
            .from(dbService.noteTable_)
            .exec()
            .then(
            function(rows) {
              deferred.resolve(rows);
            });
        });
                
        return deferred.promise; 
      }
      
      function remove(id) {         
        var deferred = $q.defer();        
        
        dbService.connect().then(function() {
          
          // DELETE docs: https://github.com/google/lovefield/blob/master/docs/spec/04_query.md#44-delete-query-builder
          dbService.db_.delete()
            .from(dbService.noteTable_)
            .where(dbService.noteTable_.id.eq(id))
            .exec()
            .then(
                function() {      
                    deferred.resolve();
                });
        });
                
        return deferred.promise; 
      }
      
    
      /**
      * Creates a guid.
      * @return {guid}     
      * copy/pasted from http://stackoverflow.com/a/105074/2652910 - thank you
      */
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
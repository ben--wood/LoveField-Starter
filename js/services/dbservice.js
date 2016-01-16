/**
 * This is inspired by/ripped off from various bits of LoveField demo code:
 * https://github.com/googlesamples/io2015-codelabs/blob/master/lovefield/src/final/lovefield_service.js
 * https://github.com/google/lovefield/blob/master/demos/olympia_db/angular/demo.js
 * Thank you!
 */

(function () {
    'use strict';

    angular
      .module('app')
      .factory('dbService', dbService);

    dbService.$inject = ['$http', '$log', '$q', '$rootScope', 'TABLE'];

    function dbService($http, $log, $q, $rootScope, TABLE) {
      var db_ = null;
      var noteTable_ = null;
      var isConnecting_ = false;
    
      var service = {
        db_: db_,
        noteTable_: noteTable_,
         
        connect: connect,
        initDatabase: initDatabase
      };

      return service;

      ////////////


      /**
      * Initializes a database connection.
      * @return {!angular.$q.Promise} - promise is resolved when the db_ and noteTable_ properties have had values assigned to them 
      * 
      * NOTE: 2015/10/10
      *       When no connection options are set LoveField does some feature detection to determine which backing store to use.
      *       If the browser supports IndexedDb it uses that, then falls back to WebSql and finally to an "in memory" data store.
      *       I found when debugging on actual devices that LoveField chose the in memory (lf.schema.DataStoreType.MEMORY) store 
      *       on iOS which didn't work so well so here we ensure WebSql is used for iOS and Android devices. 
      *       IndexedDb seemed to work well on desktop browsers. 
      *       https://github.com/google/lovefield/blob/master/docs/spec/03_life_of_db.md#311-connect-options
      *       https://cordova.apache.org/docs/en/5.1.1/cordova/storage/storage.html 
      *       http://caniuse.com/#feat=indexeddb
      *       https://github.com/google/lovefield/blob/master/docs/dd/02_data_store.md#25-websql-store   
      */
      function connect() {
        var deferred = $q.defer();  
        
        console.info('connect() isConnecting_', isConnecting_);
        
        if (isConnecting_ === false) {         
        
          var connectionOptions = { storeType: lf.schema.DataStoreType.INDEXED_DB };
          if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
            connectionOptions = { storeType: lf.schema.DataStoreType.WEB_SQL };
          }
          
          if (service.db_ === null) {
            isConnecting_ = true;
            buildSchema()
              .connect(connectionOptions)
              .then((
                function(database) {
                  isConnecting_ = false;
                  service.db_ = database;
                  service.noteTable_ = service.db_.getSchema().table(TABLE.Note);
                  window.db = database;
                  deferred.resolve();                     
                }));
          } else {
            deferred.resolve();
          }
        } else {
          deferred.reject('Still connecting to the database');
        }
        
        return deferred.promise; 
      }
      
    
      /**
      * Checks if any data exists in the DB.
      * @return {!angular.$q.Promise.<!boolean>}
      */
      function checkForExistingData() {  
        var deferred = $q.defer(); 
        
        service.db_.select().from(service.noteTable_).exec().then(
          function(rows) {
            deferred.resolve(rows.length > 0);
          }
        );
        
        return deferred.promise;
      }
    
      /**
      * Inserts seed data into the DB.
      * @return {!angular.$q.Promise}      
      * @private
      */
      function insertSeedData() {
        $log.debug('Populating initial Note data');
          
        var url = "../js/data/notes.json";
        if (ionic.Platform.isAndroid()) {
          url = "/android_asset/www/js/data/notes.json";
        } else if (ionic.Platform.isIOS()) {
          url = "js/data/notes.json";
        }
        
        return $http.get(url).then(
          function(response) {
            var rows = response.data.map(function(obj) {
              return service.noteTable_.createRow(obj);
            });
            
            return service.db_.insert()
                      .into(service.noteTable_)
                      .values(rows)
                      .exec();
          });
        
      }

    
      /**
      * Builds the database schema.
      * @return {!lf.schema.Builder}
      * @private
      * TODO: this is where you would define your database tables
      * https://github.com/google/lovefield/blob/master/docs/spec/01_schema.md
      */
      function buildSchema() {  
        var schemaBuilder = lf.schema.create('LoveField-Starter', 1);
        schemaBuilder.createTable(TABLE.Note).
          addColumn('id', lf.Type.STRING).
          addColumn('text', lf.Type.STRING).
          addPrimaryKey(['id']).
          addIndex('idx_text', ['text']);
        return schemaBuilder;
      }
      
      
      /**
      * Connects to and seeds the database with some dummy data if no data exists.
      * @private
      */
      function initDatabase() {        
        $log.debug('Attempt to connect to and seed the database');  
        connect().then(function() {
          $rootScope.$broadcast('lovefield-starter-event:dbConnected');
          checkForExistingData().then(
            function(dataExists){            
              if (dataExists === false) {
                insertSeedData().then(
                  function(){                      
                    $rootScope.$broadcast('lovefield-starter-event:seedDataInserted');
                  }
                );  
              }                 
            }
          );    	
        });        
      }

    }
})();
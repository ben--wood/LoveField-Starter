/**
 * This is inspired by/ripped off from various bits of LoveField demo code:
 * https://github.com/googlesamples/io2015-codelabs/blob/master/lovefield/src/final/lovefield_service.js
 * https://github.com/google/lovefield/blob/master/demos/olympia_db/angular/demo.js
 * Thank you!
 */

(function () {
    'use strict';

    angular
      .module('App')
      .factory('dbService', dbService);

    dbService.$inject = ['$http', '$log', '$q', '$rootScope', 'TABLE'];

    function dbService($http, $log, $q, $rootScope, TABLE) {
      var db_ = null;
    
      var service = {
        getDb: getDb,
        guid: guid
      };

      return service;

      ////////////


      /**
      * Gets the db connection.
      * @return {!IThenable.<!lf.Database>}
      */
      function getDb() {
        return init().then(
                  function() {
                    return db_;
                  });
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
    
    
      /**
      * Checks if any data exists in the DB.
      * @return {!IThenable.<!boolean>}
      */
      function checkForExistingData() {  
        var deferred = $q.defer(); 
              
        var note = db_.getSchema().table(TABLE.Note);        
      
        db_.select().from(note).exec().then(
          function(rows) {
            deferred.resolve(rows.length > 0);
          }
        );
        
        return deferred.promise;
      };
    
      /**
      * Inserts seed data into the DB.
      * @return {!angular.$q.Promise}      
      */
      function insertSeedData() {
        $log.debug('Populating initial Note data');
        var note = db_.getSchema().table(TABLE.Note);
        
        var url = "../js/data/notes.json";
        if (ionic.Platform.isAndroid()) {
          url = "/android_asset/www/js/data/notes.json";
        } else if (ionic.Platform.isIOS()) {
          url = "js/data/notes.json";
        }
        
        return $http.get(url).then(
          function(response) {
            var rows = response.data.map(function(obj) {
              return note.createRow(obj);
            });
            
            return db_.insert()
                      .into(note)
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
      * Initializes a database connection.
      * @return {!IThenable.<!lf.Database>}
      * @private
      * 
      * NOTE: 2015/10/10
      *       When no connection options are set LoveField does some feature detection to determine which backing store to use.
      *       If the browser supports IndexedDb it uses that, then falls back to WebSql and finally to an "in memory" data store. 
      *       I found when debugging on an iOS device that LoveField chose the in memory (lf.schema.DataStoreType.MEMORY) store 
      *       which didn't work so well so here we ensure WebSql is used for iOS devices. 
      *       IndexedDb seemed to work ok on Android devices and desktop browsers. 
      *       https://github.com/google/lovefield/blob/master/docs/spec/03_life_ofdb_.md#311-connect-options
      *       https://cordova.apache.org/docs/en/5.1.1/cordova/storage/storage.html 
      *       http://caniuse.com/#feat=indexeddb
      *       https://github.com/google/lovefield/blob/master/docs/dd/02_data_store.md#25-websql-store      
      */
      function init() {        
        var deferred = $q.defer();        
        
        if (db_ !== null) {
          deferred.resolve(db_);
        }
       
        var connectionOptions = { storeType: lf.schema.DataStoreType.INDEXED_DB };
        if (ionic.Platform.isIOS()) {
          connectionOptions.storeType = lf.schema.DataStoreType.WEB_SQL;
        }
            
        return buildSchema()
                .connect(connectionOptions)
                .then((
                  function(database) {
                    db_ = database;
                    window.db = database;
                    onConnected();
                    deferred.resolve(db_);                     
                  }));
                      
        return deferred.promise;   
      }
      
      
      /**
      * Seeds the database with some dummy data if no data exists.
      * @private
      * TODO: this means there will never be 0 notes in the database so perhaps better moved into app.run?
      */
      function onConnected() {
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
      }

    }
})();
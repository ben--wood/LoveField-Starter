/**
 * This is ripped off from the LoveField Olympics demo here:
 * https://github.com/google/lovefield/blob/master/demos/olympia_db/angular/demo.js
 * 
 * Slightly simplified so seed data is only inserted when you explicitly call the insertSeedData() function  
 */

(function () {
    'use strict';

    angular
        .module('App')
        .factory('dbService', dbService);

    dbService.$inject = ['$http', '$log', 'TABLE'];

    function dbService($http, $log, TABLE) {

      var _db = null;
    
      var service = {
          getDb: getDb,
          guid: guid,
          insertSeedData: insertSeedData
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
                    return _db;
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
      * Inserts seed data into the DB.
      * @return {!angular.$q.Promise}      
      */
      function insertSeedData() {
        $log.debug('Populating initial Note data');
        var note = _db.getSchema().table(TABLE.Note);
        
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
              
              return _db.insert()
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
      * By default LoveField uses IndexedDb - I've changed it to use WebSql as WebSql works better with Cordova on Android and iOS
      * https://cordova.apache.org/docs/en/5.1.1/cordova/storage/storage.html 
      * http://caniuse.com/#feat=indexeddb
      * https://github.com/google/lovefield/blob/master/docs/dd/02_data_store.md#25-websql-store
      *  
      * You can set various connection options including using Firebase as your data store:
      * https://github.com/google/lovefield/blob/master/docs/spec/03_life_of_db.md#311-connect-options      
      */
      function init() {        
       
        var connectionOptions = { storeType: lf.schema.DataStoreType.WEB_SQL };
            
        return buildSchema()
                  .connect(connectionOptions)
                  .then((
                        function(database) {
                              _db = database;
                              window.db = database;
                        
                              Promise.resolve(_db);                        
                        }));
      }

    }
})();

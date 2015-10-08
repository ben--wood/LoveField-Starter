/**
 * 
 */

(function () {
    'use strict';

    angular
        .module('App')
        .factory('dbService', dbService);

    dbService.$inject = ['$http', '$log'];

    function dbService($http, $log) {

      var _db = null;
    
      var service = {
          getDb: getDb
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
      };
    
      /**
      * Builds the database schema.
      * @return {!lf.schema.Builder}
      * @private
      * TODO: this is where you would define your database tables
      * https://github.com/google/lovefield/blob/master/docs/spec/01_schema.md
      */
      function buildSchema() {  
        var schemaBuilder = lf.schema.create('LoveField-Starter', 1);
        schemaBuilder.createTable('Note').
            addColumn('id', lf.Type.STRING).
            addColumn('text', lf.Type.STRING).
            addPrimaryKey(['id']).
            addIndex('idx_text', ['text']);
        return schemaBuilder;
      }
  
  
      /**
      * Checks if any data already exists in the DB.
      * @return {boolean}
      * @private
      */
      function checkForExistingData() {
        var note = _db.getSchema().table('Note');
        return _db.select().from(note).exec().then(
            function(rows) {
              return rows.length > 0;
            });
      };
      
      
      /**
      * Ensures that the database is populated with data and initializes the DB connection.
      * @return {!IThenable}
      * @private 
      */
      function init() {
        // By default LoveField uses IndexedDb - I've changed it to use WebSql as it works with Cordova on Android and iOS
        // https://cordova.apache.org/docs/en/5.1.1/cordova/storage/storage.html 
        // http://caniuse.com/#feat=indexeddb
        // https://github.com/google/lovefield/blob/master/docs/dd/02_data_store.md#25-websql-store
        
        // You can set various connection options including using Firebase as your data store
        // https://github.com/google/lovefield/blob/master/docs/spec/03_life_of_db.md#311-connect-options
        var connectionOptions = { storeType: lf.schema.DataStoreType.WEB_SQL };
            
        return buildSchema().connect(connectionOptions).then((
            function(database) {
              _db = database;
              window.db = database;
              // if there is no data in the database populate it with some dummy data
              return checkForExistingData();
            }).bind(this)).then((
            function(dataExist) {
              return dataExist ? Promise.resolve() : insertData();
            }).bind(this));
      };
      
      
      /**
      * Inserts seed data to the DB.
      * @return {!angular.$q.Promise}
      * @private
      * TODO: this is where you could pre-populate your database tables
      */
      function insertData() {
        $log.debug('Populating Note data');
        var note = _db.getSchema().table('Note');
        
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
              return _db.insert().into(note).values(rows).exec();
            });
      };

    }
})();

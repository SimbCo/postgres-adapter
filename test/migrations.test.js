var Schema = require('jugglingdb').Schema;
var db, UserData, StringData, NumberData, DateData;

describe('migrations', function() {
     
    before(setup);
    
    it('should run migration', function(done) {
        db.automigrate(function(){
            done();
        });
    });


});


function setup(done) {

    require('./init.js');
    
    db = getSchema();
    
    UserData = db.define('UserData', {
        email: { type: String, null: false, index: true },
        name: String,
        bio: Schema.Text,
        birthDate: Date,
        pendingPeriod: Number,
        createdByAdmin: Boolean,
    } , { indexes: {
            index0: {
                columns: 'email, createdByAdmin'
            }
        }
    });

    // StringData = db.define('StringData', {
    //     smallString: {type: String, null: false, index: true, dataType: 'char', limit: 127},
    //     mediumString: {type: String, null: false,  dataType: 'varchar', limit: 255},
    //     tinyText: {type: String, dataType: 'tinyText'},
    //     giantJSON: {type: Schema.JSON, dataType: 'longText'},
    //     text: {type: Schema.Text, dataType: 'varchar', limit: 1024}
    // });
    
    NumberData = db.define('NumberData', {
        inter: {type: Number, dataType: 'integer', precision: 10, scale: 3},
        smallint: {type: Number, dataType: 'smallint', display: 2},
        bigint: {type: Number, dataType: 'bigint', unsigned: true},
        numeric: {type: Number, dataType: 'numeric', precision: 14, scale: 6},
        doubl: {type: Number, dataType: 'double precision'},
        real: {type: Number, dataType: 'real'},
    });
        
    // DateData = db.define('DateData', {
    //     dateTime: {type: Date, dataType: 'datetime'},
    //     timestamp: {type: Date, dataType: 'timestamp'}
    // });

    blankDatabase(db, done);
    
}

var query = function (sql, cb) {
    db.adapter.query(sql, cb);
};

var blankDatabase = function (db, cb) {
    var dbn = db.settings.database;
    var cs = db.settings.charset;
    var co = db.settings.collation;
    query('DROP DATABASE IF EXISTS ' + dbn, function(err) {
        var q = 'CREATE DATABASE ' + dbn;
        if(cs){
            q += ' CHARACTER SET ' + cs;
        }
        if(co){
            q += ' COLLATE ' + co;
        }
        // query(q, function(err) {
        //     query('USE '+ dbn, cb);
        // });
    	cb();
    });
};

getFields = function (model, cb) {
    query('SHOW FIELDS FROM ' + model, function(err, res) {
        if (err) {
            cb(err);
        } else {
            var fields = {};
            res.forEach(function(field){
                fields[field.Field] = field;
            });
            cb(err, fields);
        }
    });
}

getIndexes = function (model, cb) {
    query('SHOW INDEXES FROM ' + model, function(err, res) {
        if (err) {
            console.log(err);
            cb(err);
        } else {
            var indexes = {};
            // Note: this will only show the first key of compound keys
            res.forEach(function(index) {
                if (parseInt(index.Seq_in_index, 10) == 1) {
                    indexes[index.Key_name] = index 
                }
            });
            cb(err, indexes);
        }
    });
};

var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var busboy = require('express-busboy');
var Grid=require('gridfs-stream');
var fs=require('fs');

var app = express();
busboy.extend(app, {
    upload: true
});

var passportStrategy = require('./strategy/strategy');
var routes = require('./routes/routes');

app.set('views','./views');
app.set('view engine','ejs');

app.use(express.static('./static'));

var URI= process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/ganastore';

var port= process.env.PORT || 7700;

mongoose.Promise = global.Promise;
mongoose.connect(URI, {useMongoClient: true},function(err,res){
      if (err) {
      console.log ('ERROR connecting to: ' + URI + '. ' + err);
      } else {
      console.log ('Connected to: ' + URI);
      }
});
var conn=mongoose.connection;

var gfs;
Grid.mongo=mongoose.mongo;

conn.once('open',function(err){
    if(err){return res.send(err);}
    gfs=Grid(conn.db);
    console.log('grid connected');
});

passportStrategy();

app.use(cookieParser());
app.use(session({
    secret: 'qwertyuiop',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
var songs;
fs.readFile('./songsList.json',function(err,data,next){
    if(err)return next(err);
    songs=JSON.parse(data);
});
app.use(function(req,res,next){
    res.locals.data=songs;
    next();
});
app.use(routes);

app.post('/upload',function(req,res){
    
    if(!req.user){
          req.flash('info','Not authorized to upload! First login.');
            return res.redirect('/');
    }
    var song=req.files.file;
     
    gfs.exist({filename:song.filename}, function (err, found) {
  if (err) return handleError(err);
        if(found){
            req.flash('info','File already exists!');
            return res.redirect('/');
        }
     if(!found && song.mimetype==='audio/mp3'){
    var ws=gfs.createWriteStream({filename:song.filename,contentType:song.mimetype});
    fs.createReadStream(song.file).pipe(ws);
    
    ws.on('close',function(){
        fs.unlink(song.file);
        return res.redirect('/');
    });
    songs.songs.push({sName:song.filename});
    var json=JSON.stringify(songs);
    fs.writeFile('./songsList.json',json);
      }
        else{
          req.flash('info','Only .mp3 files are allowed to upload !');
            return res.redirect('/');
    }
});
    
});
    
app.get('/listen/:name',function(req,res){
    var name=req.params.name;
    var rs=gfs.createReadStream({filename:name});
    rs.pipe(res);
});

app.listen(port, function (err) {
    if (err) throw err;
    else {
        console.log('Server started on port: '+port);
    }
});


var app = require('../server.js');
var monk = require('monkii');
var url = require('url');
var auth = require('./auth');

var db = monk(process.env.MONGODB_URI || 'mongodb://localhost:27017/local');

var experiences = db.get("experiences");
var categories = db.get("categories");
var users = db.get("users");

//experiences.remove({});
//categories.remove({});
// 
// app.get('/demoReset', function(req, res) {
//     experiences.remove({});
//     categories.remove({});
//     res.json("The database has been reset");
// });

app.post('/auth/login', function(req, res) {
    auth.login(req.body.email, req.body.password, function (err, user) {
        if (err) return res.status(401).end();
        auth.createToken(user, function (err, token) {
            if (err) return res.status(500);
            res.json({ email: user.email, token: token });
        });
    });
});

app.post('/auth/signup', function(req, res) {
    auth.signup(req.body.email, req.body.password, function (err, user) {
        if (err) return res.status(400).end();
        auth.createToken(user, function (err, token) {
            if (err) return res.status(500);
            res.json({ email: user.email, token: token });
        });
    });
});

app.get('/categories', function(req,res) {
    auth.getUser(req.get('Authorization'), function (err, user) {
        if (err) return res.status(401).end();
        categories.find({ email: user.email }, function(e,docs) {
            if(docs.length > 0){
                res.json(docs[0]);
            }
            else {
                var userCategories = {
                    email: user.email,
                    categories: [
                        { "name" : "Leadership" },
                        { "name" : "Overcoming Weakness" },
                        { "name" : "Working With a Team" },
                        { "name" : "Changing the World" },
                        { "name" : "Miscellaneous" }
                    ]
                }
                categories.insert(userCategories);
                res.json(userCategories);
            }
        });
    });
});

app.put('/categories', function(req, res) {
    auth.getUser(req.get('Authorization'), function (err, user) {
        if (err) return res.status(401).end();
        var newCategory = req.body;
        categories.update({ email: user.email}, {$push: {
            'categories' : newCategory
            }
        }, function(e, docs) {
            if(!e){
                res.status(200);
                res.json({success: true});
            }
            else{
                res.status(500);
            }
        });
    });
});

app.post('/categories', function(req, res) {
    console.log("inside post");
    auth.getUser(req.get('Authorization'), function (err, user) {
        if (err) return res.status(401).end();
        categories.find({ email: user.email }, function(e,docs) {
            var category = req.body;
            console.log(docs['categories']);
            docs.categories.insert(category);
            console.log(docs);
        });
    });
});

app.get('/experiences',function(req,res){
    auth.getUser(req.get('Authorization'), function (err, user) {
        if (err) return res.status(401).end();
        experiences.find({ email: user.email }, function(e, docs) {
            res.json(docs);
        });
    });
});

app.post('/experiences', function(req, res) {
    auth.getUser(req.get('Authorization'), function (err, user) {
        if (err) return res.status(401).end();
        var experience = req.body;
        experience.email = user.email;
        experiences.insert(experience, function(e, doc) {
            if (doc){
                res.status(200);
                res.json(doc);
            }
            else
                res.status(500);
        });
        res.status();
    });
});

app.get('/experiences/:id',function(req,res) {
    auth.getUser(req.get('Authorization'), function (err, user) {
        if (err) return res.status(401).end();
        var id = req.params.id;
        experiences.find({ _id : id }, function(e, doc) {
            if(docs.length > 0){
                res.status(200);
                res.json(docs[0]);
            }
            else if (e)
                res.status(500);
            else
                res.status(400);
        });
    });
});

app.put('/experiences/:id', function(req, res) {
    auth.getUser(req.get('Authorization'), function (err, user) {
        if (err) return res.status(401).end();
        var id = req.params.id;
        var experience = req.body;
        experiences.update({ _id : id }, experience, function(e) {
            if (!e) {
                res.status(200);
                res.json(experience);
            }
            else {
                res.status(500);
            }
        });
    });
});

app.delete('/experiences/:id', function(req, res) {
    auth.getUser(req.get('Authorization'), function (err, user) {
        if (err) return res.status(401).end();
        var id = req.params.id;
        experiences.find({ _id : id }, function(e, docs) {
            if(docs.length > 0){
                experiences.remove(docs[0], function(e) {
                    if (!e){
                        res.status(200);
                        res.json("success");
                    }
                    else{
                        res.status(500);
                        res.json("success");
                    }
                });
            }
        });
    });
});

const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');


const accessTokenSecret = 'hdjfhdjfhjdhjsdh743846375';

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
    console.log('authenticateJWT: '+  authenticateJWT);
    User.find()
    .then(users => {
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Something went wrong while getting list of users."
        });
    });
};

// Create and Save a new User
exports.create = (req, res) => {
    // Validate request
    if(!req.body) {
        return res.status(400).send({
            message: "Please fill all required field"
        });
    }

    // Create a new User
    const user = new User({
        first_name: req.body.first_name, 
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        role: req.body.role
    });

    // Save user in the database
    if(req.body.role == 'admin'){
        console.log("creating admin user...");
        user.save()
        .then(data => {
                // Generate an access token
                console.log("generating token...");
                const accessToken = jwt.sign({ first_name: user.first_name,  role: user.role }, accessTokenSecret);
                console.log(accessToken + ": accesstoken");
                //res.send(data,accessToken);
                res.json({
                    accessToken
                });
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Something went wrong while creating new user."
            });
        });
    }else{
        console.log("creating member user...");

    }

    // create role=member
    // mocha
};

// Find a single User with a id
exports.findOne = (req, res) => {
    User.findById(req.params.id)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.id
            });            
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params.id
            });                
        }
        return res.status(500).send({
            message: "Error getting user with id " + req.params.id
        });
    });
};

// Update a User identified by the id in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body) {
        return res.status(400).send({
            message: "Please fill all required field"
        });
    }

    // Find user and update it with the request body
    User.findByIdAndUpdate(req.params.id, {
        first_name: req.body.first_name, 
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        role: req.body.role
    }, {new: true})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "user not found with id " + req.params.id
            });
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "user not found with id " + req.params.id
            });                
        }
        return res.status(500).send({
            message: "Error updating user with id " + req.params.id
        });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
    User.findByIdAndRemove(req.params.id)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "user not found with id " + req.params.id
            });
        }
        res.send({message: "user deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "user not found with id " + req.params.id
            });                
        }
        return res.status(500).send({
            message: "Could not delete user with id " + req.params.id
        });
    });
};

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader;
        console.log('token: ' + token);

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}
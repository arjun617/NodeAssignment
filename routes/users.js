const { Router } = require('express')
const route = Router()
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { User } = require('../db/index')
const bcrypt = require('bcrypt');
const saltRounds = 10;


route.post('/', async(req, res) => {
    try {
        const payload = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        var privateKEY = fs.readFileSync(__dirname + '\\keys\\private.key', 'utf8');
        var publicKEY = fs.readFileSync(__dirname + '\\keys\\public.key', 'utf8');
        var i = 'Arjun Dhall'; // Issuer 
        var s = 'a@d.com'; // Subject 
        var a = 'http://arjundhall.in'; //audience
        var signOptions = {
            issuer: i,
            subject: s,
            audience: a,
            expiresIn: "12h",
            algorithm: "RS256"

        };

        var jwtToken = jwt.sign(payload, privateKEY, signOptions);


        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            token: jwtToken
        })
        res.status(201).json({ user: newUser })
    } catch (e) {
        res.status(400).json({ message: e.errors[0].message })
    }
})

route.get('/user', async(req, res) => {
    const jwtToken = req.header("Authorization")
    jwtToken = jwtToken.split(" ");
    jwtToken = jwtToken[1]
    const user = await User.findOne({
        where: {
            token: jwtToken
        }
    })

    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ user: user })
})

route.post('/login', async(req, res) => {
    try {
        const payload = {
            email: req.body.email,
            password: req.body.password
        }

        const userInDb = await User.findOne({
            where: { email: req.body.email }
        })
        if (!userInDb) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (userInDb.password !== payload.password) {
            return res.status(400).json({ message: "Invalid Password" })
        }
        res.status(200).json({ user: userInDb })
    } catch (e) {
        res.status(400).json({ message: e.errors[0].message })
    }
})

module.exports = route
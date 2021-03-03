const express = require('express');
const authmiddleware = require('../middlewars/auth')
const router = express.Router();


router.use(authmiddleware);

router.get('/',(req,res)=>{
    res.send({ ok: true,user:req.userId });
});

module.exports = app => app.use('/projetos',router);
const jwt = require('jsonwebtoken')
const authconfig = require('../../config/auth.json')
module.exports = (req,res,next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(401).send({erro:'Token não fornecido'});

    const parts = authHeader.split(' ');

    if(!parts.length === 2)
        return res.status(401).send({erro:'Erro no token'});

    const [scheme,token] = parts;

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send({erro:'Token errado'})
    
    jwt.verify(token,authconfig.secret,(err, decoded) => {
      if (err) return res.status(401).send({erro:'Token inválido'})
      req.userId = decoded.id;
      return next();
    })


};
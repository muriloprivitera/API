const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const crypto = require('crypto')
const transport = require ('../../modules/mailer')

const authconfig = require('../../config/auth.json')

const router = express.Router()

function generateToken(params={}){
  return jwt.sign(params,authconfig.secret,{
    expiresIn:86400
})
}

router.post('/registro',async(req,res)=>{
    const { email } = req.body
    
    try{
        if (await User.findOne({ email }))
            return res.status(400).send({error:'tente outro'})
      const user = await User.create(req.body)
        
        user.password = undefined

      return res.send({ 
        user,
        token:generateToken({id: user.id})
      })
    } catch(err){
        return res.status(400).send({erro:'Falha no registro'})
    }
})


router.post('/validacao',async(req,res)=>{
  const{email,password}= req.body;
  const user = await User.findOne({email}).select('+password')

  if (!user)
   return res.status(400).send({erro:'Usuario não existe'})
 
  if(!await bcrypt.compare(password,user.password))
   return res.status(400).send({erro:'Senha invalida'})
  
  user.password = undefined
  

  res.send
  ({ user,
    token:generateToken({ id:user.id }) 
  });
});


router.post('/esqueceuasenha',async(req,res)=>{
  const { email } = req.body;
 
  try{
    const user = await User.findOne({email});
    if(!user)
      return res.status(400).send({erro:'Usuario não existe'})
    const token = crypto.randomBytes(20).toString('hex');

    const now = new Date();
    now.setHours(now.getHours()+1);
    await User.findByIdAndUpdate(user.id,{
      '$set':{
        passwordResetToken:token,
        passwordResetExpires:now,
      }
    });
    const mailOptions = {
      to: email,
      from: 'muriloprivitera24@gmail.com',
      template:'auth/esqueceuasenha',
      context:{token},
  }
  transport.sendMail(mailOptions, function(error, info){
    if(error){
     return res.send([{error:'Email não enviado'}])
        
    }
    return res.send([{data:'Email enviado com sucesso'}])

});

  }catch(err){
    res.status(400).send({error: 'Tente novamente'});
  }
})
router.post('/resetsenha',async(req,res)=>{
  const {email, token, password} = req.body

  try{
    const user = await User.findOne({ email })
      .select('+passwordResetToken passwordResetExpires');
   
      if(!user)
       return res.status(400).send({erro:'Usuario não existe'});
   
       if(token !== user.passwordResetToken)
      return res.status(400).send ({erro: 'Token invalido' });
    const now = new Date()
    
    if(now>user.passwordResetExpires)
     return res.status(400).send({erro: 'Token expirado,gere outro token'});

    user.password = password;

    await user.save();

    res.send();
  } catch(err){
    res.status(400).send({erro:'Você nao pode restaurar a senha, tente novamente'})
  }
})



module.exports=app=>app.use('/autenticacao',router)
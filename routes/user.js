const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

router.post('/signup', (req, res) => {

    // Obtén los datos del usuario del cuerpo de la solicitud
    const user = req.body;

    // Verifica si el correo electrónico ya existe en la base de datos
    const email = user.email;
    const checkEmailQuery = "SELECT email FROM user WHERE email=?";
    connection.query(checkEmailQuery, [email], (err, emailResults) => {
        if (err) {
            // Si hay un error en la consulta, devuelve un error de servidor
            return res.status(500).json({ error: "Error en la base de datos" });
        }

        if (emailResults.length > 0) {
            // Si el correo electrónico ya existe, devuelve un error 400
            return res.status(400).json({ message: "El correo electrónico ya existe" });
        }

        // Si el correo electrónico no existe, inserta el nuevo usuario
        const insertUserQuery = "INSERT INTO user (name, contactNumber, email, password, status, role) VALUES (?, ?, ?, ?, 'false', 'user')";
        const values = [user.name, user.contactNumber, user.email, user.password];

        connection.query(insertUserQuery, values, (err, insertResults) => {
            if (err) {
                // Si hay un error al insertar, devuelve un error de servidor
                return res.status(500).json({ error: "Error en la base de datos al insertar usuario" });
            }

            // Si se inserta correctamente, devuelve un mensaje de éxito
            return res.status(200).json({ message: "Registro exitoso" });
        });
    });
});

router.post('/login', (req, res) => {
    const user = req.body;
    query = "select email, password, role, status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                return res.status(401).json({ message: "Nombre de usuario o contraseña incorrectas" });
            }
            else if (results[0].status === 'false') {
                return res.status(401).json({ message: "Espera la aprobación del administrador" });
            }
            else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
                res.status(200).json({ token: accessToken });
            }
            else {
                return res.status(400).json({ message: "Algo fallo. Por favor, intenta de nuevo después" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "select email, password from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if(!err){
            if(results.length <= 0){
                return res.status(200).json({message: "La contraseña se envio correctamente a tu correo"});
            }
            else{
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Contraseña por el sistema de gestión de "Donde nena"',
                    html: '<p><b>Tus detalles de acceso por el sistema de gestión de "Donde nena"</b><br><b>Email:</b>'+results[0].email+'<br><b>Contraseña: </b>'+results[0].password+'<br><a href="http://localhost:4200">Presiona aquí para acceder</a></p>'
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log('Email enviado: '+info.response);
                    }
                });
                return res.status(200).json({message: "La contraseña se envio correctamente a tu correo"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;

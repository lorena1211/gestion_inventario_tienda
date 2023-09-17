const express = require('express');
const connection = require('../connection');
const router = express.Router();

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

    module.exports = router;

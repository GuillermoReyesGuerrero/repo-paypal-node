// state constants
const express = require('express');
const engines = require('consolidate');
const morgan = require('morgan');
const path = require('path');

const app = express();

// settings port and views
app.set('port',process.env.PORT || 3000);
app.engine('ejs', engines.ejs);
app.set('views','./views');
app.set('view engine','ejs');

// middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use(express.static('./public'));

// rutas
app.use(require('./routes'));

// starting the server
app.listen(app.get('port'), () => {
    console.log(`Servidor en el puerto ${app.get('port')}`);
});

module.exports = app;

const mongoose = require('mongoose');
const {config} = require('../config');
const options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    connectTimeoutMS: 5000,
    useUnifiedTopology: true,
    useCreateIndex: true

};
const url = config.DB_CONNECTION_URI;
console.log('DB Con', url);
const dbConnect = mongoose
    .connect(url, options)
    .then(function () {
        console.log('DB connectected', url);
    })
    .catch(function (err) {
        console.log(err);
    });
module.exports = dbConnect;

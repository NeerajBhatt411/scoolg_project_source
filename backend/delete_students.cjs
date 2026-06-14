const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/scoolg_dev').then(async () => {
    try {
        await mongoose.connection.db.collection('students').deleteMany({});
        console.log("All students deleted.");
    } catch(err) {
        console.log(err);
    }
    process.exit(0);
});

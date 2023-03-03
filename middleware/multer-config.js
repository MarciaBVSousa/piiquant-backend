const multer = require('multer');

const mime_type = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.replace(' ', '_').split('.')[0];
        const extension = mime_type[file.mimetype];
        callback(null, name + '_' + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage: storage }).single('image');
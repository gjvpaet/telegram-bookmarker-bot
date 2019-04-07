const fs = require('fs');
const util = require('util');
const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/bookmarkerbot';
const dirPath = `${__dirname}/models/`;

exports.createDirectory = async () => {
    if (!fs.existsSync(dirPath)) {
        const mkdir = util.promisify(fs.mkdir);

        try {
            await mkdir(dirPath);
        } catch (error) {
            console.log('error: ', error);
        }
    }
};

exports.createModelFile = async (chatId) => {
    let modelContent = 
`const moment = require('moment');
const mongoose = require('mongoose');

const bookmark${chatId}Schema = {
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
    },
    content: {
        type: String,
    },
    keywords: {
        type: Array,
    },
    createdAt: {
        type: Date,
        required: true,
        default: moment().format()
    },
    updatedAt: {
        type: Date,
        required: true,
        default: moment().format()
    }
};

module.exports = mongoose.model('Bookmark${chatId}', bookmark${chatId}Schema);
`;

    if (!fs.existsSync(`${dirPath}${chatId}.js`)) {
        const writeFile = util.promisify(fs.writeFile);

        try {
            await writeFile(`${dirPath}${chatId}.js`, modelContent, 'utf8');
        } catch (error) {
            console.log('error: ', error);
        }
    }
};

exports.connect = () => mongoose.connect(mongoURI, { useNewUrlParser: true });
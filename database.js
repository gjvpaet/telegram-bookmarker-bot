const fs = require('fs');
const util = require('util');
const Cryptr = require('cryptr');
const mongoose = require('mongoose');

const cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY);

const dirPath = `${__dirname}/models/`;

/** Database initialization methods */
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
/** End */

/** Database CRUD methods */
exports.addBookmark = async (chatId, data) => {
    const Bookmark = require(`./models/${chatId}`);

    let {
        title,
        content,
        keywords
    } = data;

    const bookmark = new Bookmark({
        _id: new mongoose.Types.ObjectId(),
        title,
        keywords,
        content: cryptr.encrypt(content)
    });

    try {
        await bookmark.save();

        return { message: 'Woohoo! Your bookmark is added.' };
    } catch (error) {
        console.log('error: ', error);
        return { message: 'Oops! It seems that something went wrong.' };
    }
};

exports.getBookmark = async (chatId, type, query) => {
    const Bookmark = require(`./models/${chatId}`);

    try {
        let bookmarks = await Bookmark.find(type === 'title' ? { [type]: query } : { [type]: { $in: query.split(',') } }).exec();

        if (!bookmarks.length) {
            return { bookmarks, message: 'No bookmarks found' };
        }

        bookmarks = bookmarks.map(bookmark => {
            bookmark.content = cryptr.decrypt(bookmark.content);
            return bookmark;
        });

        return { bookmarks, message: `Found ${bookmarks.length} bookmark(s)` };
    } catch (error) {
        console.log('error: ', error);
        return { message: 'Oops! It seems that something went wrong.' };
    }
};
/** End */
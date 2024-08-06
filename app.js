const fs = require('fs')
const createError = require('http-errors');
const express = require('express');
const favicon = require('serve-favicon')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const matter = require('gray-matter');
const marked = require('marked');
const app = express();
const router = express.Router()
const apiRouter = require('./routes/api');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter( router ));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
/**
 * This then sends the HTML ( from MD ) to the user
 */
app.get('*', (req, res, next) => {
    let filePath = path.join(__dirname, 'cms', req.path);
    if (req.path.endsWith('/')) {
        filePath = path.join(filePath, 'index');
    } else {
        fs.stat(filePath, (err, stats) => {
            if (!err && stats.isDirectory()) {
                filePath = path.join(filePath, 'index');
            }
        });
    }

    const mdFilePath = filePath + '.md';
    const mdxFilePath = filePath + '.mdx';

    fs.access(mdFilePath, fs.constants.F_OK, (err) => {
        if (!err) {
            fs.readFile(mdFilePath, 'utf-8', (err, content) => {
                if (err) return next(createError(500, err));
                const {data} = matter(content)
                return res.render('template', { content, frontmatter: data });
            });
        } else {
            fs.access(mdxFilePath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.readFile(mdxFilePath, 'utf-8', (err, content) => {
                        if (err) return next(createError(500, err));
                        const {data} = matter(content)
                        return res.render('template', { content, frontmatter: data });
                    });
                } else {
                    next(createError(404));
                }
            });
        }
    });
});

app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;

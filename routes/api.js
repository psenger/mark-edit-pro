module.exports = ( router ) => {
    console.log('loading api routes')
    router.get('/foo', function(req, res, next) {
        console.log('foo')
        res.json({ msg: 'hello'})
    });
    return router;
};

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
// const categoryById = require('../middleware/categoryById');
const { check, validationResult } = require('express-validator');
const formidable = require('formidable');
const fs = require('fs');
const productById = require('../middleware/productById');

// @route Post api/product
// @desc  Create new product
// @access Private Admin
router.post('/', auth, adminAuth, async (req, res) => {
    
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            })
        }
        if(!files.photo) {
            return res.status(400).json({
                error: "Image is required"
            })
        }
        if(files.photo.type !== "image/jpeg" && files.photo.type !== "image/jpg" && files.photo.type !== "image/png") {
            return res.status(400).json({
                error: "Image type is not allowed"
            })
        }
        // 1MB = 1000000
        if(files.photo.size > 1000000) {
            return res.status(400).json({
                error: "Image should be less than 1MB in size"
            })
        }
        // check for all fields
        const { name, description, price, category, quantity, shipping } = fields;
        if(!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: "All fields are required"
            })
        }
        let product = new Product(fields);
        product.photo.data = fs.readFileSync(files.photo.path);
        product.photo.contentType = files.photo.type;

        try {
            await product.save();
            res.json('Product created successfully')
        } catch (error) {
            console.log(error);
            res.status(500).send('Server Error')
        }

    })
})

// @route Get api/product/productId
// @desc  Get a product information
// @access Public
router.get('/:productId', productById, async (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
})

// @route Get api/product/photo/productId
// @desc  Get a product image
// @access Public
router.get('/photo/:productId', productById, async(req, res) => {
    if(req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    res.status(500).json({
        error: 'Failed to load image'
    });
})

// @route Get api/product/list
// @desc  Get a list of products with filter
// @options ( order => asc or desc, sortBy => any product property like name, limit, number of return product )
// @access Public
router.get('/list', async(req, res) => {
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;
    try {
        let products = await Product.find({}).select('-photo').populate('category').sort([
            [sortBy, order]
        ]).limit(limit).exec();
        res.json(products);
    } catch(error) {
        console.log(error);
        res.status(500).send('Invalid querys');
    }
})


module.exports = router;
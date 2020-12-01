express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { check, validationResult } = require('express-validator');


router.post('/', [
    check('name', 'Name is required').trim().not().isEmpty()
], auth, adminAuth, async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const { name } = req.body;
    try {
        let category = await Category.findOne({name});
        if(category) {
            return res.status(403).json({
                error: 'Category already exist'
            })
        }
        const newCategroy = new Category({name});
        category = await newCategroy.save();
        res.json(category)
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error')
    }
})



module.exports = router
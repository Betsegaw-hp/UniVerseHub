const Category = require('../model/category');
const handleErrors = require('../utils/errorHandler');

// common category api 
const category_get = async (req, res) => {
    const { name, type } = req.params;

    try {

        const categoryDoc = await Category.findOne({ name, type: type.toLowerCase() });

        if (!categoryDoc) {
            return res.status(404).json({ errors: { msg: `Given Category doesn't exist in Category type ${type}!`}});
        }
        

        res.status(200).json({category: categoryDoc });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err); 
    }
}

const  category_post = async (req, res) => {
    const { name, description, type } = req.body;

    try {
        const categoryDoc = await Category.findOne({ name, type });
        if(categoryDoc) return res.status(400).json({ errors: { msg : "Category exists with that name and type!"} });

        // type is enum. so it's value is case sensetive
        const category = await Category.create({ name, description, type: type.toLowerCase()});

        res.status(200).json({ category });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err); 
    }
}

const  category_update_put = async (req, res) => {
    const { name, description, categoryId, type } = req.body;

    try {
        

        const categoryDoc = await Category.findById(categoryId);
        if (!categoryDoc) {
            return res.status(400).json({ errors: { msg: "Category not found" } });
        }

        if(name === '' && description === '') {
            return res.status(400).json({ errors: { msg: "Provide at least one field!" } });
        }
        
        const data = { name, description};
        if(type !== categoryDoc.type && type !== '' ) data.type = type.toLowerCase();

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId , data, { new : true, runValidators: true}
        ).exec();

        console.log("category updated: ", updatedCategory)

        res.status(200).json({ category: updatedCategory });

    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);    
    }
}

const  category_dlt = async (req, res) => {
    const { id } = req.params;
    
    try {
        // this method used intentionally to triger ""remove" pre hook
        const category = await Category.findById(id);
        await category.remove();

        console.info("deleted!", category._id);
        res.status(200).json({ redirect: `/${category.type}` });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}

module.exports = {
    category_get,
    category_post,
    category_update_put,
    category_dlt
};
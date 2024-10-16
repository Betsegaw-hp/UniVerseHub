const { isDuplicate } = require('../middleware/uploadMiddleware');
const Blog = require('../model/blog');
const Category = require('../model/category');


const blog_get = async (req, res) => {

    try {
        
        const rawBlogs = await Blog.find()
                                .populate('author', "username email name avatarUrl")
                                .populate("category", "name");
        const { blogs, featuredBlogs } = rawBlogs.reduce((acc, blog) => {
            if( blog.featured) {
                acc.featuredBlogs.push(blog);
            } else {
                acc.blogs.push(blog)
            }

            return acc;
        }, { blogs: [], featuredBlogs: []});

        res.render('blog/index', { title : 'UniVerseHub Blog', blogs, featuredBlogs })
    } catch (err) {
        console.error(err);
    }

}

const blog_dlt = (req, res) => {
    const slug = req.params.slug

    Blog.findOneAndDelete({ slug })
    .then(result => {
        res.json({ redirect : '/blog'})
    }).catch( err => {
        console.log(err)
    })
}

const blog_detail_get = async (req, res) => {
    // TODO: add related blogs

    const slug = req.params.slug;

    try {
        
        const blog = await Blog.findOne({ slug })
                                .populate('author', "username email name avatarUrl")
                                .populate("category", "name");
        
        const relatedBlogs = await getBlogsByCategory(blog.category.name, "title snippet thumbnail slug");
        
        res.render('blog/detail', { title : `${blog.title} - UniVerseHub Blog`, blog, relatedBlogs })
        } catch (err) {
            console.error(err)
            res.redirect('../404')
    }
}

const blog_create_get = async (req, res) => {
    try {
        const categories = await Category.find({ type: "blog" });
        
        res.render('admin/blog/create', { title: 'Create New Blog Post - UniVerseHub', categories });
    } catch (err) {
        console.error(err);
    }
}

const blog_create_post = async (req, res) => {
    const {
        title, slug, category, content, 
        tags, featured, snippet
    } = req.body;

    try {

        const categoryDoc = await Category.findOne( { category, type: 'blog' });
        if(!categoryDoc) {
            return res.status(400).json({ errors: { category: "Category not found" } });
        }

        if (!req.file) {
            return res.status(400).json({ errors: { file: 'No file uploaded.'} });
        }

        const seralizedTags = tags.split(',');

        let filename = '';

        if(!isDuplicate(req.file.filename)) {
            filename = req.file.filename ;
        } else {
            filename = isDuplicate(req.file.filename);
        }
        
        ImageURI = `/uploads/${filename}`;

        const savedBlog = await Blog.create({
            title, slug, featured, snippet,
            author: res.locals.user._id,
            category: categoryDoc._id,
            tags: seralizedTags,
            body: content,
            thumbnail: ImageURI
        });

        console.log("savedBlog", savedBlog);

        res.status(200).json(savedBlog);
    } catch (err) {
        console.error(err);
    }
}

const blog_update_get = (req, res) => {

}

const blog_update_put = (req, res) => {

}


// utils
const getBlogsByCategory = async (categoryName, field = null ) => {
    try {
        const category = await Category.findOne({ name: categoryName, type: 'blog' });

        if (!category) {
            console.log('Category not found');
            return [];
        }

        let blogs = null;
        // Fetch blogs for the found category
        if(field) {

            blogs = await Blog.find({ category: category._id }, field)
                // .populate('author', 'username email') 
                // .populate('category', 'name') 
                .exec();
        } else {
            blogs = await Blog.find({ category: category._id })
                .populate('author', 'username email avatarUrl') 
                .populate('category', 'name') 
                .exec();
        }

        return blogs;

    } catch (err) {
        console.error('Error fetching blogs:', err);
        return [];
    }
};

module.exports = {
    blog_get,
    blog_create_get,
    blog_create_post,
    blog_update_get,
    blog_update_put,
    blog_dlt,
    blog_detail_get
}
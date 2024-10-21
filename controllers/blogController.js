const Blog = require('../model/blog');
const Category = require('../model/category');
const handleErrors = require('../utils/errorHandler');


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
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);
    }

}

const blog_dlt = (req, res) => {
    const slug = req.params.slug

    Blog.findOneAndDelete({ slug })
    .then(result => {
        res.status(200).json({ redirect : '/blog'});
    }).catch( err => {
        console.log(err);
    });
}

const blog_detail_get = async (req, res) => {

    const slug = req.params.slug;

    try {
        
        const blog = await Blog.findOne({ slug })
                                .populate('author', "username email name avatarUrl")
                                .populate("category", "name");
        if(!blog) {
            return res.redirect('../404');
        }

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
        const seralizedContent = contentSerializer(content);

        const savedBlog = await Blog.create({
            title, slug, featured, snippet,
            author: res.locals.user._id,
            category: categoryDoc._id,
            tags: seralizedTags,
            body: seralizedContent,
            thumbnail: req.imagePath
        });

        console.log("savedBlog");

        res.status(200).json({savedBlog});
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);
    }
}

const blog_update_get = async (req, res) => {
    const slug = req.params.slug;

    try {
        const blog = await Blog.findOne({ slug })
                                .populate('author', "username email name avatarUrl")
                                .populate("category", "name");
        if(!blog) {
            return res.redirect('../404');
        }

        const relatedBlogs = await getBlogsByCategory(blog.category.name, "title snippet thumbnail slug");
        const categories = await Category.find({ type: "blog" });
        
        res.render('admin/blog/manage', { title : `${blog.title} - UniVerseHub Blog Manager`, blog, relatedBlogs, categories }) 
    } catch (err) {
        console.error(err);
    }
}

const blog_update_put = async (req, res) => {
    const {
        title, slug, category, content, 
        tags, featured, snippet
    } = req.body;

    const originalSlug = req.params.slug;

    try {
        const categoryDoc = await Category.findOne( { category, type: 'blog' });
        if(!categoryDoc) {
            return res.status(400).json({ errors: { category: "Category not found" } });
        }

        const seralizedTags = tags.split(',');
        const seralizedContent = contentSerializer(content);

        const data = {
            title, featured, snippet,
            category: categoryDoc._id,
            tags: seralizedTags,
            body: seralizedContent,
            status: 'draft'
        };

        if(req.imagePath) data.thumbnail = req.imagePath ;
        if(slug !== originalSlug && slug !== '') data.slug = slug;

        // console.info("data to be drafted: ", data, originalSlug);

        const draftedBlog = await Blog.findOneAndUpdate(
            { slug: originalSlug }, data, {runValidators: true, new: true}
        );

        if(!draftedBlog) {
            return res.status(400).json({ errors: { msg: "Unable to make a save. Try refreshing the page!" }});
        }

        console.log("blog drafted?: ", draftedBlog.status);

        res.status(200).json({draftedBlog});
        
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(err);
    }
}

const image_upload_post = (req, res) => {
     // Access the uploaded file
     const image = req.file;

     if (!image) {
         return res.status(400).json({ error: 'No image uploaded' });
     }
 
     // Get the image URL
     const imageUrl = req.imagePath ;
 
     // Send the URL back to the client
     res.json({ imageUrl });
}

const blog_slug_availablity_get = async (req, res) => {
    const { slug } = req.query;

    try {
        const blog = await Blog.findOne({ slug });
        
        let isAvailable = false;

        if (!blog) {
            isAvailable = true;
        }

        return res.status(200).json({ available: isAvailable });
        
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
        console.error(errors);
    }
}

const blog_publish_get = async (req, res) => {
    const slug = req.params.slug;
    try {
       const savedBlog =  await Blog.findOneAndUpdate({ slug }, { status: 'published' }, {runValidators: true, new: true});

       if(!savedBlog) return res.status(400).json({ errors: { msg: "Unable to publish. Try refreshing the page!" }});

       console.log("published?: ", savedBlog.status);
       res.status(200).json({savedBlog});
    } catch (err) {
        console.error(err);
    }
}

const admin_blog_get = async (req, res) => {
    res.render('admin/blog/index', { title: "blog list"});
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

const contentSerializer = (content) => {
    // General regex to match any base64 data in tags (e.g., img, text, etc.)
    const base64DataRegex = /<[^>]+src="data:[^;]+;base64[^"]*"[^>]*>/g;

    // Remove all tags containing base64 data from the content
    content = content.replace(base64DataRegex, "");

    return content;
};

module.exports = {
    blog_get,
    blog_create_get,
    blog_create_post,
    blog_update_get,
    blog_update_put,
    blog_dlt,
    blog_detail_get,
    blog_slug_availablity_get,
    image_upload_post,
    blog_publish_get,
    admin_blog_get
}
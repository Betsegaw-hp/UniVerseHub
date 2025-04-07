const Blog = require('../model/blog');
const Category = require('../model/category');
const handleErrors = require('../utils/errorHandler');


const blog_get = async (req, res) => {
    try {
        // paggination
        let limit = parseInt(req.query.limit) || 6;
        
        const blogCount = await Blog.countDocuments();
        if(limit > blogCount) limit = blogCount;

        // bussiness logic
        const rawBlogs = await Blog.find({ status: 'published'}).sort({ createdAt: -1 })
                                .populate('author', "username email name avatarUrl")
                                .populate("category", "name")
                                .populate("thumbnail", "s3location s3key hash")
                                .limit(limit);
        const { blogs, featuredBlogs } = rawBlogs.reduce((acc, blog) => {
            if( blog.featured) {
                acc.featuredBlogs.push(blog);
            } else {
                acc.blogs.push(blog);
            }

            return acc;
        }, { blogs: [], featuredBlogs: []});

        const categories = await Category.find({ type: 'blog' });

        res.render('blog/index', { title : 'UniVerseHub Blog', blogs, featuredBlogs, categories, limit })
    } catch (err) {
        console.log(err);
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }

}

const blog_dlt = (req, res) => {
    const slug = req.params.slug

    Blog.findOneAndDelete({ slug })
    .then(result => {
        res.status(200).json({ redirect : '/admin/blog'});
    }).catch( err => {
        console.log(err);
    });
}

const blog_detail_get = async (req, res) => {

    const slug = req.params.slug;

    try {
        
        const blog = await Blog.findOne({ slug, status: 'published' })
                                .populate('author', "username email name avatarUrl")
                                .populate("category", "name")
                                .populate("thumbnail", "s3location s3key hash");
        if(!blog) {
            return res.redirect('../404');
        }

        const relatedBlogs = await getBlogsByCategory(blog.category.name, "title snippet thumbnail slug readTime createdAt");
        console.log(blog.thumbnail.location);

        res.render('blog/detail', { title : `${blog.title} - UniVerseHub Blog`, blog, relatedBlogs })
        } catch (err) {
            console.error(err)
            res.redirect('../404')
    }
}

const blog_create_get = async (req, res) => {
    try {
        const categories = await Category.find({ type: "blog" });
        
        res.render('admin/blog/create', { title: 'Create New Blog Post - UniVerseHub', currentPage: "blog", categories });
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

        const categoryDoc = await Category.findOne( { name: category, type: 'blog' });
        if(!categoryDoc) {
            return res.status(400).json({ errors: { category: "Category not found" } });
        }

        if (!req.s3File) {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded or file type invalid.' });
            } else {
                console.error("Reached route handler, req.file exists but req.s3File is missing.");
                return res.status(500).json({ message: 'Internal error processing file.' });
            }
        }

        console.log('File processed:');
        console.log('S3 Key:', req.s3File.key);
        console.log('S3 Location:', req.s3File.location);
        console.log('Hash:', req.s3File.hash);
        console.log('Is Duplicate:', req.s3File.isDuplicate);

        const seralizedTags = tags.split(',');
        const seralizedContent = contentSerializer(content);

        const savedBlog = await Blog.create({
            title, slug, featured, snippet,
            author: res.locals.user._id,
            category: categoryDoc._id,
            tags: seralizedTags,
            body: seralizedContent,
            thumbnail: req.s3File._id
        });

        console.log("blog saved?: ", savedBlog.status);

        res.status(200).json({savedBlog});
    } catch (err) {
        console.log(err);
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const blog_update_get = async (req, res) => {
    const slug = req.params.slug;

    try {
        const blog = await Blog.findOne({ slug })
                                .populate('author', "username email name avatarUrl")
                                .populate("category", "name")
                                .populate("thumbnail", "s3location s3key hash");
        if(!blog) {
            return res.redirect('../404');
        }

        const relatedBlogs = await getBlogsByCategory(blog.category.name, "title snippet thumbnail slug");
        const categories = await Category.find({ type: "blog" });
        
        res.render('admin/blog/manage', { title : `${blog.title} - UniVerseHub Blog Manager`, currentPage: "blog", blog, relatedBlogs, categories }) 
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
        const categoryDoc = await Category.findOne( { name: category, type: 'blog' });
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
        

        if(req.s3File) data.thumbnail = req.s3File._id;
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
        console.log(err);
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const image_upload_post = (req, res) => {
     // Access the uploaded file
    if (!req.s3File) {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded or file type invalid.' });
        } else {
            console.error("Reached route handler, req.file exists but req.s3File is missing.");
            return res.status(500).json({ message: 'Internal error processing file.' });
        }
    }

    console.log('File processed:');
    console.log('S3 Key:', req.s3File.key);
    console.log('S3 Location:', req.s3File.location);
    console.log('Hash:', req.s3File.hash);
    console.log('Is Duplicate:', req.s3File.isDuplicate);
 
    res.status(200).json({
        message: req.s3File.isDuplicate ? 'Duplicate file detected. Using existing file.' : 'File uploaded successfully!',
        fileInfo: {
            _id: req.s3File._id,
            key: req.s3File.key,
            location: req.s3File.location,
            hash: req.s3File.hash,
            isDuplicate: req.s3File.isDuplicate,
        }
    });
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
    try {
        
        const blogs = await Blog.find()
                                .populate('author', "username email name avatarUrl")
                                .populate("category", "name");

        res.render('admin/blog/index', { title: "Content Manager - UniVerseHub", currentPage: "blog", blogs});
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.error(err);
    }
    
}


// utils
const getBlogsByCategory = async (categoryName, field = null ) => {
    try {
        const category = await Category.findOne({ name: categoryName, type: 'blog' });

        if (!category) {
            console.log('Category not found');
            return [];
        }

        const query = {
            category: category._id,
            status: 'published'
        };

        let blogsQuery = Blog.find(query)
            .populate('author', 'username email avatarUrl')
            .populate('category', 'name')
            .populate('thumbnail', 's3location s3key hash');

        if (field) {
            blogsQuery = blogsQuery.select(field);
        }

        const blogs = await blogsQuery.exec();
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
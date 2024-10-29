const Blog = require('../model/blog');
const { ForumPost } = require('../model/forum');
const Category = require('../model/category');

const search_forum_get = async (req, res) => {
   const { title, category, date, sortBy, limit } = req.query;
   
   try {
    // pagination
    let limitParsed = parseInt(limit) || 3;

    const postCount = await ForumPost.countDocuments();
    if(limitParsed > postCount) {
        limitParsed = postCount;
        req.query.limit = limitParsed;
    }
       
    // bussiness logic
    let filterData = {
        title: { $regex: title, $options: 'i'},
        // tags: { $regex: title, $options: 'i'}
    };

    let sortOption = {}
       
    if(category !== 'all') {
        const categoryDoc = await Category.findOne( { name: category, type: 'forum' });
        if(!categoryDoc) {
            return res.status(400).json({ errors: { category: "Category not found" } });
        }
        filterData.category = categoryDoc._id;
    }

    if( sortBy === 'date') {
        sortOption.createdAt = -1;
    }

    const startDate = getDateRange(date);
    if(startDate) {
        filterData.createdAt = { $gte : startDate, $lt: new Date() };
    }

    const posts = await ForumPost.find(filterData)
    .sort(sortOption)
    .populate('author', "username email name avatarUrl")
    .populate('category', "name description")
    .limit(limitParsed);

    const categories = await Category.find({ type: 'forum' });
    const filterdPostCount = await ForumPost.countDocuments(filterData);

    res.render('forum/search', 
        {
         title: `Search results for "${title}" in ${category !== 'all' ? category : 'all categories'} - UniverseHub`,
         posts,
         postCount: filterdPostCount,
         categories,
         query: req.query
        }
    );

   } catch (err) {
    console.error(err);
   }
}

const search_blog_get = async (req, res) => {
    const { title, category, date, sortBy, limit} = req.query;
    
    try {
        // pagination
        let limitParsed = parseInt(limit) || 3;

        const blogCount = await Blog.countDocuments();
        if(limitParsed > blogCount) {
            limitParsed = blogCount;
            req.query.limit = limitParsed;
        }

        // bussiness logic
        let filterData = {
            title: { $regex: title, $options: 'i'}
        };
        let sortOption = {}

        if(category !== 'all') {
            const categoryDoc = await Category.findOne( { name: category, type: 'blog' });
            if(!categoryDoc) {
                return res.status(400).json({ errors: { category: "Category not found" } });
            }
            filterData.category = categoryDoc._id;
        }

        if( sortBy === 'date') {
            sortOption.createdAt = -1;
        }

        const startDate = getDateRange(date);
        if(startDate) {
            filterData.createdAt = { $gte : startDate, $lt: new Date() };
        }

        const blogs = await Blog.find(filterData)
        .sort(sortOption)
        .populate('author', "username email name avatarUrl")
        .populate('category', "name description")
        .limit(limitParsed);

        const categories = await Category.find({ type: 'blog' });  
        const filterdBlogCount = await Blog.countDocuments(filterData);

        res.render('blog/search', 
            {
             title: `Search results for "${title}" in ${category !== 'all' ? category : 'all categories'} - UniverseHub`,
             blogs,
             blogCount: filterdBlogCount,
             categories,
             query: req.query
            }
        );
    
    } catch (err) {
     console.error(err);
    }
 }


 const getDateRange = (date) => {
    const now = new Date();
    let startDate;

    switch (date) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Past 24 hours
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Past week
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1)); // Past month
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1)); // Past year
          break;
        default:
          startDate = null;
      }

      return startDate;
 } 

module.exports = {
    search_forum_get,
    search_blog_get
}
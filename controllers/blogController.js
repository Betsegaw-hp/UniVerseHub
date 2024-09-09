const Blog = require('../model/blog')

const blog_get = (req, res) => {
    Blog.find().sort( { createdAt : -1 })
    .then(result => {
        res.render('blogs/index', { title: 'Home', data : result })
    }).catch(err => {
        console.log(err)
    })
}
const blog_post = (req, res) => {
    const inputBlog = req.body
    // validate inputBlog.tags
    console.log((inputBlog.tag).split(','))

    const blog = new Blog(inputBlog)
                
    blog.save()
    .then(result => {
        res.redirect('blogs')
    })
    .catch( err => console.error(err._message))
}

const blog_update = ( req, res ) => {
    console.log(req.params.id)
}


const blog_create_get = (req, res) => {
    res.render('blogs/create', { title: 'Create a Blog' })
}
const blog_dlt = (req, res) => {
    const id = req.params.id

    Blog.findByIdAndDelete(id)
    .then(result => {
        res.json({ redirect : '/blogs'})
    }).catch( err => {
        console.log(err)
    })
}
const blog_detail_get = (req, res) => {
    const id = req.params.id
    Blog.findById(id)
    .then(result => {
        res.render('blogs/details', { title : 'Blog detail', blog : result})
    }).catch( err => {
        console.error(err)
        res.redirect('../404')
    })
}


module.exports = {
    blog_get,
    blog_post,
    blog_create_get,
    blog_dlt,
    blog_detail_get,
    blog_update
}
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const blogRoutes = require('./routes/blogRoutes')
const forumRoutes = require('./routes/forumRoutes')
const authRoutes = require('./routes/authRoutes')
const profileRoutes = require('./routes/profileRoutes')
const homeRoutes = require('./routes/homeRoutes')
const getPresignedUrl = require('./routes/getPresignedUrl')
const adminRoutes = require('./routes/adminRoutes')
const {requireAuth, checkUser, requireRole} = require('./middleware/authMiddleware');

const app = express()
const port = process.env.PORT || 3000;

// db connection
mongoose.connect(process.env.DB_URI)  
        .then((res) => {
            console.log('Database successfully connected!')
            app.listen(port, () => console.log(`listening at port ${port}`))
        }).catch(err => {
            console.log(err)
        });

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended : true }))
app.use(express.json());
app.use(cookieParser());

app.use(morgan('dev'))

app.use('*', checkUser);

// auth routes
app.use('/auth', authRoutes);

app.get('/', requireAuth,  homeRoutes);

app.get('/about', requireAuth, (req, res) => {
    res.render('about', { title: 'About'})
})

// profile routes
app.use('/profile', requireAuth,  profileRoutes);

// blog routes
app.use('/blog', requireAuth,  blogRoutes)

//forum routes
app.use('/forum', requireAuth, forumRoutes)

// pre-signed URL route
app.get('/image/:hash', requireAuth, getPresignedUrl);


// admin routes
app.use('/admin', requireAuth,  requireRole(['admin']), adminRoutes)

app.use((req, res) => {
    res.status(404).render('404', { title : 'Not found'})
})

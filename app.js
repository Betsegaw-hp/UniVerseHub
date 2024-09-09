const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const blogRoutes = require('./routes/blogRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()
const port = 3000

// db connection
mongoose.connect('mongodb://localhost:27017/test')  
        .then((res) => {
            console.log('Database successfully connected!')
            app.listen(port, () => console.log(`listening at port ${port}`))
        }).catch(err => {
            console.log(err)
        })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended : true }))
app.use(express.json())
app.use(cookieParser)

app.use(morgan('dev'))

// auth routes
app.use('/auth', authRoutes);

app.get('/', (req, res ) => {
    res.render('index', { title : 'Home'})
})

app.get('/about', (req, res) => {
    res.render('about', { title: 'About'})
})
// blog routes
app.use('/blogs', blogRoutes)


app.use((req, res) => {
    res.status(404).render('404', { title : 'Not found'})
})
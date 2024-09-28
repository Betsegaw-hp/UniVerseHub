const { ForumPost } = require('../model/forum');

const search_topic = async (req, res) => {
   const topicTitle = req.params.title ;

   return res.status(500).json({ msg: "not implemented yet!" });
   try {
    
    const posts = await ForumPost.find();
    posts.filter()
   } catch (err) {
    
   }
}

module.exports = {
    search_topic
}
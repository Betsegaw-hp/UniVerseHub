// handle errors
const handleErrors = (err) => {
    // console.log(err.message, err.code);
    let errors = null;

    let user_errors = { 
      email: '', password: '', name: '', username: '', role: '' // auth
    }

    let formPost_errors = {
      content: '', title:'', category: '' // forum
    }

    let comment_errors = {
      content: '', author: '', post: ''
    }

    let category_errors = {
      name: '', description: '', type: ''
    }
    let blog_errors = {
      title: '', body: '', snippet: '', tags: '', category: ''
    }

    //by default 
    errors = user_errors;

    // incorrect email
    if (err.message === 'incorrect email') {
      errors.email = 'That email is not registered';
    }
  
    // incorrect password
    if (err.message === 'incorrect password') {
      errors.password = 'That password is incorrect';
    }
  
    // duplicate error
    if (err.code === 11000) {
      if(err.keyValue.email) errors.email = 'that email is already registered';
      if(err.keyValue.username) errors.username = `The username <em>${err.keyValue.username}</em> is taken!`;
      if(err.keyValue.name) errors.name =  `That category already exists`;
      if(err.keyValue.slug) errors.slug = `The slug (${err.keyValue.slug}) is already in use. try different!`;
      return errors;
    }
  
    // validation errors
    if (err.message.includes('user validation failed')) {
      // console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
        // console.log(val);
        // console.log(properties);
        errors[properties.path] = properties.message;
      });
    } else if (err.message.includes('ForumPost validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {

          formPost_errors[properties.path] = properties.message;
          errors = formPost_errors;
        });
    } else if (err.message.includes('Comment validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {

          comment_errors[properties.path] = properties.message;
          errors = comment_errors;
        });
    } else if (err.message.includes('Category validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {

          category_errors[properties.path] = properties.message;
          errors = category_errors;
        });
    } else if (err.message.includes('Blog validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {

          blog_errors[properties.path] = properties.message;
          errors = blog_errors;
        });
    } 

    return errors;
  }


  module.exports = handleErrors;
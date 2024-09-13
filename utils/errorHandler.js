// handle errors
const handleErrors = (err) => {
    // console.log(err.message, err.code);
    let errors = null;
    let user_errors = { 
      email: '', password: '', name: '', username: '', // auth
     };
    let formPost_errors = {
      content: '', title:'', category: '' // forum
    }
    let comment_errors = {
      content: '', author: '', post: ''
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
    } 

    return errors;
  }


  module.exports = handleErrors;
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
  
    // duplicate email error
    if (err.code === 11000) {
      errors.email = 'that email is already registered';
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
    } else {
      errors = {...user_errors, ...formPost_errors} ;
      Object.values(err.errors).forEach(({ properties }) => {
          
        formPost_errors[properties.path] = properties.message;
        errors = formPost_errors;
      });
    }

    return errors;
  }


  module.exports = handleErrors;
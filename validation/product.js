const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProductInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.imageurls = !isEmpty(data.imageurls) ? data.imageurls : "";
  data.price = !isEmpty(data.price) ? data.price : "";

  //Text Validation

  if (!Validator.isLength(data.name, { min: 3, max: 50 })) {
    errors.name = "Product name must be between 3 & 50 character!!";
  }
  if (Validator.isEmpty(data.name)) {
    errors.name = "Product name field is required";
  }

  if (!Validator.isLength(data.description, { min: 10, max: 300 })) {
    errors.description = "Product Description be between 10 & 300 character!!";
  }
  if (Validator.isEmpty(data.description)) {
    errors.description = "Product Description field is required";
  }

  if (Validator.isEmpty(data.imageurls)) {
    errors.imageurls = "Product must have atleast 1 image";
  }

  if (Validator.isEmpty(data.price)) {
    errors.price = "Product Price field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

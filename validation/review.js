const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateReviewInput(data) {
  let errors = {};
  data.text = !isEmpty(data.text) ? data.text : "";
  data.product_id = !isEmpty(data.product_id) ? data.product_id : "";

  //Text Validation

  if (!Validator.isLength(data.text, { min: 10, max: 300 })) {
    errors.text = "Review must be between 10 & 300 character!!";
  }
  if (Validator.isEmpty(data.text)) {
    errors.text = "Review field is required";
  }
  if (Validator.isEmpty(data.product_id)) {
    errors.product_id = "Product field cannot be empty";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

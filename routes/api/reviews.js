const express = require("express");
const router = express.Router();
const passport = require("passport");
const db = require("arangojs")();
const reviewCollection = db.collection("Review");

//Validation
const validateReviewInput = require("../../validation/review");

//@route GET api/reviews/test
//@desc Test reviews route
//@access Public
router.get("/test", (req, res) => res.json({ message: "REVIEWS Works" }));

//@route GET api/reviews
//@desc Get all reviews
//@access Public
router.get("/", (req, res) => {
  reviewCollection
    .all()
    .then(function(response) {
      console.log(`Retrieved documents.`, response._result);

      return res.status(200).json(response._result);
    })
    .catch(function(error) {
      console.error("Error getting document", error);
      return res.status(200).json({ error: "No records" });
    });
});

//@route GET api/reviews
//@desc GET list of reviews of the current user
//@access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    reviewCollection
      .byExample({ user: req.user._key })
      .toArray()
      .then(reviews => {
        res.json(reviews);
      })
      .catch(err => res.status(404).json({ error: "No reviews found" }));
  }
);

//@route POST api/reviews
//@desc Create reviews
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("REview");
    console.log(req.body);
    const { errors, isValid } = validateReviewInput(req.body);
    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newReview = {
      user: req.user._key,
      text: req.body.text,
      product_id: req.body.product_id
    };

    reviewCollection
      .save(newReview)
      .then(review => {
        res.json(review);
      })
      .catch(err => console.log(err));
  }
);

//@route GET api/reviews/:id
//@desc GET reviews
//@access Public
router.get("/:id", (req, res) => {
  reviewCollection
    .firstExample({ _key: req.params.id })
    .then(review => {
      res.json(review);
    })
    .catch(err => res.status(404).json({ error: "No reviews found" }));
});

//@route DELETE api/reviews/:id
//@desc Delete reviews
//@access Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    reviewCollection
      .firstExample({ _key: req.params.id })
      .then(review => {
        if (review.user.toString() !== req.user._key) {
          return res.status(401).json({ error: "User not authorized" });
        }
        //Delte
        reviewCollection
          .removeByExample({ _key: req.params.id })
          .then(() => {
            res.json({ success: true });
          })
          .catch(err => res.status(404).json({ error: "Post not found" }));
      })
      .catch(err => res.status(404).json({ error: "No reviews found" }));
  }
);

module.exports = router;

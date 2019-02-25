const express = require("express");
const router = express.Router();
const passport = require("passport");
const db = require("arangojs")();
const productCollection = db.collection("Product");

//Validation
const validateProductInput = require("../../validation/product");
//@route GET api/products/test
//@desc TEST users
//@access Public
router.get("/test", (req, res) => {
  res.json({ text: "TEST is working" });
});

//@route GET api/products
//@desc Get all products
//@access Public
router.get("/", (req, res) => {
  productCollection
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

//@route GET api/products/all
//@desc GET list of products added by the current user
//@access Private
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    productCollection
      .byExample({ dealer_id: req.user._key })
      .then(products => {
        res.json(products._result);
      })
      .catch(err => res.status(404).json({ error: "No products found" }));
  }
);

//@route POST api/products
//@desc Create product
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("New Product");
    console.log(req.body);
    const { errors, isValid } = validateProductInput(req.body);
    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newProduct = {
      dealer_id: req.user._key,
      dealer: req.user.name,
      name: req.body.name,
      description: req.body.description,
      imageurls: req.body.imageurls,
      price: req.body.price
    };

    productCollection
      .save(newProduct)
      .then(product => {
        res.json(product);
      })
      .catch(err => console.log(err));
  }
);

//@route GET api/products/:id
//@desc GET product with id
//@access Public
router.get("/:id", (req, res) => {
  productCollection
    .firstExample({ _key: req.params.id })
    .then(product => {
      res.json(product);
    })
    .catch(err => res.status(404).json({ error: "No products found" }));
});

//@route DELETE api/products/:id
//@desc Delete product
//@access Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    productCollection
      .firstExample({ _key: req.params.id })
      .then(product => {
        if (product.dealer_id.toString() !== req.user._key) {
          return res.status(401).json({ error: "User not authorized" });
        }
        //Delete
        productCollection
          .removeByExample({ _key: req.params.id })
          .then(() => {
            res.json({ success: true });
          })
          .catch(err => res.status(404).json({ error: "Product not found" }));
      })
      .catch(err => res.status(404).json({ error: "No products found" }));
  }
);

module.exports = router;

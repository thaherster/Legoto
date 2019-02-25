const express = require("express");
const arangojs = require("arangojs");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const products = require("./routes/api/products");
const reviews = require("./routes/api/reviews");

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dbConfig = require("./config/keys").dbConfig;

// Connection to ArangoDB
const db = new arangojs.Database({
  url: `http://${dbConfig.host}:${dbConfig.port}`,
  databaseName: dbConfig.database
});

db.useBasicAuth(dbConfig.username, dbConfig.password);

//Passport middleware
app.use(passport.initialize());
//Passport Config
require("./config/passport")(passport);

//Use Routes
app.use("/api/users", users);
app.use("/api/products", products);
app.use("/api/reviews", reviews);

app.listen(port, () => {
  console.log("Server running at port " + port);
});

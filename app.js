const express = require("express");
const app = express();
const validator = require("validator");
const request = require("sync-request");
const nunjucks = require("nunjucks");
const fs = require("fs");
const { extract } = require("article-parser");

app.use(express.static("public"));

app.get("/", (req, res) => {
  var url = req.query.url;
  if (!url) {
    res.sendFile(__dirname + "/views/index.html");
  } else if (!validator.isURL(url)) {
    res.send("Invalid URL").status(400);
  } else {
    try {
      var htmlrequest = request("GET", url);
      var html = htmlrequest.getBody("utf8");

      var webpage = extract(url)
        .then(webpage => {
          webpage.date = new Date(webpage.published || new Date())
            .toLocaleString("en-US", {
              timeZone: "America/New_York",
              dateStyle: "short"
            })
            .toString();
          res.send(
            nunjucks.renderString(
              fs.readFileSync("./views/template.html", "utf8"),
              { ...webpage, domain: new URL(url).host }
            )
          );
        })
        .catch(e => {
          res.send("Something went wrong.").status(500);
          console.log(e);
        });
    } catch (e) {
      res.send("Something went wrong.").status(500);
      console.log(e);
    }
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

require("dotenv").config();
const express = require("express");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: "us2",
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const listID = process.env.MAILCHIMP_LIST_ID;

  const run = async () => {
    const response = await mailchimp.lists.batchListMembers(listID, {
      members: [
        {
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
          },
          email_address: email,
          status: "subscribed",
        },
      ],
    });

    if (response.new_members[0].status === "subscribed") {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
      console.log(response.errors);
    }
  };

  run();
});

app.post("/failure", (req, res) => {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Express server listening on port 3000");
});

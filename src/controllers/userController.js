const asynchHandler = require("express-async-handler");
const User = require("../models/userModel");

//api/user/serach=
const allUsers = asynchHandler(async (req, res) => {
  //req.query.search this like useParams

  console.log("Search term:", req.query.search);
  let filter = {};
  const { search } = req.query;
  if (search) {
    filter = {
      $or: [
        //option "i" to make it case insensitive
        { username: { $regex: " ^req.query.search$", $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    };
  }

  //To get all user except the particular user
  //This give an error so we need to login in
  // const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  // Log the keyword object to debug
  console.log("Search Keyword:", JSON.stringify(filter));

  const users = await User.find(filter);

  // Find the users based on the keyword
  // const users = await User.find(keyword);
  console.log("Users found:", users.length);
  console.log(users);
  res.send(users);
});

module.exports = { allUsers };

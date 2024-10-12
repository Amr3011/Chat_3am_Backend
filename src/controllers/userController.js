const asynchHandler = require("express-async-handler");
const User = require("../models/userModel");

//api/user/serach=
const allUsers = asynchHandler(async (req, res) => {
  //req.query.search this like useParams

  let filter = {};
  const { search } = req.query;
  if (search) {
    filter = {
      $or: [
        //option "i" to make it case insensitive
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };
  }

  const users = await User.find(filter);
  res.json(users);
});

module.exports = { allUsers };

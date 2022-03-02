const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

//json body use
app.use(express.json());

//user data is here
const users = [
  {
    id: "1",
    username: "shi",
    password: "John098",
    isAdmin: true,
  },
  {
    id: "2",
    username: "goo",
    password: "John098",
    isAdmin: false,
  },
];

//refreshtoken databass
let refreshTokens = [];

//creating token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      isAdmin: user.isAdmin,
    },
    "mySecretKey",
    { expiresIn: "15m" }
  );
};
//creating token
const generatrefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      isAdmin: user.isAdmin,
    },
    "myRefreshSecretKey"
  );
};

//asking for new Refresh token
app.post("/api/refresh", (req, res) => {
  //token from  the user
  console.log("hellow sir");
  const refreshtoken = req.body.token;

  if (!refreshtoken) {
    return res.status(401).json("you are not authenticated");
  }
  if (!refreshTokens.includes(refreshtoken)) {
    return res.status(403).json("refreshToken is not valid");
  }
  jwt.verify(refreshtoken, "myRefreshSecretKey", (err, user) => {
    err && console.log(err);

    refreshTokens = refreshTokens.filter((token) => token !== refreshtoken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generatrefreshToken(user);

    refreshTokens.push(newRefreshToken);
    res.status(200).json({
      accessToken: newAccessToken,
      refreshTokens: newRefreshToken,
    });
  });

  //sent error if there is not error or not valid

  // if everything is ok , create new access token, refresh tokenn and send to user
});

//login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    const accessToken = generateAccessToken(user);

    const Refreshtoken = generatrefreshToken(user);

    refreshTokens.push(Refreshtoken);

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      Refreshtoken,
    });
  } else {
    res.status(400).json("username or password is incorrect");
  }

  console.log("hellow ");
});

// verifying method
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("token is not valid");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("you are not authenticaed!");
  }
};

//log out route
app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;

  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

  res.status(200).json("you logged out successfully");
});

//deleting  route
app.delete("/api/users/:userid", verify, (req, res) => {
  if (req.user.id === req.params.userid || req.user.isAdmin) {
    res.status(200).json("user has been deleted");
  } else {
    res.status(403).json("you are not allowed to deleted this user");
  }
});
app.listen(5000, () => {
  console.log("bakcend server is running");
});

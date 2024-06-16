const postgres = require("postgres");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const app = express();
const { sequelize, Profile } = require("./models");
const http = require("http");
const server = http.createServer(app);
const socket = require("./chat");
require("dotenv").config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
  })
);
try {
  app.use(passport.initialize());
  app.use(passport.session());
} catch (error) {
  console.log("ERROR");
}

const authRoutes = require("./routes/AuthenticationRoutes");
app.use("/", authRoutes);

const profileRoutes = require("./routes/ProfileRoutes");
app.use("/", profileRoutes);

const channelRoutes = require("./routes/ChannelRoutes");
app.use("/", channelRoutes);

//socket.attach(server);
const io = socket(server);

const PORT = 8080;
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await sequelize.authenticate();
  console.log("Database connected!");
});

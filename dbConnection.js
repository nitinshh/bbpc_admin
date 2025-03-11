const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];


const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: "mysql",
  }
);

const connectdb = async () => {
  await sequelize
    .authenticate()
    .then(async () => {
      await sequelize.sync({ alter: false });
      console.log("db is connected and sync also");
    }) 
    .catch((err) => {
      console.log("error while connecting to the db", err);
      throw err; 
    });
};

module.exports = {
  sequelize: sequelize,
  connectdb: connectdb,
};

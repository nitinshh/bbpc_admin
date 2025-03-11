const Sequelize = require("sequelize");
const sequelize = require("../dbConnection").sequelize;

module.exports = {
  userModel: require("./userModel")(Sequelize, sequelize, Sequelize.DataTypes),
  cmsModel: require("./cmsModel")(Sequelize, sequelize, Sequelize.DataTypes),
  faqModel:require("./faqModel")(Sequelize, sequelize, Sequelize.DataTypes),
  customerSupportModel:require("./customerSupportModel")(Sequelize, sequelize, Sequelize.DataTypes),
  mealsModel:require("./mealsModel")(Sequelize, sequelize, Sequelize.DataTypes),
  workoutsModel:require("./workoutsModel")(Sequelize, sequelize, Sequelize.DataTypes),
  exerciseModel:require("./exerciseModel")(Sequelize, sequelize, Sequelize.DataTypes),
};
 
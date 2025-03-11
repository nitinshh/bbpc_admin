module.exports = (Sequelize, sequelize, DataTypes) => {
  return sequelize.define(
    "meals",
    {
      ...require("./cors")(Sequelize, DataTypes),

      mealType: {
        type: DataTypes.INTEGER, // 1 for Breakfast, 2 for Lunch, 3 for Dinner
        allowNull: false,
        defaultValue: 1,
      },
      mealName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      mealTime: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      mealPic: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "meals",
    }
  );
};

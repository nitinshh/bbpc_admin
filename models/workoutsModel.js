module.exports = (Sequelize, sequelize, DataTypes) => {
  return sequelize.define(
    "Workout",
    {
      ...require("./cors")(Sequelize, DataTypes),

      workoutType: {
        type: DataTypes.INTEGER, // 1: General fitness, 2: Football specific, 3: Workout logging
        allowNull: false,
        defaultValue: 1,
      },
      workoutStatus: {
        type: DataTypes.INTEGER, // 1: Active, 2: Completed, 3: Upcoming
        allowNull: false,
        defaultValue: 1,
      },
      workoutName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      workoutTime: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      workoutDescription: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "N/A",
      },
      workoutPic: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      numberOfExercises: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      tableName: "workouts",
    }
  );

};

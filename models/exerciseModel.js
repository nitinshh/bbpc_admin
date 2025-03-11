module.exports = (Sequelize, sequelize, DataTypes) => {
  return sequelize.define(
    "Exercise",
    {
      workoutId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "workouts",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      exerciseName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sets: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reps: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      exerciseTime: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "",
      },
      exerciseDescription: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "N/A",
      },
    },
    {
      timestamps: true,
      tableName: "exercises",
    }
  );

};

module.exports = (Sequelize, sequelize, DataTypes) => {
  return sequelize.define(
    "users",
    {
      ...require("./cors")(Sequelize, DataTypes),
      role:{
        type: DataTypes.INTEGER,  // 0 for admin 1 for Fitness Enthusiast 2 for Footballer 3 for Dual Focus and 4 for Coach
        allowNull: false,
        defaultValue: 1
      },
      //1.  Fitness Enthusiast
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue:''
      },
     socialType:{
       type: DataTypes.INTEGER,
       allowNull: true,   // 1 FOR GOOOGLE 2 FOR FACEBOOK 
       defaultValue:0
      },
      socialId:{
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:''
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:''
      },
      countryCode: {
        type: DataTypes.STRING(5),
        allowNull: true,
        defaultValue:''
     },
      phoneNumber: {
        type: DataTypes.STRING(15),
        allowNull: true,
        defaultValue:''
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      weight: {
        type: DataTypes.STRING(15),
        allowNull: true,
        defaultValue:''
      },
      height: {
        type: DataTypes.STRING(15),
        allowNull: true,
        defaultValue:''
      },
      injuries: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:''
      },

      password: {
        type: DataTypes.STRING(60),
        allowNull: true,
        defaultValue:''
      },
      otpVerify: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue:0
      }, 
      gender: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:''
      },

      resetToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:null
      },

      resetTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue:null
      },

      deviceToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:''
      },

      deviceType: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue:''
      },

    },
    {
      timestamps: true,
      tableName: "users",
    }
  );
};

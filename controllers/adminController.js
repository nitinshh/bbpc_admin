"use strict";

/* RENDER: when displaying views/templates with data (forms/errors/user-data) [URL stays same]
 REDIRECT: after successful actions to prevent resubmission (form-success/logout/cancel) [URL changes]*/

const bcrypt = require("bcrypt");
const { Sequelize, Op, fn, col } = require("sequelize");
const moment = require("moment");
const Models = require("../models/index");
const helper = require("../helpers/commonHelper");

Models.exerciseModel.belongsTo(Models.workoutsModel, {
  foreignKey: "workoutId",
  as: "workout",
});

Models.workoutsModel.hasMany(Models.exerciseModel, {
  foreignKey: "workoutId",
  as: "exercises",
});

module.exports = {
  login_page: async (req, res) => {
    if (req.session.user) return res.redirect("/admin/dashboard");
    res.render("admin/login_page", { layout: false, msg: req.flash("msg") });
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const login_data = await Models.userModel.findOne({
        where: { email: email },
      });

      if (!login_data || !bcrypt.compareSync(password, login_data.password)) {
        return res.json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (login_data.role !== 0) {
        return res.json({
          success: false,
          message: "Please enter valid credentials",
        });
      }

      req.session.user = login_data;
      req.flash("msg", "You are logged in successfully");

      return res.json({
        success: true,
        message: "You are logged in successfully",
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.redirect("/admin/login");
    }
  },

  logout: async (req, res) => {
    try {
      req.session.destroy(() => {
        res.json({ success: true });
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  profile: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      res.render("admin/profile", {
        title: "Profile",
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  profile_update: async (req, res) => {
    try {
      let fileImage = "";

      if (req.files && req.files.profilePicture) {
        fileImage = await helper.fileUpload(req.files.profilePicture, "images");
      } else {
        let user = await Models.userModel.findOne({
          where: { id: req.params.id },
        });

        fileImage = user.profilePicture;
      }

      // Update user profile
      await Models.userModel.update(
        {
          name: req.body.name,
          profilePicture: fileImage,
        },
        { where: { id: req.params.id } }
      );

      // Fetch updated user
      let updatedUser = await Models.userModel.findOne({
        where: { id: req.params.id },
      });
      if (updatedUser) {
        req.session.user = updatedUser;
      }

      req.flash("msg", "Profile updated successfully");
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  change_password: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/login");
      res.render("admin/changePassword", {
        title: "Reset Password",
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  change_password_post: async (req, res) => {
    try {
      if (!req.session) {
        console.error("Session is not initialized!");
        return res.status(500).json({ error: "Session not initialized." });
      }

      const { password, new_password, confirm_new_password } = req.body;
      const userId = req.session.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ error: "User not found. Please log in again." });
      }

      const user = await Models.userModel.findOne({ where: { id: userId } });

      if (!user) {
        return res
          .status(401)
          .json({ error: "User not found. Please log in again." });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ error: "Your old password is incorrect." });
      }

      if (new_password !== confirm_new_password) {
        return res
          .status(400)
          .json({ error: "New password and confirm password do not match." });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await Models.userModel.update(
        { password: hashedPassword },
        { where: { id: userId } }
      );

      // Destroy session and send a success response
      req.session.destroy();
      return res.json({
        success: true,
        message: "Your password has been updated successfully!",
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  dashboard: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      const [
        totalUsersExcludingRole0,
        fitnessenthusiast,
        footballer,
        dualfocus,
        coach,
        meals,
        workouts,
      ] = await Promise.all([
        Models.userModel.count({ where: { role: { [Op.ne]: 0 } } }),
        Models.userModel.count({ where: { role: 1 } }),
        Models.userModel.count({ where: { role: 2 } }),
        Models.userModel.count({ where: { role: 3 } }),
        Models.userModel.count({ where: { role: 4 } }),
        Models.mealsModel.count(),
        Models.workoutsModel.count(),
      ]);

      const currentYear = Math.max(2025, moment().year());
      const months = [];
      const counts = {
        // fitnessenthusiast: [], // Role: 1
        // footballer: [], // Role: 2
        // dualfocus: [], // Role: 3
        // coach: [], // Role: 4
        allUsers: [], // Sum of all roles except 0
        // meals: [],
        // workouts:[],
      };

      const startOfYear = moment(`${currentYear}-01-01`)
        .startOf("year")
        .toDate();
      const endOfYear = moment(startOfYear).endOf("year").toDate();

      const monthlyCounts = await Models.userModel.findAll({
        attributes: [
          [fn("MONTH", col("createdAt")), "month"],
          "role",
          [fn("COUNT", col("id")), "count"],
        ],
        where: {
          createdAt: { [Op.between]: [startOfYear, endOfYear] },
          role: { [Op.ne]: 0 }, // Exclude role 0
        },
        group: ["month", "role"],
        raw: true,
      });

      for (let month = 1; month <= 12; month++) {
        months.push(moment(`${currentYear}-${month}-01`).format("MMM, YYYY"));
        // counts.fitnessenthusiast.push(0);
        // counts.footballer.push(0);
        // counts.dualfocus.push(0);
        // counts.coach.push(0);
        counts.allUsers.push(0);
      }

      monthlyCounts.forEach(({ month, role, count }) => {
        // if (role == 1) counts.fitnessenthusiast[month - 1] = parseInt(count);
        // else if (role == 2) counts.footballer[month - 1] = parseInt(count);
        // else if (role == 3) counts.dualfocus[month - 1] = parseInt(count);
        // else if (role == 4) counts.coach[month - 1] = parseInt(count);

        // Sum of all users except role 0
        counts.allUsers[month - 1] += parseInt(count);
      });

      res.render("dashboard", {
        title: "Dashboard",
        counts1: counts,
        months1: months,
        totalUsersExcludingRole0,
        fitnessenthusiast,
        footballer,
        dualfocus,
        coach,
        meals,
        workouts,
        session: req.session.user,
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
      return res.redirect("/admin/login");
    }
  },

  getDashboardData: async (req, res) => {
    try {
      const year = parseInt(req.query.year) || moment().year();

      // Ensure the requested year is valid
      if (year < 2024) {
        return res.status(400).json({
          success: false,
          error: "Year must be 2024 or later",
        });
      }

      const startOfYear = moment(`${year}-01-01`).startOf("year").toDate();
      const endOfYear = moment(startOfYear).endOf("year").toDate();

      // Fetch users except role 0
      const monthlyCounts = await Models.userModel.findAll({
        attributes: [
          [fn("MONTH", col("createdAt")), "month"],
          [fn("COUNT", col("id")), "count"],
        ],
        where: {
          createdAt: { [Op.between]: [startOfYear, endOfYear] },
          role: { [Op.ne]: 0 }, // Exclude role 0
        },
        group: ["month"],
        raw: true,
      });

      // Initialize counts array for 12 months
      const counts = new Array(12).fill(0);

      // Populate counts where data is available
      monthlyCounts.forEach(({ month, count }) => {
        counts[month - 1] = parseInt(count);
      });

      // Generate month labels (Jan, Feb, etc.)
      const months = Array.from({ length: 12 }, (_, i) =>
        moment(`${year}-${i + 1}-01`).format("MMM")
      );

      res.json({
        success: true,
        counts: { allUsers: counts },
        months,
      });
    } catch (error) {
      console.error("Dashboard Data Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  aboutUs: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let about_data = await Models.cmsModel.findOne({
        where: { type: 1 },
      });

      // Use res.render instead of res.redirect to render the "about" page
      return res.render("admin/cms/about", {
        title: "About Us",
        about_data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  about_post: async (req, res) => {
    try {
      let about_data = await Models.cmsModel.update(
        {
          title: req.body.title,
          description: req.body.description,
        },
        {
          where: { type: 1 },
        }
      );
      req.flash("msg", "About Us updated successfully");
      res.redirect("back");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  privacyPolicy: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let policy_data = await Models.cmsModel.findOne({
        where: { type: 2 },
      });
      res.render("admin/cms/privacy", {
        title: "Privacy Policy",
        policy_data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  privacy_post: async (req, res) => {
    try {
      let data = await Models.cmsModel.update(
        {
          title: req.body.title,
          description: req.body.description,
        },
        {
          where: { type: 2 },
        }
      );
      req.flash("msg", "Privacy Policy updated successfully");
      res.redirect("back");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  termsConditions: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let terms_data = await Models.cmsModel.findOne({
        where: { type: 3 },
      });
      res.render("admin/cms/terms", {
        title: "Terms & Conditions",
        terms_data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  termsConditionsPost: async (req, res) => {
    try {
      let data = await Models.cmsModel.update(
        {
          title: req.body.title,
          description: req.body.description,
        },
        {
          where: { type: 3 },
        }
      );
      req.flash("msg", "Terms and Conditions updated successfully");
      res.redirect("back");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  users_listing: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let user_data = await Models.userModel.findAll({
        where: {
          role: {
            [Sequelize.Op.ne]: 0,
          },
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      res.render("admin/users/usersListing", {
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
        title: "Users",
        user_data,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  user_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let userId = req.params.id;

      // Find user details
      let data = await Models.userModel.findOne({
        where: { id: userId },
      });
      res.render("admin/users/userView", {
        title: "Users",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  user_status: async (req, res) => {
    try {
      const { id, status } = req.body;
      console.log(`Updating user ${id} to status: ${status}`); // Debugging

      if (!id || status === undefined) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid data provided" });
      }

      const [updatedRows] = await Models.userModel.update(
        { status },
        { where: { id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found or status unchanged",
        });
      }

      res.json({
        success: true,
        message: "Status changed successfully",
        status,
      });
    } catch (error) {
      console.log("Error updating user status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return res.redirect("/admin/login");
    }
  },

  user_delete: async (req, res) => {
    try {
      const userId = req.body.id;
      // Delete user
      await Models.userModel.destroy({ where: { id: userId } });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete user " });
      return res.redirect("/admin/login");
    }
  },

  footballer_listing: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let footballer_data = await Models.userModel.findAll({
        where: {
          role: 2,
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });
      res.render("admin/footballer/footballerListing", {
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
        title: "Footballer",
        footballer_data,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  footballer_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let footballerId = req.params.id;

      // Find user details
      let data = await Models.userModel.findOne({
        where: { id: footballerId },
      });
      res.render("admin/footballer/footballerView", {
        title: "Footballer",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  footballer_status: async (req, res) => {
    try {
      const { id, status } = req.body;

      const [updatedRows] = await Models.userModel.update(
        { status },
        { where: { id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "footballer not found or status unchanged",
        });
      }

      res.json({
        success: true,
        message: "Status changed successfully",
        status,
      });
    } catch (error) {
      console.log("Error updating footballer status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return res.redirect("/admin/login");
    }
  },

  footballer_delete: async (req, res) => {
    try {
      const footballerId = req.body.id;
      await Models.userModel.destroy({ where: { id: footballerId } });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete footballer " });
      return res.redirect("/admin/login");
    }
  },

  fitnessenthusiast_listing: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let fitnessenthusiast_data = await Models.userModel.findAll({
        where: {
          role: 1,
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });
      res.render("admin/fitnessenthusiast/fitnessenthusiastListing", {
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
        title: "Fitness Enthusiast",
        fitnessenthusiast_data,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  fitnessenthusiast_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let fitnessenthusiastId = req.params.id;

      // Find user details
      let data = await Models.userModel.findOne({
        where: { id: fitnessenthusiastId },
      });
      res.render("admin/fitnessenthusiast/fitnessenthusiastView", {
        title: "Fitness Enthusiast",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  fitnessenthusiast_status: async (req, res) => {
    try {
      const { id, status } = req.body;

      const [updatedRows] = await Models.userModel.update(
        { status },
        { where: { id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "fitnessenthusiast not found or status unchanged",
        });
      }

      res.json({
        success: true,
        message: "Status changed successfully",
        status,
      });
    } catch (error) {
      console.log("Error updating fitnessenthusiast status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return res.redirect("/admin/login");
    }
  },

  fitnessenthusiast_delete: async (req, res) => {
    try {
      const fitnessenthusiastId = req.body.id;
      await Models.userModel.destroy({ where: { id: fitnessenthusiastId } });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete fitnessenthusiast " });
      return res.redirect("/admin/login");
    }
  },

  dualfocus_listing: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let dualfocus_data = await Models.userModel.findAll({
        where: {
          role: 3,
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });
      res.render("admin/dualfocus/dualfocusListing", {
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
        title: "Dual Focus",
        dualfocus_data,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  dualfocus_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let dualfocusId = req.params.id;

      // Find user details
      let data = await Models.userModel.findOne({
        where: { id: dualfocusId },
      });
      res.render("admin/dualfocus/dualfocusView", {
        title: "Dual Focus",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  dualfocus_status: async (req, res) => {
    try {
      const { id, status } = req.body;

      const [updatedRows] = await Models.userModel.update(
        { status },
        { where: { id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "dualfocus not found or status unchanged",
        });
      }

      res.json({
        success: true,
        message: "Status changed successfully",
        status,
      });
    } catch (error) {
      console.log("Error updating dualfocus status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return res.redirect("/admin/login");
    }
  },

  dualfocus_delete: async (req, res) => {
    try {
      const dualfocusId = req.body.id;
      await Models.userModel.destroy({ where: { id: dualfocusId } });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete dualfocus " });
      return res.redirect("/admin/login");
    }
  },

  coach_listing: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");
      let coach_data = await Models.userModel.findAll({
        where: {
          role: 4,
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });
      res.render("admin/coach/coachListing", {
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
        title: "Coach",
        coach_data,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  coach_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let coachId = req.params.id;

      // Find user details
      let data = await Models.userModel.findOne({
        where: { id: coachId },
      });
      res.render("admin/coach/coachView", {
        title: "Coach",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  coach_status: async (req, res) => {
    try {
      const { id, status } = req.body;

      const [updatedRows] = await Models.userModel.update(
        { status },
        { where: { id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "coach not found or status unchanged",
        });
      }

      res.json({
        success: true,
        message: "Status changed successfully",
        status,
      });
    } catch (error) {
      console.log("Error updating coach status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
      return res.redirect("/admin/login");
    }
  },

  coach_delete: async (req, res) => {
    try {
      const coachId = req.body.id;
      await Models.userModel.destroy({ where: { id: coachId } });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete coach " });
      return res.redirect("/admin/login");
    }
  },

  faq_list: async (req, res) => {
    try {
      let title = "Faq";
      let faqData = await Models.faqModel.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/faq/faqListing", {
        title,
        faqData,
        session: req.session.user,
        msg: req.flash("msg") || "",
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/add_faq");
    }
  },

  add_faq: async (req, res) => {
    try {
      let title = "Faq";
      res.render("admin/faq/faq_add", {
        title,
        session: req.session.user,
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/add_faq");
    }
  },

  create_faq: async (req, res) => {
    try {
      const { question, answer } = req.body;
      await Models.faqModel.create({
        question: question,
        answer: answer,
      });

      req.flash("msg", "Faq added successfully.");
      res.redirect("/admin/faq_list");
    } catch (error) {
      console.log(error);
      req.flash("msg", "An error occurred while adding the FAQ.");
      res.redirect("/admin/add_faq");
    }
  },

  delete_faq: async (req, res) => {
    try {
      await Models.faqModel.destroy({
        where: {
          id: req.body.id,
        },
      });

      res.redirect("/admin/faq_list");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/faq_list");
    }
  },

  faq_edit: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let faqId = req.params.id;

      let data = await Models.faqModel.findOne({
        where: { id: faqId },
      });
      res.render("admin/faq/faqEdit", {
        title: "Faq",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  faq_update: async (req, res) => {
    try {
      const faqId = req.params.id;
      const { question, answer } = req.body;

      await Models.faqModel.update(
        {
          question: question,
          answer: answer,
        },
        { where: { id: faqId } }
      );

      req.flash("msg", "FAQ updated successfully");
      res.redirect("/admin/faq_list");
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },
  faq_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let faqId = req.params.id;

      let data = await Models.faqModel.findOne({
        where: { id: faqId },
      });
      res.render("admin/faq/faqView", {
        title: "Faq",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  customersupport_listing: async (req, res) => {
    try {
      let title = "Customer Support";
      let customersupportData = await Models.customerSupportModel.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/customersupport/customersupportListing", {
        title,
        customersupportData,
        session: req.session.user,
        msg: req.flash("msg") || "",
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/add_customersupport");
    }
  },

  delete_customersupport: async (req, res) => {
    try {
      await Models.customerSupportModel.destroy({
        where: {
          id: req.body.id,
        },
      });

      res.redirect("/admin/customersupport_listing");
    } catch (error) {
      console.log(error);
      res.redirect("/admin/customersupport_listing");
    }
  },

  customersupport_view: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let customersupportId = req.params.id;

      let data = await Models.customerSupportModel.findOne({
        where: { id: customersupportId },
      });
      res.render("admin/customersupport/customersupportView", {
        title: "Customer Support",
        data,
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/admin/login");
    }
  },

  meals_listing: async (req, res) => {
    try {
      let title = "Meals";
      let meals_data = await Models.mealsModel.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/meals/mealsListing", {
        title,
        meals_data,
        session: req.session.user,
        msg: req.flash("msg") || "",
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/login");
    }
  },

  add_meals: async (req, res) => {
    try {
      let title = "Meals";
      res.render("admin/meals/mealsAdd", {
        title,
        session: req.session.user,
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/mealsAdd");
    }
  },

  create_meals: async (req, res) => {
    try {
      let mealImage = "";

      if (req.files && req.files.mealPic) {
        mealImage = await helper.fileUpload(req.files.mealPic, "images");
      }

      // Get the values from the form
      let startHour = req.body.startHours;
      let startMinute = req.body.startMinutes;
      let startAmpm = req.body.startAmpm;
      let endHour = req.body.endHours;
      let endMinute = req.body.endMinutes;
      let endAmpm = req.body.endAmpm;

      // Log to check incoming values
      console.log("Start Hour:", startHour);
      console.log("Start Minute:", startMinute);
      console.log("Start AM/PM:", startAmpm);
      console.log("End Hour:", endHour);
      console.log("End Minute:", endMinute);
      console.log("End AM/PM:", endAmpm);

      if (
        startHour &&
        startMinute &&
        startAmpm &&
        endHour &&
        endMinute &&
        endAmpm
      ) {
        // Format the meal time as "Start Time to End Time"
        let mealTime = `${startHour}:${startMinute} ${startAmpm} to ${endHour}:${endMinute} ${endAmpm}`;

        // Insert into the database
        let newMeal = await Models.mealsModel.create({
          mealName: req.body.mealName,
          mealTime: mealTime, // Store the formatted time string
          mealType: req.body.mealType,
          mealPic: mealImage,
        });

        if (newMeal) {
          req.flash("msg", "Meal added successfully");
        }

        res.redirect("/admin/meals_listing");
      } else {
        console.error("Invalid time fields");
        res.redirect("/admin/add_meals");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/admin/add_meals");
    }
  },

  delete_meals: async (req, res) => {
    try {
      await Models.mealsModel.destroy({
        where: {
          id: req.params.id,
        },
      });

      res.json({ success: true, message: "Meal deleted successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete meal" });
    }
  },

  get_meals_by_type: async (req, res) => {
    try {
      let mealType = parseInt(req.params.mealType);
      console.log(`Fetching meals for type: ${mealType}`);

      if (isNaN(mealType)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid meal type" });
      }

      let meals = await Models.mealsModel.findAll({
        where: { mealType: mealType },
        raw: true,
      });

      if (!meals.length) {
        console.log("No meals found for this type.");
      }

      res.json({ success: true, meals });
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ success: false, message: "Error fetching meals" });
    }
  },

  workouts_listing: async (req, res) => {
    try {
      let title = "Workouts";
      let workouts_data = await Models.workoutsModel.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/workouts/workoutsListing", {
        title,
        workouts_data,
        session: req.session.user,
        msg: req.flash("msg") || "",
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/login");
    }
  },

  add_workouts: async (req, res) => {
    try {
      let title = "Workouts";
      res.render("admin/workouts/workoutsAdd", {
        title,
        session: req.session.user,
      });
    } catch (error) {
      console.log(error);
      res.redirect("/admin/workoutsAdd");
    }
  },

  create_workouts: async (req, res) => {
    try {
      console.log("===========>>>>>>>>>>", req.body);

      let workoutImage = "";
      if (req.files && req.files.workoutPic) {
        workoutImage = await helper.fileUpload(req.files.workoutPic, "images");
      }

      let newWorkout = await Models.workoutsModel.create({
        workoutName: req.body.workoutName,
        workoutTime: req.body.workoutTime,
        workoutType: parseInt(req.body.workoutType, 10) || 1,
        workoutPic: workoutImage,
        workoutDescription: req.body.workoutDescription || "N/A",
        numberOfExercises: 0, // Initialize with 0
      });

      if (newWorkout) {
        let { exerciseName, sets, reps, exerciseTime, exerciseDescription } =
          req.body;

        // Convert to arrays if not already
        if (!Array.isArray(exerciseName))
          exerciseName = [exerciseName || "N/A"];
        if (!Array.isArray(sets)) sets = [sets || "1"];
        if (!Array.isArray(reps)) reps = [reps || "1"];
        if (!Array.isArray(exerciseTime))
          exerciseTime = [exerciseTime || "N/A"];
        if (!Array.isArray(exerciseDescription))
          exerciseDescription = [exerciseDescription || "N/A"];

        let exercisesCount = exerciseName.length; // Get number of exercises

        await Promise.all(
          exerciseName.map((name, index) => {
            return Models.exerciseModel.create({
              workoutId: newWorkout.id,
              exerciseName: name || "N/A",
              sets: parseInt(sets[index], 10) || 1,
              reps: parseInt(reps[index], 10) || 1,
              exerciseTime: exerciseTime[index] || "N/A",
              exerciseDescription: exerciseDescription[index] || "N/A",
            });
          })
        );

        // **Update workout with exercise count**
        await newWorkout.update({ numberOfExercises: exercisesCount });

        req.flash("msg", "Workout added successfully");
        return res.redirect("/admin/workouts_listing");
      }

      console.error("Workout creation failed");
      res.redirect("/admin/add_workouts");
    } catch (error) {
      console.error("Error in create_workouts:", error);
      res.redirect("/admin/add_workouts");
    }
  },

  delete_workouts: async (req, res) => {
    try {
      await Models.workoutsModel.destroy({
        where: {
          id: req.params.id,
        },
      });

      res.json({ success: true, message: "workout deleted successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete workout" });
    }
  },

  get_workouts_by_type: async (req, res) => {
    try {
      let workoutType = parseInt(req.params.workoutType);
      console.log(`Fetching workouts for type: ${workoutType}`);

      if (isNaN(workoutType)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid workout type" });
      }

      let workouts = await Models.workoutsModel.findAll({
        where: { workoutType: workoutType },
        raw: true,
      });

      if (!workouts.length) {
        console.log("No workouts found for this type.");
      }

      res.json({ success: true, workouts });
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching workouts" });
    }
  },

  edit_workout: async (req, res) => {
    try {
      if (!req.session.user) return res.redirect("/admin/login");

      let workoutsId = req.params.id;

      let workout = await Models.workoutsModel.findOne({
        where: { id: workoutsId },
        include: [{ model: Models.exerciseModel, as: "exercises" }],
      });

      if (!workout) {
        console.log("Workout not found in database.");
        req.flash("error", "Workout not found");
        return res.redirect("/admin/workouts_listing");
      }

      console.log("Associated exercises:", workout.exercises);

      res.render("admin/workouts/workoutsEdit", {
        title: "Workouts",
        data: workout,
        exercises: workout.exercises || [],
        session: req.session.user,
        msg: req.flash("msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error("Error fetching workout:", error); // ✅ Log error details
      res.redirect("/admin/workouts_listing");
    }
  },

  update_workout: async (req, res) => {
    try {
      const { workoutsId: workoutId } = req.body;

      const workout = await Models.workoutsModel.findOne({
        where: { id: workoutId },
      });
      if (!workout) {
        req.flash("error", "Workout not found");
        return res.redirect("/admin/workouts_listing");
      }

      let workoutImage = workout.workoutPic;

      if (req.files && req.files.workoutPic) {
        workoutImage = await helper.fileUpload(req.files.workoutPic, "images");
      }

      // Update workout details
      await workout.update({
        workoutName: req.body.workoutName || workout.workoutName,
        workoutTime: req.body.workoutTime || workout.workoutTime,
        workoutType: parseInt(req.body.workoutType, 10) || 1,
        workoutPic: workoutImage,
        workoutDescription: req.body.workoutDescription || "N/A",
      });

      // Process exercises
      let {
        exerciseId,
        exerciseName,
        sets,
        reps,
        exerciseTime,
        exerciseDescription,
      } = req.body;

      // Convert to arrays if not already
      exerciseId = !Array.isArray(exerciseId)
        ? exerciseId
          ? [exerciseId]
          : []
        : exerciseId;
      exerciseName = !Array.isArray(exerciseName)
        ? exerciseName
          ? [exerciseName]
          : []
        : exerciseName;
      sets = !Array.isArray(sets) ? (sets ? [sets] : []) : sets;
      reps = !Array.isArray(reps) ? (reps ? [reps] : []) : reps;
      exerciseTime = !Array.isArray(exerciseTime)
        ? exerciseTime
          ? [exerciseTime]
          : []
        : exerciseTime;
      exerciseDescription = !Array.isArray(exerciseDescription)
        ? exerciseDescription
          ? [exerciseDescription]
          : []
        : exerciseDescription;

      // Handle deleted exercises
      if (req.body.deletedExercises) {
        try {
          const deletedIds = JSON.parse(req.body.deletedExercises);
          if (Array.isArray(deletedIds) && deletedIds.length > 0) {
            await Models.exerciseModel.destroy({
              where: { id: { [Op.in]: deletedIds } },
            });
          }
        } catch (error) {
          console.error("Error processing deleted exercises:", error);
        }
      }

      // Update or create exercises using Promise.all
      await Promise.all(
        exerciseName.map(async (name, index) => {
          const exId = exerciseId[index];

          if (exId) {
            // Update existing exercise
            await Models.exerciseModel.update(
              {
                exerciseName: name || "N/A",
                sets: parseInt(sets[index], 10) || 1,
                reps: parseInt(reps[index], 10) || 1,
                exerciseTime: exerciseTime[index] || "N/A",
                exerciseDescription: exerciseDescription[index] || "N/A",
              },
              { where: { id: exId } }
            );
          } else {
            // Create new exercise
            await Models.exerciseModel.create({
              workoutId: workoutId,
              exerciseName: name || "N/A",
              sets: parseInt(sets[index], 10) || 1,
              reps: parseInt(reps[index], 10) || 1,
              exerciseTime: exerciseTime[index] || "N/A",
              exerciseDescription: exerciseDescription[index] || "N/A",
            });
          }
        })
      );

      // Update exercise count
      const exerciseCount = await Models.exerciseModel.count({
        where: { workoutId },
      });
      await workout.update({ numberOfExercises: exerciseCount });

      req.flash("msg", "Workout updated successfully");
      return res.redirect("/admin/workouts_listing");
    } catch (error) {
      console.error("Error in update_workout:", error);
      req.flash("error", "Failed to update workout");
      return res.redirect(`/admin/edit_workout/${req.body.workoutId}`);
    }
  },

  test: async (req, res) => {
    try {
      let objtosave = {
        name: "Dakota Johnson",
        email: "dk69@gmail.com",
        message:
          "Lorem ipsum odor amet, consectetuer adipiscing elit. Nulla semper viverra placerat ornare amet semper condimentum habitasse eget. Posuere ullamcorper condimentum magna enim eget id hendrerit aenean vehicula. Odio dignissim etiam eget porttitor, odio sagittis. Justo posuere inceptos et senectus netus eget quisque. Integer aptent suscipit etiam mauris lectus nec hendrerit. Efficitur scelerisque morbi per phasellus ante. Tortor iaculis magna hendrerit eleifend sapien euismod. Accumsan volutpat efficitur tortor finibus, amet sem semper.",
      };
      const saved = await Models.customerSupportModel.create(objtosave);
      console.log(saved);
    } catch (error) {
      throw error;
    }
  },
};

var express = require("express");
var router = express.Router();
const controller = require("../controllers/index");
const { session } = require("../helpers/commonHelper.js");

module.exports = function () {
  router.get("/", controller.adminController.login_page);
  router.get("/login", controller.adminController.login_page);
  router.post("/Login", controller.adminController.login);
  router.post("/logout", controller.adminController.logout);
  router.get("/dashboard", session, controller.adminController.dashboard);
  router.get('/getDashboardData', session, controller.adminController.getDashboardData);


  router.get("/profile", controller.adminController.profile);
  router.post("/profile_update/:id", controller.adminController.profile_update);
  router.get("/change_password", controller.adminController.change_password);
  router.post(
    "/change_password_post",
    controller.adminController.change_password_post
  );

  router.get("/aboutUs", session, controller.adminController.aboutUs);
  router.post("/about_post", session, controller.adminController.about_post);

  router.get(
    "/privacyPolicy",
    session,
    controller.adminController.privacyPolicy
  );
  router.post(
    "/privacy_post",
    session,
    controller.adminController.privacy_post
  );

  router.get(
    "/termsConditions",
    session,
    controller.adminController.termsConditions
  );
  router.post(
    "/termsConditionsPost",
    session,
    controller.adminController.termsConditionsPost
  );

  router.get(
    "/users_listing",
    session,
    controller.adminController.users_listing
  );
  router.get("/user_view/:id", session, controller.adminController.user_view);
  router.post("/user_status", session, controller.adminController.user_status);
  router.post("/user_delete", session, controller.adminController.user_delete);

  router.get("/footballer_listing", session,controller.adminController.footballer_listing);
  router.get("/footballer_view/:id", session,controller.adminController.footballer_view);
  router.post("/footballer_status", session,controller.adminController.footballer_status);
  router.post("/footballer_delete", session,controller.adminController.footballer_delete);

  router.get("/fitnessenthusiast_listing", session,controller.adminController.fitnessenthusiast_listing);
  router.get("/fitnessenthusiast_view/:id", session,controller.adminController.fitnessenthusiast_view);
  router.post("/fitnessenthusiast_status", session,controller.adminController.fitnessenthusiast_status);
  router.post("/fitnessenthusiast_delete", session,controller.adminController.fitnessenthusiast_delete);

  router.get(
    "/dualfocus_listing",
    session, controller.adminController.dualfocus_listing
  );
  router.get("/dualfocus_view/:id",session, controller.adminController.dualfocus_view);
  router.post("/dualfocus_status", session,controller.adminController.dualfocus_status);
  router.post("/dualfocus_delete", session,controller.adminController.dualfocus_delete);


  router.get(
    "/coach_listing",
    session,controller.adminController.coach_listing
  );
  router.get("/coach_view/:id",session, controller.adminController.coach_view);
  router.post("/coach_status",session, controller.adminController.coach_status);
  router.post("/coach_delete", session,controller.adminController.coach_delete);

router.get('/faq_list', session, controller.adminController.faq_list)
router.get('/add_faq', session, controller.adminController.add_faq)
router.post('/create_faq', session, controller.adminController.create_faq)
router.post('/delete_faq', session, controller.adminController.delete_faq)
router.get("/faq_edit/:id",session, controller.adminController.faq_edit);
router.post("/faq_update/:id", session, controller.adminController.faq_update);
router.get("/faq_view/:id",session, controller.adminController.faq_view);


router.get('/customersupport_listing', session, controller.adminController.customersupport_listing)
router.post('/delete_customersupport', session, controller.adminController.delete_customersupport)
router.get("/customersupport_view/:id",session, controller.adminController.customersupport_view);

router.get('/meals_listing', session, controller.adminController.meals_listing)
router.get('/add_meals', session, controller.adminController.add_meals)
router.post('/create_meals', session, controller.adminController.create_meals)
router.post('/delete_meals/:id', session, controller.adminController.delete_meals)
router.get("/get_meals/:mealType", session, controller.adminController.get_meals_by_type);

router.get('/workouts_listing', session, controller.adminController.workouts_listing)
router.get('/add_workouts', session, controller.adminController.add_workouts)
router.post('/create_workouts', session, controller.adminController.create_workouts)
router.post('/delete_workouts/:id', session, controller.adminController.delete_workouts)
router.get("/get_workouts/:workoutType", session, controller.adminController.get_workouts_by_type);
router.get("/edit_workout/:id",session, controller.adminController.edit_workout);
router.post("/update_workout", controller.adminController.update_workout);











  router.post("/test", controller.adminController.test);

  return router;
};

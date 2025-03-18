const express = require("express");
const {
  addQUestionToQuiz,
  getQuizByID,
  deleteQuizByID,
  addResponse,
  deleteResponse,
  getResponseByResponseID,
  getAllResponses,
} = require("../controllers/Quiz/quiz");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router
  .route("/:quiz_id")
  .patch(addQUestionToQuiz)
  .get(getQuizByID)
  .delete(verifyToken, deleteQuizByID);

router.route("/:quiz_id/response").post(addResponse).get(getAllResponses);
router
  .route("/:quiz_id/response/:response_id")
  .get(getResponseByResponseID)
  .delete(verifyToken, deleteResponse);

// router.route("/:id").patch(verifyToken, );

// router.route("/:id/quiz").post(verifyToken, createQuiz);

module.exports = router;

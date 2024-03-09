const express = require("express");
const moviesController = require("./../controller/moviesController");
const authContoller = require("./../controller/authController")

const router = express.Router();

router.route("/highest-rated").get(moviesController.getHighestRated, moviesController.getAllMovies)

router.route("/movie-stats").get(moviesController.getMovieStats)
router.route("/movie-by-genre/:genre").get(moviesController.getMovieByGenres)

router
  .route("/")
  .get(authContoller.protect, moviesController.getAllMovies)
  .post(moviesController.createMovie);

router
  .route("/:id")
  .get(authContoller.protect, moviesController.getMovie)
  .patch(moviesController.updateMovie)
  .delete(authContoller.protect, authContoller.restrict("admin"), moviesController.deleteMovie);

module.exports = router;

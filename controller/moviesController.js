const Movie = require("../Models/movieModels")

module.exports.getAllMovies = async (req, res) => {
  try{
    const movies = await Movie.find()

    res.status(200).json({
      status: "success",
      count: movies.length,
      data: {
        movies
      }
    })
  }catch(err){
    res.status(404).json({
      status: "fail",
      message: err.message
    })
  }
};

module.exports.getMovie = async (req, res) => {
  try{
    const movie = await Movie.findById(req.params.id)

    res.status(200).json({
      status: "success",
      data: {
        movie
      }
    })
  }catch(err){
    res.status(404).json({
      status: "fail",
      message: err.message
    })
  }
};

module.exports.createMovie = async (req, res) => {
  try{
    const movie = await Movie.create(req.body)

    res.status(201).json({
      status: "success",
      data: {
        movie
      }
    })
  }catch(err){
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
};

module.exports.updateMovie = async (req, res) => {
  try{
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidator: true})

    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie
      }
    })
  }catch(err){
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
};

module.exports.deleteMovie = async(req, res) => {
  try{
    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      data: null
    })
  }catch(err){
    res.status(400).json({
      status: "fail",
      message: err.message
    })
  }
};

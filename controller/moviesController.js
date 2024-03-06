const Movie = require("../Models/movieModels");
const ApiFeatures = require("./../Utils/ApiFeatures");


module.exports.getHighestRated = (req, res, next) => {
  req.query.limit = "5",
  req.query.sort = "-ratings"

  next()
}

module.exports.getAllMovies = async (req, res) => {
  try{
    const features = new ApiFeatures(Movie.find(), req.query).filter().sort().limitFields().paginate();
    
    const movies = await features.query;

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

    res.status(204).json({
      status: "success",
      data: null
    })
  }catch(err){
    res.status(404).json({
      status: "fail",
      message: err.message
    })
  }
};

module.exports.getMovieStats = async (req, res) => {
  try{
    const stats = await Movie.aggregate([
      {$match: {ratings: {$gte: 4.5}}},
      {$group: {
        _id: "$releaseYear",
        avgRating: {$avg: "$ratings"},
        avgPrice: {$avg: "$price"},
        minPrice: {$min: "$price"},
        maxPrice: {$max: "$price"},
        priceTotal: {$sum: "$price"},
        moviCount: {$sum: 1}
      }},
      {$sort: {minPrice: 1}},
      {$match: {maxPrice: {$gte: 60}}}
    ])

    res.status(200).json({
      status: "success",
      count: stats.length,
      data: {
        stats
      }
    })
  }catch(err){
    res.status(404).json({
      status: "fail",
      message: err.message
    })
  }
}

module.exports.getMovieByGenres = async (req, res) => {
  try{
    const genre = req.params.genre;
    
    const movies = await Movie.aggregate([
      {$unwind: "$genres"},
      {$group: {
        _id: "$genres",
        movieCount: {$sum: 1},
        movies: {$push: "$name"}
      }},
      {$addFields: {genre: "$_id"}},
      {$project: {_id: 0}},
      {$sort: {movieCount: 1}},
      // {$limit: 6}
      {$match: {genre: genre}}
    ])

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
}
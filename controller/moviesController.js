const Movie = require("../Models/movieModels");
const CustomError = require("../Utils/CustomError");
const ApiFeatures = require("./../Utils/ApiFeatures");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");



module.exports.getHighestRated = (req, res, next) => {
  req.query.limit = "5",
  req.query.sort = "-ratings"

  next()
}

module.exports.getAllMovies = asyncErrorHandler( async (req, res, next) => {

    const features = new ApiFeatures(Movie.find(), req.query).filter().sort().limitFields().paginate();
    
    const movies = await features.query;

    res.status(200).json({
      status: "success",
      count: movies.length,
      data: {
        movies
      }
    })
})

module.exports.getMovie = asyncErrorHandler( async (req, res, next) => {
  console.log("test")
  console.log(process.env)
  
  const movie = await Movie.findById(req.params.id)
  
  if(!movie){
    const error = new CustomError("Movie with that id is not found!", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      movie
    }
  })
})

module.exports.createMovie = asyncErrorHandler( async (req, res, next) => {
    const movie = await Movie.create(req.body)

    res.status(201).json({
      status: "success",
      data: {
        movie
      }
    })
})

module.exports.updateMovie = asyncErrorHandler(async (req, res, next) => {

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidator: true})

    if(!updatedMovie){
      const error = new CustomError("Movie with that id is not found!", 404);
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie
      }
    })
})

module.exports.deleteMovie = asyncErrorHandler(async(req, res, next) => {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

    if(!deletedMovie){
      const error = new CustomError("Movie with that id is not found!", 404);
      return next(error);
    }

    res.status(204).json({
      status: "success",
      data: null
    })
})

module.exports.getMovieStats = asyncErrorHandler(async (req, res, next) => {

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
      // {$match: {maxPrice: {$gte: 60}}}
    ])

    res.status(200).json({
      status: "success",
      count: stats.length,
      data: {
        stats
      }
    })
})

module.exports.getMovieByGenres = asyncErrorHandler(async (req, res, next) => {

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
})

module.exports.getmo = async (req, res, next) => {
    try{
  const movie = await Movie.findById(req.params.id)
  console.log("test")
  if(!movie){
    const error = new CustomError("Movie with that id is not found!", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      movie
    }
  })
}catch(err){
  res.status(404).json({
    status: "fail"
  })
}
}
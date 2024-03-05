const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field is required"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description field is required"],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, "Duration is requird field"],
    },
    ratings: {
        type: Number,
    },
    totalRating: {
        type: Number
    },
    releaseYear: {
        type: Number,
        required: [true, "ReleaseYear is a requird field"]
    },
    releaseDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    genres: {
        type: [String],
        required: [true, "Genres is a required field"]
    },
    directors: {
        type: [String],
        required: [true, "Genres is a required field"]
    },
    coverImage: {
        type: String,
        required: [true, "cover image is requird field"]
    },
    actors: {
        type: [String],
        required: [true, "actors is a required field"]
    },
    price: {
        type: Number,
        required: [true, "Price is a required field"]
    }
})

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
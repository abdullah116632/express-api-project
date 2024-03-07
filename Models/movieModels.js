const mongoose = require("mongoose");
const fs = require("fs");
const validator = require("validator")

const movieSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field is required"],
        unique: true,
        trim: true,
        validate: [validator.isAlpha, "name should only contain alphabets"]
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
    },
    createdBy: String
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

movieSchema.virtual("durationInHours").get(function(){
    return this.duration / 60;
})

movieSchema.pre("save", function(next){
    this.createdBy = "ABDULLAH";
    next()
})

movieSchema.post("save", function(doc, next){
    const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy}`
    fs.writeFileSync("./log/log.txt", content, {flag: "a"}, () => {
        console.log(err.message);
    })
    next()
})

movieSchema.pre(/^find/, function(next){
    this.find({releaseYear: {$lte: 2024}})
    this.startTime = Date.now()
    next()
})

// movieSchema.pre("findOne", function(next){
//     this.find({releaseDate: {$lte: Date.now()}})
//     next()
// })

movieSchema.post(/^find/, function(docs, next){
    this.find({releaseYear: {$lte: 2024}})
    this.endTime = Date.now()

    const content = `Query took ${this.endTime - this.startTime} milliseconds to fetch the documents`
    fs.writeFileSync("./log/log.txt", content, {flag: "a"}, () => {
        console.log(err.message);
    })
    next()
})

movieSchema.pre("aggregate", function(next){
        this.pipeline().unshift({$match: {releaseDate: {$lte: new Date()}}})
    next()
})

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
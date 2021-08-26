const mongoose = require('mongoose')

const ariBnbSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  Host_Name: String,
  No: String,
  Property_Name: String,
  policy_num: String,
  Cleanliness_Ratings: String,
  Accuracy_Ratings: String,
  Communication_Ratings: String,
  Location_Ratings: String,
  Checkin_Ratings: String,
  Value_Ratings: String,
  Beds: String,
  Baths: String,
  BedRooms: String,
})

module.exports = mongoose.model('hostProperty', ariBnbSchema)

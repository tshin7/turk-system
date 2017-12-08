let User = require('../models/user.js');
let Demand = require('../models/demand.js');
let Rating = require('../models/rating.js');

const home = (app, isLoggedIn, checkUserAccess) => {
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  const renderHomeAndCalculateStatus = (req, res) => {
  	Rating
  	  .find({ 'toUserId' : req.user._id })
  	  .exec(function(err, allRatingsForUser) {
  	  	if(err) { throw err; }
  	  	let sum = 0;
	  	allRatingsForUser.forEach((ratingObj, i) => {
	  	  	sum += ratingObj.rating;
	  	});
	  	let avgRating = sum/allRatingsForUser.length;
  	  	//Loop through all the rating and get the sum and avg
  	  	User
  	  	 .findOne({ '_id' : req.user._id})
  	  	 .exec(function(err2, setUserStatus) {
  	  	 	let oldAvgRating = setUserStatus.local.avgRating;
  	  	 	setUserStatus.local.avgRating = avgRating;
  	  	 	if (avgRating <= 2 && allRatingsForUser.length >= 5) {
  	  	 		setUserStatus.local.accountStatus = 'poorperformance';
  	  	 		if (oldAvgRating > avgRating) {
  	  	 			// the warning was already sent 
  	  	 			setUserStatus.local.warningCounter += 1;
  	  	 		}
  	  	 	}
  	  	 	setUserStatus.save(function(err) {
      			if (err) { throw err; }
      			Rating
  	  			.find({ 'fromUserId' : req.user._id })
  	  			.exec(function(err3, allRatingByUser) {
      				if (err3) { throw err3; }
      				let sum = 0;
				  	allRatingByUser.forEach((ratingObj, i) => {
				  	  	sum += ratingObj.rating;
				  	});
	  				let avgRating = sum/allRatingByUser.length;
	  				User
  	  	 			.findOne({ '_id' : req.user._id})
  	  	 			.exec(function(err4, setUserStatus) {
      					if (err4) { throw err4; }
  	  	 				let oldAvgRatingToOthers = setUserStatus.local.avgRatingToOthers;
  	  	 				setUserStatus.local.avgRatingToOthers = avgRating;
      					if ((avgRating < 2 || avgRating > 4) && allRatingByUser.length >= 8) {
      						setUserStatus.local.accountStatus = 'irresponsibleevaluations';
      						if (oldAvgRatingToOthers > avgRating) {
			  	  	 			// the warning was already sent 
			  	  	 			setUserStatus.local.warningCounter += 1;
			  	  	 		}
      					}
      					setUserStatus.save(function(err) { 
      						res.render('home.ejs', {
  	 							user: req.user // get the user out of session and pass to template
							});
      					})

  	  	 			 })

      				
  	  			})
      			
    		});
  	  	 })	

  	  })
  };

  app.get('/home', isLoggedIn, checkUserAccess, renderHomeAndCalculateStatus);

  return app;
}

module.exports = home

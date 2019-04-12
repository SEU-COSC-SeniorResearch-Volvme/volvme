//Volvme User 'Dashboard' Controller//
const mongoose = require('mongoose')
const db = mongoose.connect('mongodb://localhost/Volvme', {useNewUrlParser: true, autoIndex: false})

//Import Models//
const User = require('../models/user')
const Project = require('../models/project')
const Group = require('../models/group')


//Export Model Controls//
exports.index = function(req, res) {
	res.json({
		info: "This is the Volvme api user index point. Refer to the Volvme api index point (../api) for complete api documentation. Thanks for visiting Volvme :)",
		suggestion: "Visit /signup to create a new user with us! :)"
	})
}

exports.signup = function(req, res) {

	if (req.body.name &&
		req.body.email &&
		req.body.password)	{

		const new_user = new User({

	     	_id: mongoose.Types.ObjectId(),
	     	email: req.body.email,
	    	profile: {
	    		name: req.body.name
	    	}
    	})
		new_user.setPassword(req.body.password)
		new_user.save(function(err, new_user){
					if (err) return res.status(500).json(err)
					return res.status(201).json(new_user.toAuthProfile())
				})
	}
}//End Post Signup//

exports.login = function(req, res) {


	if (req.body.email && req.body.password) {
		User.findOne({email: req.body.email	})
			.exec(function(err, user) {
				if (err) return res.status(500).send("Error Finding User")
				if (!user) return res.status(404).json({"message": "The email provided is not registered with us!"})
	  			if (!user.validPassword(req.body.password)) return res.status(401).json({"message": "Invalid Password"})
	  			return res.status(200).json(user.toAuthProfile())
			})
	}

	// db.User.findOne(
	// 	 //query params//
	// 	{email: req.body.email},
	// 	// { //return values//
	// 	// 	profile: true
	// 	// },
	// 	//callback function//
	// 	function(err, user) {

	// 		if (err) return res.status(500).json(err) //next(err)
	//   		let token = user.generateJWT()
	//   		if (!user) return res.status(204).json({"message": "The email provided is not registered with us!"})
	//   		if (!user.validPassword(req.body.password)) return res.status(401).json({"message": "Invalid Password"})
	//   		//Success//
	//   		 res.session.user = user
	// 		return res.status(200).json(user.toAuthProfile()) //(user.toAuthProfile())
	// 	}
	// )
}//End Login//

exports.dahsboard = function(req, res) {

	const profile = req.session.user.toAuthProfile()
	return res.status(200).json(profile)

}

exports.logout = function (req, res, next) {

	if (req.session)
	{
		req.session.destroy(function(err) {
			if (err)
				return next(err)
			else
				return res.redirect('https://volvme.xyz/', {

				})
		})
	}
}//End Logout//



exports.getAllUsers = function(req, res) {

	//res.send("Lists all Users")
	User.find({}, {profile: true}, function(err, users) {
		if (err) return res.status(500).json("Error finding all Users")
		return res.status(200).json(users)
	})
}

exports.getUserByID = function(req, res) {

	//const user = {_id: req.body.userID }
	User.findOne({_id: req.body.userID},
								{profile: true})
		.exec(function(err, user) {
        if (err) return res.status(500).send("Error Finding this User")
        if (!user) return res.status(404).send("No user found.")
        res.status(200).json(user.toProfile())
	})
}

exports.getUserByName = function(req, res) {

	//const user = {_id: req.body.userID }
	User.findOne({_id: req.body.userID},
								{profile: true})
		.exec(function(err, user) {
        if (err) return res.status(500).send("Error Finding this User")
        if (!user) return res.status(404).send("No user found.")
        res.status(200).json(user.toProfile())
	})
}

exports.updateBio = function(req, res) {

	const bio = req.body.bio

// 	User.findOneAndUpdate({email: req.params.email})
// 	 		.exec(function(err, user) {
// 					if (err) return res.status(500).json(err)
// 					if (!user) return res.status(404).send("No user found.")
					
// 					user.save(function(err, success) {
// 							if (err) return res.status(500).json(err)
// 							res.status(200).json(user.toAuthProfile())
// 			})
// 	})
// }

	User.findOneAndUpdate( 
		{email: req.body.email},
		{$set: {
			"profile.bio":bio
		}},
		{new: true},
		function(err, updatedUser) {
			if (err) return res.status(500).json(err)
			return res.status(200).json(updatedUser.toAuthProfile())
		})
}


exports.addFriend = function(req, res) {

	//res.send("Add a Friend to a Users Friend list")
	const friend = req.body.friendID
	const friends = [friend]
	User.findByIdAndUpdate(
		mongoose.Types.ObjectId(req.body.userID),
		{$push:{
			"profile.friends": 	mongoose.Types.ObjectId(req.body.friendID),

		}},
		{new:true},
		function(err, user) {
			if (err) return res.status(500).send(err)
			if (!user) return res.status(404).send("No user found.")
		 	return res.status(200).json(user.toAuthProfile())
		 })
}

exports.removeFriend = function(req, res) {

	//res.send("Remove a Friend from a Users Friend list")
	const friend = req.body.friendID
	const friends = [friend]
	User.findOne({_id: req.body.userID})
		.exec(function(err, user) {
			if (err) return res.status(500).send("Error Finding this User")
			if (!user) return res.status(404).send("No user found.")
			user.profile.friends.pull(friend)
			user.save(function(err, success) {
				if (err) return res.status(500).json(err)
				return res.status(200).json(user.toAuthProfile())
			})
		})
}

exports.getFriends = function(req, res) {

	//res.send("List all friends of a User")
	User.find({ _id: this.id }, 'friends', function(err, friends) {
		if (err) return res.status(500).json(err)
		return res.status(200).json(friends)
	}
)}

exports.createProject = function(req, res) {
	//res.send("Add a Project to a Users Project list")
	const title = req.body.title
	const creator = req.body.creatorID
	const new_project = new Project({
     	_id: mongoose.Types.ObjectId(),
     	title: title,
    	creator: creator
	})
	User.findById(creator, function(err, user) {
		if (err) {
			console.log('Error finding project creator')
			return res.status(500).json(err)
		}
		user.profile.projects.push(new_project._id)
		user.save(function(err, done) {
			if (err) {
				console.log('Error saving user')
				return res.status(500).json(err)
			}
		new_project.save(function(err, new_project) { 
				if (err) {
					console.log('Error saving project')
					return res.status(500).json(err)
				}
			})
		})
	})
}

exports.updateProject = function(req, res) {

	res.send("Edit a User Project")
}

exports.deleteProject = function(req, res) {
	//res.send("Remove a User Project")
	const projectID = req.body.projectID
	const userID = req.body.userID
	Project.findByIdAndDelete(projectID)
	User.findById(userID, function(err, user) {
		user.profile.projects.pull(projectID)
	})
	return res.status(200).json("Project Successfully Deleted")

}

exports.uploadImage = function(req, res) {

	const userID = req.body.userID
	const file = req.file
  if (!file) return res.status(500).send('Please upload a file')
	console.log('successful file upload')
	User.findByIdAndUpdate(
		userID,
		{$set: { image: file.filename}}
	)
	return res.status(200).json({
		message: "Success",
		file: file
	})
}

//jake routes

exports.getStuff = function(req, res) {
	//res.send("Lists all Users")
	User.find({}, {profile: true}, function(err, users) {
		if (err) return res.status(500).json("Error finding all Users")
		return res.status(200).json(users)
	})
}

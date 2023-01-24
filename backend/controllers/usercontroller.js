const userModel = require("../models/Userschema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const transporter = require("../config/emailconfig.js")
const { find } = require("../models/Userschema")

class UserController {
    static userRegister = async (req, res) => {
        const { username, email, password, password_confirmation, tc } = req.body
        const user = await userModel.findOne({ email: email })
        if (user) {
            res.status(201).send({ "status": "Failed", "message": "Email Already exists" })
        } else {
            if (username && email && password && password_confirmation && tc) {
                if (password === password_confirmation) {
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashpassword = await bcrypt.hash(password, salt)
                        const document = new userModel({
                            username: username,
                            email: email,
                            password: hashpassword,
                            tc: tc
                        })
                        await document.save()
                        const saved_user = await userModel.findOne({ email: email })
                        console.log(saved_user)

                        // genrate token 
                        const token = jwt.sign({ userID: saved_user._id, username: saved_user.username }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" })


                        res.status(200).send({ "status": "Success", "message": "registeration successful", "token": token, "username": saved_user.username })

                    } catch (error) {
                        console.log(error)
                        res.status(201).send({ "status": "Failed", "message": "Unable to register" })
                    }

                } else {
                    res.status(201).send({ "status": "Failed", "message": "password and confirm password doesn't match" })

                }

            } else {
                res.status(201).send({ "status": "Failed", "message": "all Fields are required" })

            }

        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body
            if (email && password) {
                const user = await userModel.findOne({ email: email })
                if (user != null) {
                    const isMatch = await bcrypt.compare(password, user.password)

                    if (user.email === email && isMatch) {

                        // genrate token 
                        const token = jwt.sign({ userID: user._id, username: user.username }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" })

                        res.status(200).send({ "status": "Success", "message": "login successful", "token": token, "username": user.username })
                    } else {
                        res.status(201).send({ "status": "Failed", "message": "email or password is not valid " })
                    }
                } else {
                    res.status(201).send({ "status": "Failed", "message": "you are not registered user" })
                }
            } else {
                res.status(201).send({ "status": "Failed", "message": "all Fields are required" })
            }
        } catch (error) {
            console.log(error)
            res.status(201).send({ "status": "Failed", "message": "Unable to login" })

        }
    }
    static changeUserpassword = async (req, res) => {
        const { password, password_confirmation } = req.body
        if (password && password_confirmation) {
            if (password !== password_confirmation) {
                res.send({ "status": "failed", "message": "new password and confirm new password doesnt match" })
            } else {
                const salt = await bcrypt.genSalt(10)
                const newhashpassword = await bcrypt.hash(password, salt)
                await userModel.findByIdAndUpdate(req.user._id, { $set: { password: newhashpassword } })
                res.status(200).send({ "status": "success", "message": "Password changed successfully" })
            }
        } else {
            res.status(201).send({ "status": "failed", "message": "all fields are required" })
        }
    }

    static loggedUser = async (req, res) => {
        res.status(200).send({ "user": req.user })
    }

    static sendUserpasswordResetEmail = async (req, res) => {
        const { email } = req.body
        if (email) {
            const user = await userModel.findOne({ email: email })
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '20m' })
                const link = `http://127.0.0.1:8080/reset/${user._id}/${token}`
                // console.log(link)

                // send email 
                let info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject: "Splitwise - Password Reset link ",
                    html: `<a href=${link}>Click here </a> To reset your password`
                })
                console.log("Message sent: %s", info.messageId)
                res.send({ "status": "success", "message": "Password reset email sent... please check your email", "info": info })

            } else {
                res.send({ 'status': "failed", "message": "email doesnt exits" })
            }
        } else {
            res.status(401).send({ "status": "failed", "message": "email field is required" })
        }
    }

    static userpasswordreset = async (req, res) => {
        console.log(req.body)
        const { password, password_confirmation, id, token } = req.body
        // const { id, token } = req.params
        const user = await userModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)
            if (password && password_confirmation) {
                if (password !== password_confirmation) {
                    res.status(201).send({ "status": "failed", "message": "new password and confirmation new password doesn't match" })

                } else {
                    const salt = await bcrypt.genSalt(10)
                    const newhashpassword = await bcrypt.hash(password, salt)
                    await userModel.findByIdAndUpdate(user._id, { $set: { password: newhashpassword } })
                    res.status(200).send({ "status": "Success", "message": "password reset successfully" })
                }
            } else {
                res.status(201).send({ "status": "failed", "message": "all fields are required " })

            }
        } catch (error) {
            res.status(201).send({ "status": "failed", "message": "Invaild token " })
        }
    }
    // chulu method ////////////////////////
    // static async AddFriend(userObject, response) {
    //     var check = await userModel.find(userObject.username);
    //     console.log(check);
    //     if (check) {
    //         // console.log("hiimj")
    //         userModel.findOneAndUpdate({ username: userObject.body.defaultUser },
    //             { "$push": { "friends": userObject.body.username, "expensis": { "name": userObject.body.username, "data": {} } } }, { "new": true },
    //             (err, doc) => {
    //                 if (err) {
    //                     console.log(err);
    //                 } else {
    //                     //send mail to check.email => that userObject.default user has added you as his friend;
    //                     response.json({ Status: "Success", message: "Added succesfully", doc: doc });

    //                 }
    //             }
    //         )
    //     } else {
    //         console.log("status Fail")
    //         response.json({ Status: "Failed", msg: "your friend is not registerd yet" });
    //     }
    // }
    // find(username) {
    //     return userModel.findOne({ username }, function (err, res) {
    //         if (err) {
    //             console.log(err)
    //         } else {
    //             if (doc) {
    //                 console.log(doc)
    //             } else {
    //                 console.log("not found")
    //             }
    //         }

    //     })
    // }

    //  kuch naya try karte hai from below  with modified code ////////

    static async AddFriend(userObject, response) {
        const check = await userModel.findOne({ username: userObject.body.username });
        if (check) {
        userModel.findOne({ username: userObject.body.defaultUser, friends: { $elemMatch: { $eq: userObject.body.username } } }, (err, doc) => {
        if (err) {
            console.log(err);
        } else {
            if (doc) {
                console.log("Friend already exists");
                response.json({ Status: "Failed", message: "Friend already exists" });
            } else {
                userModel.findOneAndUpdate({ username: userObject.body.defaultUser },
                    { "$push": { "friends": userObject.body.username, "expensis": { "name": userObject.body.username, "data": {} } } }, { "new": true },
                    (err, doc) => {
                        if (err) {
                            console.log(err);
                        } else {
                            response.json({ Status: "Success", message: "Added succesfully", doc: doc });
                        }
                    }
                )
            }
            }
         })
        } else {
            console.log("status Fail")
            response.json({ Status: "Failed", message: "user doesnot exists register the user first" });
            }
        }
    






    static async getUserData(req, res) {
        const result = await userModel.find({ username: req.body.username })
        if (result) {
            res.json({ user: result })
        } else {
            console.log("Error in finding User")
        }
    }

    // / ADD Expenses //////////
    static async AddExp(userObject, response) {
        console.log(userObject, "12335")

        let results = [];  // create an empty array to store the results

        console.log('Starting loop...');  // debug statement

        for (let i = 0; i < userObject.body.length; i++) {
            // use the await keyword to wait for the findOneAndUpdate function to complete
            console.log(userObject.body[i].amount)
            let result = await userModel.findOneAndUpdate({
                username: userObject.body[i].username, "expensis.name": userObject.body[i].user
            }, {
                "$set": { "expensis.$.data.description": userObject.body[i].description, "expensis.$.data.date": userObject.body[i].date }, "$inc": { "expensis.$.data.amount": userObject.body[i].amount }
            }, { "new": true }
            );

            if (result) {
                // store the result in the results array
                console.log('Adding result...');  // debug statement
                results.push({ Status: "Success", msg: "Added succesfully", doc: result });
            } else {
                console.log('Error occurred.');  // debug statement
            }
        }

        console.log('Finished loop.');  // debug statement

        // send the response with the results array after the loop has finished
        response.json(results);
    }




    static settle(userObject, response) {

        userModel.findOneAndUpdate({ username: userObject.body.username, "expensis.name": userObject.body.user }, { "$inc": { "expensis.$.data.amount": userObject.body.amount } }, { "new": true },
            (err, doc) => {
                if (err) {
                    console.log(err);
                } else {
                    //send mail to check.email => that userObject.default user has added you as his friend;
                    console.log(doc);
                    response.json({ Status: "Sucsess", msg: "Amount settle  succesfully", doc: doc });
                }
            }
        )

    }
    static async invite(req, res) {

        // get the email address from the request body
        const { email } = req.body;
        const link = "http://localhost:8080/signup"

        const user = await userModel.findOne({ email: email });
        if (user) {
            res.status(400).send({ error: 'Email already exists' });
            return;
        }

        // create the email message
        const message = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Invitation to join our platform',
            text: `Hello, you have been invited to join our platform! splitwise clone click on the blow link ${link}`,
        };

        // send the email
        transporter.sendMail(message, (error, info) => {
            if (error) {
                // send a response with the error
                res.send({ error });
            } else {
                // send a response with the success message
                res.send({ message: 'Invitation sent successfully!' });
            }
        });
        ;

    }

}


module.exports = UserController
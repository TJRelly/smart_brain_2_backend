const express = require("express");
const router = new express.Router();
const fetch = require("node-fetch");

const ExpressError = require("../expressError");
const User = require("../models/user");
// read .env files and make environmental variables
require("dotenv").config();

/** POST /imageurl
 *
 * Handle API call
 *
 **/

router.post("/imageurl", async function (req, res, next) {
    const imageUrl = req.body.input;

    const returnClarifaiRequestOptions = (url) => {
        const raw = JSON.stringify({
            user_app_id: {
                user_id: "clarifai",
                app_id: "main",
            },
            inputs: [
                {
                    data: {
                        image: {
                            url: url,
                        },
                    },
                },
            ],
        });

        const requestOptions = {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: process.env.CLARIFAI_API_KEY,
            },
            body: raw,
        };
        return requestOptions;
    };

    await fetch(
        `https://api.clarifai.com/v2/models/face-detection/outputs`,
        returnClarifaiRequestOptions(imageUrl)
    )
        .then((response) => response.text())
        .then((data) => {
            res.json(data);
        })
        .catch((err) => res.status(400).json("unable to work with API"));
});

router.patch("/increment", async function (req, res, next) {
    try {
        const { id } = req.body;
        if (id) {
            const user = await User.incrementEntries(id);
            return res.json(user);
        } else throw new ExpressError("Invalid id", 400);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;

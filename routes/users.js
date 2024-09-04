/** Routes for companies in biztime. */

const express = require("express");
// const ExpressError = require("../middleware/expressError");
const router = new express.Router();
const User = require("../models/user");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", async function (req, res, next) {
    try {
        const users = await User.all();
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", async function (req, res, next) {
    try {
        const user = await User.get(req.params.username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { username, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }
        const user = await User.update(req.params.id, req.body);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[id]   => {message: "User deleted"} */

router.delete("/:id", async function (req, res, next) {
    try {
        await User.remove(req.params.id);
        return res.json({ message: "User deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;

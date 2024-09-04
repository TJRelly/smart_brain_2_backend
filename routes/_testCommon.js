const db = require("../db");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
    await db.query("DELETE FROM users");

    await User.register({
        username: "u1",
        email: "user1@user.com",
        password: "password1",
    });
    await User.register({
        username: "u2",
        email: "user2@user.com",
        password: "password2",
    });
    await User.register({
        username: "u3",
        email: "user3@user.com",
        password: "password3",
    });
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

const u1Token = createToken({ id: 111, username: "u1", isAdmin: false });
const u2Token = createToken({ id: 222, username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
};

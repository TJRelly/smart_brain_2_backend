/** User class for message.ly */
const { BCRYPT_WORK_FACTOR } = require("../config");
const bcrypt = require("bcrypt");
const db = require("../db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ExpressError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** User of the site. */

class User {
    /** register new user -- returns
     *    {username, password, email}
     */

    static async register({ username, password, email }) {
        const duplicateCheck = await db.query(
            `SELECT username
             FROM users
             WHERE username = $1`,
            [username]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        if (!username || !password) {
            throw new ExpressError("Username and password required", 400);
        } else if (!email) {
            throw new ExpressError("Email required", 400);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users (username, password_hash, email)
             VALUES ($1, $2, $3)
             RETURNING id, username, password_hash`,
            [username.toLowerCase(), hashedPassword, email]
        );

        return result.rows[0];
    }

    /** Authenticate: is this username/password valid? Returns boolean. */

    static async authenticate(username, password) {
        // try to find the user first
        const result = await db.query(
            `SELECT id,
                    username,
                    password_hash AS password,
                    email,
                    is_admin AS "isAdmin"
            FROM users
            WHERE username = $1`,
            [username]
        );

        const user = result.rows[0];

        if (user) {
            // compare hashed password to a new hash from password
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }

    /** Update last_login_at for user */

    static async updateLoginTimestamp(username) {
        const result = await db.query(
            `UPDATE users 
                SET last_login_at = current_timestamp
                WHERE username = $1
                RETURNING username`,
            [username]
        );

        if (!result.rows[0]) {
            throw new ExpressError(`No such user: ${username}`, 404);
        }
    }

    /** All: basic info on all users:
     * [{username, email, entries.. }, ...] */

    static async all() {
        const result = await db.query(
            `SELECT username, entries, created_at FROM users`
        );
        let users = result.rows;
        return users;
    }

    /** Get: get user by username
     *
     * returns {username,
     *          email,
     *          entries,
     *          created_at,
     *          last_login_at,
     *          is_admin } */

    static async get(username) {
        const result = await db.query(
            `SELECT id, username, email, entries, created_at, last_login_at, is_admin
                FROM users
                WHERE username = $1`,
            [username]
        );

        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        return user;
    }

    /** Update data with matching ID to data, return updated user.
     * {username, email, entries.. }
     *
     * => {username, email, entries.. }
     *
     * */

    static async update(id, data) {
        if (data.password) {
            data.password = await bcrypt.hash(
                data.password,
                BCRYPT_WORK_FACTOR
            );
        }

        const { setCols, values } = sqlForPartialUpdate(data, {
            password: "password_hash",
        });

        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING id, username,
                                    email, created_at, entries, is_admin, last_login_at`;

        const result = await db.query(querySql, [...values, id]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user at id: ${id}`);

        delete user.password;
        return user;
    }

    /** remove book with matching id. Returns undefined. */

    static async remove(id) {
        const result = await db.query(
            `DELETE 
             FROM users 
             WHERE id = $1 
             RETURNING username`,
            [id]
        );

        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);
    }

    static async incrementEntries(id) {
        const result = await db.query(
            `UPDATE users
                SET entries = entries + 1
                WHERE id = $1
                RETURNING username, entries`,
            [id]
        );

        let user = result.rows[0];
      
        if (!user) {
            throw new ExpressError(`No such user at id: ${id}`, 404);
        }
        return user;
    }
}

module.exports = User;

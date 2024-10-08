/** Common config */

// read .env files and make environmental variables
require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY;

const PORT = +process.env.PORT || 3000;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
    return process.env.NODE_ENV === "test"
        ? "psql:///smart_brain_2_test"
        : process.env.DATABASE_URI || "psql:///smart_brain_2";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

// console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
// console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("Jobly Config:".green);
console.log("PORT:".yellow, PORT.toString());
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri,
};

const { BadRequestError } = require("../expressError");
const db = require("../db")

/**
 * Helper for making selective update queries.
 *
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 * @param jsToSql {Object} maps js-style data fields to database column names,
 *   like { firstName: "first_name", age: "age" }
 *
 * @returns {Object} {sqlSetCols, dataToUpdate}
 *
 * @example {firstName: 'Aliya', age: 32} =>
 *   { setCols: '"first_name"=$1, "age"=$2',
 *     values: ['Aliya', 32] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0)
        throw new BadRequestError("No data entered to update.");

    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map(
        (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
    );

    return {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate),
    };
}

// checks for dulicates in database
async function checkForDuplicates(field, value) {
    const result = await db.query(
        `SELECT ${field} 
       FROM users 
       WHERE ${field} = $1`,
        [value]
    );
    return result.rows.length > 0; // Returns true if duplicates exist
}

module.exports = { sqlForPartialUpdate, checkForDuplicates };

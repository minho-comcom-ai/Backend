const { DataTypes } = require('sequelize');

module.exports = (sequelize) => (
    sequelize.define('school_code', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        }
    })
)
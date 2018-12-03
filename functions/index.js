var functionsObj = {};

functionsObj.findIndexInData = async function(data, property, value) {
    data.some(function(item, i) {
        if (item[property] == value) {
            return true;
        }
    });
    return false;
};

module.exports = functionsObj;

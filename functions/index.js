var functionsObj = {};

functionsObj.findIndexInData = function(data, property, value) {
    var check = 0;
    data.some(function(item, i) {
        if (item[property] == value) {
            check = 1;
            return true;
        }
    });
    if (check == 0) {

    }
    else if (check == 1) {
        return true;
    }
    else {
        return false;
    }
};

module.exports = functionsObj;

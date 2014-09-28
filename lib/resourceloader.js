exports.getImage = function (name) {
    return resources[name];
};

var resources = {};
exports.loadResource = function (name, path) {
    var img = new window.Image();
    img.src = path;
    resources[name] = img;
    return exports;
};
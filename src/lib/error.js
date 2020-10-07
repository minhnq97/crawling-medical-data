const MyError = {
    NotValidate(msg,data) {
        return {
            msg, status: 400,
            code: 'NotValidate',data
        };
    },
    NotFound(msg,data) {
        return {
            msg, status: 404, code: 'NotFound',data
        };
    },
    ServerError(msg,data) {
        return {
            msg, status: 500, code: 'ServerError',data
        };
    }
};
module.exports = { MyError };
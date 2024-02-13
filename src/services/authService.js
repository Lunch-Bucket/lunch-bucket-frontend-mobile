import {
    forgetPasswordController,
    loginController,
    registerController,
    validateTokenController
} from "../controllers/authController";
import {ERROR_STATUS, SUCCESS_STATUS} from "../errorLogs/errorStatus";
import {addDataToLocalStorage} from "../helpers/storage/asyncStorage";
import {log} from "../helpers/logs/log";

export async function loginService(email, password) {
    try {
        if (email === "" || password === "") {
            return ERROR_STATUS.ERROR;
        }

        const result = await loginController(email, password);
        const data = await result.data;

        console.log("result", result);

        if (result === ERROR_STATUS.ERROR) {
            log("error", "service", "loginService | result", result, "authService.js");
            return ERROR_STATUS.LOGIN_API_ERROR;
        } else if (data && data.state === false && data.response === "not registered") {
            log("info", "service", "loginService | state", data.state, "authService.js");
            return ERROR_STATUS.LOGIN_NOT_REGISTERED;
        } else if (data && data.state === false && data.response === "email confirmation pending") {
            log("info", "service", "loginService | state", data.state, "authService.js");
            return ERROR_STATUS.LOGIN_EMAIL_CONFIRMATION_PENDING;
        } else {
            await addDataToLocalStorage('token', data && data.token);
            await addDataToLocalStorage('customerId', data.id ? data.id : "");
            await addDataToLocalStorage('loginStatus', "true");
            await addDataToLocalStorage('role', data && data.type ? data.type : "");

            log("success", "service", "loginService", "Login Success", "authService.js");
            return data;
        }
    } catch (error) {
        log("error", "service", "loginService", error.message, "authService.js");
        return ERROR_STATUS.ERROR;
    }
}

export async function registerService(email, password, contactNo, expoPushToken) {
    try {
        if (email === "" || password === "" || contactNo === "") {
            return ERROR_STATUS.ERROR;
        }

        const result = await registerController(email, password, contactNo, expoPushToken);
        const data = await result.data;

        if (result === "error") {
            log("error", "service", "registerService | result", data.response, "authService.js");
            return ERROR_STATUS.ERROR;
        } else if (data && data.state === false) {
            log("error", "service", "registerService | state", data.state, "authService.js");
            return ERROR_STATUS.ERROR;
        } else {
            log("success", "service", "registerService", "Register Success", "authService.js");
            return SUCCESS_STATUS.SUCCESS;
        }
    } catch (error) {
        log("error", "service", "registerService", error.message, "authService.js");
        return ERROR_STATUS.ERROR;
    }
}

export async function forgetPasswordService(email, password) {
    try {
        if (email === "" || password === "") {
            return ERROR_STATUS.ERROR;
        }

        const result = await forgetPasswordController(email, password);
        const data = await result.data;

        if (result === "error") {
            log("error", "service", "forgetPasswordService | result", data.response, "authService.js");
            return ERROR_STATUS.ERROR;
        } else if (data && data.state === false) {
            log("error", "service", "forgetPasswordService | state", data.state, "authService.js");
            return ERROR_STATUS.ERROR;
        } else {
            log("success", "service", "forgetPasswordService", "Register Success", "authService.js");
            return SUCCESS_STATUS.SUCCESS;
        }
    } catch (error) {
        log("error", "service", "forgetPasswordService", error.message, "authService.js");
        return ERROR_STATUS.ERROR;
    }
}

export async function logoutService() {
    try {
        await addDataToLocalStorage('token', "");
        await addDataToLocalStorage('@visited', "");
        await addDataToLocalStorage('customerId', "");
        await addDataToLocalStorage('loginStatus', "false");
        await addDataToLocalStorage('expoPushToken', "");
        await addDataToLocalStorage('basket', "");

        log("success", "service", "logoutService", "Logout Success", "authService.js");
        return SUCCESS_STATUS.SUCCESS;
    } catch (error) {
        log("error", "service", "logoutService", error.message, "authService.js");
        return ERROR_STATUS.ERROR;
    }
}

export async function validateTokenService() {
    try {
        const result = await validateTokenController();
        if (result === "error") {
            return false;
        } else {
            return result.data.state !== false;
        }
    } catch (error) {
        log("error", "service", "checkTokenService", error.message, "authService.js");
        return ERROR_STATUS.ERROR;
    }
}
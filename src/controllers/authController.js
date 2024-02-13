import {ERROR_STATUS} from "../errorLogs/errorStatus";
import {log} from "../helpers/logs/log";
import {getDataFromLocalStorage} from "../helpers/storage/asyncStorage";
import {auth2API, lunchBucketAPI, projectCode} from "../apis/lunchBucketAPI";

export async function loginController(email, password) {
    try {

        if (!email || !password) return "Login Failed";

        let expoPushToken = await getDataFromLocalStorage('expoPushToken');
        if (!expoPushToken) expoPushToken = "";

        console.log("expoPushToken", expoPushToken);

        const response = await auth2API.post(
            'userLogin',
            {
                email: email,
                password: password,
                project_code: projectCode,
                device_token: expoPushToken ? expoPushToken : "",
            }
        );

        if (response.status === 200) {
            return response.data;
        }

    } catch (error) {
        log("error", "controller", "loginController", error.message, "authController.js");
        return ERROR_STATUS.ERROR;
    }
}

export async function registerController(email, password, contactNo, expoPushToken) {
    try {
        const response = await lunchBucketAPI.post(
            'addCustomer',
            {
                email: email,
                password: password,
                contact_no: contactNo,
                device_token: expoPushToken ? expoPushToken : "",
            }
        );

        if (response.status === 200) {
            return response.data;
        }

    } catch (error) {
        log("error", "controller", "signUpController", error.message, "authController.js");
        return ERROR_STATUS.ERROR;
    }
}

export async function validateTokenController() {
    try {
        const token = await getDataFromLocalStorage('token');
        if (!token) {
            return ERROR_STATUS.ERROR;
        }

        const response = await lunchBucketAPI.get(
            'lunch/getMenus',
            {
                headers: {
                    'token': token,
                }
            });

        if (response.status === 200) return response.data;

    } catch (error) {
        log("error", "controller", "validateTokenController", error.message, "authController.js");
        return ERROR_STATUS.ERROR;
    }
}

export async function validatePushNotificationTokenChange() {
    try {
        const token = await getDataFromLocalStorage('token');
        const expoPushToken = await getDataFromLocalStorage('expoPushToken');

        console.log("token", token);
        console.log("expoPushToken", expoPushToken);
        if (!token || !expoPushToken) {
            return ERROR_STATUS.ERROR;
        }

        const response = await auth2API.put('updateDeviceToken',
            {
                device_token: expoPushToken ? expoPushToken : "",
            },
            {
                headers: {
                    'project_code': projectCode,
                    'token': token,
                }
            }
        );

        console.log("response", response.data);

        if (response.status === 200) return response.data;

        return ERROR_STATUS.ERROR;

    } catch (error) {
        log("error", "controller", "validatePushNotificationTokenChange", error.message, "authController.js");
        return ERROR_STATUS.ERROR;
    }
}

export async function forgetPasswordController(email, password) {
    try {
        const response = await auth2API.post(
            'forgetPassword',
            {
                email: email,
                password: password,
                project_code: projectCode
            }
        );

        if (response.status === 200) {
            return response.data;
        }

    } catch (error) {
        log("error", "controller", "forgetPasswordController", error.message, "authController.js");
        return ERROR_STATUS.ERROR;
    }
}
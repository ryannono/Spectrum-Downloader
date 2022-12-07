"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCSVFile = exports.generateCSVString = exports.login = exports.closeBrowser = exports.getDate = void 0;
const assert_1 = __importDefault(require("assert"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const convert_array_to_csv_1 = require("convert-array-to-csv");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class PuppeteerObject {
    constructor() {
        this.response = null;
        this.browser = null;
        this.page = null;
    }
}
function getDate() {
    let dateString = new Date().toLocaleDateString('en-GB');
    dateString =
        dateString.substring(0, 2) +
            '_' +
            dateString.substring(3, 5) +
            '_' +
            dateString.substring(6);
    return dateString;
}
exports.getDate = getDate;
function getBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield puppeteer_1.default.launch();
    });
}
function closeBrowser(puppeteerObject) {
    var _a;
    (_a = puppeteerObject.browser) === null || _a === void 0 ? void 0 : _a.close;
}
exports.closeBrowser = closeBrowser;
function clickElement(page, selector) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.evaluate(passedSelector => {
            const element = document.querySelector(passedSelector);
            if (element) {
                element.click();
                return true;
            }
            else {
                return false;
            }
        }, selector);
    });
}
function selectElement(page, selector, optionIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.evaluate((passedSelector, passedOptionIndex) => {
            const element = document.querySelector(passedSelector);
            if (element) {
                element.selectedIndex = passedOptionIndex + 1;
                return true;
            }
            else {
                return false;
            }
        }, selector, optionIndex);
    });
}
function login(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginURL = 'https://sms-sgs.ic.gc.ca/login/auth';
        const loginSuccesURL = 'https://sms-sgs.ic.gc.ca/eic/site/sms-sgs-prod.nsf/eng/home';
        const userSelector = '#Username';
        const passSelector = '#Password';
        const loginBttnSelector = 'input[value="Login"]';
        const loginObject = new PuppeteerObject();
        loginObject.browser = (yield getBrowser());
        loginObject.page = (yield loginObject.browser.newPage());
        yield loginObject.page.goto(loginURL);
        (0, assert_1.default)(loginObject.page.url() === loginURL);
        yield loginObject.page.type(userSelector, username);
        yield loginObject.page.type(passSelector, password);
        const clickResponse = yield clickElement(loginObject.page, loginBttnSelector);
        if (clickResponse &&
            (yield loginObject.page.waitForNavigation()) &&
            loginObject.page.url() === loginSuccesURL) {
            loginObject.response = true;
        }
        else {
            loginObject.response = false;
        }
        return loginObject;
    });
}
exports.login = login;
function navToTablePage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.goto('https://sms-sgs.ic.gc.ca/product/listOwn/index?lang=en_CA');
        const selectAccSelector = '#changeClient';
        const submitBttnSelector = '#changeAccountButton';
        yield selectElement(page, selectAccSelector, 1);
        const clickResponse = yield clickElement(page, submitBttnSelector);
        if (clickResponse) {
            yield page.waitForNavigation();
            return true;
        }
        return false;
    });
}
function navToNextTablePage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const nextPageBttnSelector = "a[rel = 'next']";
        const clickResponse = yield clickElement(page, nextPageBttnSelector);
        if (clickResponse) {
            yield page.waitForNavigation();
            return true;
        }
        return false;
    });
}
function getTable(page) {
    return __awaiter(this, void 0, void 0, function* () {
        let table = {
            heading: [''],
            body: [['']],
            bodyLen: 0,
        };
        let successfullNavIndicator = true;
        while (successfullNavIndicator) {
            table = yield page.evaluate(table => {
                const rows = document.querySelectorAll('tr');
                if (!table.heading[0]) {
                    table.heading = Array.from(rows[0].cells, headingText => headingText.innerText);
                }
                const rowsLen = rows.length;
                for (let i = 1; i < rowsLen; i++) {
                    const currentRowCellArray = Array.from(rows[i].cells, el => el.innerText);
                    table.body[table.bodyLen] = currentRowCellArray;
                    table.bodyLen++;
                }
                return table;
            }, table);
            successfullNavIndicator = yield navToNextTablePage(page);
        }
        return table;
    });
}
function generateCSVString(puppeteerObject) {
    return __awaiter(this, void 0, void 0, function* () {
        yield navToTablePage(puppeteerObject.page);
        const table = yield getTable(puppeteerObject.page);
        const header = table.heading;
        const body = table.body;
        const csvString = (0, convert_array_to_csv_1.convertArrayToCSV)(body, {
            header,
            separator: ',',
        });
        return csvString;
    });
}
exports.generateCSVString = generateCSVString;
function generateCSVFile(puppeteerObject) {
    return __awaiter(this, void 0, void 0, function* () {
        const csvString = yield generateCSVString(puppeteerObject);
        const filePath = path_1.default.join('temp_exports', 'Active_Licences_Export_' + getDate() + '.csv');
        fs_1.default.writeFileSync(filePath, csvString);
        return filePath;
    });
}
exports.generateCSVFile = generateCSVFile;

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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const exportFunctions_1 = require("./exportFunctions");
const app = (0, express_1.default)();
const port = 3001;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Welcome to the server');
});
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username);
    console.log(password);
    const loginObject = yield (0, exportFunctions_1.login)(username, password);
    if (!loginObject.response) {
        res.send(401);
    }
    else {
        res.send(200);
        const csvFilePath = yield (0, exportFunctions_1.generateCSVFile)(loginObject);
        res.download(csvFilePath, err => {
            if (err)
                console.log(err);
            fs_1.default.unlinkSync(csvFilePath);
        });
        (0, exportFunctions_1.closeBrowser)(loginObject);
    }
}));
app.listen(port, () => {
    console.log('server is running on port 3001');
});

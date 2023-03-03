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
const pg_1 = require("pg");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SERVER_KEY = "key";
const pool = new pg_1.Pool({
    user: "postgres",
    password: "kye040109",
    database: "mydb",
    host: "localhost",
    port: 5432
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
function giveToken(timeStr, value) {
    var token = "";
    token = jsonwebtoken_1.default.sign({
        id: value,
    }, SERVER_KEY, {
        algorithm: "HS256",
        expiresIn: `${timeStr}`,
        issuer: "issuer",
    });
    return token;
}
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body) {
        const value = yield pool.query(`SELECT * FROM account WHERE id = '${req.body.id}' AND password = '${req.body.password}';`);
        if (value.rowCount) {
            return res.status(200).json({
                code: 200,
                refreshToken: giveToken("30m", req.body.id),
                accessToken: giveToken("1m", req.body.id)
            });
        }
        else {
            res.send("no account");
        }
    }
    else {
        res.send("err");
    }
}));
app.post("/register", (req, res) => {
    var { id, password } = req.body;
    pool.query(`INSERT INTO account VALUES('${id}', '${password}');`);
    res.send("added");
});
app.get("/page", (req, res) => {
    try {
        if (req.headers.authorization) {
            const decoded = jsonwebtoken_1.default.verify(req.headers.authorization, SERVER_KEY);
            res.send(`NICE TO SEE YOU, ${decoded.id}`);
        }
        else
            throw Error;
    }
    catch (err) {
        res.send("Login first!");
    }
});
app.get("/refresh", (req, res) => {
    console.log(req.headers.authorization);
    try {
        if (req.headers.authorization) {
            const decoded = jsonwebtoken_1.default.verify(req.headers.authorization, SERVER_KEY);
            res.status(200).json({
                code: 200,
                accessToken: giveToken("1m", decoded.id)
            });
        }
    }
    catch (err) {
        res.send("Login again...");
    }
});
app.get("/", (req, res) => {
    res.send("hi there!");
});
app.listen(3000, () => console.log('listen on 3000!!!'));

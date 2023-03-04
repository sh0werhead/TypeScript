import express from 'express';
import { Request, Response } from 'express';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const SERVER_KEY : string = "key";
const pool = new Pool({
    user : "postgres",
    password : "kye040109",
    database: "mydb",
    host: "localhost",
    port:5432
})

const app = express();

app.use(express.json());

function giveToken(timeStr : string, value : string){
    var token = "";
    token = jwt.sign(
        {
            id: value,
        },
        SERVER_KEY,
        {
            algorithm : "HS256",
            expiresIn: `${timeStr}`,
            issuer: "issuer",
        }
    );
    return token;
}

app.post("/login", async(req : Request, res : Response) => {
    if(req.body){
        const value = await pool.query(`SELECT * FROM account WHERE id = '${req.body.id}' AND password = '${req.body.password}';`);
        if(value.rowCount){
            return res.status(200).json({
                code: 200,
                refreshToken: giveToken("30m", req.body.id),
                accessToken: giveToken("1m", req.body.id)
            });
        }
        else{
            res.send("no account");
        }
    }
    else{
        res.send("err");
    }
});

app.post("/register", (req : Request, res : Response)=>{
    var {id, password} = req.body;
    pool.query(`INSERT INTO account VALUES('${id}', '${password}');`);
    res.send("added");
});

interface JwtPayload {
    id: string
}

app.get("/page", (req : Request, res : Response)=>{
    try{
        if(req.headers.authorization){
            const decoded = jwt.verify(req.headers.authorization, SERVER_KEY) as JwtPayload;
            res.send(`NICE TO SEE YOU, ${decoded.id}`);
        }
        else throw Error;
        
    }
    catch(err){
        res.send("Login first!");
    }
});

app.get("/refresh", (req : Request, res : Response)=>{
    console.log(req.headers.authorization);
    try{
        if(req.headers.authorization){
            const decoded = jwt.verify(req.headers.authorization, SERVER_KEY) as JwtPayload;
            res.status(200).json({
                code: 200,
                accessToken: giveToken("1m", decoded.id)
            })
        }
    }
    catch(err){
        res.send("Login again...");
    }
})


app.get("/", (req : Request, res : Response)=>{
    res.send("hi man!");
});

app.listen(3000, ()=> console.log('listen on 3000!!!'));

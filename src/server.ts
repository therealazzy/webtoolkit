import  express from "express";
import jwtRouter from "./routes/jwt.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

const PORT = 3000;

app.use(express.json());
app.use("/api/v1/jwt", jwtRouter);
app.use(errorHandler);



app.listen(PORT, () =>{
    console.log(`listening on port ${PORT}`)
});
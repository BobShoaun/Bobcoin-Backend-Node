import http from "http";
import Express from "express";
import cors from "cors";

import { port } from "./config.js";
import { socket } from "./socket.js";
import { mongodb } from "./mongodb.js";
import { network } from "./config.js";
import { blocksRouter } from "./routes/block.route.js";
import { blockchainRouter } from "./routes/blockchain.route.js";
import { transactionRouter } from "./routes/transaction.route.js";
import { consensusRouter } from "./routes/consensus.route.js";
import { addressRouter } from "./routes/address.route.js";
import { mineRouter } from "./routes/mine.route.js";
import { utxoRouter } from "./routes/utxo.route.js";

import params from "./params.js";

import { resetMigration, phase1, phase2 } from "./controllers/migrate.controller.js";
import {
	setupUnconfirmedBlocks,
	saveUnconfirmedBlocks,
} from "./controllers/blockchain.controller.js";

const app = Express();
const server = http.createServer(app);

app.get("/", (req, res) => {
	const message = `<h2>Bobcoin node: running on ${network}</h2>
  <h4>Time since last start: ${new Date().toLocaleString()}</h4>`;
	res.send(message);
});

app.locals.headBlock = null;
app.locals.unconfirmedBlocks = []; // sorted by descending height
app.locals.mempool = []; // mempool as of headblock, recalc with reorg
app.locals.utxos = []; // utxos as of headblock, recalc with reorg
app.locals.difficulty = params.initBlkDiff;

server.listen(port, () => {
	console.log("Server listening on port: ", port);
	// resetMigration();
	// phase1();
	// phase2();
	setupUnconfirmedBlocks(app.locals);
});

// const exit = () => {
// 	console.log("shutting down server");
// 	// await dumpUnconfirmed();
// };

// process.on("exit", exit.bind(null));
// process.on("SIGINT", exit.bind(null));
// process.on("SIGUSR1", exit.bind(null));
// process.on("SIGUSR2", exit.bind(null));
// process.on("uncaughtException", exit.bind(null));

mongodb();
const io = socket(server);

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cors());

app.use("/block", blocksRouter(io));
app.use("/blockchain", blockchainRouter(io));
app.use("/transaction", transactionRouter(io));
app.use("/consensus", consensusRouter());
app.use("/address", addressRouter());
app.use("/mine", mineRouter());
app.use("/utxo", utxoRouter());

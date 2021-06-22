import Express from "express";
import {
	getTransactions,
	addTransaction,
	getMempool,
} from "../controllers/transaction.controller.js";

export const transactionsRouter = io => {
	const router = Express.Router();

	function error(res, e) {
		res.status(400).json(`${e}`);
		// console.error(e);
	}

	router.get("/", async (req, res) => {
		try {
			res.send(await getTransactions());
		} catch (e) {
			error(res, e);
		}
	});

	router.get("/mempool", async (req, res) => {
		try {
			res.send(await getMempool(req.query.block));
		} catch (e) {
			error(res, e);
		}
	});

	router.post("/", async (req, res) => {
		try {
			const transaction = req.body;
			await addTransaction(transaction);
			io.sockets.emit("transaction", transaction);
			res.send("transaction added and broadcasted!");
		} catch (e) {
			error(res, e);
		}
	});

	return router;
};

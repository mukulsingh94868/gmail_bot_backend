import express from "express";
import { createMailSend, getMailList } from "../controller/ContactController.js";

const router = express.Router();

router.post("/mail-send", createMailSend);
router.get("/get-mail-list", getMailList);

export default router;

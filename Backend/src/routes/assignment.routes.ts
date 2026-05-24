import { Router } from "express";
import multer from "multer";
import {
  listAssignments,
  getAssignment,
  createAssignment,
  deleteAssignment,
  regenerateAssignment,
  downloadPdf,
  uploadFile,
} from "../controllers/assignment.controller.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/", listAssignments);
router.get("/:id", getAssignment);
router.post("/", createAssignment);
router.delete("/:id", deleteAssignment);
router.post("/:id/regenerate", regenerateAssignment);
router.get("/:id/pdf", downloadPdf);
router.post("/upload", upload.single("file"), uploadFile);

export default router;

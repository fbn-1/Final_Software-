import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

// Routes
import uploadRoutes from "./routes/upload.js";
import transcriptRoutes from "./routes/transcripts.js";
import annotationsRouter from "./routes/annotations.js";
import bloombergRouter from "./routes/bloombergroute.js";
import pool from "./database/db.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// FFmpeg setup
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
console.log("✅ FFmpeg path set to:", ffmpegInstaller.path);

// Routes

app.use("/upload", uploadRoutes);
app.use("/transcripts", transcriptRoutes);
app.use("/annotations", annotationsRouter);
app.use("/bloombergdata", bloombergRouter);



// Ensure database columns/types we expect (convenience for development)
async function ensureSchema() {
	try {
		// Add consultant_name if missing
		await pool.query("ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS consultant_name TEXT");
		// Add consultant_rating as NUMERIC if missing
		await pool.query("ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS consultant_rating NUMERIC");
		// If consultant_rating exists but is integer, convert to NUMERIC (USING cast)
		try {
			await pool.query("ALTER TABLE transcripts ALTER COLUMN consultant_rating TYPE NUMERIC USING (consultant_rating::numeric)");
		} catch (e) {
			// ignore if alter not applicable
		}
		console.log("✅ Ensured transcripts columns consultant_name and consultant_rating (NUMERIC)");
	} catch (err) {
		console.error("⚠️ Failed to ensure schema columns:", err.message);
	}
}

ensureSchema().then(() => {
	app.listen(5000, () => {console.log("🚀 Server started on port 5000");});
}).catch((err) => {
	console.error("Failed to start server due to schema setup error:", err);
	app.listen(5000, () => {console.log("🚀 Server started on port 5000 (schema setup failed)");});
});



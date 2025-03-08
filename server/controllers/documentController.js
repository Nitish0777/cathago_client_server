import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../config/database.js";
import { extractTextFromFile } from "../helpers/documentHelpers.js";
import natural from "natural";

// Set up multer for file uploads (same as before)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath); // Destination folder for file uploads
  },
  filename: (req, file, cb) => {
    console.log(`Uploaded file: ${req.file}`);
    const filePath = Date.now() + path.extname(file.originalname);
    cb(null, filePath);
    console.log(`Uploaded file path: ${path.join("uploads", filePath)}`); // Unique filename
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/plain") {
    cb(null, true); // Accept .txt files
  } else {
    cb(new Error("Only .txt files are allowed!"), false); // Reject non-txt files
  }
};

const upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size: 10MB
});

export const uploadDocument = upload.single("document");

// Function to calculate similarity using Levenshtein Distance
const calculateSimilarity = (text1, text2) => {
  const distance = natural.LevenshteinDistance(text1, text2);
  const maxLength = Math.max(text1.length, text2.length);
  return 1 - distance / maxLength; // Similarity percentage
};

// Document scan and matching logic
// Document scan and matching logic
export const scanDocument = (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No document uploaded" });
  }

  // Check if user has enough credits
  const query = "SELECT credits FROM users WHERE id = ?";
  db.get(query, [userId], (err, user) => {
    if (err) {
      console.error("Error checking credits:", err);
      return res
        .status(500)
        .json({ message: "Error checking credits", error: err });
    }

    if (user.credits <= 0) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // Deduct 1 credit
    const deductCreditsQuery =
      "UPDATE users SET credits = credits - 1 WHERE id = ?";
    db.run(deductCreditsQuery, [userId], (err) => {
      if (err) {
        console.error("Error deducting credits:", err);
        return res
          .status(500)
          .json({ message: "Error deducting credits", error: err });
      }

      // Extract text from the uploaded document
      const filepath = file.path;
      extractTextFromFile(filepath)
        .then((content) => {
          // Save the document to the database
          const insertQuery =
            "INSERT INTO documents (user_id, filename, filepath, content) VALUES (?, ?, ?, ?)";
          db.run(
            insertQuery,
            [userId, file.originalname, filepath, content],
            function (err) {
              if (err) {
                console.error("Error uploading document:", err);
                return res
                  .status(500)
                  .json({ message: "Error uploading document", error: err });
              }

              // Log the scan activity in the scan_history table
              const insertScanHistoryQuery =
                "INSERT INTO scan_history (user_id, document_id, matched_docs) VALUES (?, ?, ?)";
              db.run(
                insertScanHistoryQuery,
                [userId, this.lastID, ""],
                (err) => {
                  if (err) {
                    console.error("Error logging scan history:", err);
                    return res
                      .status(500)
                      .json({
                        message: "Error logging scan history",
                        error: err,
                      });
                  }

                  return res
                    .status(200)
                    .json({
                      message: "Document uploaded and scanned successfully",
                    });
                }
              );
            }
          );
        })
        .catch((err) => {
          console.error("Error extracting text:", err);
          res
            .status(500)
            .json({
              message: "Error extracting text from document",
              error: err,
            });
        });
    });
  });
};

// Get matching documents based on similarity
export const getMatchingDocuments = (req, res) => {
  const docId = req.params.docId;
  const userId = req.user.id;

  // Check if user has enough credits
  const query = "SELECT credits FROM users WHERE id = ?";
  db.get(query, [userId], (err, user) => {
    if (err) {
      console.error("Error checking credits:", err);
      return res
        .status(500)
        .json({ message: "Error checking credits", error: err });
    }

    if (user.credits <= 0) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // Deduct 1 credit
    const deductCreditsQuery =
      "UPDATE users SET credits = credits - 1 WHERE id = ?";
    db.run(deductCreditsQuery, [userId], (err) => {
      if (err) {
        console.error("Error deducting credits:", err);
        return res
          .status(500)
          .json({ message: "Error deducting credits", error: err });
      }

      // Fetch the document to be compared (target document)
      const getDocumentQuery = "SELECT * FROM documents WHERE id = ?";
      db.get(getDocumentQuery, [docId], (err, targetDocument) => {
        if (err || !targetDocument) {
          return res
            .status(400)
            .json({
              message: "Target document not found",
              similarDocuments: [],
            });
        }

        const targetContent = targetDocument.content;

        // Fetch all documents from the database
        const getAllDocsQuery =
          "SELECT id, filename, filepath, content FROM documents";
        db.all(getAllDocsQuery, [], (err, documents) => {
          if (err) {
            return res
              .status(500)
              .json({
                message: "Error fetching documents from database",
                error: err,
              });
          }

          // Compare each document with the target document and calculate the similarity
          const similarDocuments = documents
            .filter((doc) => doc.id !== docId) // Exclude the target document itself
            .map((doc) => {
              const similarity = calculateSimilarity(
                targetContent,
                doc.content
              );
              if (similarity >= 0.5) {
                const formattedFilePath = `/${doc.filepath.replace(
                  /\\/g,
                  "/"
                )}`; // Only include documents with at least 50% similarity
                return {
                  docId: doc.id,
                  filename: doc.filename,
                  similarity,
                  filePath: formattedFilePath, // Provide the path to the file in the response
                };
              }
            })
            .filter((doc) => doc !== undefined); // Remove undefined values (documents with similarity < 0.5)

          // If no similar documents are found
          if (similarDocuments.length === 0) {
            return res
              .status(200)
              .json({ message: "No similar documents found" });
          }

          // Log the scan activity in the scan_history table for each comparison
          const matchedDocs = similarDocuments
            .map((doc) => doc.filename)
            .join(", ");
          const insertScanHistoryQuery =
            "INSERT INTO scan_history (user_id, document_id, matched_docs) VALUES (?, ?, ?)";
          db.run(
            insertScanHistoryQuery,
            [req.user.id, docId, matchedDocs],
            (err) => {
              if (err) {
                console.error("Error logging scan history:", err);
              }

              // Update admin analytics (total scans)
              const updateAnalyticsQuery =
                "UPDATE admin_analytics SET total_scans = total_scans + 1 WHERE id = 1";
              db.run(updateAnalyticsQuery, (err) => {
                if (err) {
                  console.error("Error updating admin analytics:", err);
                }
              });

              // Return the list of similar documents
              return res.status(200).json({ similarDocuments });
            }
          );
        });
      });
    });
  });
};

// Function to get all documents uploaded by a particular user
export const getUserDocuments = (req, res) => {
  const userId = req.user.id;
  const query = "SELECT * FROM documents WHERE user_id = ?";
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching user documents:", err);
      return res
        .status(500)
        .json({ message: "Error fetching user documents", error: err });
    }
    return res.status(200).json({ documents: rows });
  });
};

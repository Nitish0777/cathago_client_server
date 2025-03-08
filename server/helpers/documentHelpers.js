import fs from 'fs';

// Function to extract text content from a .txt file
export const extractTextFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);  // Return the content of the file
      }
    });
  });
};

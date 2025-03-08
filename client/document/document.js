// Authentication check
function checkAuth() {
  console.log("Checking authentication...");
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found, redirecting to login...");
    window.location.href = "../login/login.html";
    return false;
  }
  console.log("Token found", token);
  return token;
}

// Status display functions
function showUploadStatus(message, isError) {
  console.log("Showing upload status:", message);
  const statusElement = document.getElementById("uploadStatus");
  statusElement.textContent = message;
  statusElement.className = isError
    ? "status-message error"
    : "status-message success";
  if (!isError) setTimeout(() => (statusElement.textContent = ""), 3000);
}

// Date formatting
function formatDate(dateString) {
  console.log("Formatting date:", dateString);
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Unknown date";
  }
}

// Document loading
async function loadDocuments() {
  console.log("Loading documents...");
  const token = checkAuth();
  if (!token) return;

  const documentList = document.querySelector(".document-list");

  // Show loading animation
  documentList.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <p>Loading documents...</p>
          </div>
        `;

  try {
    const response = await fetch("http://localhost:3000/document/documents", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    console.log("Documents fetch response:", response);
    if (!response.ok) {
      if (response.status === 401) {
        console.log("Unauthorized, redirecting to login...");
        localStorage.removeItem("token");
        window.location.href = "../login/login.html";
        return;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Documents data received:", data);

    if (data.documents?.length) {
      documentList.innerHTML = data.documents
        .map(
          (doc) => `
              <div class="document-card">
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  ${doc.filename || "Unnamed Document"}
                </h3>
                <p><strong>Created At:</strong> ${formatDate(
                  doc.created_at
                )}</p>
                ${
                  doc.content
                    ? `<p><strong>Content:</strong> <pre>${doc.content}</pre></p>`
                    : ""
                }
                <div class="actions">
                  <a href="http://localhost:3000/${
                    doc.filepath?.startsWith("/")
                      ? doc.filepath.slice(1)
                      : doc.filepath
                  }" 
                     class="button" 
                     download="${doc.filename || "document"}">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                       <polyline points="7 10 12 15 17 10"></polyline>
                       <line x1="12" y1="15" x2="12" y2="3"></line>
                     </svg>
                     Download
                  </a>
                  <button type="button" class="button view-matches" data-doc-id="${
                    doc.id
                  }">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    View Matches
                  </button>
                </div>
              </div>
            `
        )
        .join("");
    } else {
      documentList.innerHTML = `
              <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <p>No documents found. Upload your first document above.</p>
              </div>
            `;
    }

    // Add event listeners to all "View Matching Documents" buttons
    document.querySelectorAll(".view-matches").forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.preventDefault(); // Prevent default behavior
        const docId = button.getAttribute("data-doc-id");
        console.log("Fetching matches for document ID:", docId);
        await viewMatches(docId); // Fetch and redirect
      });
    });
  } catch (error) {
    console.error("Error loading documents:", error);
    documentList.innerHTML = `
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>Error loading documents. Please try again.</p>
            </div>
          `;
  }
}

// Upload handling
async function setupUploadForm() {
  console.log("Setting up upload form...");
  const token = checkAuth();
  if (!token) return;

  // Show file name when selected
  document
    .getElementById("documentFile")
    .addEventListener("change", function () {
      const fileName = this.files[0] ? this.files[0].name : "";
      document.getElementById("fileName").textContent = fileName;
    });

  document
    .getElementById("uploadForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Uploading document...");
      const formData = new FormData();
      formData.append(
        "filename",
        document.getElementById("documentName").value
      );
      formData.append(
        "document",
        document.getElementById("documentFile").files[0]
      );

      showUploadStatus("Uploading...", false);

      try {
        const response = await fetch("http://localhost:3000/document/upload", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        });

        console.log("Upload response:", response);
        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        console.log("Upload success data:", data);
        showUploadStatus("File uploaded successfully!", false);
        document.getElementById("uploadForm").reset();
        document.getElementById("fileName").textContent = "";
        await loadDocuments(); // Reload documents after upload
      } catch (error) {
        console.error("Upload error:", error);
        showUploadStatus(`Upload failed: ${error.message}`, true);
      }
    });
}

// Fetch and redirect to a new page with matching documents
async function viewMatches(docId) {
  console.log("Viewing matches for document ID:", docId);
  const token = checkAuth();
  if (!token) {
    console.log("No token found, redirecting to login...");
    return;
  }

  const url = `http://localhost:3000/document/matches/${docId}`;
  console.log("Fetching matches from:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    });

    console.log("Matches fetch response status:", response.status);
    if (!response.ok) {
      if (response.status === 401) {
        console.log("Unauthorized, redirecting to login...");
        localStorage.removeItem("token");
        window.location.href = "../login/login.html";
        return;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Matches data received:", data);

    // Store the fetched data in localStorage
    localStorage.setItem("matchingDocuments", JSON.stringify(data));

    // Redirect to the new page
    window.location.href = "matches.html";
  } catch (error) {
    console.error("Error loading matches:", error);
    alert(`Error loading matches: ${error.message}`);
  }
}

// Modal operations
function openModal() {
  document.getElementById("matchesModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("matchesModal").style.display = "none";
}

// Close modal if user clicks outside the modal content
window.onclick = function (event) {
  const modal = document.getElementById("matchesModal");
  if (event.target === modal) {
    closeModal();
  }
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing page...");
  const token = checkAuth();
  if (token) {
    setupUploadForm();
    loadDocuments();
  }
});

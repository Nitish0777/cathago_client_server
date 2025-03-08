document.getElementById("logout-button").addEventListener("click", () => {
  localStorage.removeItem("username");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "../login/login.html";
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../login/login.html";
    return;
  }
  const role = localStorage.getItem("role");
  if (role !== "user") {
    window.location.href = "../adminDashboard/dashboard.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    document.getElementById("username").textContent = data.username;
    document.getElementById("remaining-credits").textContent =
      data.remainingCredits;
    document.getElementById("total-credits").textContent = data.totalCredits;
    document.getElementById("total-files").textContent = data.documents.length;

    const documentList = document.getElementById("document-list");
    documentList.innerHTML = "";
    data.documents.forEach((doc) => {
      const card = document.createElement("div");
      card.className = "document-card";
      card.innerHTML = `
        <h3>${doc.filename}</h3>
        <p>File ID: ${doc.id}</p>
        <a href="${doc.filepath}" download>Download</a>
      `;
      card.addEventListener("click", async () => {
        const fileResponse = await fetch(
          `http://localhost:3000/${doc.filepath}`
        );
        const fileContent = await fileResponse.text();
        document.getElementById("file-content").textContent = fileContent;
        document.getElementById("preview-modal").style.display = "block";
      });
      documentList.appendChild(card);
    });

    // Populate Credit Request History
    const creditHistoryDiv = document.getElementById("credit-history");
    creditHistoryDiv.innerHTML = "<h2>Credit Request History</h2>";
    data.creditRequests.forEach((req) => {
      const reqDiv = document.createElement("div");
      reqDiv.className = "credit-request card";
      reqDiv.innerHTML = `
        <p><strong>ID:</strong> ${req.id}</p>
        <p><strong>Requested Credits:</strong> ${req.credits_requested}</p>
        <p><strong>Status:</strong> ${req.status}</p>
        <p><strong>Timestamp:</strong> ${req.timestamp}</p>
      `;
      creditHistoryDiv.appendChild(reqDiv);
    });

    // Show Latest Credit Request
    if (data.latestCreditRequest) {
      const latestReqDiv = document.getElementById("latest-credit-request");
      latestReqDiv.innerHTML = `
        <h2>Latest Credit Request</h2>
        <div class="card">
          <p><strong>ID:</strong> ${data.latestCreditRequest.id}</p>
          <p><strong>Requested Credits:</strong> ${data.latestCreditRequest.credits_requested}</p>
          <p><strong>Status:</strong> ${data.latestCreditRequest.status}</p>
          <p><strong>Timestamp:</strong> ${data.latestCreditRequest.timestamp}</p>
        </div>
      `;
    } else {
      document.getElementById("latest-credit-request").style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching profile data:", error);
  }

  // Handle Credit Request Submission
  document
    .getElementById("request-credits-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent form from reloading

      const requestedCredits =
        document.getElementById("credits-requested").value;
      if (!requestedCredits || requestedCredits <= 0) {
        document.getElementById("request-message").innerHTML =
          "<p style='color: red;'>Enter a valid number of credits.</p>";
        return;
      }

      try {
        const creditResponse = await fetch(
          "http://localhost:3000/auth/credits/request",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ creditsRequested: requestedCredits }),
          }
        );

        const creditData = await creditResponse.json();
        if (creditResponse.ok) {
          document.getElementById("request-message").innerHTML =
            "<p style='color: green;'>Credit request submitted successfully!</p>";
        } else {
          document.getElementById(
            "request-message"
          ).innerHTML = `<p style='color: red;'>Error: ${creditData.message}</p>`;
        }
      } catch (error) {
        console.error("Error requesting credits:", error);
        document.getElementById("request-message").innerHTML =
          "<p style='color: red;'>Failed to request credits. Try again later.</p>";
      }
    });
});

// Close Modal
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("preview-modal").style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("preview-modal")) {
    document.getElementById("preview-modal").style.display = "none";
  }
});

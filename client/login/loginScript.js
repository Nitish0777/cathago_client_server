document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Validate input
    if (!username || !password) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    // Create login object
    const loginData = {
      username,
      password,
    };

    try {
      // Make API call
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        localStorage.setItem("token", data.token);

        showMessage(`User ${username} logged in successfully!`, "success");
        this.reset();
        setTimeout(() => {
          window.location.href = "../dashboard/dashboard.html";
        }, 3000);
      } else {
        showMessage(`Error: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Error logging in user:", error);
      showMessage("An error occurred. Please try again.", "error");
    }
  });

function showMessage(text, type) {
  let messageDiv = document.getElementById("message");
  if (!messageDiv) {
    messageDiv = document.createElement("div");
    messageDiv.id = "message";
    document.body.appendChild(messageDiv);
  }
  messageDiv.textContent = text;
  messageDiv.className = type;

  // Clear message after 3 seconds
  setTimeout(() => {
    messageDiv.textContent = "";
    messageDiv.className = "";
  }, 3000);
}

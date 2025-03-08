document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate input
    if (!username || !role || !password || !confirmPassword) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    const user = {
      username,
      password,
      role,
    };

    try {
      const response = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        showMessage(
          `User ${username} registered successfully as ${role}!`,
          "success"
        );
        this.reset();
        setTimeout(() => {
          window.location.href = "../login/login.html";
        }, 3000);
      } else {
        showMessage(`Error: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Error registering user:", error);
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

  setTimeout(() => {
    messageDiv.textContent = "";
    messageDiv.className = "";
  }, 3000);
}

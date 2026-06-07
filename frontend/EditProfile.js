const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

if (!userId) window.location.href = "Login.html";

// Eye icon SVGs
const eyeOpen = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
</svg>`;

const eyeClosed = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
</svg>`;

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    btn.innerHTML = isHidden ? eyeOpen : eyeClosed;
}

const form = document.getElementById("edit-profile-form");

function clearErrors() {
    ["error-username", "error-email", "error-current-password",
     "error-new-password", "error-confirm-password", "error-general", "success-msg"]
        .forEach(id => document.getElementById(id).textContent = "");
}

function validate() {
    let valid = true;
    clearErrors();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!username && !email && !newPassword) {
        document.getElementById("error-general").textContent = "Please fill in at least one field to update.";
        return false;
    }

    if (email && !(email.includes("@") && email.includes("."))) {
        document.getElementById("error-email").textContent = "Enter a valid email address.";
        valid = false;
    }

    if (newPassword) {
        if (!currentPassword) {
            document.getElementById("error-current-password").textContent = "Current password is required.";
            valid = false;
        }
        if (newPassword.length < 8) {
            document.getElementById("error-new-password").textContent = "Password must be at least 8 characters.";
            valid = false;
        }
        if (newPassword !== confirmPassword) {
            document.getElementById("error-confirm-password").textContent = "Passwords do not match.";
            valid = false;
        }
    }

    return valid;
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!validate()) return;

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;

    const dto = {};
    if (username) dto.username = username;
    if (email) dto.email = email;
    if (newPassword) dto.password = newPassword;

    const btn = document.getElementById("btn-save");
    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
        const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ dto, currentPassword: currentPassword || undefined }),
        });

        const data = await res.json();

        if (!res.ok) {
            document.getElementById("error-general").textContent = data.message || "Update failed.";
            btn.disabled = false;
            btn.textContent = "Save Changes";
            return;
        }

        document.getElementById("success-msg").textContent = "Profile updated successfully!";
        if (data.username) localStorage.setItem("username", data.username);
        form.reset();
        btn.disabled = false;
        btn.textContent = "Save Changes";

    } catch (err) {
        document.getElementById("error-general").textContent = "Server error. Please try again.";
        btn.disabled = false;
        btn.textContent = "Save Changes";
    }
});
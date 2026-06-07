const form = document.getElementById("loginform");
const btnLogin = document.getElementById("btn-login");
const errorEmail = document.getElementById("error-email");
const errorPassword = document.getElementById("error-password");
const errorGeneral = document.getElementById("error-general");


function validateForm() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    let validEmail = false;
    let validPass = false;

    if (email === "") {
        errorEmail.textContent = "Email is required";
    } else if (!(email.includes("@") && email.includes("."))) {
        errorEmail.textContent = "Enter a valid email";
    } else {
        errorEmail.textContent = "";
        validEmail = true;
    }

    if (password === "") {
        errorPassword.textContent = "Password is required";
    } else {
        errorPassword.textContent = "";
        validPass = true;
    }

    return validEmail && validPass;
}

form.addEventListener("input", validateForm);

btnLogin.addEventListener("click", async function(e) {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    const body = {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
    };

    try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.ok) {
            // Save token + user info to localStorage
            localStorage.setItem("token", data.access_token); // ← save the JWT
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role);
            
            if (data.role === "admin") {
                window.location.href = "Admin.html";
            } else {
                window.location.href = "homepage.html";
            }

        } else {
            errorGeneral.textContent = data.message || "Login failed. Check your email or password.";
        }
    } catch (err) {
        errorGeneral.textContent = "Server error. Please try again.";
    }
    
});
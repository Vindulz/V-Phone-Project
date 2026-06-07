const form = document.getElementById("registform");
const btnSubmit = document.getElementById("btn-submit");

const errorUsername = document.getElementById("error-username");
const errorEmail = document.getElementById("error-email");
const errorPassword = document.getElementById("error-password");
const errorConfirmPassword = document.getElementById("error-confirm-password");
const errorAgree = document.getElementById("error-agree");
const errorGender = document.getElementById("error-gender");

function validateForm() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const agree = document.getElementById("agree").checked;
    const gender = document.getElementById("gender").value;

    let validEmail = false;
    let validPass = false;
    let validUser = false;
    let validConfirm = false;
    let validAgree = false;
    let validGender = false;

    if (username === "") {
        errorUsername.textContent = "Username is required";
    } else {
        errorUsername.textContent = "";
        validUser = true;
    }

    if (gender === "") {
        errorGender.textContent = "Gender must not be empty";
    } else {
        errorGender.textContent = "";
        validGender = true;
    }

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
    } else if (password.length < 8) {
        errorPassword.textContent = "Password must be at least 8 characters long";
    } else if (!/[a-z]/.test(password)) {
        errorPassword.textContent = "Password must include at least one lowercase letter";
    } else if (!/[A-Z]/.test(password)) {
        errorPassword.textContent = "Password must include at least one uppercase letter";
    } else if (!/[0-9]/.test(password)) {
        errorPassword.textContent = "Password must include at least one number";
    } else {
        errorPassword.textContent = "";
        validPass = true;
    }

    if (confirmPassword === "") {
        errorConfirmPassword.textContent = "Please confirm your password";
    } else if (confirmPassword !== password) {
        errorConfirmPassword.textContent = "Passwords do not match";
    } else {
        errorConfirmPassword.textContent = "";
        validConfirm = true;
    }

    if (!agree) {
        errorAgree.textContent = "You must agree to the Terms and Conditions";
    } else {
        errorAgree.textContent = "";
        validAgree = true;
    }

    return validAgree && validConfirm && validEmail && validPass && validUser && validGender;
}

// validate while typing
form.addEventListener("input", validateForm);

// on submit button click
btnSubmit.addEventListener("click", async function(e) {
    e.preventDefault();

    const isValid = validateForm(); // always run validation on click
    if (!isValid) return;

    const body = {
        username: document.getElementById("username").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        gender: document.getElementById("gender").value,
    };

    try {
        const res = await fetch("http://localhost:3000/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.ok) {
            window.location.href = "homepage.html";
        } else {
            alert(data.message || "Registration failed");
        }
    } catch (err) {
        alert("Server error. Please try again.");
    }
});
// const showLogin = document.getElementById("showHideLoginRegister");
// showLogin.classList.remove("visible");
// showLogin.classList.add("hidden");

// LOGIN =========================================================================

let currentUser = "";


async function login(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("/userLogin", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password}),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("loginMsg");

    if (responseData.success) {
        localStorage.setItem("currentUser", username);

        document.getElementById("loginForm").reset();
        location.href =  window.location.href + "dashboard.html";
    } else {
        alert("Login failed! Did you mean to register instead?");
        messageElement.textContent = "Failed to login!";
    }
    document.getElementById("loginForm").reset();
}

// REGISTER =========================================================================
async function register(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const profileicon = document.getElementById("profileicon").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/registerUser", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, profileicon, password}),
    });

    const responseData = await response.json();
    if (responseData.success) {
        console.log(responseData);
        alert("Successfully registered!");
            /*
            let maxpcid = await fetch("/getmaxpostcollectionid", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const maxPostObject = await maxpcid.json();
            let mpcid = Object.values(maxPostObject)
            const pcidValue = Number(mpcid[0]) + 1;

            console.log(pcidValue);

            const pcResponse = await fetch("/insert-postcollection", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pcid: pcidValue,
                    username: username,
                    title: "My Posts",
                }),
            });

            const pcResponseData = await pcResponse.json();

            if (pcResponseData.success) {
                console.log("My Posts created successfully!");
            } else {
                console.log("My Posts creation failed!");
            }
            */
    } else {
        alert("Registration failed. Did you mean to login?");
    }

    document.getElementById("registerForm").reset();
}

async function resetTables() {
    const response = await fetch("/initiate-tables", {
        method: "POST",
    });

    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById("resetResultMsg");
        messageElement.textContent = "Tables initiated successfully!";
        document.body.style.backgroundColor = "#ffffff";
        document.body.style.color = "#000000";

        // showLogin.classList.remove("hidden");
        // showLogin.classList.add("visible");
    } else {
        alert("Error initiating table!");
    }
}

// ---------------------------------------------------------------
window.onload = function () {
    document.getElementById("resetTables").addEventListener("click", resetTables);
    document.getElementById("loginForm").addEventListener("submit", login);
    document.getElementById("registerForm").addEventListener("submit", register);
};
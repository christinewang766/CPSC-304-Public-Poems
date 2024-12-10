
async function displayDashboardstyle() {
    const username = currentUser;
    const response = await fetch("/current-dashboardstyle", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username}),
    });

    const responseData = await response.json();
    const dashboardstyle = responseData.data;

    if (dashboardstyle && dashboardstyle.length > 0) {
        const [bgColor, textColor] = dashboardstyle[0];
        document.body.style.backgroundColor = bgColor || "#ffffff";
        document.body.style.color = textColor || "#000000";
    } else {
        console.error("No valid dashboard style data received.");
    }
}

async function fetchAndDisplayContactInformation() {
    const tableElement = document.getElementById("contactinformation");
    const tableBody = tableElement.querySelector("tbody");
    const username = searchedUser;

    const response = await fetch("/contactinformation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username}),
    });


    const responseData = await response.json();
    const contactinformation = responseData.data;

    tableBody.innerHTML = "";

    contactinformation.forEach((contact) => {
        const row = tableBody.insertRow();
        contact.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchAndDisplayPostCollections() {
    const tableElement = document.getElementById("postcollection");
    const tableBody = tableElement.querySelector("tbody");
    const username = searchedUser;

    const response = await fetch("/postcollection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username}),
    });

    const responseData = await response.json();
    const postcollectionData = responseData.data;
    for (const pc of postcollectionData) {
        pc.push("view");
    }

    tableBody.innerHTML = "";

    postcollectionData.forEach((community) => {
        const row = tableBody.insertRow();
        let pcid = "";
        community.forEach((field, index) => {
            const cell = row.insertCell(index);
            if (index === 0) {
                pcid = field;
            }
            if (index === 1) {
                cell.textContent = field;
            }
            if (index === 2) {
                cell.innerHTML = `<button onclick="viewPostCollection('${pcid}')">${field}</button>`;
            }
        });
    });
}

async function viewPostCollection(pcid) {

    console.log(pcid);

    const tableElement = document.getElementById("selectedpostcollection");
    const tableBody = tableElement.querySelector("tbody");

    try {
        const response = await fetch(`/postcollection/posts/${pcid}`, {
            method: "GET",
        });

        const responseData = await response.json();
        const posts = responseData.data;

        const messageElement = document.getElementById("postcollectionMsg");
        if (posts.length > 0) {
            messageElement.textContent = "";
        } else {
            messageElement.textContent = "No posts in this collection yet!";
        }

        tableBody.innerHTML = "";

        posts.forEach((post) => {
            const row = tableBody.insertRow();
            post.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

async function fetchAndDisplayAchievements(event) {
    event.preventDefault();

    const tableElement = document.getElementById("earnedachievements");
    const tableBody = tableElement.querySelector("tbody");
    const messageElement = document.getElementById("achievementsMsg");

    try {
        const response = await fetch("getachievements", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: searchedUser,
            }),
        });

        const responseData = await response.json();

        if (responseData.success) {
            if (responseData.data.length > 0) {
                messageElement.textContent = ""
                const achievements = responseData.data;

                tableBody.innerHTML = "";

                achievements.forEach((post) => {
                    const row = tableBody.insertRow();
                    post.forEach((field, index) => {
                        const cell = row.insertCell(index);
                        cell.textContent = field;
                    });
                });
            } else {
                messageElement.textContent = "No achievements yet!";
            }
        } else {
            messageElement.textContent = "Error getting achievements!";
        }
    } catch (error) {
        messageElement.textContent = "Error getting achievements!";
        console.error("Error fetching achievements:", error);
    }
}

async function displayIcon() {
    const icon = document.getElementById("profileicon");

    if (icon) {
        icon.innerHTML = "";
    }

    try {
        const response = await fetch("getusericon", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: searchedUser,
            }),
        });

        const result = await response.json();
        let iconv = Object.values(result);
        const iconval = Number(iconv);

        console.log(iconval);

        if (iconval === 5) {
            icon.innerHTML =
            `<img
                    id="updateProfile5"
                    class="profileIcon"
                    src="./profile5.jpg"
                    alt="profile5"
                    width="200"
                    height="200"
            />`;
        } else if (iconval === 4) {
            icon.innerHTML =
            `<img
                    id="updateProfile4"
                    class="profileIcon"
                    src="./profile4.jpg"
                    alt="profile4"
                    width="200"
                    height="200"
            />`;
        } else if (iconval === 3) {
            icon.innerHTML =
              `<img
                      id="updateProfile3"
                      class="profileIcon"
                      src="./profile3.jpg"
                      alt="profile3"
                      width="200"
                      height="200"
              />`;
        } else if (iconval === 2) {
              icon.innerHTML =
                `<img
                        id="updateProfile2"
                        class="profileIcon"
                        src="./profile2.jpg"
                        alt="profile2"
                        width="200"
                        height="200"
                />`;
      } else {
            icon.innerHTML =
              `<img
                      id="updateProfile1"
                      class="profileIcon"
                      src="./profile1.gif"
                      alt="profile1"
              />`;
      }


    } catch (error) {
        console.error("Failed to fetch and show user icon");
    }
}

window.onload = function () {
    // login stuff
    currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        console.log(currentUser, " is logged in");
    } else {
        console.log("failed to get currentUser");
    }

    searchedUser = localStorage.getItem("searchedUser");
    if (currentUser) {
        console.log(searchedUser, " is searched");
    } else {
        console.log("failed to get searchedUser");
    }

    displayDashboardstyle();
    fetchAndDisplayPostCollections();
    fetchAndDisplayContactInformation();
    displayIcon();
    fetchAndDisplayContactInformation();

    document.getElementById("showAchievements").addEventListener("click", fetchAndDisplayAchievements);

};
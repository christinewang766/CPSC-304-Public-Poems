let currentUser = "";
const showAdminCentre = document.getElementById("adminCentre");
showAdminCentre.classList.remove("visible");
showAdminCentre.classList.add("hidden");


async function checkDbConnection() {
    const statusElem = document.getElementById("dbStatus");
    const loadingGifElem = document.getElementById("loadingGif");


    const response = await fetch("/check-db-connection", {
        method: "GET",
    });

    loadingGifElem.style.display = "none";
    statusElem.style.display = "inline";

    response
        .text()
        .then((text) => {
            statusElem.textContent = text;
        })
        .catch((error) => {
            statusElem.textContent = "connection timed out " + error; // Adjust error handling if required.
        });
}

// LOGIN =========================================================================

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

async function fetchAndDisplayPosts() {
    const selectionsRaw = document.getElementById("postsTableFilter");
    const selectedOptions = Array.from(selectionsRaw.selectedOptions);
    const selectedValues = selectedOptions.map(option => option.value);

    const messageElement = document.getElementById("filterMsg");

    if (selectedValues.length === 0) {
        messageElement.textContent = "You must select at least one column.";
        return;
    }

    let columns = selectedValues.includes("*") ? "*" : selectedValues.join(',');

    const postsResponse = await fetch("/poststable", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({columns}),
    });

    const postsIdsResponse = await fetch("/poststable", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({columns: "postid"}),
    });

    const username = currentUser;
    const relationshipsResponse = await fetch("/relationships", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username}),
    });

    const relationshipsData = await relationshipsResponse.json();
    const relationships = relationshipsData.data;
    const following = relationships.following;

    const postsData = await postsResponse.json();
    const poststableContent = postsData.data;

    const tableElement = document.getElementById("posts");
    const tableBody = tableElement.querySelector("tbody");
    const tableHeader = tableElement.querySelector("thead");

    tableBody.innerHTML = "";
    tableHeader.innerHTML = "";

    let indexOfUsernameCol = selectedValues.indexOf("username");
    let indexOfAnnoucement = selectedValues.indexOf("announcementduration");

    const allCol = ["postid", "username", "postdate", "content", "tag", "title", "announcementduration"];

    const headerRow = tableHeader.insertRow();
    if (selectedValues[0] === '*') {
        allCol.forEach((column) => {
            const th = document.createElement("th");
            th.textContent = column;
            headerRow.appendChild(th);
        });

        indexOfUsernameCol = 1;
        indexOfAnnoucement = 6;
    } else {
        selectedValues.forEach((column) => {
            const th = document.createElement("th");
            th.textContent = column;
            headerRow.appendChild(th);
        });
    }

    const postsIdsData = await postsIdsResponse.json();
    const postsIdsTableContent = postsIdsData.data;

    let i = 0;

    poststableContent.forEach((poem) => {
        const row = tableBody.insertRow();

        const cell = row.insertCell("Likes and comments");
        let pid = postsIdsTableContent[i];
        cell.innerHTML = `<button onclick="showInteractions('${pid}')"> Interactions </button>`;
        i++;

        poem.forEach((field, index) => {
            const cell = row.insertCell(index);
            if (index === indexOfUsernameCol && field !== username && !following.includes(field)) {
                cell.innerHTML = `<button style="background: none; border: none; color: blue" onclick="followProfile('${field}')">${field || ""}</button>`;
            } else if (index === indexOfAnnoucement) {
                cell.style.fontWeight = 'bold';
                cell.textContent = field;
            } else {
                cell.textContent = field;
            }
        });
    });

    messageElement.textContent = "Filtered posts successfully!";
}

async function showInteractions(pid) {
    await updateLikes(pid);

    const likesbutton = document.getElementById("likesbutton");
    likesbutton.innerHTML = `<button onclick="likePost('${pid}')"> Like this post </button>`;

    updateComments(pid);

    const commentzone = document.getElementById("makecomment");
    commentzone.innerHTML = `<textarea id="commentspace"></textarea>
                            <button onclick="makeComment('${pid}')"> Comment this </button>`;
}

async function makeComment(pid) {

    const usern = currentUser;

    let commentnum = await fetch("/getcommentnum", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({postid: pid})
    });

    const cnumresponse = await commentnum.json();
    let cn = Object.values(cnumresponse);
    const commentNumValue = Number(cn[0]) + 1;

    const contentValue = document.getElementById("commentspace").value;

    let commentResponse = await fetch("/insertcomment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            commentnum: commentNumValue,
            username: usern,
            postid: pid,
            content: contentValue
        })
    });

    const responseData = await commentResponse.json();
    const success = responseData.success;

    if (success) {
        document.getElementById("commentspace").value = "";
        await updateComments(pid);
        await insertAchievementWithCheck("10th Comment", "comment", 10);
    } else {
        window.alert("Something went wrong while commenting. Perhaps too long?");
    }
}

async function updateComments(pid) {
    const commentsResponse = await fetch("/getcomments", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({postid: pid}),
    });

    const responseData = await commentsResponse.json();
    const comments = responseData.data;

    const tableElement = document.getElementById("comments");
    const tableBody = tableElement.querySelector("tbody");

    tableBody.innerHTML = "";

    comments.forEach((comment) => {
        const row = tableBody.insertRow();
        comment.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function updateLikes(pid) {
    const element = document.getElementById("likes");

    const likesResponse = await fetch("/countlikes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({pid})
    });

    const likesObject = await likesResponse.json();
    let likes = Object.values(likesObject);

    element.innerText = `Likes: ${likes}`;
}

async function likePost(pid) {
    try {
        const username = currentUser;

        const pidvalue = Number(pid);

        const likes = await fetch("/userlikes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({pid: pidvalue, usern: username})
        });

        const responseData = await likes.json();
        const success = responseData.success;

        if (success) {
            await updateLikes(pid);
            await insertAchievementWithCheck("1st Like", "like", 1);
        } else {
            window.alert("You may have liked that post already!");
        }
    } catch (error) {
        window.alert("You may have liked that post already!");
        console.error("Error liking post:", error);
    }
}

async function resetTables() {
    localStorage.removeItem('currentUser');
    alert("You've been logged out!");
    window.location.href = window.location.href.slice(0, -14);
}

async function showCommunity() {
    const tableElement = document.getElementById("communities");
    const tableBody = tableElement.querySelector("tbody");

    const resCommunity = await fetch("/community-stats", {
        method: "GET",
    });

    const responseData = await resCommunity.json();
    const communityStats = responseData.data;

    for (const cs of communityStats) {
        cs.push("join");
    }

    tableBody.innerHTML = "";

    let i = 0;

    communityStats.forEach((community) => {
        const row = tableBody.insertRow();
        let communityName = "";
        community.forEach((field, index) => {
            const cell = row.insertCell(index);
            if (index === 0) {
                communityName = field;
                let url = "";
                switch (communityName) {
                    case "BIPOC LGBTQ2+ Safe Space":
                        url = "bipoclgbt";
                        break;
                    case "Cat Owner":
                        url = "catowner"
                        break;
                    case "Complain about life":
                        url = "complain";
                        break;
                    case "Sadge Poets":
                        url = "sadgepoets"
                        break;
                    case "Not a Cat Owner":
                        url = "notcatowner";
                        break;
                    default:
                        url = "404";
                }
                cell.innerHTML = `<a href="communities/${url}.html">${field}</a>`;
            } else if (index !== 3) {
                cell.innerHTML = field;
            } else {
                cell.innerHTML = `<button onclick="joinCommunity('${communityName}')">${field}</button>`;
                // TODO CHANGE THE USERNAME
            }
        });
        i++;
    });
}

async function joinCommunity(communityname) {
    const username = currentUser;

    try {
        const response = await fetch("/join-community", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, communityname}),
        });

        const responseData = await response.json();
        const messageElement = document.getElementById("joinCommunityMsg");

        if (responseData.success) {
            messageElement.textContent = "Wahoo! Welcome to your new family.";
            showCommunity();
            await insertAchievementWithCheck("Community Contributor: joined your first community!", "community", 1);
        } else {
            messageElement.textContent =
                "Uh oh! Either you're already in this community, or there's an issue!";
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function followProfile(profileToFollow) {

    const username = currentUser;

    const response = await fetch("/insert-profilefollowsprofile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            follows: username,
            followed: profileToFollow,
        }),
    });

    const responseData = await response.json();

    if (responseData.success) {
        console.log("Followed user successfully!");
        await fetchAndDisplayPosts();
        await findBestPosts();
        await findBusyPosts();

    } else {
        alert("Error following user!");
        console.log("Error following user!");
    }
}

async function findBusyPosts(event) {

    console.log("busy");

    const response = await fetch('/findbusyposts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const responseData = await response.json();
    const posts = responseData.data;

    const messageElement = document.getElementById('busypostsstatus');
    const tableElement = document.getElementById("busysearchresults");
    const tableBody = tableElement.querySelector("tbody");

    tableBody.innerHTML = '';

    const username = currentUser;
    const relationshipsResponse = await fetch("/relationships", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username}),
    });

    const relationshipsData = await relationshipsResponse.json();
    const relationships = relationshipsData.data;
    const following = relationships.following;

    if (posts === undefined || posts.length == 0) {
        messageElement.textContent = "No trending posts";
    } else {
        messageElement.textContent = "Here are the trending posts:";

        let i = 0;

        posts.forEach((post) => {
            const row = tableBody.insertRow();

            post.forEach((field, index) => {
                const cell = row.insertCell(index);
                if (index === 1 && field !== username && !following.includes(field)) {
                    cell.innerHTML = `<button style="background: none; border: none; color: blue" onclick="followProfile('${field}')">${field || ""}</button>`;
                } else if (index === 6) {
                    cell.style.fontWeight = 'bold';
                    cell.textContent = field;
                } else {
                    cell.textContent = field;
                }

                if (index === 0) {
                    i = field;
                }
            });

            const interact = row.insertCell(7);
            interact.innerHTML = `<button onclick="showInteractions('${i}')"> Interactions </button>`;

        });
    }
}

async function findBestPosts(event) {
    const response = await fetch('/findbestposts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const responseData = await response.json();
    const posts = responseData.data;

    const messageElement = document.getElementById('bestpostsstatus');
    const tableElement = document.getElementById("bestsearchresults");
    const tableBody = tableElement.querySelector("tbody");

    tableBody.innerHTML = '';

    const username = currentUser;
    const relationshipsResponse = await fetch("/relationships", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username}),
    });

    const relationshipsData = await relationshipsResponse.json();
    const relationships = relationshipsData.data;
    const following = relationships.following;

    if (posts === undefined || posts.length == 0) {
        messageElement.textContent = "No liked posts";
    } else {
        messageElement.textContent = "Here are the best posts:";

        let i = 0;

        posts.forEach((post) => {
            const row = tableBody.insertRow();

            post.forEach((field, index) => {
                const cell = row.insertCell(index);
                if (index === 1 && field !== username && !following.includes(field)) {
                    cell.innerHTML = `<button style="background: none; border: none; color: blue" onclick="followProfile('${field}')">${field || ""}</button>`;
                } else if (index === 6) {
                    cell.style.fontWeight = 'bold';
                    cell.textContent = field;
                } else {
                    cell.textContent = field;
                }

                if (index === 0) {
                    i = field;
                }
            });

            const interact = row.insertCell(7);
            interact.innerHTML = `<button onclick="showInteractions('${i}')"> Interactions </button>`;

        });
    }
}

async function findSuperStars(event) {
    const response = await fetch('/findsuperstars', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const responseData = await response.json();
    const searchTable = responseData.data;

    const messageElement = document.getElementById('starsstatus');
    const tableElement = document.getElementById("starsresults");
    const tableBody = tableElement.querySelector("tbody");

    tableBody.innerHTML = '';

    if (searchTable === undefined || searchTable.length == 0) {
        messageElement.textContent = "No stars yet, maybe you could be the first!";
    } else {
        messageElement.textContent = "Here are the stars:";

        searchTable.forEach((user) => {
            const row = tableBody.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    }
}

async function insertAchievement(achievementTitle) {

    const response = await fetch("/insert-achievementsawarded", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: achievementTitle,
            username: currentUser,
        }),
    });

    const responseData = await response.json();

    if (responseData.success) {
        return alert("You earned an achievement: \"" + achievementTitle + "\"");
    }
}

async function insertAchievementWithCheck(title, type, count) {

    const response = await fetch("/usercount-" + type, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: currentUser,
        }),
    });

    const responseData = await response.json();

    if (responseData.success && responseData.count[0] >= count) {
        await insertAchievement(title);
    }
}

async function fetchProfiles() {
    const dropdownElement = document.getElementById("selectprofile");

    if (dropdownElement) {
        dropdownElement.innerHTML = "";
    }

    try {
        const response = await fetch("/allusernames", {
            method: "GET",
        });

        if (!response.ok) {
            console.log(`Error fetching data: ${response.statusText}`);
        }

        const responseData = await response.json();
        const users = responseData.data;

        users.forEach((username) => {
            const option = document.createElement("option");
            option.textContent = `${username}`;
            option.value = username;
            dropdownElement.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to fetch and show users:", error);
    }
}

async function searchprofile(event) {
    selectedUser = document.getElementById("selectprofile").value;
    localStorage.setItem("searchedUser", selectedUser);
    location.href = "publicprofile.html";
}


async function fetchDsidForProfileUpdate() {
    const dropdownElement = document.getElementById("updateNewDsid");

    if (dropdownElement) {
        dropdownElement.innerHTML = "";
    }

    try {
        const response = await fetch("/dashboardstyletable", {
            method: "GET",
        });

        if (!response.ok) {
            console.log(`Error fetching data: ${response.statusText}`);
        }

        const responseData = await response.json();
        const dashboardstyleTableContent = responseData.data;

        dashboardstyleTableContent.forEach(([dsid, dashboardname]) => {
            const option = document.createElement("option");
            option.textContent = `${dsid}: ${dashboardname}`;
            option.value = dsid;
            dropdownElement.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to fetch and show dropdown options:", error);
    }
}


async function fetchAllProfiles() {
    const tableElement = document.getElementById("allUsers");
    const tableBody = tableElement.querySelector("tbody");

    const allProfiles = await fetch("/allProfiles", {
        method: "GET",
    });

    const responseData = await allProfiles.json();
    const userData = responseData.data;

    for (const user of userData) {
        user.push("edit");
    }

    tableBody.innerHTML = "";

    userData.forEach((user) => {
        const row = tableBody.insertRow();
        let rowUser = "";
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            if (index === 0) {
                rowUser = field;
            }
            if (index !== 4) {
                cell.textContent = field;

            } else {
                cell.innerHTML = `<button onclick="showUpdateForm('${rowUser}')">${field}</button>`;
            }
        });
    });
}

function showUpdateForm(selectedUser) {
    localStorage.setItem("selectedUser", selectedUser);
    const showUpdateUser = document.getElementById("showUpdate");
    showUpdateUser.classList.remove("hidden");
    showUpdateUser.classList.add("visible");
}

async function updateProfile(event) {
    event.preventDefault();

    const selectedUser = localStorage.getItem("selectedUser");
    if (selectedUser) {
        const newDsidValue = document.getElementById("updateNewDsid").value;
        const newPasswordValue = document.getElementById("updateNewPassword").value;
        const newProfileiconValue = document.getElementById("updateNewProfileicon").value;

        const response = await fetch("/update-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: selectedUser,
                newDsid: newDsidValue,
                newPassword: newPasswordValue,
                newProfileicon: newProfileiconValue,
            }),
        });

        const updateResponse = await response.json();
        const messageElement = document.getElementById("updateProfileResultMsg");

        if (updateResponse.success) {
            messageElement.textContent = `${selectedUser} profile updated successfully!`;
            fetchAllProfiles();
            fetchDsidForProfileUpdate();

            localStorage.setItem("selectedUser", "");
            const showUpdateUser = document.getElementById("showUpdate");
            showUpdateUser.classList.remove("visible");
            showUpdateUser.classList.add("hidden");
        } else {
            messageElement.textContent = "Error updating profile!";
        }

        document.getElementById("updateProfileForm").reset();
    } else {
        alert("No user selected. Please select a user to edit.");
    }
}

// ---------------------------------------------------------------
window.onload = function () {
    // login stuff
    currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        console.log(currentUser, " is logged in");
        if (currentUser === "admin") {
            const showAdminCentre = document.getElementById("adminCentre");
            showAdminCentre.classList.remove("hidden");
            showAdminCentre.classList.add("visible");


            const showUpdateUser = document.getElementById("showUpdate");
            showUpdateUser.classList.remove("visible");
            showUpdateUser.classList.add("hidden");
        }
    } else {
        console.log("failed to get currentUser");
    }
    checkDbConnection();
    fetchAndDisplayPosts();
    showCommunity();
    fetchProfiles();
    displayDashboardstyle();
    fetchAllProfiles();
    fetchDsidForProfileUpdate();
    insertAchievement("First Login: Welcome!");

    // login stuff ends


    document
        .getElementById("updateProfileForm")
        .addEventListener("submit", updateProfile);
    document.getElementById("resetTables").addEventListener("click", resetTables);
    document.getElementById("findBusyPosts").addEventListener("click", findBusyPosts);
    document.getElementById("findBestPosts").addEventListener("click", findBestPosts);
    document.getElementById("findSuperStars").addEventListener("click", findSuperStars);
    document.getElementById("filterPostsTable").addEventListener("click", fetchAndDisplayPosts);
    document.getElementById("searchprofile").addEventListener("click", searchprofile);
};
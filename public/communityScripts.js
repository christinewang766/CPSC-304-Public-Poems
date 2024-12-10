let currentUser = "";

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

async function fetchAndDisplayCommunityPosts() {
    const communityName = document.getElementById("community").textContent;
    const response = await fetch('/getcommunityposts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({communityName})
    });

    const responseData = await response.json();
    const posts = responseData.data;

    const messageElement = document.getElementById('status');
    const tableElement = document.getElementById("searchresults");
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
        messageElement.textContent = "No posts yet!";
    } else {
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

async function fetchAndDisplayCommunityUsers() {
    const communityName = document.getElementById("community").textContent;
    const response = await fetch('/getcommunityusers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({communityName})
    });

    const responseData = await response.json();
    const posts = responseData.data;

    const messageElement = document.getElementById('usersStatus');
    const tableElement = document.getElementById("usersResults");
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
        messageElement.textContent = "No users yet!";
    } else {
        let i = 0;

        posts.forEach((post) => {
            const row = tableBody.insertRow();

            post.forEach((field, index) => {
                const cell = row.insertCell(index);
                if (field !== username && !following.includes(field)) {
                    cell.innerHTML = `<button style="background: none; border: none; color: blue" onclick="followProfile('${field}')">${field || ""}</button>`;
                } else if (index === 6) {
                    cell.style.fontWeight = 'bold';
                    cell.textContent = field;
                } else {
                    cell.textContent = field;
                }
            });
        });
    }
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
        await fetchAndDisplayCommunityPosts();
        await fetchAndDisplayCommunityUsers();

    } else {
        console.log("Error following user!");
    }
}

// ---------------------------------------------------------------
window.onload = function () {
    // login stuff
    currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        console.log(currentUser, " is logged in");
    } else {
        console.log("failed to get currentUser");
    }
    fetchAndDisplayCommunityPosts();
    fetchAndDisplayCommunityUsers();
    displayDashboardstyle();

    // login stuff ends
};
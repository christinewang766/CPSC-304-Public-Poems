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

async function fetchAndDisplayContactInformation() {
    const tableElement = document.getElementById("contactinformation");
    const tableBody = tableElement.querySelector("tbody");
    const username = currentUser;

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

async function fetchAndDisplayPostCollections() {
    const tableElement = document.getElementById("postcollection");
    const tableBody = tableElement.querySelector("tbody");
    const username = currentUser;

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
        if (!/My Posts/i.test(pc[1])) {
            pc.push("delete");
        }
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
            if (index === 3) {
                cell.innerHTML = `<button onclick="deletePostcollection('${pcid}')">${field}</button>`;
            }
        });
    });
}


async function deletePostcollection(pcid) {
    try {
        const response = await fetch("/delete-postcollection", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({pcid}),
        });

        const responseData = await response.json();
        const messageElement = document.getElementById("deletePostcollectionMsg");

        if (responseData.success) {
            messageElement.textContent = "Post collection deleted successfully!";
            await fetchAndDisplayPostCollections();
        } else {
            messageElement.textContent = "Error deleting post!";
        }

    } catch (error) {
        console.error(
            "Failed to delete post collection:",
            error,
        );
    }
}

async function viewPostCollection(pcid) {
    const tableElement = document.getElementById("selectedpostcollection");
    const tableBody = tableElement.querySelector("tbody");

    try {
        const response = await fetch(`/postcollection/posts/${pcid}`, {
            method: "GET",
        });

        const responseData = await response.json();
        const posts = responseData.data;

        tableBody.innerHTML = "";

        const messageElement = document.getElementById("postcollectionMsg");
        if (posts.length > 0) {
            messageElement.textContent = "";
        } else {
            messageElement.textContent = "No posts in this collection yet!";
        }

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

async function fetchPostCollectionsForAddPost() {
    const dropdownElement = document.getElementById("addToCollection");
    const username = currentUser;

    if (dropdownElement) {
        dropdownElement.innerHTML = "";
    }

    try {
        const response = await fetch("/postcollection", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username}),
        });

        if (!response.ok) {
            console.log(`Error fetching data: ${response.statusText}`);
        }

        const responseData = await response.json();
        const postCollections = responseData.data;

        const option = document.createElement("option");
        option.textContent = "Select a collection";
        option.value = "";

        dropdownElement.appendChild(option);

        postCollections.forEach(([pcid, title]) => {
            if (!/My Posts/i.test(title)) {
                const option = document.createElement("option");
                option.textContent = `${title}`;
                option.value = pcid;
                dropdownElement.appendChild(option);
            }
        });
    } catch (error) {
        console.error(
            "Failed to fetch and show post collection dropdown options:",
            error,
        );
    }
}


async function insertPoststable(event) {
    event.preventDefault();

    const usernameValue = currentUser;
    const contentValue = document.getElementById("insertContent").value;
    const tagValue = document.getElementById("insertTag").value;
    const titleValue = document.getElementById("insertTitle").value;

    let adv = 0;

    if (currentUser === "admin") {
        adv = document.getElementById("annoucementduration").value;
    }

    let maxpostid = await fetch("/getmaxpostid", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });

    const maxPostObject = await maxpostid.json();
    let mpid = Object.values(maxPostObject)
    const postidValue = Number(mpid[0]) + 1;

    const temp = new Date();
    temp.setUTCDate(temp.getUTCDate() + Number(adv));
    const pad = (num) => (num < 10 ? "0" : "") + num;

    let announcementdurationValue =
        temp.getUTCFullYear() +
        "-" +
        pad(temp.getUTCMonth() + 1) +
        "-" +
        pad(temp.getUTCDate()) +
        " " +
        pad(temp.getUTCHours()) +
        ":" +
        pad(temp.getUTCMinutes()) +
        ":" +
        pad(temp.getUTCSeconds());

    const pcidValue = document.getElementById("addToCollection").value;

    if (currentUser !== "admin") {
        announcementdurationValue = null;
    }

    const postResponse = await fetch("/insert-poststable", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            postid: postidValue,
            username: usernameValue,
            content: contentValue,
            tag: tagValue,
            title: titleValue,
            announcementduration: announcementdurationValue,
        }),
    });

    const postResponseData = await postResponse.json();
    const messageElement = document.getElementById("insertResultMsg");

    let collectionResponseData = true;
    if (pcidValue) {
        const collectionResponse = await fetch("/insert-postcollectionrecordspost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                pcid: pcidValue,
                postid: postidValue,
            }),
        });

        collectionResponseData = (await collectionResponse.json()).success;
    }


    if (postResponseData.success && collectionResponseData) {
        messageElement.textContent = "Data inserted successfully!";
        const pcrpResponse = await fetch("/insert-postcollectionrecordspost-myposts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                postid: postidValue,
                title: "My Posts",
                username: usernameValue,
            }),
        });

        const pcrpData = await pcrpResponse.json();

        if (pcrpData.success) {
            console.log("Successfully added new post to My Posts");
        } else {
            console.log("Failed to add a new post to My Posts");
        }
        await insertAchievementWithCheck("5th Post", "post", 5);
    } else {
        messageElement.textContent = "Error inserting data!";
    }

    document.getElementById("insertPoststable").reset();
}


async function insertPostcollection(event) {
    event.preventDefault();

    const usernameValue = currentUser;
    const titleValue = document.getElementById("insertPcTitle").value;

    if (/My Posts/i.test(titleValue)) {
        return alert("Nice try, choose a different name!");
    }

    let maxpcid = await fetch("/getmaxpostcollectionid", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });

    const maxPostObject = await maxpcid.json();
    let mpcid = Object.values(maxPostObject)
    const pcidValue = Number(mpcid[0]) + 1;

    const pcResponse = await fetch("/insert-postcollection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            pcid: pcidValue,
            username: usernameValue,
            title: titleValue,
        }),
    });

    const pcResponseData = await pcResponse.json();
    const messageElement = document.getElementById("insertPcResultMsg");

    if (pcResponseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        await fetchAndDisplayPostCollections();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
    document.getElementById("insertPostcollection").reset();
    await fetchPostCollectionsForAddPost();
}

async function updateProfile(event) {
    event.preventDefault();
    const usernameValue = currentUser;
    const newDsidValue = document.getElementById("updateNewDsid").value;
    const newPasswordValue = document.getElementById("updateNewPassword").value;
    const newProfileiconValue = document.getElementById(
        "updateNewProfileicon",
    ).value;

    const response = await fetch("/update-profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: usernameValue,
            newDsid: newDsidValue,
            newPassword: newPasswordValue,
            newProfileicon: newProfileiconValue,
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("updateProfileResultMsg");

    if (responseData.success) {
        messageElement.textContent = "Profile updated successfully!";
        await displayDashboardstyle();
    } else {
        messageElement.textContent = "Error updating profile!";
    }
    document.getElementById("updateProfileForm").reset();
}

async function insertDstable(event) {
    event.preventDefault();

    const dashboardnameValue = document.getElementById(
        "insertDashboardname",
    ).value;
    const bgcolourValue = document.getElementById("insertBgcolour").value;
    const textcolourValue = document.getElementById("insertTextcolour").value;

    let maxdsid = await fetch("/maxdsid", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });

    const maxDSObject = await maxdsid.json();
    let dsid = Object.values(maxDSObject)
    const dsidValue = Number(dsid[0]) + 1;

    const response = await fetch("/insert-dashboardstyle", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            dsid: dsidValue,
            dashboardname: dashboardnameValue,
            bgcolour: bgcolourValue,
            textcolour: textcolourValue,
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("insertDsResultMsg");

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";

        document.body.style.backgroundColor = bgcolourValue;
        document.body.style.color = textcolourValue;

        const usernameValue = currentUser;
        const newDsidValue = dsidValue;
        const newPasswordValue = "";
        const newProfileiconValue = 0;

        const response = await fetch("/update-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: usernameValue,
                newDsid: newDsidValue,
                newPassword: newPasswordValue,
                newProfileicon: newProfileiconValue,
            }),
        });

        const responseData = await response.json();

        if (responseData.success) {
            console.log("profile updated to new dashboard style");
        } else {
            console.log("profile FAILED to update to new dashboard style");
        }

    } else {
        messageElement.textContent = "Error inserting data!";
    }
    document.getElementById("insertDstable").reset();
    await fetchDsidForProfileUpdate();
}

async function unfollowProfile(profileToUnfollow) {

    if (confirm('Are you sure you want to unfollow?')) {
        const username = currentUser;
        const response = await fetch("/delete-profilefollowsprofile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                follows: username,
                followed: profileToUnfollow,
            }),
        });

        const responseData = await response.json();

        if (responseData.success) {
            console.log("Unfollowed user successfully!");
            await showFollowersFollowingMutuals();
        } else {
            alert("Error following user!");
            console.log("Error unfollowing user!");
        }
    } else {
        console.log('Cancelled unfollow.');
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
        await showFollowersFollowingMutuals();
    } else {
        alert("Error following user!");
        console.log("Error following user!");
    }
}

async function insertContactinformation(event) {
    event.preventDefault();
    const emailValue = document.getElementById("insertEmail").value;
    const usernameValue = currentUser;
    const instagramhandleValue = document.getElementById("insertIgHandle").value;
    const xhandleValue = document.getElementById("insertXHandle").value;
    const youtubehandleValue = document.getElementById("insertYtHandle").value;

    const response = await fetch("/insert-contactinformation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: emailValue,
            username: usernameValue,
            instagramhandle: instagramhandleValue,
            xhandle: xhandleValue,
            youtubehandle: youtubehandleValue,
        }),
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("insertContactinformationMsg");

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        await fetchAndDisplayContactInformation();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
    document.getElementById("insertContactinformation").reset();
}


let dsclauses = 2;

async function addDSClause() {
    const search = document.getElementById("searchds");
    const clause = document.createElement("div");
    clause.classList.add("searchds");
    clause.innerHTML = `
        <select id="conj${dsclauses}" name="conj${dsclauses}">
            <option value=" AND ">AND</option>
            <option value=" OR ">OR</option>
        </select>
        <select id="field${dsclauses}" name="field${dsclauses}" onchange="changeDSInputType(${dsclauses})">
            <option value="dsid">ID</option>
            <option value="TextColour">Text Colour</option>
            <option value="BgColour">Background Colour</option>
            <option value="dashboardname">Name</option>
        </select>
        <select id="op${dsclauses}" name="op${dsclauses}">
            <option value=" LIKE ">Contains</option>
            <option value=" = ">Equals</option>
            <option value=" < ">Less Than</option>
            <option value=" > ">Greater Than</option>
        </select>
        <input type="number" id="value${dsclauses}" name="value${dsclauses}">
        `;
    search.appendChild(clause);
    dsclauses++;
}

async function changeDSInputType(clause) {
    var inputType = document.getElementById("field" + clause).value;
    var inputValue = document.getElementById("value" + clause);

    if (inputType === "dsid") {
        inputValue.type = "number";
    } else if (inputType === "dashboardname") {
        inputValue.type = "text";
    } else {
        inputValue.type = "color";
    }
}

async function clearDSClauses() {
    const search = document.getElementById("searchds");
    const cleared = document.createElement("div");
    cleared.innerHTML = `
        <form id="searchds">
            <div> Use contains for title, equals for colors or id, and less/greater than for id</div>
            <select id="field1" name="field1" onchange="changeDSInputType(1)">
                <option value="dsid">ID</option>
                <option value="textcolour">Text Colour</option>
                <option value="bgcolour">Background Colour</option>
                <option value="dashboardname">Name</option>
            </select>
            <select id="op1" name="op1">
                <option value=" LIKE ">Contains</option>
                <option value=" = ">Equals</option>
                <option value=" < ">Less Than</option>
                <option value=" > ">Greater Than</option>
            </select>
            <input type="number" id="value1" name="value1">

            <button id="addDSClause" type="button"> add clause</button>
            <button id="clearDSSearch"> clear</button>
            <button id="submitDSQuery" type="button"> search</button>
            <br>
        </form>
        `;
    search.replaceWith(cleared);
    document.getElementById("addDSClause").addEventListener("click", addDSClause);
    document
        .getElementById("clearDSSearch")
        .addEventListener("click", clearDSClauses);
    document.getElementById("submitDSQuery").addEventListener("click", searchDS);
    dsclauses = 2;
}

async function searchDS() {
    let dssearchquery = "";
    let values = {};
    dssearchquery += document.getElementById("field1").value;
    dssearchquery += document.getElementById("op1").value;
    dssearchquery += ":value1";
    if (document.getElementById("field1").value === "dashboardname") {
        values["value1"] = "%" + document.getElementById("value1").value + "%";
    } else {
        values["value1"] = document.getElementById("value1").value;
    }

    for (let i = 2; i < dsclauses; i++) {
        dssearchquery += document.getElementById("conj" + i).value;
        dssearchquery += document.getElementById("field" + i).value;
        dssearchquery += document.getElementById("op" + i).value;
        dssearchquery += ":value" + i;
        if (document.getElementById("field" + i).value === "dashboardname") {
            values["value" + i] =
                "%" + document.getElementById("value" + i).value + "%";
        } else {
            values["value" + i] = document.getElementById("value" + i).value;
        }
    }

    const response = await fetch("/search-dashboardstyle", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({sq: dssearchquery, binds: values}),
    });

    const responseData = await response.json();
    const searchTable = responseData.data;

    const messageElement = document.getElementById('dsSearchResultMsg');
    const tableElement = document.getElementById("dsSearchResults");
    const tableBody = tableElement.querySelector("tbody");
    if (searchTable === undefined || searchTable.length == 0) {
        messageElement.textContent =
            "Error searching data! There is an error in the search or there are no results";
    } else {
        messageElement.textContent = "Searched successfully!";
        if (responseData.data) {
            if (searchTable) {
                messageElement.textContent = "Searched successfully!";

                if (tableBody) {
                    tableBody.innerHTML = "";
                }

                searchTable.forEach((user) => {
                    const row = tableBody.insertRow();
                    user.forEach((field, index) => {
                        const cell = row.insertCell(index);
                        cell.textContent = field;
                    });
                });
            }
        }
    }
}

async function showFollowersFollowingMutuals() {
    const tableElement = document.getElementById("profilefollowsprofile");
    const tableBody = tableElement.querySelector("tbody");
    const username = currentUser;

    const fetchRelationships = await fetch("/relationships", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username}),
    });

    const relationshipsData = await fetchRelationships.json();
    const relationships = relationshipsData.data;

    tableBody.innerHTML = "";

    const maxRows = Math.max(
        relationships.followers.length,
        relationships.following.length,
        relationships.mutuals.length
    );

    const notMutuals = relationships.followers.filter(
        (follower) => !relationships.mutuals.includes(follower)
    );


    for (let i = 0; i < maxRows; i++) {
        const row = tableBody.insertRow();

        const followerCell = row.insertCell(0);
        const followingCell = row.insertCell(1);
        const mutualCell = row.insertCell(2);

        if (notMutuals.includes(relationships?.followers[i])) {
            followerCell.innerHTML = `<button style="background: none; border: none; color: blue" onclick="followProfile('${relationships?.followers[i]}')">${relationships?.followers[i] || ""}</button>`;
        } else {
            followerCell.textContent = relationships?.followers[i];
        }

        followingCell.innerHTML = `<button style="background: none; border: none; color: red" onclick="unfollowProfile('${relationships?.following[i]}')">${relationships?.following[i] || ""}</button>`;
        mutualCell.textContent = relationships?.mutuals[i];
    }
}

async function addAnnouncement() {
    const amenu = document.getElementById("adminannoucement");
    amenu.innerHTML = `

        <label for="annoucementduration">Annoucement Duration:</label>
        <select id="annoucementduration">
            <option value=1> 1 day</option>
            <option value=2> 2 days</option>
            <option value=3> 3 days</option>
            <option value=4> 4 days</option>
            <option value=5> 5 days</option>
            <option value=6> 6 days</option>
            <option value=7> 7 days</option>
        </select>
        <br/><br/>

    `;
}

window.onload = function () {
    currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        console.log(currentUser, " is logged in");
    } else {
        console.log("failed to get currentUser");
    }
    showFollowersFollowingMutuals();
    fetchDsidForProfileUpdate();
    displayDashboardstyle();
    fetchPostCollectionsForAddPost();
    fetchAndDisplayContactInformation();
    fetchAndDisplayPostCollections();

    if (currentUser === "admin") {
        addAnnouncement();
    } else {
        const amenu = document.getElementById("adminannoucement");
        amenu.innerHTML = "";
    }

    document
        .getElementById("updateProfileForm")
        .addEventListener("submit", updateProfile);
    document
        .getElementById("insertPoststable")
        .addEventListener("submit", insertPoststable);
    document
        .getElementById("insertPostcollection")
        .addEventListener("submit", insertPostcollection);
    document
        .getElementById("insertDstable")
        .addEventListener("submit", insertDstable);
    document.getElementById("addDSClause").addEventListener("click", addDSClause);
    document
        .getElementById("clearDSSearch")
        .addEventListener("click", clearDSClauses);
    document.getElementById("submitDSQuery").addEventListener("click", searchDS);
    document.getElementById("insertContactinformation").addEventListener("submit", insertContactinformation);
};
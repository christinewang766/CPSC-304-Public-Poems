const express = require("express");
const appService = require("./appService");

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get("/check-db-connection", async (req, res) => {
  const isConnect = await appService.testOracleConnection();
  if (isConnect) {
    res.send("connected");
  } else {
    res.send("unable to connect");
  }
});

router.post("/userLogin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const checkCredentials = await appService.checkProfileCredentials(
      username,
      password,
    );

    if (checkCredentials.success) {
      res.json({ success: true, message: "Login successful!" });
    } else {
      res.json({ success: false, message: "Login unsuccessful!" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error...SMH" });
  }
});

router.post("/registerUser", async (req, res) => {
  const { username, profileicon, password } = req.body;
  const insertResult = await appService.registerUser(
    username,
    profileicon,
    password,
  );
  if (insertResult) {
    res.json({ success: true, message: "Registration successful!" });
  } else {
    res.json({ success: false, message: "Registration unsuccessful!" });
  }
});

router.post("/poststable", async (req, res) => {
  const { columns } = req.body;

  if (!columns || columns.trim() === "") {
    return res.status(400).json({ error: "Invalid columns specified." });
  }

  try {
    const tableContent = await appService.fetchPoststableFromDb(columns);
    res.json({ data: tableContent });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Failed to fetch table data." });
  }
});

router.post("/contactinformation", async (req, res) => {
  const { username } = req.body;
  const tableContent = await appService.fetchContactinformation(username);
  res.json({ data: tableContent });
});

router.get("/community-stats", async (req, res) => {
  const tableContent = await appService.fetchCommunityStatsFromDb();
  res.json({ data: tableContent });
});

router.post("/postcollection", async (req, res) => {
  const { username } = req.body;

  const tableContent = await appService.fetchPostCollectionFromDb(username);
  res.json({ data: tableContent });
});

router.get("/postcollection/posts/:pcid", async (req, res) => {
  const { pcid } = req.params;

  try {
    const posts = await appService.fetchPostsInCollection(pcid);
    res.json({ data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

router.get("/dashboardstyletable", async (req, res) => {
  const tableContent = await appService.fetchDashboardstyletableFromDb();
  res.json({ data: tableContent });
});

router.post("/current-dashboardstyle", async (req, res) => {
  const { username } = req.body;
  const content = await appService.fetchCurrentDashboardstyle(username);
  res.json({ data: content });
});


router.post("/relationships", async (req, res) => {
  const { username } = req.body;
  const tableContent = await appService.fetchRelationships(username);

  const followers = tableContent.followers.map(row => row[0]);
  const following = tableContent.following.map(row => row[0]);
  const mutuals = tableContent.mutuals.map(row => row[0]);

  res.json({
    data: {
      followers,
      following,
      mutuals,
    },
  });
});


router.post("/initiate-tables", async (req, res) => {
  const initiateResult = await appService.initiateTables();
  if (initiateResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/insert-postcollectionrecordspost-myposts", async (req, res) => {

  const { postid, title, username } =
      req.body;
  const insertResult = await appService.insertPcrpMyPosts(
      postid,
      title,
      username,
  );
  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }

});

router.post("/insert-poststable", async (req, res) => {
  const { postid, username, content, tag, title, announcementduration } =
      req.body;
  const insertResult = await appService.insertPoststable(
      postid,
      username,
      content,
      tag,
      title,
      announcementduration,
  );
  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/insert-postcollectionrecordspost", async (req, res) => {
  const { pcid, postid } = req.body;

  const insertResult = await appService.insertPostcollectionrecordspost(
      pcid,
      postid,
  );

  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/insert-profilefollowsprofile", async (req, res) => {
  const { follows, followed } = req.body;

  const insertResult = await appService.insertProfilefollowsprofile(
      follows,
      followed,
  );

  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/insert-postcollection", async (req, res) => {
  const { pcid, username, title} =
      req.body;
  const insertResult = await appService.insertPostcollection(
      pcid,
      username,
      title,
  );
  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/insert-postcollectionrecordspost", async (req, res) => {
  const { pcid, postid } = req.body;

  const insertResult = await appService.insertPostcollectionrecordspost(
      pcid,
      postid,
  );

  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/delete-postcollection", async (req, res) => {
  const {pcid} = req.body;

  try {
    const deleteResult = await appService.deletePostcollection(pcid);

    if (deleteResult) {
      res.json({success: true});
    } else {
      res.status(404).json({success: false, message: "Post collection not found."});
    }
  } catch (error) {
    res.status(500).json({success: false, message: "Failed to delete."});
  }
});


router.post("/delete-profilefollowsprofile", async (req, res) => {
  const {follows, followed} = req.body;

  try {
    const deleteResult = await appService.deleteProfilefollowsprofile(follows, followed);

    if (deleteResult) {
      res.json({success: true});
    } else {
      res.status(404).json({success: false, message: "Profile not found."});
    }
  } catch (error) {
    res.status(500).json({success: false, message: "Failed to unfollow."});
  }
});

router.post("/update-profile", async (req, res) => {
  const { username, newDsid, newPassword, newProfileicon } = req.body;
  const updateResult = await appService.updateProfile(
    username,
    newDsid,
    newPassword,
    newProfileicon,
  );
  if (updateResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/insert-dashboardstyle", async (req, res) => {
  const { dsid, dashboardname, bgcolour, textcolour } = req.body;
  const insertResult = await appService.insertDashboardstyle(
      dsid,
      dashboardname,
      bgcolour,
      textcolour,
  );

  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});


router.post("/insert-contactinformation", async (req, res) => {
  const { email, username, instagramhandle, xhandle, youtubehandle } = req.body;
  const insertResult = await appService.insertContactinformation(
      email, username, instagramhandle, xhandle, youtubehandle
  );

  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/join-community", async (req, res) => {
  const { username, communityname } = req.body;
  const insertResult = await appService.joinCommunity(username, communityname);

  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/search-dashboardstyle", async (req, res) => {
  const { sq, binds } = req.body;
  let sql = `SELECT * FROM dashboardstyle WHERE ${sq}`;
  const searchResult = await appService.searchDashboardstyle(sql, binds);

  if (searchResult) {
    res.json({ data: searchResult });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/getmaxpostid", async (req, res) => {
  const result = await appService.maxpostid();

  if (result) {
    res.json({result});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/maxdsid", async (req, res) => {
  const result = await appService.maxdsid();
  if (result) {
    res.json({result});
  } else {
    res.status(500).json({ success: false });
  }
});


router.post("/getmaxpostcollectionid", async (req, res) => {
  const result = await appService.maxpostcollectionid();

  if (result) {
    res.json({result});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/findbusyposts", async (req, res) => {
  const searchResult = await appService.findbusyposts();
  if (searchResult) {
    res.json({data: searchResult});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/findbestposts", async (req, res) => {
  const searchResult = await appService.findbestposts();
  if (searchResult) {
    res.json({data: searchResult});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/findsuperstars", async (req, res) => {
  const searchResult = await appService.findsuperstars();
  if (searchResult) {
    res.json({data: searchResult});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/countlikes", async (req, res) => {
  const {pid} = req.body;
  const searchResult = await appService.countlikes(pid);
  if (searchResult) {
    res.json({data: searchResult});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/userlikes", async (req, res) => {
  const {pid, usern} = req.body;
  const result = await appService.userlikes(pid, usern);
  if (result) {
    res.json({success: true});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/insertcomment", async (req, res) => {
  const {commentnum, username, postid, content} = req.body;
  const result = await appService.insertcomment(commentnum, username, postid, content);
  if (result) {
    res.json({success: true});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/getcomments", async (req, res) => {
  const {postid} = req.body;
  const searchResult = await appService.getcomments(postid);
  if (searchResult) {
    res.json({data: searchResult});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/getcommentnum", async (req, res) => {
  const {postid} = req.body;
  const searchResult = await appService.getcommentnum(postid);
  if (searchResult > -1) {
    res.json({data: searchResult});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/getusericon", async (req, res) => {
  const {username} = req.body;
  const searchResult = await appService.getusericon(username);
  res.json({data: searchResult});
});

router.post("/insert-achievementsawarded", async (req, res) => {
  const { title, username } =
      req.body;
  const insertResult = await appService.insertAchievementsAwarded(
      title,
      username,
  );
  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/usercount-community", async (req, res) => {
  const { username } =
      req.body;
  const countResult = await appService.getUserCommunityCount(
      username,
  );
  if (countResult) {
    res.json({ success: true, count: countResult});
  } else {
    res.status(500).json({ success: false, count: -1 });
  }
});

router.post("/usercount-comment", async (req, res) => {
  const { username } =
      req.body;
  const countResult = await appService.getUserCommentCount(
      username,
  );
  if (countResult) {
    res.json({ success: true, count: countResult});
  } else {
    res.status(500).json({ success: false, count: -1 });
  }
});

router.post("/usercount-like", async (req, res) => {
  const { username } =
      req.body;
  const countResult = await appService.getUserLikeCount(
      username,
  );
  if (countResult) {
    res.json({ success: true, count: countResult});
  } else {
    res.status(500).json({ success: false, count: -1 });
  }
});

router.post("/usercount-post", async (req, res) => {
  const { username } =
      req.body;
  const countResult = await appService.getUserPostCount(
      username,
  );
  if (countResult) {
    res.json({ success: true, count: countResult});
  } else {
    res.status(500).json({ success: false, count: -1 });
  }
});

router.post("/getachievements", async (req, res) => {
  const {username} = req.body;
  const result = await appService.getachievements(username);
  if (result) {
    res.json({ success: true, data: result});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/getcommunityposts", async (req, res) => {
  const {communityName} = req.body;
  const result = await appService.getcommunityposts(communityName);
  if (result) {
    res.json({ success: true, data: result});
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/getcommunityusers", async (req, res) => {
  const {communityName} = req.body;
  const result = await appService.getcommunityusers(communityName);
  if (result) {
    res.json({ success: true, data: result});
  } else {
    res.status(500).json({ success: false });
  }
});

router.get("/allusernames", async (req, res) => {
  const tableContent = await appService.allusernames();
  res.json({ data: tableContent });

});

router.get("/allProfiles", async (req, res) => {
  const tableContent = await appService.allProfiles();
  res.json({ data: tableContent });

});

module.exports = router;

const oracledb = require("oracledb");
const loadEnvFile = require("./utils/envUtil");
const {readFileSync} = require("fs");

const envVariables = loadEnvFile("./.env");

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60,
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log("Connection pool started");
    } catch (err) {
        console.error("Initialization error: " + err.message);
    }
}

async function closePoolAndExit() {
    console.log("\nTerminating");
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log("Pool closed");
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process.once("SIGTERM", closePoolAndExit).once("SIGINT", closePoolAndExit);

// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async () => {
        return true;
    }).catch(() => {
        return false;
    });
}

// LOGIN ===========================================================================
async function checkProfileCredentials(username, password) {
    return await withOracleDB(async (connection) => {
        const checkIfUsernameExists = await connection.execute(`SELECT *
                                                                FROM profile
                                                                WHERE username = :username`, [username],);

        if (checkIfUsernameExists.rows.length < 1) {
            return {success: false, message: "Username does not exist"};
        }

        const result = await connection.execute(`SELECT *
                                                 FROM profile
                                                 WHERE username = :username
                                                   AND password = :password`, [username, password],);

        if (result.rows.length > 0) {
            return {success: true, message: "Login successful!"};
        } else {
            return {success: false, message: "Invalid username or password"};
        }
    }).catch(() => {
        return {success: false, message: "An error occurred during login"};
    });
}

async function registerUser(username, profileicon, password) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`INSERT INTO profile
                                                     (username, dsid, password, profileicon)
                                                 VALUES (:username, DEFAULT, :password, :profileicon)`, {
            username, profileicon, password
        }, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function fetchPoststableFromDb(columns) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(`SELECT ${columns}
                                                     FROM post
                                                     ORDER BY POSTID ASC`);
            return result.rows;
        });
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

async function fetchContactinformation(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT email, instagramhandle, xhandle, youtubehandle
                                                 FROM CONTACTINFORMATION
                                                 WHERE username = :username`, {username});
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchDashboardstyletableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT *
                                                 FROM dashboardstyle ORDER BY dsid`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchCurrentDashboardstyle(username) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(
                `SELECT ds.bgcolour, ds.textcolour
                 FROM dashboardstyle ds
                          JOIN profile p ON p.dsid = ds.dsid
                 WHERE p.username = :username`,
                {username}
            );
            return result.rows;
        });
    } catch (error) {
        console.error("Error fetching dashboard style:", error);
        return [];
    }
}

async function fetchPostCollectionFromDb(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT pcid, title
                                                 FROM postcollection
                                                 WHERE username = :username`, {username},);

        return result.rows;
    }).catch((err) => {
        console.error("Error fetching post collections:", err);
        return [];
    });
}

async function fetchPostsInCollection(pcid) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT p.postid,
                                                        p.username,
                                                        p.postdate,
                                                        p.content,
                                                        p.tag,
                                                        p.title,
                                                        p.announcementduration
                                                 FROM postcollectionrecordspost pc
                                                          JOIN post p ON pc.postid = p.postid
                                                 WHERE pc.pcid = :pcid`, {pcid},);

        return result.rows;
    }).catch((err) => {
        console.error("Database query failed:", err);
        return [];
    });
}

async function fetchCommunityStatsFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT c.communityname, c.description, COUNT(p.username) as population
                                                 FROM community c
                                                          LEFT JOIN profileincommunity p ON c.communityname = p.communityname
                                                 GROUP BY c.communityname, c.description`,);
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function insertPoststable(postid, username, content, tag, title, announcementduration,) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`INSERT INTO POST
                                                     (postid, username, postdate, content, tag, title, announcementduration)
                                                 VALUES (:postid, :username, SYSDATE, :content, :tag, :title,
                                                         TO_DATE(:announcementduration, 'YYYY-MM-DD HH24:MI:SS'))`, {
            postid, username, content, tag, title, announcementduration
        }, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function insertPostcollection(pcid, username, title) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`INSERT INTO POSTCOLLECTION
                                                     (pcid, username, title)
                                                 VALUES (:pcid, :username, :title)`, {
            pcid, username, title
        }, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function insertPostcollectionrecordspost(pcid, postid) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`INSERT INTO POSTCOLLECTIONRECORDSPOST
                                                     (pcid, postid)
                                                 VALUES (:pcid, :postid)`, {pcid, postid}, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateProfile(username, newDsid, newPassword, newProfileicon) {
    return await withOracleDB(async (connection) => {
        let result;
        if(newPassword === "" && newProfileicon === 0){
            result = await connection.execute(`UPDATE profile
                                                 SET dsid        = :newDsid
                                                 WHERE username = :username`, {
                username, newDsid
            }, {autoCommit: true},);
        } else if (newPassword === "")
        {
            result = await connection.execute(`UPDATE profile
                                                 SET dsid        = :newDsid,
                                                     profileicon = :newProfileicon
                                                 WHERE username = :username`, {
                username, newDsid, newProfileicon,
            }, {autoCommit: true},);
        } else {
            {
                result = await connection.execute(`UPDATE profile
                                                 SET dsid        = :newDsid,
                                                     password    = :newPassword,
                                                     profileicon = :newProfileicon
                                                 WHERE username = :username`, {
                    username, newDsid, newPassword, newProfileicon,
                }, {autoCommit: true},);
            }
        }
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function joinCommunity(username, communityname) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`INSERT INTO profileincommunity (username, communityname)
                                                 VALUES (:username, :communityname)`, {
            username, communityname
        }, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deletePostcollection(pcid) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`DELETE
                                                 FROM POSTCOLLECTION
                                                 WHERE pcid = :pcid`, {pcid}, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
};


async function deleteProfilefollowsprofile(follows, followed) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`DELETE
                                                 FROM PROFILEFOLLOWSPROFILE
                                                 WHERE follows = :follows
                                                   AND followed = :followed`, {follows, followed}, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
};

async function insertDashboardstyle(dsid, dashboardname, bgcolour, textcolour) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            INSERT INTO DashboardStyle (dsid, dashboardname, bgcolour, textcolour)
            VALUES (:dsid, :dashboardname, :bgcolour, :textcolour)`, {
            dsid, dashboardname, bgcolour, textcolour
        }, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function insertProfilefollowsprofile(follows, followed) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            INSERT INTO PROFILEFOLLOWSPROFILE (follows, followed)
            VALUES (:follows, :followed)`, {
            follows, followed
        }, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function insertContactinformation(email, username, instagramhandle, xhandle, youtubehandle) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            INSERT INTO CONTACTINFORMATION (email, username, instagramhandle, xhandle, youtubehandle)
            VALUES (:email, :username, :instagramhandle, :xhandle, :youtubehandle)`, {
            email, username, instagramhandle, xhandle, youtubehandle
        }, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function insertPcrpMyPosts(postid, title, username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            INSERT INTO postcollectionrecordspost (pcid, postid)
            SELECT pcid, :postid
            FROM postcollection
            WHERE title = :title
              AND username = :username`, {
            postid, title, username
        }, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function searchDashboardstyle(sql, binds) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(sql, binds);
        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function fetchRelationships(username) {
    return await withOracleDB(async (connection) => {
        console.log(username);

        const [followersResult, followingResult, mutualsResult] = await Promise.all([connection.execute(`SELECT follows
                                                                                                         FROM profilefollowsprofile
                                                                                                         WHERE followed = :username`, {username},), connection.execute(`SELECT followed
                                                                                                                                                                        FROM profilefollowsprofile
                                                                                                                                                                        WHERE follows = :username`, {username},), connection.execute(`SELECT p1.followed
                                                                                                                                                                                                                                      FROM profilefollowsprofile p1
                                                                                                                                                                                                                                               JOIN profilefollowsprofile p2
                                                                                                                                                                                                                                                    ON p1.follows = p2.followed AND p1.followed = p2.follows
                                                                                                                                                                                                                                      WHERE p1.follows = :username`, {username},),])

        const followers = followersResult.rows;
        const following = followingResult.rows;
        const mutuals = mutualsResult.rows;

        return {followers, following, mutuals};

    }).catch(() => {
        return [];
    });
}

async function insertAchievementsAwarded(title, username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`INSERT INTO achievementawardedto
                                                     (title, username, achievementdate)
                                                 VALUES (:title, :username, SYSDATE)`, {
            title, username
        }, {autoCommit: true},);

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function getUserPostCount(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT COUNT(*)
                                                 FROM POST
                                                 WHERE username = :username`, [username],);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function getUserCommentCount(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT COUNT(*)
                                                 FROM usercomment
                                                 WHERE username = :username`, [username],);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function getUserCommunityCount(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT COUNT(*)
                                                 FROM profileincommunity
                                                 WHERE username = :username`, [username],);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function getUserLikeCount(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT COUNT(*)
                                                 FROM profilelikespost
                                                 WHERE username = :username`, [username],);

        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function initiateTables() {
    return await withOracleDB(async (connection) => {

        try {
            const sqlScript = readFileSync("./sql/databases.sql", "utf-8");

            const unFormattedStatements = sqlScript.split("$$");
            const statements = [];

            for (const us of unFormattedStatements) {
                const trimmed = us.trim();
                if (trimmed) {
                    statements.push(trimmed);
                }
            }

            for (const s of statements) {
                try {
                    await connection.execute(s);
                } catch (err) {
                    console.log(s, err);
                }
            }
        } catch {
            console.log("SQL Script failed to execute.");
        }
        return true;
    }).catch(() => {
        console.log("Reading SQL Script ran into an error.");
        return false;
    });
}

async function maxpostid() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT MAX(postid)
            FROM post`
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function maxdsid() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT MAX(dsid)
            FROM dashboardstyle`
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function maxpostcollectionid() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT MAX(pcid)
            FROM postcollection`
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function findbusyposts() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT *
            FROM post
            WHERE postid IN (SELECT postid
                            FROM usercomment
                            GROUP BY postid
                            HAVING COUNT(commentnum) >= 3)`
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function findbestposts() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT *
            FROM post
            WHERE postid IN (SELECT postid
                            FROM profilelikespost
                            GROUP BY postid
                            HAVING COUNT(username) >= ALL (SELECT COUNT(username)
                                                            FROM profilelikespost
                                                            GROUP BY postid))`
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function findsuperstars() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT P.username
             FROM Profile P
             WHERE NOT EXISTS ((SELECT A.title
                                 FROM Achievement A)
                                 MINUS
                                 (SELECT AAT.title
                                 FROM AchievementAwardedTo AAT
                                 WHERE AAT.username = P.username))`
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function countlikes(pid) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(USERNAME)
             FROM PROFILELIKESPOST
             WHERE postid = :pid`,
            {pid}
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}


async function userlikes(pid, usern) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            INSERT INTO PROFILELIKESPOST (USERNAME, POSTID)
            VALUES (:usern, :pid)`, {
            usern, pid
        }, {autoCommit: true},);
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function insertcomment(commentnum, username, postid, content) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            INSERT INTO USERCOMMENT (commentnum, username, postid, content)
            VALUES (:commentnum, :username, :postid, :content)`, {
            commentnum, username, postid, content
        }, {autoCommit: true},);
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function getcomments(postid) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT *
             FROM USERCOMMENT
             WHERE postid = :postid
             ORDER BY commentnum`,
            {postid}
        );
        return result.rows;
    }).catch(() => {
        return false;
    });
}

async function getcommentnum(postid) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT COUNT(COMMENTNUM)
             FROM USERCOMMENT
             WHERE postid = :postid`,
            {postid}
        );
        if (result === null) {
            return {data: [0]};
        } else {
            return result.rows;
        }
    }).catch(() => {
        return -1;
    });
}

async function getachievements(username){
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT a.title, a.tier, atier.description, aa.achievementdate
             FROM achievementawardedto aa
                      JOIN achievement a
                          ON aa.title = a.title
                      JOIN achievementtier atier
                          ON a.tier = atier.tier
             WHERE aa.username = :username`,
            {username}
        );
        return result.rows;
    }).catch(() => {
        return false
    });
}

async function getcommunityposts(community){
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT *
             FROM post
             WHERE username 
                       IN (SELECT username 
                           FROM profileincommunity 
                           WHERE communityname = :community)`,
            {community}
        );
        return result.rows;
    }).catch(() => {
        return false
    });
}

async function getcommunityusers(community) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT username 
             FROM profileincommunity 
             WHERE communityname = :community`,
            {community}
        );
        return result.rows;
    }).catch(() => {
        return false
    });
}

async function allusernames() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT username
             FROM profile ORDER BY username`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}


async function allProfiles() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT *
             FROM profile`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function getusericon(username) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT profileicon
             FROM profile
             WHERE username = :username`,
             {username}
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

module.exports = {
    testOracleConnection,
    fetchPoststableFromDb,
    initiateTables,
    insertPoststable,
    checkProfileCredentials,
    registerUser,
    updateProfile,
    fetchDashboardstyletableFromDb,
    insertDashboardstyle,
    joinCommunity,
    fetchCommunityStatsFromDb,
    fetchPostCollectionFromDb,
    fetchPostsInCollection,
    searchDashboardstyle,
    insertPostcollectionrecordspost,
    insertPostcollection,
    deletePostcollection,
    insertContactinformation,
    fetchContactinformation,
    fetchRelationships,
    insertProfilefollowsprofile,
    deleteProfilefollowsprofile,
    maxpostid,
    maxpostcollectionid,
    findbusyposts,
    findsuperstars,
    fetchCurrentDashboardstyle,
    countlikes,
    userlikes,
    getcomments,
    getcommentnum,
    insertcomment,
    insertPcrpMyPosts,
    insertAchievementsAwarded,
    getUserLikeCount,
    getUserCommentCount,
    getUserCommunityCount,
    getUserPostCount,
    getachievements,
    maxdsid,
    findbestposts,
    getcommunityposts,
    getcommunityusers,
    allusernames,
    getusericon,
    allProfiles
};

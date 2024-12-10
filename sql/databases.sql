DROP TABLE achievementawardedto $$
DROP TABLE achievement $$
DROP TABLE achievementtier $$
DROP TABLE usercomment $$
DROP TABLE postcollectionrecordspost $$
DROP TABLE postcollection $$
DROP TABLE profilelikespost $$
DROP TABLE profilefollowsprofile $$
DROP TABLE profileincommunity $$
DROP TABLE community $$
DROP TABLE contactinformation $$
DROP TABLE post $$
DROP TABLE profile $$
DROP TABLE dashboardstyle $$


-- dashboardstyle TABLE DATA AND CREATION

CREATE TABLE dashboardstyle
(
    dsid          INTEGER,
    dashboardname VARCHAR2(200)
        DEFAULT 'Default Style' NOT NULL,
    bgcolour      CHAR(7)
        DEFAULT '#ffffff'       NOT NULL,
    textcolour    CHAR(7)
        DEFAULT '#000000'       NOT NULL,
    CHECK (REGEXP_LIKE(bgcolour, '^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$')),
    CHECK (REGEXP_LIKE(textcolour, '^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$')),
    PRIMARY KEY (dsid)
)$$

INSERT INTO DashboardStyle (dsid, dashboardname, bgcolour, textcolour)
VALUES (1, 'Default Style', '#FFFFFF', '#000000')$$
INSERT INTO DashboardStyle (dsid, dashboardname, bgcolour, textcolour)
VALUES (2, 'Dark Mode', '#000000', '#FFFFFF')$$
INSERT INTO DashboardStyle (dsid, dashboardname, bgcolour, textcolour)
VALUES (3, 'Relaxing Theme', '#A4D65E', '#3E3E3E')$$
INSERT INTO DashboardStyle (dsid, dashboardname, bgcolour, textcolour)
VALUES (4, 'Ocean Theme', '#37F5FF', '#4670B6')$$
INSERT INTO DashboardStyle (dsid, dashboardname, bgcolour, textcolour)
VALUES (5, 'Christmas Theme', '#E21B1B', '#37FF3F')$$

-- profile TABLE DATA AND CREATION

CREATE TABLE profile
(
    username    VARCHAR2(30),
    dsid        INTEGER DEFAULT 1 NOT NULL,
    password    VARCHAR2(50)      NOT NULL,
    profileicon INTEGER DEFAULT 1 NOT NULL,
    CHECK (REGEXP_LIKE(username, '^[A-Za-z0-9_]+$')),
    CHECK (REGEXP_LIKE(password, '^[A-Za-z0-9_]+$')),
    PRIMARY KEY (username),
    FOREIGN KEY (dsid) REFERENCES dashboardstyle (dsid)
)$$

INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('username123', 1, 'password', DEFAULT)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('christine', 2, 'wang', 4)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('anneka', 3, 'che123n', 1)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('jesse', 4, '123woo', 3)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('meow', 5, 'woof', 2)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('RobertFrost', 1, 'ice', 2)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('EdgarAllenPoe', 1, 'sad', 2)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('SylviaPlath', 1, 'col', 2)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('EmilyDickinson', 1, 'hope', 2)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('William', 1, 'spear', 2)$$
INSERT INTO profile (username, dsid, password, profileicon)
VALUES ('admin', 1, 'admin', 2)$$

-- post TABLE DATA AND CREATION

CREATE TABLE post
(
    postid               INTEGER,
    username             VARCHAR2(30),
    postdate             DATE           NOT NULL,
    content              VARCHAR2(3000) NOT NULL,
    tag                  VARCHAR2(50),
    title                VARCHAR2(200)  NOT NULL,
    announcementduration DATE,
    CHECK (tag IN ('Love', 'Nature', 'Death', 'Conflict', 'Friendship', 'Identity', 'Hope', 'Joy', 'Sorrow',
                   'Faith', 'Announcement', NULL)),
    PRIMARY KEY (postid),
    FOREIGN KEY (username) REFERENCES profile(username) ON DELETE SET NULL
)$$

INSERT INTO post (postid, username, postdate, content, tag, title, announcementduration)
VALUES (1, 'username123', SYSDATE, 'Please do not send messages via the Canvas messaging system.', NULL, 'Syllabus',
        NULL)$$
INSERT INTO post (postid, username, postdate, content, tag, title, announcementduration)
VALUES (2, 'christine', TO_DATE('2024-10-31', 'YYYY-MM-DD'),
        'Im so excited for Halloween! My poem is about sheer fear and excitement!', 'Joy', 'Hallow, There', NULL)$$
INSERT INTO post (postid, username, postdate, content, tag, title, announcementduration)
VALUES (3, 'admin', TO_DATE('2024-01-01', 'YYYY-MM-DD'), 'Attention folks! Its time for a site update.',
        'Announcement', 'An Announcement Post', TO_DATE('2024-01-07', 'YYYY-MM-DD'))$$
INSERT INTO post (postid, username, postdate, content, tag, title, announcementduration)
VALUES (4, 'jesse', SYSDATE, 'Im pretty sure I passed the CPSC 320 Midterm!', 'Hope', 'Please please please', NULL)$$
INSERT INTO post (postid, username, postdate, content, tag, title, announcementduration)
VALUES (5, 'anneka', SYSDATE, 'Purr mew meow meow wowie', 'Death', 'MEOWTH!', NULL)$$
INSERT INTO post (postid, username, postdate, content, tag, title, announcementduration)
VALUES (6, 'William', SYSDATE, 'Juliet', 'Death', 'My Play', NULL)$$

--usercomment TABLE DATA AND CREATION

CREATE TABLE usercomment
(
    commentnum INTEGER,
    username   VARCHAR2(30),
    postid     INTEGER,
    content    VARCHAR2(300) NOT NULL,
    PRIMARY KEY (commentnum, postid),
    FOREIGN KEY (username) REFERENCES profile (username) ON DELETE SET NULL,
    FOREIGN KEY (postid) REFERENCES post (postid) ON DELETE CASCADE
)$$

INSERT INTO usercomment (commentnum, username, postid, content) VALUES (1, 'username123', 1, 'L post.')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (2, 'christine', 1, 'W post! Don''t listen to the last guy.')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (3, 'anneka', 1, 'True')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (4, 'meow', 1, 'False')$$

INSERT INTO usercomment (commentnum, username, postid, content) VALUES (1, 'anneka', 2, 'Thanks for sharing!')$$

INSERT INTO usercomment (commentnum, username, postid, content) VALUES (1, 'jesse', 3, 'I cried. 10/10')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (2, 'meow', 3, 'Lets go')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (3, 'username123', 3, 'Lets not go')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (4, 'anneka', 3, 'Lets go')$$

INSERT INTO usercomment (commentnum, username, postid, content) VALUES (1, 'meow', 4, 'purr :3')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (2, 'meow', 4, 'mew :3')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (3, 'meow', 4, 'hiss :3')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (4, 'meow', 4, 'yowl :3')$$

INSERT INTO usercomment (commentnum, username, postid, content) VALUES (1, 'jesse', 6, 'Romeo')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (2, 'jesse', 6, 'Romeo')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (3, 'jesse', 6, 'wherefore art thou')$$
INSERT INTO usercomment (commentnum, username, postid, content) VALUES (4, 'jesse', 6, 'Romeo')$$

-- contactinformation TABLE DATA AND CREATION

CREATE TABLE contactinformation
(
    email           VARCHAR2(50),
    username        VARCHAR2(30) NOT NULL,
    instagramhandle VARCHAR2(50),
    xhandle         VARCHAR2(50),
    youtubehandle   VARCHAR2(50),
    PRIMARY KEY (email),
    UNIQUE (username),
    FOREIGN KEY (username) REFERENCES profile (username) ON DELETE CASCADE
)$$

INSERT INTO contactinformation (email, username, instagramhandle, xhandle, youtubehandle)
VALUES ('username123email@gmail.com', 'username123', 'username123ig', 'username123x', 'username123yt')$$
INSERT INTO contactinformation (email, username, instagramhandle, xhandle, youtubehandle)
VALUES ('annekathegoat@hotmail.com', 'anneka', 'chenanneka', NULL, NULL)$$
INSERT INTO contactinformation (email, username, instagramhandle, xhandle, youtubehandle)
VALUES ('jessewoo@wealthsimple.com', 'jesse', NULL, 'woojessex', 'jesseyt')$$
INSERT INTO contactinformation (email, username, instagramhandle, xhandle, youtubehandle)
VALUES ('angrymeow@yahoo.ca', 'meow', 'sadmeow', NULL, 'excitedmeow')$$

-- community TABLE DATA AND CREATION

CREATE TABLE community
(
    communityname VARCHAR2(200),
    description   VARCHAR2(500)
        DEFAULT 'Welcome to the community!',
    PRIMARY KEY (communityname)
)$$

INSERT INTO community (communityname, description)
VALUES ('Sadge Poets', DEFAULT)$$
INSERT INTO community (communityname, description)
VALUES ('Not a Cat Owner', 'A group for unfortunate people.')$$
INSERT INTO community (communityname, description)
VALUES ('Cat Owner', 'Wahoo! Yippee! Hip Hip? ____')$$
INSERT INTO community (communityname, description)
VALUES ('BIPOC LGBTQ2+ Safe Space', 'Poem gonzalez!')$$
INSERT INTO community (communityname, description)
VALUES ('Complain about life', 'Big sigh…')$$


-- profileincommunity TABLE DATA AND CREATION

CREATE TABLE profileincommunity
(
    username      VARCHAR2(30),
    communityname VARCHAR2(200),
    PRIMARY KEY
        (
         username,
         communityname
            ),
    FOREIGN KEY (username) REFERENCES profile (username) ON DELETE CASCADE,
    FOREIGN KEY (communityname) REFERENCES community (communityname) ON DELETE CASCADE
)$$

INSERT INTO profileincommunity (username, communityname)
VALUES ('username123', 'Sadge Poets')$$
INSERT INTO profileincommunity (username, communityname)
VALUES ('christine', 'Not a Cat Owner')$$
INSERT INTO profileincommunity (username, communityname)
VALUES ('anneka', 'Cat Owner')$$
INSERT INTO profileincommunity (username, communityname)
VALUES ('jesse', 'BIPOC LGBTQ2+ Safe Space')$$
INSERT INTO profileincommunity (username, communityname)
VALUES ('meow', 'Cat Owner')$$


-- profilefollowsprofile TABLE DATA AND CREATION

CREATE TABLE profilefollowsprofile
(
    follows  VARCHAR2(30),
    followed VARCHAR2(30),
    PRIMARY KEY
        (
         follows,
         followed
            ),
    FOREIGN KEY (follows) REFERENCES profile (username) ON DELETE CASCADE,
    FOREIGN KEY (followed) REFERENCES profile (username) ON DELETE CASCADE
)$$

INSERT INTO profilefollowsprofile (follows, followed)
VALUES ('username123', 'christine')$$
INSERT INTO profilefollowsprofile (follows, followed)
VALUES ('christine', 'jesse')$$
INSERT INTO profilefollowsprofile (follows, followed)
VALUES ('christine', 'anneka')$$
INSERT INTO profilefollowsprofile (follows, followed)
VALUES ('anneka', 'christine')$$
INSERT INTO profilefollowsprofile (follows, followed)
VALUES ('jesse', 'anneka')$$
INSERT INTO profilefollowsprofile (follows, followed)
VALUES ('anneka', 'jesse')$$
INSERT INTO profilefollowsprofile (follows, followed)
VALUES ('jesse', 'username123')$$


-- profilelikespost TABLE DATA AND CREATION

CREATE TABLE profilelikespost
(
    username VARCHAR2(30),
    postid   INTEGER,
    PRIMARY KEY
        (
         username,
         postid
            ),
    FOREIGN KEY (username) REFERENCES profile (username) ON DELETE CASCADE,
    FOREIGN KEY (postid) REFERENCES post (postid) ON DELETE CASCADE
)$$

INSERT INTO profilelikespost (username, postid)
VALUES ('username123', 1)$$
INSERT INTO profilelikespost (username, postid)
VALUES ('christine', 1)$$
INSERT INTO profilelikespost (username, postid)
VALUES ('anneka', 2)$$
INSERT INTO profilelikespost (username, postid)
VALUES ('jesse', 3)$$
INSERT INTO profilelikespost (username, postid)
VALUES ('meow', 2)$$


-- postcollection TABLE DATA AND CREATION

CREATE TABLE postcollection
(
    pcid     INTEGER,
    username VARCHAR2(30)  NOT NULL,
    title    VARCHAR2(100) NOT NULL,
    PRIMARY KEY (pcid),
    FOREIGN KEY (username) REFERENCES profile (username) ON DELETE CASCADE
)$$

CREATE OR REPLACE TRIGGER createMyPosts
  AFTER INSERT ON profile
  FOR EACH ROW
DECLARE
max_pcid INTEGER;
BEGIN
SELECT MAX(pcid) INTO max_pcid
FROM postcollection;
INSERT INTO postcollection (pcid, username, title)
VALUES (max_pcid+1, :new.username, 'My Posts');
END;
$$

CREATE OR REPLACE TRIGGER noDeleteMyPosts
BEFORE DELETE ON postcollection
FOR EACH ROW
BEGIN
IF :OLD.title = 'My Posts' THEN
	RAISE_APPLICATION_ERROR(-20001, 'Cannot delete My Posts');
END IF;
END;
$$

INSERT INTO postcollection (pcid, username, title)
VALUES (0, 'christine', 'My Posts')$$
INSERT INTO postcollection (pcid, username, title)
VALUES (2, 'christine', 'Secret Folder')$$
INSERT INTO postcollection (pcid, username, title)
VALUES (6, 'christine', 'Crashing out at 3am vibes')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (1, 'username123', 'My Posts')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (7, 'anneka', 'My Posts')$$
INSERT INTO postcollection (pcid, username, title)
VALUES (3, 'anneka', 'Tutorials')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (8, 'jesse', 'My Posts')$$
INSERT INTO postcollection (pcid, username, title)
VALUES (4, 'jesse', 'Sad poems about CPSC 320')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (9, 'meow', 'My Posts')$$
INSERT INTO postcollection (pcid, username, title)
VALUES (5, 'meow', 'Cat Treats')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (10, 'admin', 'My Posts')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (11, 'RobertFrost', 'My Posts')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (12, 'EdgarAllenPoe', 'My Posts')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (13, 'SylviaPlath', 'My Posts')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (14, 'EmilyDickinson', 'My Posts')$$

INSERT INTO postcollection (pcid, username, title)
VALUES (15, 'William', 'My Posts')$$

-- postcollectionrecordspost TABLE DATA AND CREATION

CREATE TABLE postcollectionrecordspost
(
    pcid   INTEGER,
    postid INTEGER,
    PRIMARY KEY
        (
         pcid,
         postid
            ),
    FOREIGN KEY (pcid) REFERENCES postcollection (pcid) ON DELETE CASCADE,
    FOREIGN KEY (postid) REFERENCES post (postid) ON DELETE CASCADE
)$$

INSERT INTO postcollectionrecordspost (pcid, postid)
VALUES (1, 1)$$
INSERT INTO postcollectionrecordspost (pcid, postid)
VALUES (0, 2)$$
INSERT INTO postcollectionrecordspost (pcid, postid)
VALUES (10, 3)$$
INSERT INTO postcollectionrecordspost (pcid, postid)
VALUES (8, 4)$$
INSERT INTO postcollectionrecordspost (pcid, postid)
VALUES (7, 5)$$
INSERT INTO postcollectionrecordspost (pcid, postid)
VALUES (3, 5)$$
INSERT INTO postcollectionrecordspost (pcid, postid)
VALUES (15, 6)$$

-- achievementtier TABLE DATA AND CREATION

CREATE TABLE achievementtier
(
    tier        INTEGER,
    description VARCHAR2(200) NOT NULL,
    PRIMARY KEY (tier)
)$$

INSERT INTO AchievementTier (tier, description)
VALUES (1, 'Good job, but you could do better')$$
INSERT INTO AchievementTier (tier, description)
VALUES (2, 'Great job, but still not enough')$$
INSERT INTO AchievementTier (tier, description)
VALUES (3, 'Amazing job, do better')$$
INSERT INTO AchievementTier (tier, description)
VALUES (4, 'Excellent job, but room for improvement')$$
INSERT INTO AchievementTier (tier, description)
VALUES (5, 'Good job for real (unless?)')$$


-- achievement TABLE DATA AND CREATION

CREATE TABLE achievement
(
    title VARCHAR2(200),
    tier  INTEGER NOT NULL,
    PRIMARY KEY (title),
    FOREIGN KEY (tier) REFERENCES achievementtier (tier),
    CHECK (tier IN (1, 2, 3, 4, 5))
)$$

INSERT INTO Achievement (title, tier)
VALUES ('First Login: Welcome!', 1)$$
INSERT INTO Achievement (title, tier)
VALUES ('Community Contributor: joined your first community!', 1)$$
INSERT INTO Achievement (title, tier)
VALUES ('1st Like', 3)$$
INSERT INTO Achievement (title, tier)
VALUES ('10th Comment', 4)$$
INSERT INTO Achievement (title, tier)
VALUES ('5th Post', 5)$$

-- achievementawardedto TABLE DATA AND CREATION

CREATE TABLE achievementawardedto
(
    title           VARCHAR2(200),
    username        VARCHAR2(30),
    achievementdate DATE NOT NULL,
    PRIMARY KEY
        (
         title,
         username
            ),
    FOREIGN KEY (title) REFERENCES achievement (title) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES profile (username) ON DELETE CASCADE
)$$

INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('First Login: Welcome!', 'jesse', TO_DATE('2024-10-15', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('First Login: Welcome!', 'anneka', TO_DATE('2024-10-15', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('1st Like', 'username123', SYSDATE)$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('10th Comment', 'christine', SYSDATE)$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('5th Post', 'meow', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$

INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('Community Contributor: joined your first community!', 'RobertFrost', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('First Login: Welcome!', 'RobertFrost', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('10th Comment', 'RobertFrost', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('5th Post', 'RobertFrost', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$

INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('Community Contributor: joined your first community!', 'EdgarAllenPoe', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('First Login: Welcome!', 'EdgarAllenPoe', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('1st Like', 'EdgarAllenPoe', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('10th Comment', 'EdgarAllenPoe', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('5th Post', 'EdgarAllenPoe', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$

INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('Community Contributor: joined your first community!', 'SylviaPlath', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('First Login: Welcome!', 'SylviaPlath', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('1st Like', 'SylviaPlath', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('10th Comment', 'SylviaPlath', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('5th Post', 'SylviaPlath', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$

INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('Community Contributor: joined your first community!', 'EmilyDickinson', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('First Login: Welcome!', 'EmilyDickinson', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('1st Like', 'EmilyDickinson', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('10th Comment', 'EmilyDickinson', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('5th Post', 'EmilyDickinson', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$

INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('Community Contributor: joined your first community!', 'William', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('First Login: Welcome!', 'William', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('1st Like', 'William', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('10th Comment', 'William', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$
INSERT INTO AchievementAwardedTo (title, username, achievementdate)
VALUES ('5th Post', 'William', TO_DATE('2024-03-04', 'YYYY-MM-DD'))$$

COMMIT$$





















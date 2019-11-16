const keys = require('./keys');


// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS user (firebaseID varchar PRIMARY key  ,firstname varchar,lastname varchar,created_at timestamp default now())')
  .catch(err => console.log(err,'couldnt create user'));


pgClient
  .query('CREATE TABLE IF NOT EXISTS tweets (id SERIAL PRIMARY key ,user_id varchar,post varchar(140),created_at timestamp default now())')
  .catch(err => console.log(err));

pgClient
  .query('ALTER TABLE tweets ADD CONSTRAINT fk_tweet_user_id FOREIGN KEY (user_id) REFERENCES user (firebaseID)')
  .catch(err => console.log(err));


pgClient
.query('CREATE TABLE IF NOT EXISTS followers (id  varchar PRIMARY key ,followers varchar[],updated_at timestamp default now())')
.catch(err => console.log(err));


pgClient
  .query('ALTER TABLE followers ADD CONSTRAINT fk_follower_user_id FOREIGN KEY (id) REFERENCES user (firebaseID)')
  .catch(err => console.log(err));



app.get('/current', async (req, res) => {
  console.log('inside curr');
  res.send("abc");

});

app.use("/fecthUsersold", async (req, res) => {
  console.log('inside fetch queries')
  //const client = await pgPool.connect();
  let searchText = req.query.searchText;
  console.log(searchText)
  let query = `select * from user where firstname ilike \'%${searchText}\%' 
  `.replace(/"/g, "")

  // query = 'select  concat(post,created_at)  as tweet from tweets where user_id = 'LPR1q8RgOJU74qQosz22cYPIjkI3';
  console.log(query)
  try {
    var dbdata = await pgClient.query(query);

  } catch (e) {
    // await client.release();
    res.status(400).send(e);
  }
  //await client.release();
  console.log(dbdata.rows)
  res.status(200).send(dbdata.rows);
});

app.use("/fecthUsers", async (req, res) => {
  console.log('inside fetch queries')
  //const client = await pgPool.connect();
  let searchText = req.query.searchText;
  let userId = req.query.userId;
  console.log(searchText)

  let query = `select *,
 array[firebaseid] <@ (select followers from followers where id = \'${userId}\'  ) as dofollow
   from user where firstname ilike \'%${searchText}\%' 
   `.replace(/"/g, "")

  //let query = `select * from user where firstname ilike \'%${searchText}\%' 
  //`.replace(/"/g, "")

  // query = 'select  concat(post,created_at)  as tweet from tweets where user_id = 'LPR1q8RgOJU74qQosz22cYPIjkI3';
  console.log(query)
  try {
    var dbdata = await pgClient.query(query);

  } catch (e) {
    // await client.release();
    res.status(400).send(e);
  }
  //await client.release();
  console.log(dbdata.rows)
  res.status(200).send(dbdata.rows);
});

app.use("/getMyTweets", async (req, res) => {
  console.log('inside my queries')
  //const client = await pgPool.connect();
  let userId = req.query.userId;
  console.log(userId)
  let query = `select post ,created_at from tweets where user_id = \'${userId}\' 
  `.replace(/"/g, "")

  // query = 'select  concat(post,created_at)  as tweet from tweets where user_id = 'LPR1q8RgOJU74qQosz22cYPIjkI3';
  console.log(query)
  try {
    var dbdata = await pgClient.query(query);

  } catch (e) {
    // await client.release();
    res.status(400).send(e);
  }
  //await client.release();
  console.log(dbdata.rows)
  res.status(200).send(dbdata.rows);
});

app.use("/getFollowerTweets", async (req, res) => {
  console.log('inside my queries')
  //const client = await pgPool.connect();
  let userId = req.query.userId;
  console.log(userId)

  let query = `select post ,a.created_at as created_at ,firstname from tweets a
  join "user" b
  on b.firebaseid = a.user_id
    where  array[a.user_id] <@  (select followers from followers where id =  \'${userId}\' )`.
    replace(/"/g, "")

  console.log(query)
  try {
    var dbdata = await pgClient.query(query);

  } catch (e) {
    // await client.release();
    res.status(400).send(e);
  }
  //await client.release();
  console.log(dbdata.rows)
  res.status(200).send(dbdata.rows);
});




app.post('/register', async (req, res) => {
  console.log('came');
  const fId = req.body.firebaseId;
  const name = req.body.name;


  let query = 'INSERT INTO user(firebaseID, firstname) VALUES( $1 ,$2)';

  await pgClient.query(query, [fId, name]);

  query = 'INSERT INTO followers(id) VALUES( $1)';

  await pgClient.query(query, [fId]);

  res.send({ registered: true });
});

app.post('/toggleFollowing', async (req, res) => {
  console.log('came');
  const user = req.body.user;
  const follower = req.body.follower;
  const action = req.body.action;

  let query = "";
  if (action === "follow")

    query = 'UPDATE followers SET followers = array_append(followers, $2 ) where id = $1';

  else
    query = 'UPDATE followers SET followers = array_remove(followers, $2 ) where id = $1';

  pgClient.query(query, [user, follower]);

  res.send({ registered: true });
});

app.post('/storetweet', async (req, res) => {
  console.log('came');
  const fId = req.body.firebaseId;
  const tweet = req.body.tweet;


  let query = 'INSERT INTO tweets(user_id, post) VALUES( $1 ,$2)';

  pgClient.query(query, [fId, tweet]);

  res.status(200).send({ tweeted: true });
});

var server = app.listen(5000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})

const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/createdb the_acme_icecream_db')
const app = express()

app.use(require('morgan')('dev'));
app.use(express.json())

//CREATE
app.post('/api/notes', async(req, res, next) =>{
  try {
    const SQL = /*sql*/ `
    INSERT INTO notes(txt)
    VALUES($1)
        RETURNING *
      `;
      const response = await client.query(SQL, [ req.body.txt]);
      res.send(response.rows[0]);
  } catch (error) {
    next(error)
  }
}

//READ
app.get('/api/notes', async (req, res, next) =>{
  try {
  const SQL = `SELECT * from notes;`
  const response = await client.query(SQL)
  res.send(response.rows);
  } catch (error) {
      next(error)
  }
});

//UPDATE
app.put('/api/notes/:id', async(req, res, next)=> {
  try {
    const SQL = `
      UPDATE notes
      SET txt=$1, ranking=$2, updated_at= now()
      WHERE id=$3 RETURNING *
    `;
    const response = await client.query(SQL, [ req.body.txt, req.body.ranking, req.params.id]);
    res.send(response.rows[0]);
  }
  catch(ex){
    next(ex);
  }
});

//DELETE
app.delete('/api/notes/:id', async(req, res, next)=> {
  try {
    const SQL = `
      DELETE from notes
      WHERE id = $1
    `;
    const response = await client.query(SQL, [ req.params.id]);
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});




const init = async () => {

    await client.connect();
    console.log('connected to database');
    let SQL = /*sql*/ `
    DROP TABLE IF EXISTS notes;
    CREATE TABLE notes(
        id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      ranking INTEGER DEFAULT 3 NOT NULL,
      txt VARCHAR(255)
    );
    

    `;
    await client.query(SQL);
    console.log('tables created');
    SQL = /*sql*/ `
    INSERT INTO notes(txt, ranking) VALUES('Name', 5);
    `;
    await client.query(SQL);
    console.log('data seeded');
  };

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
};
init()

//on video 50:18
const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const pool = mysql.createPool({
  host: "sql.freedb.tech",
  user: "u_8NeNsU",
  password: "e2io7jReWdmn",
  database: "freedb_QfUAwjZj",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});
//REPORT
app.get("/api/members", (req, res) => {
  pool.query("SELECT * FROM userdata", (err, rows, fields) => {
    if (err) throw err;
    res.json(rows);
  });
});
//CREATE
app.post("/api/members", (req, res) => {
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  const gender = req.body.gender;
  pool.query(
    "INSERT INTO userdata (first_name, last_name, email, gender) VALUES (?, ?, ?, ?)",
    [fname, lname, email, gender],
    (err, rows, fields) => {
      if (err) throw err;
      res.json({ msg: `Successfully inserted!` });
    },
  );
});
//SEARCH
app.get("/api/members/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT * FROM userdata WHERE id = ?", [id], (err, rows, fields) => {
      if (err) throw err;
      if (rows.length > 0) {
        res.json(rows);
      } else {
        res.status(400).json({ msg: `${id} id not found!` });
      }
    },
  );
});
//UPDATE
app.put("/api/members", (req, res) => {
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  const gender = req.body.gender;
  const id = req.body.id;

  if (!id || !fname || !email || !gender) {
    return res.status(400).json({ msg: "id, name, email, and role are required" });
  }

  pool.query(
    "UPDATE userdata SET first_name = ?, last_name = ?, email = ?, gender = ? WHERE id = ?",
    [fname, lname, email, gender, id],
    (err, rows, fields) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ msg: "Failed to update user" });
      }
      if (rows.affectedRows === 0) {
        return res.status(404).json({ msg: "User not found" });
      }
      res.json({ msg: `Successfully updated` });
    },
  );
});
//DELETE
const deleteMember = (req, res) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    return res.status(400).json({ msg: "id is required" });
  }

  pool.query("DELETE FROM userdata WHERE id = ?", [id], (err, rows, fields) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ msg: "Failed to delete user" });
    }
    if (rows.affectedRows === 0) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ msg: `Successfully deleted` });
  });
};

app.delete("/api/members", deleteMember);
app.delete("/api/members/:id", deleteMember);

app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});
